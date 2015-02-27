/**

Copyright (c) 2015 Nick Dodson


MIT License:
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the     Software is furnished to do so, subject to the following conditions:


The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.


THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

'use strict';

angular.module('CrowdFundrr.tracker', ['ngRoute', 'CrowdFundrr.campaign', 'CrowdFundrr.search', 'CrowdFundrr.smallCard'])

.controller('TrackerCtrl', ['$scope', '$routeParams', 'web3', 'crowdfundrr', function($scope, $routeParams, web3, crowdfundrr) {
	var id = $routeParams.id;
	console.log(id);
	
	$scope.state = {donated: false, reached: false, expired: false, payedOut: false};
	
	if(id != undefined || id != "" || id != 'tracker')
	{		
		crowdfundrr.loadCampaign(id).then(function(campaign){ 
			if(campaign != false){
				$scope.campaign = campaign;
				$scope.donationID = campaign.id;
				$scope.state.reached = campaign.reached;
				$scope.state.expired = campaign.expired;
				$scope.state.payedOut = campaign.payedOut;
				
				console.log(campaign);
			}
		}.bind(this));
	}
	
	crowdfundrr.loadCampaigns(2).then(function(campaigns){
		$scope.recent_campaigns = campaigns;
	}.bind(this));
   
	$scope.donate = function(){
		if($scope.campaign.id != undefined && $scope.donationAmount != undefined){
			crowdfundrr.donateCampaign($scope.campaign.id, $scope.donationAmount).then(function(is_good){																		
				if(is_good){
					crowdfundrr.loadCampaign($scope.campaign.id).then(function(campaign){ 
						$scope.campaign = campaign;
						$scope.state.donated = true;
						$scope.state.reached = campaign.reached;
						$scope.state.expired = campaign.expired;
						$scope.state.payedOut = campaign.payedOut;
					}.bind(this));
				}		
			}.bind(this));
		}
	};
	
	$scope.payout = function(){
		if($scope.state.reached == true){
			crowdfundrr.payout($scope.campaign.id).then(function(campaign){
				if(campaign != false){
					$scope.campaign = campaign;
					$scope.state.reached = campaign.reached;
					$scope.state.expired = campaign.expired;
					$scope.state.payedOut = campaign.payedOut;
				}
			}.bind(this));
		}
	}
}]);