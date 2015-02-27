/**

Copyright (c) 2015 Nick Dodson

MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the     Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

'use strict';

angular.module('CrowdFundrr.services', ['CrowdFundrr.config'])

.service('utils', function() {
	// ScrollTo Dirty JQuery Hack.
	this.scrollTo = function(selector){
		if(jQuery('#' + selector).length == 1){
		  //console.log(jQuery('#' + selector).position().top);
		  jQuery('html, body').animate({
			scrollTop:  jQuery('#' + selector).position().top
		  });
		};
	};
	
	this.fromWei = function(number, unit) {
		var isBigNumber = true;
	
		if(!number)
			return number;
	
		if(typeof number === 'string' && number.indexOf('0x') === 0)
			number = toDecimal(number);
		
		if(!(number instanceof BigNumber)) {
			isBigNumber = false;
			number = new BigNumber(number.toString()); // toString to prevent errors, the user have to handle giving correct bignums themselves
		}
	
	
		unit = unit.toLowerCase();
	
		switch(unit) {
			case 'kwei':
			case 'ada':
				number = number.dividedBy(1000);
				break;
			case 'mwei':
			case 'babbage':
				number = number.dividedBy(1000000);
				break;
			case 'gwei':
			case 'schannon':
				number = number.dividedBy(1000000000);
				break;
			case 'szabo':
				number = number.dividedBy(1000000000000);
				break;
			case 'finney':
				number = number.dividedBy(1000000000000000);
				break;
			case 'ether':
				number = number.dividedBy(1000000000000000000);
				break;
			case 'kether':
			case 'grand':
			case 'einstein':
				number = number.dividedBy(1000000000000000000000);
				break;
			case 'mether':
				number = number.dividedBy(1000000000000000000000000);
				break;
			case 'gether':
				number = number.dividedBy(1000000000000000000000000000);
				break;
			case 'tether':
				number = number.dividedBy(1000000000000000000000000000000);
				break;
		}
	
		return (isBigNumber) ? number : number.toString(10);
	};
	
	this.toWei = function(number, unit) {
		var isBigNumber = true;
	
		if(!number)
			return number;
	
		if(typeof number === 'string' && number.indexOf('0x') === 0)
			number = toDecimal(number);
	
		if(!(number instanceof BigNumber)) {
			isBigNumber = false;
			number = new BigNumber(number.toString());// toString to prevent errors, the user have to handle giving correct bignums themselves
		}
	
	
		unit = unit.toLowerCase();
	
		switch(unit) {
			case 'kwei':
			case 'ada':
				number = number.times(1000);
				break;
			case 'mwei':
			case 'babbage':
				number = number.times(1000000);
				break;
			case 'gwei':
			case 'schannon':
				number = number.times(1000000000);
				break;
			case 'szabo':
				number = number.times(1000000000000);
				break;
			case 'finney':
				number = number.times(1000000000000000);
				break;
			case 'ether':
				number = number.times(1000000000000000000);
				break;
			case 'kether':
			case 'grand':
			case 'einstein':
				number = number.times(1000000000000000000000);
				break;
			case 'mether':
				number = number.times(1000000000000000000000000);
				break;
			case 'gether':
				number = number.times(1000000000000000000000000000);
				break;
			case 'tether':
				number = number.times(1000000000000000000000000000000);
				break;
		}
	
		return (isBigNumber) ? number : number.toString(10);
	};
	
	this.weiDisplay = function(number, displayOption) { // Display Eth Bignumbers Nicely.
		var isBigNumber = true;
		
		if(displayOption == undefined || displayOption === false || displayOption == null){
			displayOption = 2;
		}
	
		if(!number)
			return number;
	
		if(typeof number === 'string' && number.indexOf('0x') === 0)
			number = toDecimal(number);
		
		if(!(number instanceof BigNumber)) {
			isBigNumber = false;
			number = new BigNumber(number.toString()); // toString to prevent errors, the user have to handle giving correct bignums themselves
		}
		
		//var arr = ['wie', ['kwei', 1000], ['mwei', 1000000], ['gwei', 1000000000], ['szabo', 1000000000000], ['finney', 1000000000000000], ['ether', 1000000000000000000], ['kether', 1000000000000000000000], ['mether', 1000000000000000000000000], ['gether', 1000000000000000000000000000], ['tether', 1000000000000000000000000000000]];
		var arr = [['wie', 1], ['mwei', 1000000], ['szabo', 1000000000000], ['finney', 1000000000000000], ['ether', 1000000000000000000], ['gether', 1000000000000000000000000000], ['tether', 1000000000000000000000000000000]];
		var arr4 = ['wie', 'mwei', 'szb', 'fin', 'eth', 'geth', 'teth'];
		var arr1 = ['w', 'Mw', 'Sz', 'Fi', 'E', 'gE', 'tE'];
		var den = '';
		
		if(parseInt(number) > 0){
			for(var i = arr.length - 1; i >= 0; i --)
			{
				var num = number.dividedBy(arr[i][1]);
				if(num >= 1){
					den = (displayOption == 0 ? arr1[i][0] : (displayOption == 1 ? arr4[i][0] : arr[i][0])) + String(Math.round(num * 1000) / 1000);
					break;
				}
			}
		}else{
			den = 'E0';	
		}
	
		return den;
	};

	// Days Between Count
	this.days_between = function(date1, date2) 
	{
		var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		return Math.round(Math.abs((date2.getTime() - date1.getTime())/(oneDay)));
	};
	
	// Add HTTP Prefix
	this.addhttp = function(url) {
	   if (!/^(f|ht)tps?:\/\//i.test(String(url))) {
		  url = "http://" + String(url);
	   }
	   return url;
	};
	
	// Clean Up URL for Display.
	this.cleanURL = function(string_url)
	{
		return String(string_url).replace("http://", "").replace("https://", "").replace("www.", "");
	};
})

.factory('web3', ['config', function(config) {
    var web3 = require('web3');
	try{
    	web3.setProvider(new web3.providers.HttpSyncProvider(config.httpSyncProvider)); //"http://localhost:8545/"));
	}catch(error){}
	return web3;
}])

.factory('contract', ['web3', '$http', '$q', 'config', function(web3, $http, $q, config) {
	var contract_addr = config.contractAddr;
    var contract = $q.defer();
	
    $http.get('crowdfundrr.abi.json').then(function(res) {
		console.log('Loading Crowdfundrr ABI JSON..');
        var new_contract = web3.eth.contract(contract_addr, res.data);
        contract.resolve(new_contract);
		console.log('Crowdfundrr Contract Initialized with address ' + String(contract_addr));
    });
	
	return contract;
}])

.directive('web3Address', ['web3', '$parse', function (web3, $parse) {
  return {
    restrict: 'AE'
    ,transclude: true
    , require: 'ngModel'
	, link: function(scope, element, attrs, ctrl){
		scope.address_num = 0;
		scope.accounts = web3.eth.accounts;
		element.bind("keyup", function(event) {				
			if(event.keyCode == 40 || event.keyCode == 38){
				if(event.keyCode == 40){ scope.address_num++; }
				if(event.keyCode == 38){ scope.address_num--; }				
				if(scope.address_num >= scope.accounts.length){	scope.address_num = 0;	}
				if(scope.address_num <= 0){	scope.address_num = scope.accounts.length - 1;	}			
				
                ctrl.$setViewValue(scope.accounts[scope.address_num]);
                ctrl.$render();
                event.preventDefault();
                scope.$apply();
				scope.$apply(attrs.onKeyup);
			}
		}.bind(this));
    }
  };
}])

.service('crowdfundrr', ['web3', '$http', '$q', 'contract', 'utils', '$log', 'config', function(web3, $http, $q, contract, utils, $log, config) {
			
	this.getNumCampaigns = function(){
		var deferred = $q.defer();
		
		contract.promise.then(function(contract) {
			var get_num_campaigns = parseInt(contract.call().numCampaigns());
			deferred.resolve(get_num_campaigns);
		});
		
		return deferred.promise;
	};
	
	this.categories = ['Buisness', 'Technology', 'Music', 'Arts', 'Cryptocurrency', 'Dance', 'Fashion', 'Film', 'Community', 'Food', 'Games', 'Education', 'Cause', 'Politics'];
	
	this.category = function(category_data){ // will convert category string into num and num into string
		var retVal;
		if(angular.isString(category_data)){
			retVal = this.categories.indexOf(category_data);
		}
		else if(angular.isNumber(category_data)){
			retVal = this.categories[category_data];
		}
		return retVal;
	};
	
	this.refund = function(cid, transact_options){
		var deferred = $q.defer();
		
		if(_.isObject(transact_options) !== true){
			transact_options = {from: web3.eth.accounts[0]};
		}
		
		contract.promise.then(function(contract) {
			$log.info('Transacting refund...');
			contract.transact(transact_options).refund(cid);
			this.loadCampaign(cid).then(function(campaign){ 
				deferred.resolve(campaign);
			});
		});
		return deferred.promise;	
	}
	
	this.payout = function(cid, transact_options){
		var deferred = $q.defer();
		cid = parseInt(cid);
		
		if(_.isObject(transact_options) !== true){
			transact_options = {from: web3.eth.accounts[0]};
		}
		
		contract.promise.then(function(contract) {
			$log.info('Transacting payout...');
			contract.transact(transact_options).payout(cid);
			this.loadCampaign(cid).then(function(campaign){ 
				deferred.resolve(campaign);
			});
		}.bind(this));
		
		return deferred.promise;
	};
	
	this.loadCategory = function(category, depth, start_depth){
		var deferred = $q.defer();
		contract.promise.then(function(contract) {
			category = parseInt(category);
			var category_count = 0;
			var num_campaigns = parseInt(contract.call().numCampaigns()) + 1;
			var campaigns = [];
			var depth_count = 0;
			
			start_depth = angular.isDefined(start_depth) ? start_depth : 0;
			
			if(start_depth < num_campaigns - 1){
				for(var cid = num_campaigns - start_depth - 1; cid >= 0; cid--)
				{
					if(category_count < depth){
						var raw_campaign = contract.call().campaigns(parseInt(cid));	
						var campaign = this.parseCampaign(cid, raw_campaign);
						
						if((parseInt(campaign.categoryNum) == category || category == 9999) && campaign != false){
							campaigns.push(campaign);
							category_count++;
							depth_count = cid;
						}
					}else{	
							break;
					}
				}
			}
			
			deferred.resolve({campaigns: campaigns, depth: (num_campaigns - depth_count)});
		}.bind(this));
		
		return deferred.promise;
	};
	
	this.loadCampaigns = function(depth, start_depth){
		var deferred = $q.defer();
		start_depth = angular.isUndefined(start_depth) ? 0 : start_depth;
		
		contract.promise.then(function(contract) {
			var num_campaigns = contract.call().numCampaigns();
			
			var arr = [];				 
			var go_depth = (num_campaigns - depth);
			go_depth = (go_depth < 0) ? 0 : go_depth;
			
			for(var cid = (num_campaigns - start_depth - 1); cid >= go_depth; cid--)
			{
				var raw_campaign = contract.call().campaigns(parseInt(cid));	
				var camp = this.parseCampaign(cid, raw_campaign);
				arr.push(camp);
			}
			deferred.resolve(arr);
		}.bind(this));
		
		return deferred.promise;
	};
				
	this.startCampaign = function(name, website, beneficiary, goal, timelimit, category, transact_options)
	{
		var deferred = $q.defer();
		var accounts = web3.eth.accounts;
		
		if(_.isObject(transact_options) !== true){
			transact_options = {from: accounts[0]};
		}
		
		contract.promise.then(function(contract) {
			$log.info('Transacting newCampaign...');
			goal = utils.toWei(String(goal), 'ether');
			contract.transact(transact_options).newCampaign(name, website, beneficiary, goal, timelimit, category);
			var user_latest = parseInt(contract.call().users(transact_options.from));
			var latet_campaign = parseInt(contract.call().userCampaigns(transact_options.from, (user_latest - 1)));
			var new_campaign = this.loadCampaign(latet_campaign).then(function(campaign){
				deferred.resolve(campaign);
			});
		}.bind(this));
		
		return deferred.promise;
	};
	
	this.donateCampaign = function(cid, amount, transact_options)
	{
		var deferred = $q.defer();
		amount = utils.toWei(amount.toString(), 'ether');
		if(_.isObject(transact_options) !== true) transact_options = {value: String(amount)};
		
		contract.promise.then(function(contract) {
			contract.transact(transact_options).contribute(cid);
			$log.info('Donation made to campaign #' + String(cid) + ' of ETH' + String(amount));
			this.loadCampaign(cid).then(function(campaign){ 
				deferred.resolve(campaign);
			});
		}.bind(this));
					
		return deferred.promise;				 
	};
	
	this.parseCampaign = function(cid, raw_campaign)
	{
		if(raw_campaign[0] != undefined && String(raw_campaign[0]) != "")
		{
			var pledged_bign = new BigNumber(raw_campaign[6].toString());
			var goal_bign = new BigNumber(raw_campaign[5].toString());			
			var campaign_progress = parseFloat(pledged_bign.dividedBy(goal_bign).round(4))*100;
			
			var days_to_go = utils.days_between(new Date(), new Date(parseInt(raw_campaign[4])*1000));
			var expired = (parseInt(new Date().getTime()) > parseInt(new Date(parseInt(raw_campaign[4])*1000).getTime())) ? true : false;
									
			var return_obj = {
				"id": String(cid)
				, "name": _.escape(String(raw_campaign[0]))
				, "url": "#/tracker/" + String(cid) //Will be: "http://crowdfundrr.github.io/?id=" + String(cid)			
				, "siteUrl": config.siteUrl + String(cid) //Will be: "http://crowdfundrr.github.io/?id=" + String(cid)		
				, "website": _.escape(utils.cleanURL(raw_campaign[1]))	
				, "websiteUrl": _.escape(utils.addhttp(raw_campaign[1]))								
				, "imageUrl": _.escape(String(raw_campaign[1]) + String(config.imageSuffix))
				, "benificiary": _.escape(String(raw_campaign[3]))
				, "goal": utils.fromWei(String(raw_campaign[5]), 'wei')
				, 'goalDisplay': utils.weiDisplay(String(raw_campaign[5]), 0)
				, "backers": parseInt(raw_campaign[9])
				, "pledged": (parseInt(raw_campaign[8]) == 1 ? utils.fromWei(String(raw_campaign[5]), 'wei') : utils.fromWei(String(raw_campaign[6]), 'wei'))
				, "pledgedDisplay": (parseInt(raw_campaign[8]) == 1 ? utils.weiDisplay(String(raw_campaign[5]), 0) : utils.weiDisplay(String(raw_campaign[6]), 0))
				, "owner": String(raw_campaign[2])
				, "timelimit": parseInt(raw_campaign[4]) * 1000
				, "categoryNum": _.escape(parseInt(raw_campaign[7]))
				, "category": String(raw_campaign[7])
				, "status": parseInt(raw_campaign[8])
				, "progress": (parseInt(raw_campaign[8]) == 1 ? 100 : (campaign_progress > 100 ? 100 : Math.round(campaign_progress)))// multiply hack...
				, "daysToGo": parseInt(days_to_go)
				, "reached": (campaign_progress >= 100 || parseInt(raw_campaign[8]) == 1) && !expired ? true : false // multiply hack used..
				, "expired": expired
				, "payedOut": (parseInt(raw_campaign[8]) == 1 && parseInt(raw_campaign[6]) == 0) ? true : false
			};
		
			return return_obj;
		}else{
			return false;
		}
	};
																			  
	this.loadCampaign = function(cid) 
	{
		var deferred = $q.defer();
		$log.info('Loading campaign with id ' + String(cid));		
		contract.promise.then(function(contract) {
			var raw_campaign = contract.call().campaigns(parseInt(cid));
			var camp = this.parseCampaign(cid, raw_campaign);
			deferred.resolve(camp);
		}.bind(this));
		
		return deferred.promise;
	};
}]);