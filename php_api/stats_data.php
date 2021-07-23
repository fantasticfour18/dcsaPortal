<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    
    include("connection.php");
    
    $request = json_decode(file_get_contents("php://input"), true);
    
    if($request["mode"] == "student_stats")
    {
        $pid = $request["pid"];
        $query = "SELECT class, semester FROM user_info WHERE id = $pid";
        $rs = mysqli_query($con, $query);
        $rs = mysqli_fetch_assoc($rs);

        $clss = $rs['class'];   $sems = $rs["semester"];
    
        $query = "SELECT subjects, sub_code, lecture_count FROM subs WHERE class = '$clss' AND semester = $sems";
        $rs = mysqli_query($con, $query);

        $i = 0;
        while($row = mysqli_fetch_array($rs))
        {
            $data[0]['sub' . ($i + 1)] = $row[0];
            $data[1]['sub_code' .($i + 1)] = $row[1];

            if((int)$sems % 2 == 0)
            {   $s_month = 1;   $e_month = 5;  }
            else
            {   $s_month = 7;   $e_month = 12;  }

            for($j = $s_month, $k = 0; $j <= $e_month; $j++, $k++)
            {
                $query = "SELECT date FROM attendance WHERE stud_id = $pid AND subject = '$row[0]' AND ";
                if($j < 10)
                    $query .= "date LIKE '____-0$j-__' ORDER BY date";
                else
                    $query .= "date LIKE '____-$j-__' ORDER BY date";

                $rs2 = mysqli_query($con, $query);
                $l = 0; $temp = [];
                while($row2 = mysqli_fetch_array($rs2))
                    $temp[$l++] = $row2[0];
                
                $data[2][$i]['mon' . ($k + 1)] = $temp;
            }
            
            $data[3]['lec_count' .($i + 1)] = $row[2];

            $i++;
        }

        $data[4]['sem'] = $sems;

        echo json_encode($data);
    }
    else if($request["mode"] == "get_year")
    {
        $pid = $request["pid"]; $sub = $request["sub"];

        $query = "SELECT date FROM attendance WHERE stud_id = $pid AND subject = '$sub'";
        $rs = mysqli_query($con, $query);

        if(mysqli_num_rows($rs) != 0)
        {
            $rs = mysqli_fetch_array($rs);
            $response['status'] = "OK";
            $response['year'] = substr($rs[0], 0, 4);
            
            echo json_encode($response);
        }
    }
    else if($request["mode"] == "teacher_stats")
    {   
        $response[0]['Male'] = $response[0]['Female'] = 0;
        $clss = $request['clss'];   $sem = $request['sem']; $shift = $request['shift']; $sub = $request['sub'];

        $query = "SELECT lecture_count FROM subs WHERE class = '$clss' AND semester = $sem AND subjects = '$sub'";
        $rs = mysqli_query($con, $query);
        $row = mysqli_fetch_row($rs);
        $lec_count = $row[0];
        
        $query = "SELECT gender, COUNT(gender) AS total FROM user_info WHERE user_type = 'Student' 
        AND class = '$clss' AND semester = $sem AND shift = '$shift' GROUP By gender";
        $rs = mysqli_query($con, $query);
        
        while($row = mysqli_fetch_array($rs))
            $response[0][$row[0]] = $row[1];

        $query = "SELECT A.id, A.first_name, A.last_name, A.user_image, COUNT(B.subject) FROM user_info AS A 
            LEFT JOIN attendance AS B ON A.id = B.stud_id AND B.subject = '$sub' AND B.class = '$clss'
            WHERE A.class = '$clss' AND A.semester = $sem AND A.shift = '$shift' AND A.user_type = 'Student'
            GROUP BY A.id, A.first_name, A.last_name, A.user_image
            ORDER BY A.first_name";

        $rs = mysqli_query($con, $query);

        $i = 0;
        while($row = mysqli_fetch_array($rs))
        {   
            $temp[$i]['pid'] = $row[0]; $temp[$i]['fname'] = $row[1];   $temp[$i]['lname'] = $row[2];   
            $temp[$i]['photo'] = base64_encode($row[3]);   $temp[$i]['att_count'] = $row[4];   $i++;    
        }

        $response[1]['studs'] = $temp;
        $response[2]['lecture_count'] = $lec_count;

        $query = "SELECT subjects, sub_code FROM subs WHERE class = '$clss' AND semester = $sem";
        $rs = mysqli_query($con, $query);

        if((int)$sem % 2 == 0)
        {   $s_month = 1;   $e_month = 5;  }
        else
        {   $s_month = 7;   $e_month = 12;  }

        $i = 0;
        while($row = mysqli_fetch_array($rs))
        {
            $response[3]['sub'. ($i + 1)] = $row[0];
            $response[3]['sub_code' . ($i + 1)] = $row[1];

            for($j = $s_month, $k = 0; $j <= $e_month; $j++, $k++)
            {
                $query = "SELECT count(date) FROM attendance WHERE class = '$clss' AND subject = '$row[0]' AND ";
                $query2 = "SELECT count(date) as lec_count FROM attendance WHERE class = '$clss' AND subject = '$row[0]' AND "; 
                if($j < 10)
                {   $query .= "date LIKE '____-0$j-__'";    $query2 .= "date LIKE '____-0$j-__'";   }
                else
                {   $query .= "date LIKE '____-$j-__'"; $query2 .= "date LIKE '____-$j-__'";    }

                $query2 .= "GROUP BY stud_id ORDER BY lec_count DESC";

                $rs2 = mysqli_query($con, $query);
                $row2 = mysqli_fetch_array($rs2);

                $response[3]['mon_count' . ($i + 1)][$k] = $row2[0];

                $rs2 = mysqli_query($con, $query2);
                $row2 = mysqli_fetch_array($rs2);

                $response[3]['lec_count' . ($i + 1)][$k] = ($row2[0] != null) ? $row2[0] : 0;

            }

            $i++;
        }
            
        echo json_encode($response);
    }

?>