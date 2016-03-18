var updateMenu = function(){
	var stage = LocalStore.get('startCampaignStage') || 0;
	
	// remove active class
	$('#startHeader div.inner ul li a').removeClass('active');
	$('#startHeader div.inner ul li a').removeClass('disabled');
	
	// set active button
	$('#startHeader div.inner ul li[data-stage="' + stage + '"] a').addClass('active');
	
	for(var stageIndex = 4; stageIndex >= stage; stageIndex --)
		$('#startHeader div.inner ul li[data-stage="' + stageIndex + '"] a').addClass('disabled');
};
	

Template['layout_header'].rendered = function(){
	updateMenu();
	//$('#weifund_header_nav li a').click(updateMenu);
};


Template['layout_header'].helpers({
	'loaded': updateMenu,
});