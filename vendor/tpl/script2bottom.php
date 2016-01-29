<?php ob_start();?>
#content#
<?php
if(!$FEATHER_SCRIPT2BOTTOMS = $this->get('FEATHER_SCRIPT2BOTTOMS')){
	$FEATHER_SCRIPT2BOTTOMS = array();
}

$FEATHER_SCRIPT2BOTTOMS[] = ob_get_contents(); ob_end_clean(); 
$this->set('FEATHER_SCRIPT2BOTTOMS', $FEATHER_SCRIPT2BOTTOMS);
?>