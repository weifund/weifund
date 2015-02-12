/*
var CrowdFunding = web3.eth.contractFromAbi([{"constant":true,"inputs":[],"name":"numCampaigns","outputs":[{"name":"numCampaigns","type":"uint256"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"},{"name":"uCID","type":"uint256"}],"name":"getUserCampaign","outputs":[{"name":"uCampaignID","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"getCampaign","outputs":[{"name":"r_name","type":"string32"},{"name":"r_website","type":"string32"},{"name":"r_benificiary","type":"address"},{"name":"r_fundingGoal","type":"uint256"},{"name":"r_numFunders","type":"uint256"},{"name":"r_amount","type":"uint256"},{"name":"r_timelimit","type":"uint256"},{"name":"r_owner","type":"address"},{"name":"r_ownerNumCampaigns","type":"uint256"},{"name":"r_category","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"checkGoalReached","outputs":[{"name":"reached","type":"bool"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"}],"name":"getUser","outputs":[{"name":"uNumCampaigns","type":"uint256"}]},{"constant":false,"inputs":[{"name":"name","type":"string32"},{"name":"website","type":"string32"},{"name":"beneficiary","type":"address"},{"name":"goal","type":"uint256"},{"name":"timelimit","type":"uint256"},{"name":"category","type":"uint256"}],"name":"newCampaign","outputs":[{"name":"campaignID","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"contribute","outputs":[]},{"constant":true,"inputs":[],"name":"campaigns","outputs":[{"name":"campaigns","type":"mapping(uint256=>structCampaign)"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"}],"name":"getUserLatest","outputs":[{"name":"uCampaignID","type":"uint256"}]},{"constant":false,"inputs":[],"name":"getNumCampaigns","outputs":[{"name":"r_numCampaigns","type":"uint256"}]},{"constant":true,"inputs":[],"name":"users","outputs":[{"name":"users","type":"mapping(address=>structUser)"}]}]);
contract CrowdFunding{function numCampaigns()constant returns(uint256 numCampaigns){}function getUserCampaign(address uAddr,uint256 uCID)returns(uint256 uCampaignID){}function getCampaign(uint256 campaignID)returns(string32 r_name,string32 r_website,address r_benificiary,uint256 r_fundingGoal,uint256 r_numFunders,uint256 r_amount,uint256 r_timelimit,address r_owner,uint256 r_ownerNumCampaigns,uint256 r_category){}function checkGoalReached(uint256 campaignID)returns(bool reached){}function getUser(address uAddr)returns(uint256 uNumCampaigns){}function newCampaign(string32 name,string32 website,address beneficiary,uint256 goal,uint256 timelimit,uint256 category)returns(uint256 campaignID){}function contribute(uint256 campaignID){}function campaigns()constant returns(mapping(uint256 => struct Campaign) campaigns){}function getUserLatest(address uAddr)returns(uint256 uCampaignID){}function getNumCampaigns()returns(uint256 r_numCampaigns){}function users()constant returns(mapping(address => struct User) users){}}
2c0f7b6f… :numCampaigns
4a616c3d… :getUserCampaign
5598f8cc… :getCampaign
5b2329d4… :checkGoalReached
6f77926b… :getUser
9aac25c6… :newCampaign
c1cbbca7… :contribute
cb5697f9… :campaigns
d6ce497d… :getUserLatest
d9a9bb3e… :getNumCampaigns
f2020275… :users


// New Campaign Transaction
// newCampaign(string32 name, string32 website, address beneficiary, uint goal, uint timelimit)
// contract.transact().newCampaign("My Great Campaign"
// , "mygreatcampaign.com", "0x6465940d1a1a7901f89476ff87a945e0fb1d07db", 50000, 4232408243);

// Contribute to Campaign
// contribute(uint campaignID)
// contract.transact({value: 34598}).contribute(234243);

// Check Goal Reached
// checkGoalReached(uint campaignID) returns (bool reached) 
// contract.transact().checkGoalReached(campaignID);

// Get Number of Campaigns
// get_numCampaigns() returns (uint r_numCampaigns)
// var get_numCampaigns = contract.call().get_numCampaigns();

// Get Campaign Function (uint ID)
var getCampaign = contract.call().getCampaign(34827423);

var number = web3.eth.number;
var info = web3.eth.block(number);

// contract.transact({from: addr2, value: 100000}).join(addr1);


*/

