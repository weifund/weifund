var updateMenu = function(){
	var active = $('a[href^="' + Router.current().route._path + '"]').first().parent().addClass('active');

	$('a:not([href^="' + Router.current().route._path + '"])').parent().removeClass('active');
};
	

Template['components_adminMenu'].rendered = function(){
	updateMenu();
	$('.nav-stacked li a ').click(updateMenu);
};


Template['components_adminMenu'].helpers({
	'loaded': updateMenu,
});