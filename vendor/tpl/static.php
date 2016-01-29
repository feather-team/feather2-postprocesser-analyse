<?php 
if(!empty($links)){
	foreach($links as $key => $value){
		echo '<link rel="stylesheet" href="' . $value . '" type="text/css" />';
	}
}

if(!empty($scripts)){
	foreach($scrits as $key => $value){
		echo '<script src="' . $value . '"></script>';
	}
}

if(!empty($inlineScritps)){
	foreach($inlineScritps as $key => $value){
		echo $value;    
	}
}