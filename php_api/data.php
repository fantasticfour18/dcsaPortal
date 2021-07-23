<?php   
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    
    include("connection.php");

    //echo json_encode("Connected");
    
    $request = json_decode(file_get_contents("php://input"), true);
    
    if($request['mode'] == "username_check")
    {
        $uname = $request['uname'];
        $query = "SELECT username FROM user_info WHERE username = '$uname'";
        $rs = mysqli_query($con, $query);
        
        if(mysqli_num_rows($rs) != 1)
            echo json_encode("user_avail");
        else
            echo json_encode("error");
        
        return;
    }
    else if($request['mode'] == "email_check")
    {
        $email = $request['email'];
        $query = "SELECT email FROM user_info WHERE email = '$email'";
        $rs = mysqli_query($con, $query);
        
        if(mysqli_num_rows($rs) != 1)
            echo json_encode("user_avail");
        else
            echo json_encode("error");
            
        return;
    }
    else if($request['mode'] == "pass_check")
    {
        $pid = $request["pid"]; $pwd = $request["pwd"]; 
        
        $query = "SELECT pwd FROM user_info WHERE id = $pid";
        
        $rs = mysqli_query($con, $query);
        $rs = mysqli_fetch_assoc($rs);
        
        if($pwd == $rs["pwd"])
            echo json_encode("verified");
        else
            echo json_encode("error");
                
        return;
    }
    else if($request['mode'] == "subjects")
    {
        $clss = $request["clss"];  $sems = $request["sems"];
        
        $query = "SELECT subjects FROM subs WHERE class = '$clss' AND semester = $sems";
        
        $rs = mysqli_query($con, $query);
        
        $i = 0;
        while($row = mysqli_fetch_array($rs))
            $subs[$i++] = $row[0];

        echo json_encode($subs);
        return;
    }
    else if($request['mode'] == "viewList")
    {
        $clss = $request["clss"];  $sems = $request["sems"];    $shift = $request["shift"];
        $date = $request["date"];  $sub = $request["sub"];
        
        $query = "SELECT id, first_name, last_name, user_image FROM user_info WHERE user_type = 'Student' AND class = '$clss'  
        AND semester = $sems AND shift = '$shift' ORDER BY first_name";
        $rs1 = mysqli_query($con, $query);

        $query = "SELECT stud_id, date, subject FROM attendance"; 
        $rs2 = mysqli_query($con, $query);
        $count = mysqli_num_rows($rs2);

        $i = 0;
        while($user_row = mysqli_fetch_array($rs1))
        {
            $list[$i]['id'] = $user_row[0];  $list[$i]['fname'] = $user_row[1];   $list[$i]['lname'] = $user_row[2];
            $list[$i]['photo'] = base64_encode($user_row[3]);   $list[$i]['mark'] = $list[$i]['disable'] = false;
            $list[0]['sel_btn'] = true;

            for($j = 0; $j < $count; $j++)
            {
                $att_row = mysqli_fetch_array($rs2);
                if($user_row[0] == $att_row[0] && $att_row[1] == $date && $att_row[2] == $sub)
                {
                    $list[$i]['mark'] = $list[$i]['disable'] = true; $list[0]['sel_btn'] = false; break;
                }  
            }

            mysqli_data_seek($rs2, 0);

            $i++;  
        }

        echo json_encode($list);
        return;
    }
    else if($request['mode'] == "mark_attendance")
    {
        $date = $request["markedList"][0]["date"]; $clss = $request["markedList"][0]["clss"];
        $sem = $request["sem"]; $shift = $request["shift"];    $sub = $request["markedList"][0]["sub"];    
        
        $query = "SELECT * FROM attendance WHERE class = '$clss' AND date = '$date' AND subject = '$sub'";
        $rs = mysqli_query($con, $query);

        if(mysqli_num_rows($rs) == 0)
        {
            $query = "UPDATE subs SET lecture_count = lecture_count + 1 WHERE class = '$clss' AND subjects = '$sub'";
            mysqli_query($con, $query);
        }

        $count = count($request["markedList"]);
        $marked_ids = '(';
        $query = "INSERT INTO attendance(stud_id, date, subject, class) VALUES";
        for($i = 0; $i < $count; $i++)
        {
            $stud_id = $request["markedList"][$i]["stud_id"];   $date = $request["markedList"][$i]["date"];
            $sub = $request["markedList"][$i]["sub"];   $clss = $request["markedList"][$i]["clss"]; 

            if($i == $count - 1)
            {
                $query .= "($stud_id, '$date', '$sub', '$clss')";
                $marked_ids .= "$stud_id)";
            }
            else
            {
                $query .= "($stud_id, '$date', '$sub', '$clss'), ";
                $marked_ids .= "$stud_id, ";
            }
        }

        mysqli_query($con, $query);
        
        //Handle Marked Notifications
        $query = "SELECT id, device_id, log_status FROM user_info WHERE user_type = 'Student' AND 
        class = '$clss' AND semester = $sem AND shift = '$shift' AND device_id IS NOT NULL AND id IN $marked_ids";
        $rs = mysqli_query($con, $query);

        $marked_device = array();
        $count = mysqli_num_rows($rs);
        $query = "INSERT INTO notices(user_id, title, message, date, time) VALUES";
        
        date_default_timezone_set("Asia/Kolkata");
        $systime = date("h:i:s"); 
        $message = "Your attendance for course $sub has been marked for date $date. Check your stats for more information.";
        for($i = 0; $i < $count; $i++)
        {
            $row = mysqli_fetch_row($rs);
            if($row[2] != 0)
                $marked_device[$i] = $row[1];

            $query .= "($row[0], 'Attendance Marked', '$message', '$date', '$systime')";
            if($i < $count - 1)
                $query .= ",";

            $query2 = "UPDATE user_info SET badge_count = badge_count + 1 WHERE id = $row[0]";
            mysqli_query($con, $query2);
        }
        mysqli_query($con, $query);

        //Send Marked Attendance Notification
        if(count($marked_device) != 0)
            send_push_notice($marked_device, 'Attendance Marked', "Your attendance for course $sub has been marked for date $date.");
        
        //Handle UnMarked Notifications
        $query = "SELECT id, device_id, log_status FROM user_info WHERE user_type = 'Student' AND 
        class = '$clss' AND semester = $sem AND shift = '$shift' AND device_id IS NOT NULL AND id NOT IN $marked_ids";
        $rs = mysqli_query($con, $query);

        $count = mysqli_num_rows($rs);
        $query = "INSERT INTO notices(user_id, title, message, date, time) VALUES";

        $unmarked_device = array();
        $message = "You have not attended the class $sub for date $date. Please attend the class next day to avoid low attendacnce.";
        $message .=  " Check your stats for more information.";
        for($i = 0; $i < $count; $i++)
        {
            $row = mysqli_fetch_row($rs);
            if($row[2] != 0)
                $unmarked_device[$i] = $row[1];

            $query .= "($row[0], 'Class not Attended', '$message', '$date', '$systime')";
            if($i < $count - 1)
                $query .= ",";

            $query2 = "UPDATE user_info SET badge_count = badge_count + 1 WHERE id = $row[0]";
            mysqli_query($con, $query2);
        }
        mysqli_query($con, $query);
            
        //Send UnMarked Attendance Notification
        if(count($unmarked_device) != 0)
            send_push_notice($unmarked_device, 'Class not Attended', "Your have not attended the class $sub for date $date.");
        
        /*
        if(mysqli_stat($con))
            echo json_encode("success");
        else 
            echo json_encode("Error " . mysqli_error($con));*/

        return;
    }
    else if($request["mode"] == "get_notices")
    {
        $id = $request["pid"];
        $query = "SELECT * FROM notices WHERE user_id = $id ORDER BY date DESC, time DESC";
        $rs = mysqli_query($con, $query);

        $i = 0;
        while($row = mysqli_fetch_array($rs))
        {
            $list[$i]["id"] = $row[0];    $list[$i]["user_id"] = $row[1];    $list[$i]["title"] = $row[2];
            $list[$i]["msg"] = $row[3]; $list[$i]["date"] = $row[4] . ' ';  $list[$i]["date"] .= $row[5];       
            $list[$i]["read_status"] = $row[6];
            $i++;
        }

        $query = "UPDATE user_info SET badge_count = 0 WHERE id = $id";
        mysqli_query($con, $query);

        echo json_encode($list);
        
        return;
    }
    else if($request["mode"] == "get_badge_count")
    {
        $pid = $request["pid"];

        $query = "UPDATE user_info SET log_status = 1 WHERE id = $pid";
        mysqli_query($con, $query);
        
        $query = "SELECT badge_count FROM user_info WHERE id = $pid";
        $rs = mysqli_query($con, $query);
        $rs = mysqli_fetch_array($rs);

        echo json_encode($rs[0]);

        return;
    }
    else if($request["mode"] == "update_notices")
    {
        $id = $request["id"];   $user_id = $request["user_id"];

        if($request["act"] == "update")
            $query = "UPDATE notices SET read_status = 0 WHERE id = $id AND user_id = $user_id";
        else if($request["act"] == "delete")
            $query = "DELETE FROM notices WHERE id = $id AND user_id = $user_id";
        
        mysqli_query($con, $query);
        
        return;
    }
    else if($request["mode"] == "viewUserList")
    {
        $utype = $request["utype"]; $clss = $request["clss"];  $sem = $request["sem"];  $shift = $request["shift"];

        if($utype = "Student")
            $query = "SELECT id, first_name, last_name, user_image FROM user_info WHERE user_type = '$utype' AND class = '$clss'
            AND semester = $sem AND shift = '$shift'";
        else if($utype = "Teaching-Staff")
            $query = "SELECT id, first_name, last_name, user_image FROM user_info WHERE user_type = '$utype'";
        
        $rs = mysqli_query($con, $query);
        
        $i = 0;
        while($row = mysqli_fetch_row($rs))
        {
            $list[$i]['id'] = $row[0];  $list[$i]['fname'] = $row[1];   $list[$i]['lname'] = $row[2];
            $list[$i]['profile_photo'] = base64_encode($row[3]);
            $i++;  
        }
        echo json_encode($list);

        return;
    }
    else if($request["mode"] == "update_log_status")
    {
        $pid = $request["pid"];
        $query = "UPDATE user_info SET log_status = 0 WHERE id = $pid";
        mysqli_query($con, $query);

        return;
    }
    else if($request["mode"] == "admin_option")
    {
        $clss = $request["clss"];   $sem = $request["sem"];

        if($request["act"] == "promote_students")
        {
            $query = "UPDATE user_info SET semester = $sem WHERE user_type = 'Student' AND class = '$clss'";
            mysqli_query($con, $query);

            echo json_encode(mysqli_affected_rows($con));
        }
        else if($request["act"] == "delete_att_records")
        {
           $query = "SELECT subjects FROM subs WHERE class = '$clss' AND semester = $sem";
           $rs = mysqli_query($con, $query);
           
           $subs = "(";
           $count = mysqli_num_rows($rs);
           for($i = 0; $i < $count; $i++)
           {
               $row = mysqli_fetch_row($rs);
               if($i < $count - 1)
                $subs .= "'$row[0]',";
               else
                $subs .= "'$row[0]')";
           }

           $query = "DELETE FROM attendance WHERE class = '$clss' AND subject IN $subs";
           //mysqli_query($con, $query);

           echo json_encode($query);
        }
        else if($request["act"] == "push_notices")
        {
            $title = $request["title"]; $msg = $request["msg"];

            $query = "SELECT id, device_id, log_status FROM user_info WHERE (user_type = 'Student' OR user_type = 'Teaching-Staff')
                    AND device_id IS NOT null";
            $rs = mysqli_query($con, $query);

            date_default_timezone_set("Asia/Kolkata"); 
            $date = date("Y-m-d");  $systime = date("h:i:s");
            $count = mysqli_num_rows($rs);  $active_device = array();
            $query = "INSERT INTO notices(user_id, title, message, date, time) VALUES";
            for($i = 0; $i < $count; $i++)
            {
                $row = mysqli_fetch_row($rs);

                if($row[2] != 0)
                    $active_device[0] = $row[1];

                $query .= "($row[0], '$title', '$msg', '$date', '$systime')";
                if($i < $count - 1)
                    $query .= ",";

                $query2 = "UPDATE user_info SET badge_count = badge_count + 1 WHERE id = $row[0]";
                mysqli_query($con, $query2);
            }
            mysqli_query($con, $query);

            if(count($active_device) != 0)
                send_push_notice($active_device, $title, $msg);

        }

        return;
    }
    
    $mode = $request[0]['mode'];
    
    if($mode == 1)
    {
        $utype = $request[0]['utype'];
        $uname = $request[0]['uname'];

        $query = "SELECT id, user_type, first_name, last_name, username, email, pwd, status from user_info where user_type = '$utype' AND (username = '$uname' OR email = '$uname')" ;
        $rs = mysqli_query($con, $query);
        $count = mysqli_num_rows($rs);
        
        if($count == 0)
            $response = ["mode" => "Not Found"];
        else if($count == 1)
        {
            $rs = mysqli_fetch_assoc($rs);
            $pid = $rs['id'];
             
            if($request[0]['pass'] == $rs['pwd'])
            {
                if($rs['status'] == 0)
                    $response = ["mode" => "Otp_Verify", "pid" => $pid, "fname" => $rs['first_name'], "lname" => $rs['last_name'], 
                    "uname" => $rs['username'], "email" => $rs['email'], "utype" => $rs['user_type'], "status" => ['status']];
                else if($rs['status'] == 1)
                    $response = ["mode" => "Found", "pid" => $pid, "fname" => $rs['first_name'], "lname" => $rs['last_name'], 
                    "uname" => $rs['username'], "email" => $rs['email'], "utype" => $rs['user_type'], "status" => ['status']];
            }    
            else
                $response = ["mode" => "Invalid Pass"];
        }
        
        echo json_encode($response);
    }
    else if($mode == 2)
    {
        $uname = $request[1]['uname'];

        $col = ['utype', 'clss', 'semester', 'shift', 'uname', 'pass', 'fname', 'lname', 'fathname', 'mothname', 'dob', 'gender', 'address', 'city', 'state', 
                'zipcode', 'country', 'phone', 'email'];

        $query = "INSERT into user_info(user_type, class, semester, shift, username, pwd, first_name, last_name, fathers_name, mothers_name, DOB, Gender, ";
        $query .= "Address, City, State, ZipCode, Country, Phone, Email) VALUES(";
        
        $len = count($request[1]);
        for($i = 0; $i < $len; $i++)
        {
            $val = $request[1][$col[$i]];

            if($i == $len - 1)
                $query .= "'$val')";
            else if(is_string($val))
                $query .= "'$val', ";
            else if(is_numeric($val))
                $query .= "$val, ";
        }
        
        //echo json_encode($query);
        if(mysqli_query($con, $query))
             $flag = true;
        else
            echo json_encode("Error: $query");
        
        //Education
    
        $pid = mysqli_insert_id($con);
        
        if($request[2])
        {
           $len = count($request[2]);
           $query = "INSERT into edu_qual(profile_id, year, qualification, subj_spec, school_college, cgpa_marks) VALUES";
           for($i = 0; $i < $len; $i++)
           {   
                $year = $request[2][$i]["year"]; $qual = $request[2][$i]["qual"]; $sub = $request[2][$i]["sub"];
                $schl = $request[2][$i]["schl"]; $marks = $request[2][$i]["marks"];
                $query .= "($pid, $year, '$qual', '$sub', '$schl', $marks) ";
                if($i < $len - 1)
                    $query .= ","; 
           }
        
           //echo json_encode($query);
           if(mysqli_query($con, $query))
                $flag2 = true;    
           else
                echo json_encode("Error: $query");
        }
        

        //Work Experience
        
        if($request[3])
        {
            $len = count($request[3]);
            $query = "INSERT into work_exp(profile_id, years, organisation, role) VALUES";
            for($i = 0; $i < $len; $i++)
            {   
                $year = $request[3][$i]["year"]; $comp = $request[3][$i]["company"]; $role = $request[3][$i]["role"];
                $query .= "($pid, $year, '$comp', '$role') ";
                if($i < $len - 1)
                    $query .= ","; 
            }

            //echo json_encode($query);
        
            //echo json_encode($query);
            if(mysqli_query($con, $query))
                $flag3 = true;
            else
                echo json_encode("Error: $query");
        }
        
        if($flag || $flag2 || $flag3)
            echo json_encode("reg_success");
        
    }
    else if($request["mode"] == "profile_data")
    {
        $pid = $request["pid"];
        
        $query = "SELECT * FROM user_info WHERE id = $pid";

        $rs = mysqli_query($con, $query);

        $user_info = mysqli_fetch_row($rs);
        $col_count = mysqli_num_fields($rs);
        $col_list = array();
        $resp = array();

        for($i = 1, $j = 0; $i < $col_count; $i++, $j++)
        {
            if($i != 6 && $i != 21 && $i != 22)
            {
                if($i == 20 && !empty($user_info[$i]))
                    $resp[0]["profile_pic"] = base64_encode($user_info[$i]);
                else
                {
                    $temp = mysqli_fetch_field_direct($rs, $i);
                    $col_list[$j] = $temp->name;

                    $resp[0][$col_list[$j]] = $user_info[$i];
                }
            }
        }
        
        $query = "SELECT year, qualification, subj_spec, school_college, cgpa_marks, id FROM edu_qual WHERE profile_id = $pid";

        $rs = mysqli_query($con, $query);

        $count = mysqli_num_rows($rs);
        $i = 0;

        while($row_data = mysqli_fetch_array($rs))
        {
            $resp[1][$i]["year"] = $row_data[0]; $resp[1][$i]["qual"] = $row_data[1];
            $resp[1][$i]["spec"] = $row_data[2]; $resp[1][$i]["schl"] = $row_data[3];
            $resp[1][$i]["marks"] = $row_data[4]; $resp[1][$i]["id"] = $row_data[5];
            $i++;
        }

        $query = "SELECT years, organisation, role, id FROM work_exp WHERE profile_id = $pid";

        $rs = mysqli_query($con, $query);

        $count = mysqli_num_rows($rs);
        $i = 0;

        while($row_data = mysqli_fetch_array($rs))
        {
            $resp[2][$i]["years"] = $row_data[0]; $resp[2][$i]["org"] = $row_data[1];
            $resp[2][$i]["role"] = $row_data[2]; $resp[2][$i]["id"] = $row_data[3];
            $i++;
        }

        echo json_encode($resp);
    }

    else if($request["mode"] == "update_profile")
    {
        $pid = $request["pid"];
        
        if($request["act"] == "name")
        {
            $fname = $request["fname"]; $lname = $request["lname"];
            $query = "UPDATE user_info SET first_name = '$fname', last_name = '$lname' WHERE id = $pid";
        }
        else if($request["act"] == "uname")
        {
            $uname = $request["uname"];
            $query = "UPDATE user_info SET username = '$uname' WHERE id = $pid";
        }
        else if($request["act"] == "email")
        {
            $email = $request["email"];
            $query = "UPDATE user_info SET email = '$email' WHERE id = $pid";
        }
        else if($request["act"] == "pass")
        {
            $pwd = $request["pwd"];
            $query = "UPDATE user_info SET pwd = '$pwd' WHERE id = $pid";
        }
        else if($request["act"] == "basic")
        {
            $fath = $request["fath"];   $moth = $request["moth"];
            $dob = $request["dob"];     $gender = $request["gender"];
            $query = "UPDATE user_info SET fathers_name = '$fath', mothers_name = '$moth', dob = '$dob', gender = '$gender' ";
            $query .= "WHERE id = $pid";
        }
        else if($request["act"] == "contact")
        {
            $address = $request["address"];     $city = $request["city"];       $state = $request["state"];
            $zip = $request["zipcode"];     $country = $request["country"];     $phone = $request["phone"];
            $email = $request["email"];

            $query = "UPDATE user_info SET address = '$address', city = '$city', state = '$state', zipcode = $zip, ";
            $query .= "country = '$country', phone = $phone, email = '$email' WHERE id = $pid";
        }
        else if($request["act"] == "edu")
        {
            $year = $request["year"];   $qual = $request["qual"];   $sub = $request["sub"];     $schl = $request["schl"];
            $marks = $request["marks"]; $id = $request["id"];

            $query = "UPDATE edu_qual SET year = $year, qualification = '$qual', subj_spec = '$sub', "; 
            $query .= "school_college = '$schl', cgpa_marks = $marks WHERE id = $id AND profile_id = $pid";
        }
        else if($request["act"] == "work")
        {
           $year = $request["year"]; $org = $request["company"]; $role = $request["role"];
           $id = $request["id"];

           $query = "UPDATE work_exp SET years = $year, organisation = '$org', role = '$role' WHERE id = $id AND profile_id = $pid";
        }
        else if($request["act"] == "addEdu")
        {
            $year = $request["year"];   $qual = $request["qual"];   $sub = $request["sub"];     $schl = $request["schl"];
            $marks = $request["marks"];

            $query = "INSERT into edu_qual(profile_id, year, qualification, subj_spec, school_college, cgpa_marks) ";
            $query .= "VALUES($pid, $year, '$qual', '$sub', '$schl', $marks)";
        }
        else if($request["act"] == "addWork")
        {
            $year = $request["year"]; $org = $request["company"]; $role = $request["role"];

            $query = "INSERT into work_exp(profile_id, years, organisation, role) ";
            $query .= "VALUES($pid, $year, '$org', '$role')";
        }
        else if($request["act"] == "del_profile_pic")
            $query = "UPDATE user_info SET user_image = '' WHERE id = $pid";
        else if($request["act"] == "delEdu")
        {
            $id = $request["id"];
            $query = "DELETE FROM edu_qual WHERE id = $id AND profile_id = $pid";
        }
        else if($request["act"] == "delWork")
        {
            $id = $request["id"];
            $query = "DELETE FROM work_exp WHERE id = $id AND profile_id = $pid";
        }

        
        if(mysqli_query($con, $query))
            echo json_encode("success");
        else
            echo json_encode("Error " . $query);

    }
    else if($request["mode"] == "push_notice")
    {
        $pid = $request["pid"];
        $devId = $request["devId"];
        
        $query = "UPDATE user_info SET device_id = '$devId' WHERE id = $pid";
        if($rs = mysqli_query($con, $query))
            echo json_encode('success');
        else
            echo json_encode('failed'); 
    }

    //Send Push Notifications
    function send_push_notice($player_ids, $title, $msg)
    {
        $headings = array
        (
            "en" => $title
        );
        
        $contents = array
        (
            "en" => $msg
        );

        // prep the bundle
        
        $fields = array
        (
            'app_id' => "1981731a-18e3-4605-b23c-d84657999b8d",
            'include_player_ids' => $player_ids,
            'data' => array("task" => "REST API"),
            'headings' => $headings,
            'contents' => $contents,
            'small_icon' => "dcsa_icon"
        );

        $fields = json_encode($fields);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_HEADER, FALSE);
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

        $result = curl_exec($ch);
        curl_close($ch);
        //echo json_encode($result);
    }
    
?>