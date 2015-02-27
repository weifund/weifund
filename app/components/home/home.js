/**

Copyright (c) 2015 Nick Dodson


MIT License:
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the     Software is furnished to do so, subject to the following conditions:


The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.


THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

'use strict';

angular.module('CrowdFundrr.home', ['ngRoute', 'CrowdFundrr.services', 'CrowdFundrr.start'])

.controller('HomeCtrl', ['$scope', '$routeParams', '$location', '$timeout', 'web3', 'utils', 'crowdfundrr', function($scope, $routeParams, $location, $timeout, web3, utils, crowdfundrr) {
	
	var accounts = web3.eth.accounts;
	
	//crowdfundrr.donateCampaign(3, 4500).then(function(isGood){ console.log(isGood); });
	//crowdfundrr.loadCampaign(3).then(function(campaign){console.log(campaign);});
	//crowdfundrr.startCampaign('Janes New Campaign', 'janes.com', accounts[0], 333334435, 3, 22343455343).then(function(campaign){console.log(campaign);});
	//crowdfundrr.loadCampaign(2).then(function(campaign){console.log(campaign);});
   										
	// Scroll Hack.
	switch($location.path()){
		case "/top":	
			$timeout(function() { utils.scrollTo('top'); }, 1);
		break;
		case "/start":	
			$timeout(function() { utils.scrollTo('start'); }, 1);
		break;
		case "/about":	
			$timeout(function() { utils.scrollTo('about'); }, 1);
		break;
		case "/contact":	
			$timeout(function() { utils.scrollTo('contact'); }, 1);
		break;
		default:
			window.scrollTo(0, 0);
	}
}]);