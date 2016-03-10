var updateMenu = function(){
	var active = $('a[href^="' + Router.current().route._path + '"]').first().parent().addClass('active');

	$('a:not([href^="' + Router.current().route._path + '"])').parent().removeClass('active');
	
	if(Router.current().route._path == '/about') {// about hack
		$('.nav-stacked li').removeClass('active');
		$('#about').addClass('active');
	}
};
	

Template['components_aboutMenu'].rendered = function(){
	updateMenu();
	$('.nav-stacked li a ').click(updateMenu);
};


Template['components_aboutMenu'].helpers({
	'loaded': updateMenu,
});