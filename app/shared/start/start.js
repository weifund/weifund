/**

Copyright (c) 2015 Nick Dodson

MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the     Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

'use strict';

angular.module('CrowdFundrr.start', ['ngRoute', 'CrowdFundrr.services', 'CrowdFundrr.embedLink'])

.directive('cfStart', function() {
    return {
        restrict: 'AE',
        templateUrl: 'app/shared/start/start.html', 
		controller: 'StartCtrl'
    };
})

.controller('StartCtrl', ['$scope', 'web3', 'crowdfundrr', '$parse', function($scope, web3, crowdfundrr, $parse) {	
		
	$scope.accounts = web3.eth.accounts;
	$scope.state = {begin: true, started: false};
	
	$scope.selected_timestamp = 0;
	
	$scope.update_endDate = function(e)
	{
		$scope.selected_timestamp = e.date.getTime()/1000;
	};
		
	$scope.start_campaign = function(){
		//console.log($scope.cname + ' ' + $scope.cwebsite_url + ' ' + $scope.cbenificiary + ' ' + $scope.cgoal + ' ' + $scope.ccategory + ' ' + String($scope.selected_timestamp));
				
		if(angular.isDefined($scope.cname) && angular.isDefined($scope.cwebsite_url) && angular.isDefined($scope.cbenificiary) && angular.isDefined($scope.ccategory) && angular.isDefined($scope.selected_timestamp) && angular.isDefined($scope.cgoal)){
			crowdfundrr.startCampaign($scope.cname, $scope.cwebsite_url, $scope.cbenificiary, $scope.cgoal, $scope.selected_timestamp, $scope.ccategory, {from: $scope.accounts[0]}).then(function(campaign){
				$scope.campaign = campaign;
				$scope.state.begin = false;
				$scope.state.started = true;																										
			}.bind(this));
		}
	};
								
	// JQuery Campaign Datepicker Hack.
	$('#timelimit').datepicker({startDate: '0'}).on('changeDate', $scope.update_endDate.bind(this));
}]);