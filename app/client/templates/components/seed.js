var seedCampaigns = [
    ['VentureBeat 2015 Series 2', 
        'http://venturebeat.com', 
        'yt zc9UbbmkIfE',
        '0x407d73d8a49eeb85d32cf465507dd71d507100c1', 
        48000000000, 
        moment().add(24, 'days').unix(), 
        1, 
        ''],
    ['Eyes of Giants | Studio Funding', 
        'http://eyesofgiants.com', 
        'yt ZcwwmS7WcMs',
        '0x347d73d8a49eeb85d32cf465507dd71d507100c3', 
        2340000000, 
        moment().add(60, 'days').unix(), 
        2, 
        ''],
    ['BoardRoom Governance Token', 
        'http://boardroom.to', 
        'yt iLYDw-2Evmc',
        '0x407d73d8a49eeb85d32cf465507dd71d507100d6', 
        346000000000, 
        moment().add(10, 'days').unix(), 
        1, 
        ''],
    ['IO Digital Currency', 
        'http://digitalcurrencyfund.com', 
        'yt NcrwqHAfIb4',
        '0x231c73d8a49eeb85d32cf465507dd71d507100d5', 
        5849370090000000, 
        moment().add(76, 'days').unix(), 
        1, 
        ''],
    ['WeiFund Support Funding', 
        'http://digitalcurrencyfund.com', 
        'yt NcrwqHAfIb4',
        '0x123c73d8a49eeb45d32cf466677dd71d507100c2', 
        345000800000, 
        moment().add(45, 'days').unix(), 
        12,
        '']
    ];

Template['components_seed'].events({
    /**
    Seed some WeiFund crowdfunding campaigns.
    
    @event (click .btn-seed)
    **/
	
	'click .btn-seed': function(event, template){      
        
        _.each(seedCampaigns, function(campaign, campaignIndex){
            campaign.push({
               gas: 3000000,
               from: LocalStore.get('selectedAccount')
            });
            
            campaign.push(function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {isError: true, error: err});
            });
            
            weifundInstance.newCampaign.sendTransaction.apply(this, campaign);
        });
	},
});