var web3 = require('web3');
web3.setProvider(new web3.providers.HttpSyncProvider('http://localhost:8545')); 
//var eth = web3.eth; //0xabcfde4b9152b3eec0329abe22d69731acf1bbe7";

var contractAbi = [{"constant":true,"inputs":[],"name":"numCampaigns","outputs":[{"name":"numCampaigns","type":"uint256"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"},{"name":"uCID","type":"uint256"}],"name":"getUserCampaign","outputs":[{"name":"uCampaignID","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"getCampaign","outputs":[{"name":"r_name","type":"string32"},{"name":"r_website","type":"string32"},{"name":"r_benificiary","type":"address"},{"name":"r_fundingGoal","type":"uint256"},{"name":"r_numFunders","type":"uint256"},{"name":"r_amount","type":"uint256"},{"name":"r_timelimit","type":"uint256"},{"name":"r_owner","type":"address"},{"name":"r_ownerNumCampaigns","type":"uint256"},{"name":"r_category","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"checkGoalReached","outputs":[{"name":"reached","type":"bool"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"}],"name":"getUser","outputs":[{"name":"uNumCampaigns","type":"uint256"}]},{"constant":false,"inputs":[{"name":"name","type":"string32"},{"name":"website","type":"string32"},{"name":"beneficiary","type":"address"},{"name":"goal","type":"uint256"},{"name":"timelimit","type":"uint256"},{"name":"category","type":"uint256"}],"name":"newCampaign","outputs":[{"name":"campaignID","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"contribute","outputs":[]},{"constant":true,"inputs":[],"name":"campaigns","outputs":[{"name":"campaigns","type":"mapping(uint256=>structCampaign)"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"}],"name":"getUserLatest","outputs":[{"name":"uCampaignID","type":"uint256"}]},{"constant":false,"inputs":[],"name":"getNumCampaigns","outputs":[{"name":"r_numCampaigns","type":"uint256"}]},{"constant":true,"inputs":[],"name":"users","outputs":[{"name":"users","type":"mapping(address=>structUser)"}]}];
var contractAddr = "0xa6ab9e0efdcb6146c4ec5f7eda37a830c6cccca5";
var contract = web3.eth.contract(contractAddr, contractAbi);
//var contractAbi;
//var contractAddr;
//var contract; // = eth.contract(contractAddr, contractAbi);
//var contract = web3.eth.contractFromAbi([{"constant":true,"inputs":[],"name":"numCampaigns","outputs":[{"name":"numCampaigns","type":"uint256"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"},{"name":"uCID","type":"uint256"}],"name":"getUserCampaign","outputs":[{"name":"uCampaignID","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"getCampaign","outputs":[{"name":"r_name","type":"string32"},{"name":"r_website","type":"string32"},{"name":"r_benificiary","type":"address"},{"name":"r_fundingGoal","type":"uint256"},{"name":"r_numFunders","type":"uint256"},{"name":"r_amount","type":"uint256"},{"name":"r_timelimit","type":"uint256"},{"name":"r_owner","type":"address"},{"name":"r_ownerNumCampaigns","type":"uint256"},{"name":"r_category","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"checkGoalReached","outputs":[{"name":"reached","type":"bool"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"}],"name":"getUser","outputs":[{"name":"uNumCampaigns","type":"uint256"}]},{"constant":false,"inputs":[{"name":"name","type":"string32"},{"name":"website","type":"string32"},{"name":"beneficiary","type":"address"},{"name":"goal","type":"uint256"},{"name":"timelimit","type":"uint256"},{"name":"category","type":"uint256"}],"name":"newCampaign","outputs":[{"name":"campaignID","type":"uint256"}]},{"constant":false,"inputs":[{"name":"campaignID","type":"uint256"}],"name":"contribute","outputs":[]},{"constant":true,"inputs":[],"name":"campaigns","outputs":[{"name":"campaigns","type":"mapping(uint256=>structCampaign)"}]},{"constant":false,"inputs":[{"name":"uAddr","type":"address"}],"name":"getUserLatest","outputs":[{"name":"uCampaignID","type":"uint256"}]},{"constant":false,"inputs":[],"name":"getNumCampaigns","outputs":[{"name":"r_numCampaigns","type":"uint256"}]},{"constant":true,"inputs":[],"name":"users","outputs":[{"name":"users","type":"mapping(address=>structUser)"}]}]);

// New Campaign Transaction
// newCampaign(string32 name, string32 website, address beneficiary, uint goal, uint timelimit)
// contract.transact().newCampaign("My Great Campaign"
// , "mygreatcampaign.com", "0x6465940d1a1a7901f89476ff87a945e0fb1d07db", 50000, 4232408243);
function load_contract()
{
}

function days_between(date1, date2) 
{
	var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
	return Math.round(Math.abs((date2.getTime() - date1.getTime())/(oneDay)));
}

function addhttp(url) {
   if (!/^(f|ht)tps?:\/\//i.test(String(url))) {
      url = "http://" + String(url);
   }
   return url;
}

function cleanURL(string_url)
{
	return String(string_url).replace("http://", "").replace("https://", "").replace("www.", "");
}

function loadCampaign(cid)
{
	/*
	Campaign c = campaigns[campaignID];
	r_name = c.name;
	r_website = c.website;
	r_benificiary = c.beneficiary;
	r_fundingGoal = c.fundingGoal;
	r_numFunders = c.numFunders;
	r_amount = c.amount;
	r_timelimit = c.timelimit;
	r_owner = c.owner;
	r_ownerNumCampaigns = ...
	r_category = c.category;*/
		
	// Returns Campaign OBJ
	var raw_campaign = contract.call().getCampaign(parseInt(cid));
	
	if(raw_campaign[0] != undefined && String(raw_campaign[0]) != "")
	{
		var progress = (parseInt(raw_campaign[5]) / parseInt(raw_campaign[3])) * 100;
		var days_to_go = days_between(new Date(), new Date(parseInt(raw_campaign[6])));
		
		var return_obj = {
			"id": cid
			, "name": String(raw_campaign[0])
			, "website": addhttp(raw_campaign[1])
			, "benificiary": String(raw_campaign[2])
			, "fundingGoal": parseInt(raw_campaign[3])
			, "goal": parseInt(raw_campaign[3])
			, "numFunders": parseInt(raw_campaign[4])
			, "amount": parseInt(raw_campaign[5])
			, "timelimit": parseInt(raw_campaign[6])
			, "owner": String(raw_campaign[7])
			, "ownerNumCampaigns": parseInt(raw_campaign[8])
			, "category": String(raw_campaign[9])
			, "progress": parseInt(progress)
			, "days_to_go": parseInt(days_to_go)
			, "image_url": String(raw_campaign[1]) + '/crowdfundrr.png'
			, "websiteClean": cleanURL(raw_campaign[1])
			, "url": "http://crowdfundrr.github.io/?id=" + String(cid)
			, "reached": (progress >= 100 ? true : false)
		};
	
		return return_obj;
	}else{
		return false;
	}
}
		
function create_embed(id, img_size)
{
	if($('#new_campaign_embed').length != 0){
		$('#new_campaign_embed').val('<a href="http://www.crowdfundrr.github.io?id=' + String(id) + '"><img style="border: 3px solid #999; border-radius: 5px; margin-right: 10px;" src="http://crowdfundrr.github.io/img/crowdfundrr_'+ String(img_size) +'.png"></a>');
	}
}

function new_campaign()
{
	var c_name = $('#name').val();
	var c_website = $('#website').val();
	var c_beneficiary = $('#address').val();
	var c_goal = $('#goal').val();
	var c_category = parseInt($('#category').val());
	var c_timelimit = new Date(String($('#timelimit').val())).getTime();	
	var accounts = web3.eth.accounts;
	
	alert(accounts[0]);
	
	if(String(c_beneficiary) == "" || c_beneficiary == undefined){
		c_beneficiary = accounts[0];
	}
	
	if(String(c_name) == "" || c_goal <= 0 || c_timelimit <= 0){
		return false;
	}
	
	var new_camp = contract.transact({from: accounts[0]}).newCampaign(c_name, c_website, c_beneficiary, c_goal, c_timelimit, c_category);
	
	var get_camp_id = contract.call().getUserLatest(accounts[0]);
	
	alert(get_camp_id);
	
	var campaign = loadCampaign(get_camp_id);
	
	alert(campaign);
	
	if(campaign !== false)
	{
		$("#new_campaign_wrapper").hide();
		$("#campaign_details").hide();
		
		$("#new_campaign_id").html(String(campaign['id']));
		$("#new_campaign_name").html(campaign['name']);
		$("#new_campaign_url_1").val(campaign['url']);
		$("#new_campaign_website").html(campaign['website']);
		$("#new_campaign_name").attr("href", campaign['url']);
		$("#new_campaign_url").html(campaign['url']);
		$("#new_campaign_url").attr("href", campaign['url']);
		$("#new_campaign_goto").attr("href", campaign['url']);
		
		$("#campaign_embed_1").click(function(){create_embed(String(campaign['id']), 20);});
		$("#campaign_embed_2").click(function(){create_embed(String(campaign['id']), 100);});
		$("#campaign_embed_3").click(function(){create_embed(String(campaign['id']), 150);});
		
		create_embed(campaign['id'], 100);
		
		/*show campaign_success_wrapper
		hide campaign_details
		show new_campaign_success_2
		
		new_campaign_name
		new_campaign_name HREF 
		new_campaign_id
		new_campaign_url_1 http://www.crowdfundrr.github.io/?id=1
		new_campaign_goto tracker.html?id=1
		new_campaign_website http://www.kipoh.com
		
		CONTROLLER NEEDED
		
		campaign_embed_1
		campaign_embed_2
		campaign_embed_3
		
		new_campaign_embed*/
		
		$("#new_campaign_success_2").show();
		$("#campaign_success_wrapper").show();
		$("#campaign_success_wrapper").css('display', 'block');
	}
}

function payout_campaign()
{
	if($('#campaign_id').length != 0 && web3 != undefined)
	{
		var campaign_id = parseInt($('#campaign_id').val());
		
		if(campaign_id != undefined && campaign_id >= 0){
			var campaign = loadCampaign(campaign_id);
			
			if(campaign !== false){
				if(campaign['reached'] == true){
					var payout_campaign = contract.transact().checkGoalReached(campaign_id);
				}
			}
		}
	}
}

function most_recent(load_max)
{
	load_max = parseInt(load_max);
	if($('#most_recent_campaigns').length != 0 && web3 != undefined && load_max != undefined)
	{
		var total_campaigns = contract.call().getNumCampaigns();
		total_campaigns = parseInt(total_campaigns);
		
		if(total_campaigns != 0)
		{
			$('#most_recent_campaigns').empty();
			
			for(var cid = (total_campaigns - 1); cid >= (total_campaigns - load_max); cid--)
			{
				var campaign = loadCampaign(cid);
				
				if(campaign !== false){
					var raw_html = '<div style="margin-top: 20px;"><h4 class="light"><a href="' + campaign['url'] + '">' + campaign['name'] + '</a></h4><div class="progress" style="height: 7px; margin-bottom: 10px; max-width: 400px;"><div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="' + String(campaign['progress']) + '" style="width: ' + String(campaign['progress']) + '%;" aria-valuemin="0" aria-valuemax="100"></div></div><ul class="list-inline"><li><span>' + String(campaign['progress']) + '%</span><br><span class="text-muted light">funded</span></li><li><span>' + String(campaign['numFunders']) + '</span><br><span class="text-muted light">backers</span></li><li><span>$' + String(campaign['amount']) + '</span><br><span class="text-muted light">pledged</span></li><li><span>' + String(campaign['days_to_go']) + '</span><br><span class="text-muted light">days to Go</span></li></ul></div>';
					$('#most_recent_campaigns').append(raw_html);
				}
			}
		}
	}
}

function hash_verified(owner_addr, website_url)
{
	/*$('#is_verified').html('<i class="text-danger glyphicon glyphicon-remove"></i> <span class="text-danger">Not Verified</span>');
	if($('#is_verified').length != 0 && String(website_url) != "")
	{
		$.get("http://www.html5rocks.com/en/tutorials/file/xhr2/", function(data, status) {
		   alert(status);
		   var owner_address = $(data).find('meta[name=hash_verify]').attr("content");
		   
		   alert(owner_address);
		   
		   if(owner_addr == owner_address)
		   {
		   	$('#is_verified').empty();
			$('#is_verified').html('<i class="text-success glyphicon glyphicon-check"></i> <span class="text-success">Hash Verified</span>');
		   }
		});
	}*/
}

function clearDiscover()
{
	var total_campaigns = contract.call().getNumCampaigns();
	
	if(total_campaigns != undefined && total_campaigns != 0){
		$('#discover_display_row_1').css('display', 'none');
		$('#discover_display_row_1').hide();
		$('#discover_display_row_2').css('display', 'none');
		$('#discover_display_row_2').hide();
	}
}

function address_picker(el_id)
{
	el_id = String(el_id);
	if($(el_id).length != 0 && web3 != undefined)
	{
		$(el_id).keydown(function(e) {
			var current_val = String($(el_id).val());
			var current_alt = parseInt($(el_id).attr("alt"));
			var accounts = web3.eth.accounts;
			
			if(current_alt == undefined || isNaN(current_alt)){
				current_alt = 0;
			}
			
			if(accounts.length > 0)
			{
				switch(e.which)	{
					case 38: // up
						current_alt++;
						if(current_alt >= accounts.length){
							current_alt = 0;
						}
						$(el_id).val(accounts[current_alt]);
						$(el_id).prop("alt", String(current_alt));
					break;
					
					case 40: // down
						current_alt--;
						if(current_alt < 0){
							current_alt = accounts.length - 1;
						}
						$(el_id).val(accounts[current_alt]);
						$(el_id).prop("alt", String(current_alt));
					break;
					
					default: return; // exit this handler for other keys
				}
				e.preventDefault(); // prevent the default action (scroll / move caret)
			}
		});
	}
}

function discover(category, load_max, startIndex)
{
	category = parseInt(category);
	load_max = parseInt(load_max);
	startIndex = parseInt(startIndex);
	
	if(category == undefined){
		category = 0;
	}
	
	if(load_max == 0 || load_max == undefined){
		load_max = 6;
	}
	
	//var columns = [$('#discover_1'), $('#discover_2'), $('#discover_3'), $('#discover_4')];
	
	var total_campaigns = contract.call().getNumCampaigns();
	var category_count = 0;
	var column_count = 0;
	
	if(startIndex == 0 || startIndex == undefined || startIndex > total_campaigns){
		startIndex = total_campaigns;
	}
	
	var current_index = startIndex;
	var raw_html = '';
	
	for(var cid = parseInt(total_campaigns - 1); cid >= 0; cid--)
	{
		var campaign = loadCampaign(cid);
		
		if(category_count < load_max && campaign !== false)
		{
			if(campaign['category'] == category || category == 9999) // 9999 meaning just get recent
			{				
				raw_html += '<div class="col-xs-6 col-md-3">  <div class="panel panel-default cf-panel"><a href="' + campaign["url"] + '"><div class="panel-heading cf-panel-header" style="padding: 0px; background-image: url(img/crowdfundrr_logo.png);"><div class="panel-heading cf-panel-header" style="background-image: url(' + campaign['image_url'] + ');"></div></div></a><div class="panel-body">		<h4 class="light"><a href="' + campaign["url"] + '">' + campaign["name"] + '</a></h4><div class="progress" style="height: 7px; margin-bottom: 10px; max-width: 400px;"><div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="' + String(campaign["progress"]) + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + String(campaign["progress"]) + '%;"></div></div><ul class="list-inline"><li><span>' + String(campaign["progress"]) + '%</span><br><span class="text-muted light">funded</span></li><li><span>$' + String(campaign["amount"]) + '</span><br><span class="text-muted light">pledged</span></li><li><span>' + String(campaign["days_to_go"]) + '</span><br><span class="text-muted light">days to Go</span></li></ul> </div></div> <!-- End Panel -->   </div>';				
				
				if(column_count >= 3 || total_campaigns <= 3)
				{
					$('#discover_section').append('<div class="row-fluid">' + raw_html + '</div>');
					raw_html = '';
				}
				
				current_index --;
				column_count = (column_count >= 3) ? 0 : column_count++;
				category_count ++;
			}
		}
	}
	
	return current_index;
}

function get_campaign(id)
{	
	var c_id = $('#campaign_id').val();
	if(id != undefined)
	{
		c_id = id;
	}
	c_id = parseInt(c_id);
	var campaign = loadCampaign(c_id);
	
	if(campaign !== false)
	{
		$("#c_name").html(campaign["name"]);
		$("#c_website").attr('href', campaign["website"]);
		$("#c_website").html(campaign["websiteClean"]);
		$("#c_goal").html('$' + String(campaign["goal"]));
		$("#c_backers").html(String(campaign["numFunders"]));
		$("#c_amount").html('$' + String(campaign["amount"]));
		$("#c_days").html(String(campaign["days_to_go"])); //get_camp[6]
		$('#campaign_id').val(String(c_id));
		$('#c_progress').css('width', String(campaign["progress"])+'%').attr('aria-valuenow', campaign["progress"]);
		most_recent(2);
		
		if(campaign['reached'] == true){
			$("#c_name").html(campaign["name"] + " is funded!");
			$('#c_progress').addClass('progress-bar-success');
			$('#donate_amount').css('display', 'none');
			$('#donate_amount').hide();
			$('#donate_to_campaign').css('display', 'none');
			$('#donate_to_campaign').hide();
			$('#payout_to_campaign').css('display', 'block');
			$('#payout_to_campaign').show();
		}
	}
}

function donate_campaign()
{
	// $('#campaign_id').val(); $('#donate_amount').val(); function donate_campaign(){};
	var camp_id = $('#campaign_id').val();
	var donate_amount = $('#donate_amount').val();
	
	if(parseInt(donate_amount) > 0)
	{
		contract.transact({value: String(donate_amount)}).contribute(parseInt(camp_id));
		get_campaign(camp_id);
	}
}

function get_qs()
{
	var qs = (function(a) {
	    if (a == "") return {};
	    var b = {};
	    for (var i = 0; i < a.length; ++i)
	    {
	        var p=a[i].split('=', 2);
	        if (p.length == 1)
	            b[p[0]] = "";
	        else
	            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
	    }
	    return b;
	})(window.location.search.substr(1).split('&'));
	return qs;
}

function discoveryCategory()
{
	var qs = get_qs();
	var category = qs['c']; // Get C from URL
	
	if(category == undefined || category == ""){
		category = 9999;
	}
	
	return category;
}

function check_for_id()
{
	var qs = get_qs();	
	var get_url_id = qs["id"];
	
	if(parseInt(get_url_id) >= 0)
	{
		get_campaign(get_url_id);
	}
}
