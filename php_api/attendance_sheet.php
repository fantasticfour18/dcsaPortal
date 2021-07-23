<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

    include("connection.php");

    include("fpdf182/fpdf.php");

    $request = json_decode(file_get_contents("php://input"), true);
    
    $pdf = new FPDF();
    $pdf->AliasNbPages();
    $pdf->AddPage('L', 'A4');
    makeHeader($pdf, $request);
    tableData($pdf, $request, $con);
    $pdf->Output('F', 'Attendance_Sheet.pdf');
    
    function makeHeader($pdf, $request)
    {
        $pdf->image('fpdf182/logo.jpg', 128, 30, 40, 40);
        $pdf->setY(80);
        $pdf->setFont('Arial', 'B', 16);
        $pdf->SetTextColor(26, 23, 23);
        $pdf->cell(0,10,'Department of Computer Science and Applications', 0, 0, 'C');
        $pdf->Ln();

        $pdf->setFont('Arial', 'B', 20);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->cell(0,10,'Panjab University', 0, 0, 'C');
        $pdf->Ln(); $pdf->Ln();

        $pdf->setFont('Arial', '', 14);
        $pdf->cell(0,10,'ATTENDANCE SHEET', 0, 0, 'C');
        $pdf->Ln();

        
        $ends = array('st', 'nd', 'rd', 'th', 'th', 'th');
        $sem = $request["sems"];
        $sem .= $ends[$sem - 1];

        if($request['clss'] == "MCA")
            $subtitle = "Master of Computer Applications (MCA) $sem Semester";
        else if($request['clss'] == "MSc")
            $subtitle = "Master of Science (MSc) $sem Semester";

        $pdf->setFont('Arial', '', 12);
        $pdf->SetTextColor(35, 158, 207);
        $pdf->cell(0, 10, $subtitle, 0, 0, 'C');
        $pdf->Ln();

        $pdf->SetTextColor(0, 0, 0);
        $pdf->cell(0, 10, '(Shift: ' . $request['shift'] . ')', 0, 0, 'C');
        $pdf->Ln(); $pdf->Ln();
        $pdf->setFont('Arial', '', 22);
        $pdf->cell(0, 10, $request['sub'], 0, 0, 'C');
        $pdf->Ln(30);
    }

    function tableData($pdf, $request, $con)
    {
        $clss = $request['clss'];   $sem = $request['sems'];    $shift = $request['shift']; $sub = $request['sub'];
        $query = "SELECT id, first_name, last_name FROM user_info WHERE user_type = 'Student' AND class = '$clss' 
                AND semester = $sem AND shift = '$shift' ORDER BY first_name";
    
        $rs = mysqli_query($con, $query);
            
        $year = $request['year'];   $s_mon = $request['s_mon'];   $e_mon = $request['e_mon'];
        if($s_mon < 10)
            $s_mon = (int)substr($s_mon, 1, 1);
            
        if($e_mon < 10)
            $e_mon = (int)substr($e_mon, 1, 1);
        
        for($mon = $s_mon; $mon <= $e_mon; $mon++)
        {
            $mon_name = date("F", mktime(0, 0, 0, $mon, 10));
            
            
            $pdf->setFont('Arial', 'U', 14);
            $pdf->SetTextColor(0, 0, 0);
            $pdf->cell(138.5, 10, 'Month: ' . $mon_name . ' ' . $year);
            $pdf->cell(138.5, 10, 'Subject: Operations Research', 0, 0, 'R');
            $pdf->Ln();
            
            $pdf->setFont('Arial', '', 14);
            $pdf->SetFillColor(255, 60, 60);
            $pdf->cell(7, 7, '', 1, 0, 'C', true);
            $pdf->cell(100, 7, 'Holidays (Sat-Sun)', 0, 0, 'L');
            $pdf->Ln(); $pdf->Ln();
    
            $pdf->setFont('Arial', '', 11);
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFillColor(123, 131, 237);
            $pdf->cell(12, 8,'S.No.', 1, 0, 'C', true);
    
            $days = cal_days_in_month(CAL_GREGORIAN, $mon , $year);
    
            if($days == 31)
            {   $pdf->cell(51.5, 8,'Name', 1, 0, 'C', true);    $name_width = 51.5; }
            else if($days == 30)
            {   $pdf->cell(58, 8,'Name', 1, 0, 'C', true);  $name_width = 58;  }
            else if($days == 29)
            {   $pdf->cell(64.5, 8,'Name', 1, 0, 'C', true);    $name_width = 64.5; }
            else if($days == 28)
            {   $pdf->cell(71, 8,'Name', 1, 0, 'C', true);  $name_width = 71;   }
    
            for($i = 0; $i < $days; $i++)
                $pdf->cell(6.5, 8, $i+1, 1, 0, 'C', true);
    
            $pdf->cell(12, 8, 'Total', 1, 0, 'C', true);
            $pdf->Ln();
            
            $i = 1;
            $pdf->SetFillColor(194, 255, 210);
            while($row = mysqli_fetch_array($rs))
            {
                /*
                if($pdf->GetY() == 179)
                {
                    $pdf->SetFont('Arial', '', 8);
                    $pdf->cell(0, 10, 'Page ' . $pdf->PageNo() . '/{nb}', 0, 0, 'C');
                    $pdf->setFont('Arial', '', 12);
                }*/
    
                $pdf->SetTextColor(0, 0, 0);
                $pdf->cell(12, 8, $i++ , 1, 0, 'C');
                $pdf->cell($name_width, 8, $row[1] . ' ' . $row[2], 1, 0, 'C');
    
                $id = $row[0];
                $query = "SELECT substring(date, 9, 2) AS date FROM attendance WHERE stud_id = $id AND date LIKE "; 
                if($mon < 10)
                    $query .= "'$year-0$mon%' AND subject = '$sub' ORDER BY date";
                else
                    $query .= "'$year-$mon%' AND subject = '$sub' ORDER BY date";
    
                $rs2 = mysqli_query($con, $query);
                $att_date = mysqli_fetch_array($rs2);
                
                $pdf->SetTextColor(0, 65, 168);
                $count = 0;
                for($j = 1; $j <= $days; $j++)
                {
                    if($j == $att_date[0])
                    {
                        $pdf->cell(6.5, 8, 'P', 1, 0, 'C', true);
                        $att_date = mysqli_fetch_array($rs2);   $count++;
                    }
                    else if(date("D", strtotime($year . '-' . $mon . '-' . $j)) == "Sat" || 
                            date("D", strtotime($year . '-' . $mon . '-' . $j)) == "Sun")
                    {
                        $pdf->SetFillColor(255, 60, 60);
                        $pdf->cell(6.5, 8, '', 1, 0, 'C', true);
                        $pdf->SetFillColor(194, 255, 210);
                    }
                    else
                        $pdf->cell(6.5, 8, '', 1, 0, 'C', true);
                }
                
                $pdf->cell(12, 8, $count, 1, 0, 'C', true);
                $pdf->Ln();
            }
            
            mysqli_data_seek($rs, 0);
            $pdf->Ln(); $pdf->Ln(); $pdf->Ln();
            
        }

    }

?>