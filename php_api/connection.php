<?php

	error_reporting(0);

	$server = "localhost";
	$database_userid = "roshn7bs_spic";
	$database_password = "spic123#";
	$database_name = "roshn7bs_project1";
	$con = mysqli_connect($server,$database_userid,$database_password,$database_name);

	if(!$con)
	{
		echo "Server connection error";
		exit;
	}

?>