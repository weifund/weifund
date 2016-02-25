/**
Template Controllers

@module Templates
**/

/**
The view1 template

@class [template] views_view1
@constructor
**/

Template['views_home'].helpers({
    /**
    Get the name

    @method (name)
    **/

    'name': function(){
        return this.name || TAPi18n.__('dapp.views.home.defaultName');
    },
    
    
    /**
    Get most recent campaigns.

    @method (campaigns)
    **/

    'campaigns': function(){
        return Campaigns.find({}, {limit: 4, sort: {id: -1}});
    },
    
    
    /**
    Get most recent campaigns.

    @method (picks)
    **/

    'picks': function(){
        /*var picks = Picks.find({}, {limit: 4, sort: {id: -1}}).fetch(),
            pickedCampaigns = [];
        
        _.each(picks, function(pick, pickIndex){
             pickedCampaigns.push(Campaigns.findOne({id: pick.cid}));
        });
        
        return pickedCampaigns;*/
    }
});

Template['views_home'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.views.home.title"));
};
