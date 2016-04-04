var updateMenu = function(){
	$('#weifund_header_nav li').removeClass('active');
	
	if(Router.current().route._path != '/')
		$('#weifund_header_nav li a[href^="' + Router.current().route._path + '"]').first().parent().addClass('active');
	else
		$('#weifund_header_nav li').removeClass('active');
};
	

Template['layout_header'].rendered = function(){
	updateMenu();
	$('#weifund_header_nav li a').click(updateMenu);
};


Template['layout_header'].helpers({
	'loaded': updateMenu,
});