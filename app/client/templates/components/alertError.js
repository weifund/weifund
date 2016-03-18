Template['components_alertError'].rendered = function(){
	TemplateVar.set('data', this.data);
};

Template['components_alertError'].helpers({
	'alertData': function(){
		// get template data
		var data = TemplateVar.get('data') || {};
		
		// defaults
		if(!_.has(data, 'messageExtra'))
			data.messageExtra = true;
		
		if(!_.has(data, 'showTransactionHash'))
			data.showTransactionHash = true;
		
		if(!_.has(data, 'showAddress'))
			data.showAddress = true;
		
		if(!_.has(data, 'ipfsHash'))
			data.showAddress = true;
		
		if(!_.has(data, 'hash'))
			data.showAddress = true;
		
		// return template data
		return data;
	},
});