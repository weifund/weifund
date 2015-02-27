/**

Copyright (c) 2015 Nick Dodson

MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the     Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

'use strict';

angular.module('CrowdFundrr.discover', ['ngRoute', 'CrowdFundrr.search', 'CrowdFundrr.card', 'CrowdFundrr.services'])

.controller('DiscoverCtrl', ['$scope', '$routeParams', 'crowdfundrr', '$rootScope', function($scope, $routeParams, crowdfundrr, $rootScope) 
{
	window.scrollTo(0, 0);																
								
	$scope.category = 9999;
	if(angular.isDefined($routeParams.category))
	{
		$scope.category = crowdfundrr.category($routeParams.category);
	}
	
	function chunk(arr, size) {
	  var newArr = [];
	  for (var i=0; i<arr.length; i+=size) { // 1 over hack.
		newArr.push(arr.slice(i, i+size));
	  }
	  return newArr;
	}
	
	$scope.state = {loaded: false, not_loaded: true};
	$scope.start_depth = 0;
	$scope.campaigns = [];
	
	$scope.loadCampaigns = function(){
		crowdfundrr.loadCategory($scope.category, 8, $scope.start_depth).then(function(load_data){
			if(load_data.campaigns.length > 0){
				$scope.campaigns = $scope.campaigns.concat(chunk(load_data.campaigns, 4));	// Chunk into rows of four JS hack.
				$scope.state.loaded = true;
				$scope.state.not_loaded = false;
				$scope.start_depth = load_data.depth;
			}
		}.bind(this));
	}
	
	$scope.loadCampaigns();
	
	
}]);