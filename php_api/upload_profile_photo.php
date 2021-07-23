<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    
    include("connection.php");
    
    if(isset($_POST["pid"]))
    {
        $pid = $_POST["pid"];
        
        $image = $_FILES["photo"];
        $image = $image["tmp_name"];
        $image = addslashes(file_get_contents($image));
        
        $query = "UPDATE user_info SET user_image = '$image' WHERE id = $pid";
        
        if(mysqli_query($con, $query))
            echo json_encode("Upload Success");
        else 
            echo json_encode("Upload Error");
    }
    
?>