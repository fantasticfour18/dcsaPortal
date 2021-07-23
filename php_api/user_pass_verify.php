<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

    include("connection.php");

    $request = json_decode(file_get_contents("php://input"), true);

    $pid = $request["pid"];
    $mode = $request["mode"];

    if($mode == "email_verify")
    {
        $user_email = $request["email"];

        $query = "SELECT email FROM user_info WHERE id = $user_email";
        $rs = mysqli_query($con, $query);
        $rs = mysqli_fetch_assoc($rs);

        $sys_email = $rs["email"];
        $pid = $rs["id"];

        if($user_email == $sys_email)
            echo json_encode(["msg" => "success", "pid" => "$pid"]);
        else
            echo json_encode(["msg" => "invalid"]);

    }
    if($mode == "otp_gen")
    {
        $otp = rand(1000, 9999);

        $query = "SELECT email FROM user_info WHERE id = $pid";
        $rs = mysqli_query($con, $query);
        $rs = mysqli_fetch_array($rs);

        $message = "<html>
                    <body>
                    <p>Hello,</p>
                    <p>Thank you for using DCSA Portal App</p>
                    <p>Please verify the OTP. Below is your OTP Verification Code:</p>
                    <br><br>
                    <h3>$otp</h3>
                    </body>
                    </html>";

        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
                    
        // More headers
        $headers .= 'From: DCSA Portal <alerts@dcsaportal.com>' . "\r\n";
        
        mail($rs[0], "OTP Verification Code", $message, $headers);

        $query = "UPDATE user_info SET otp = $otp WHERE id = $pid";
        mysqli_query($con, $query);
    }
    else if($mode == "otp_verify")
    {
        $query = "SELECT otp from user_info WHERE id = $pid";

        $rs = mysqli_query($con, $query);
        $rs = mysqli_fetch_assoc($rs);

        $sys_otp = $rs["otp"];
        $user_otp = $request["otp"];

        if($user_otp == $sys_otp)
        {
            $query = "UPDATE user_info SET status = 1 WHERE id = $pid";
            mysqli_query($con, $query);
            echo json_encode("verified");
        }
        else
            echo json_encode("invalid");

    }
    else if($mode == "pass_reset")
    {
        $pass = $request["pass"];

        $query = "UPDATE user_info SET pwd = '$pass' WHERE id = $pid";

        if(mysqli_query($con, $query))
            echo json_encode("success");
        else
            echo json_encode("Server Error");
    }

?>