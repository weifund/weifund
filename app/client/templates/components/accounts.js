Template['components_accounts'].helpers({
    'accounts': function(){
        return EthAccounts.find({});  
    },
    
    'isSelected': function(address){
        return (LocalStore.get('selectedAccount') == address); 
    },
});

Template['components_accounts'].events({
    'click .account': function(event, template){
        var data = $(event.target).parent('.account').get(0);
        
        if(_.isUndefined(data))
            return;
        else
            data = data.dataset.address;
        
        LocalStore.set('selectedAccount', data);
    },
});