<!--FEATHER STATIC POSITION:HEAD-->
<?php 
if(!$this->get('FEATHER_HEAD_RESOURCE_LOADED')){
	$this->load('widget/_static_.#suffix#', array(
		'links' => $this->get('FEATHER_USE_STYLES'), 
		'scripts' => $this->get('FEATHER_USE_HEAD_SCRIPTS')
	));
}
?>
<!--FEATHER STATIC POSITION END-->