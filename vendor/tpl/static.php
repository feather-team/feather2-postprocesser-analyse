<?php 
switch($type){
	case 'head':
		if(!$this->get('FEATHER_HEAD_RESOURCE_LOADED')){
			$links = $this->get('FEATHER_USE_STYLES');
			$scripts = $this->get('FEATHER_USE_HEAD_SCRIPTS');
		}

		break;

	default:
		if(!$this->get('FEATHER_BOTTOM_RESOURCE_LOADED')){
			$scripts = $this->get('FEATHER_USE_SCRIPTS');
		}
}

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