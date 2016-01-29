<!--FEATHER STATIC POSITION:BOTTOM-->
<?php 
if(!$this->get('FEATHER_HEAD_RESOURCE_LOADED')){
	$this->load('widget/_static_.#suffix#', array(
		'links' => $this->get('FEATHER_USE_STYLES'), 
		'scripts' => $this->get('FEATHER_USE_SCRIPTS'), 
		'inlineScripts' => $this->get('FEATHER_SCRIPT2BOTTOMS')
	));
}
?>
<!--FEATHER STATIC POSITION END-->