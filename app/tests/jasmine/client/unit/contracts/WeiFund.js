var weifundInstance = null,
	weifundAddress = '';
			
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe('WeiFund testing', function () {
	var error;
	
	beforeAll(function(done){
		web3.setProvider(TestRPC.provider());
		
		web3.eth.getAccounts(function(err, result){
			if(err){
				error = err;
				done();
			}
			
			chai.assert.equal(err, null);
			chai.assert.isArray(result);
			chai.assert.ok(result.length);

			if(result.length == 0)
				return;

			web3.eth.defaultTxObject = {
				from: result[0],
				gas: 3000000
			};

			done();
		});
	});
	
	it('should have a provider', function () {
		chai.assert.ok(web3.currentProvider);
	});
	
	it('no errors while setting up tx object', function () {
		chai.assert.notOk(error);
	});
	
	it('should have global WeiFund and tx object', function () {
		chai.assert.ok(web3);
		chai.assert.ok(WeiFund);
		chai.assert.ok(web3.eth.defaultTxObject);
		chai.assert.ok(web3.eth.defaultTxObject.from);
	});
	
	describe("contract testing", function(){
		var error;
		
		beforeAll(function(done){
			WeiFund.new(_.extend(web3.eth.defaultTxObject, {data: WeiFund.bytecode}), function(err, result){
				if(err) {
					error = err;
					done();
				}
					
				if(!result.address)
					return;
				
				weifundAddress = result.address;
				weifundInstance = WeiFund.at(result.address);
				done();
			});
		});

		it("No errors while deploying WeiFund contract", function(done){
			chai.assert.notOk(error);
			done();
		});

		it("WeiFund contract has been deployed", function(done){
			chai.assert.ok(weifundInstance);
			chai.assert.ok(weifundInstance.address);
			done();
		});

		it("should be version 1 of WeiFund", function(done){
			weifundInstance.version(function(err, result){
				chai.assert.equal(err, null);
				chai.assert.ok(result);
				chai.assert.equal(result.toNumber(10), 1);
				done();
			});
		});

		it("should have zero campaigns", function(done){
			weifundInstance.totalCampaigns(function(err, result){
				chai.assert.equal(err, null);
				chai.assert.ok(result);
				chai.assert.equal(result.toNumber(10), 0);
				done();
			});
		});
		
		describe("new valid campaign", function(){
			var error,
				campaignID = 0,
				name = "Nicks New Crowdfund",
				owner = '',
				beneficiary = '',
				fundingGoal = 5000,
				expiry = 1457022325 + 3600000,
				config = '0x0000000000000000000000000000000000000000',
				eventFilter = {};
			
			beforeAll(function(done){
				owner = web3.eth.defaultTxObject.from;
				beneficiary = web3.eth.defaultTxObject.from;
				eventFilter = {
					_owner: web3.eth.defaultTxObject.from
				};
				
				weifundInstance.CampaignCreated(function(err, result){
					if(err)
						error = err;
					
					done();
				});
				weifundInstance.newCampaign(name, beneficiary, fundingGoal, expiry, config, web3.eth.defaultTxObject, function(err, result){
					if(!err)
						return;

					error = err;
					done();	
				});
			});
			
			it("no errors while creating campaign", function(done){
				chai.assert.equal(error, null);
				done();
			});
			
			it("number of campaigns equals 1", function(done){
				weifundInstance.totalCampaigns(function(err, result){
					chai.assert.equal(err, null);
					chai.assert.ok(result);
					chai.assert.equal(result.toNumber(10), 1);
					done();
				});
			});
			
			it("campaign has not succeeded", function(done){
				weifundInstance.isSuccess(campaignID, function(err, result){
					chai.assert.equal(err, null);
					chai.assert.notOk(result);
					done();
				});
			});
			
			it("campaign has not failed", function(done){
				weifundInstance.hasFailed(campaignID, function(err, result){
					chai.assert.equal(err, null);
					chai.assert.notOk(result);
					done();
				});
			});
			
			it("campaign has not been refunded", function(done){
				weifundInstance.isRefunded(campaignID, function(err, result){
					chai.assert.equal(err, null);
					chai.assert.notOk(result);
					done();
				});
			});
			
			it("zero total contributions", function(done){
				weifundInstance.totalContributions(campaignID, function(err, result){
					chai.assert.equal(err, null);
					chai.assert.equal(result.toNumber(10), 0);
					done();
				});
			});
			
			it("zero total amount refunded", function(done){
				weifundInstance.totalRefunded(campaignID, function(err, result){
					chai.assert.equal(err, null);
					chai.assert.notOk(result.toNumber(10));
					done();
				});
			});
			
			it("the owner has created one campaign", function(done){
				weifundInstance.totalCampaignsBy(owner, function(err, result){
					chai.assert.equal(err, null);
					chai.assert.equal(result.toNumber(10), 1);
					done();
				});
			});
			
			it("the owner of the campaign is correct", function(done){
				weifundInstance.ownerOf(campaignID, owner, function(err, result){
					chai.assert.equal(err, null);
					chai.assert.ok(result);
					done();
				});
			});
			
			it("the beneficiary is correct", function(done){
				weifundInstance.beneficiaryOf(campaignID, function(err, result){
					chai.assert.equal(err, null);
					chai.assert.equal(result, beneficiary);
					done();
				});
			});
			
			it("campaign created timestamp set", function(done){
				weifundInstance.createdAt(campaignID, function(err, result){
					chai.assert.equal(err, null);
					chai.assert.ok(result.toNumber(10));
					done();
				});
			});
			
			it("campaign data is equal to stored data", function(done){
				weifundInstance.campaigns(campaignID, function(err, result){
					chai.assert.equal(err, null);
					chai.assert.ok(result);
					chai.assert.equal(result[0], name);
					chai.assert.equal(result[1], owner);
					chai.assert.equal(result[2], beneficiary);
					chai.assert.equal(result[3], web3.address(0));
					chai.assert.equal(result[4], false);
					chai.assert.equal(result[5].toNumber(10), expiry);
					chai.assert.equal(result[6].toNumber(10), fundingGoal);
					chai.assert.equal(result[7].toNumber(10), 0); // amount raised
					chai.assert.ok(result[8].toNumber(10)); // amount raised
					chai.assert.equal(result[9].toNumber(10), 0); // amount raised
					
					done();
				});
			});
			
			describe("contribute to valid campaign", function(){
				var error,
					transactionObject,
					amountContributed = 2500,
					contributionID = 0;
				
				beforeAll(function(done){
					transactionObject = _.extend(web3.eth.defaultTxObject, {value: amountContributed});
					var contirbutedEventFilter = {
						_owner: transactionObject.from
					};
					
					weifundInstance.contribute(campaignID, beneficiary, transactionObject, function(err, result){
						if(err) {
							error = err;
							done();
						}
					});
					weifundInstance.Contributed(contirbutedEventFilter, function(err, result){
						if(err) {
							error = err;
							done();
						}
						
						done();
					});
				});
			
				it("no errors while contributing to campaign", function(done){
					chai.assert.equal(error, null);
					done();
				});
			
				it("contributor data is correct", function(done){
					/*(address contributor, 
						address beneficiary, 
						uint amountContributed, 
						bool refunded,
						uint created)*/
					
					weifundInstance.contributionAt(campaignID, contributionID, function(err, result){
						chai.assert.equal(err, null);
						chai.assert.ok(result);
						chai.assert.equal(result[0], transactionObject.from);
						chai.assert.equal(result[1], transactionObject.from);
						chai.assert.equal(result[2].toNumber(10), amountContributed);
						chai.assert.equal(result[3], false);
						chai.assert.ok(result[4]);
						done();
					});
				});
			
				it("contributor ID is correct", function(done){
					weifundInstance.contributionID(campaignID, transactionObject.from, 0, function(err, result){
						chai.assert.equal(err, null);
						chai.assert.equal(result.toNumber(10), contributionID);
						done();
					});
				});
			
				it("one total contributions", function(done){
					weifundInstance.totalContributions(campaignID, function(err, result){
						chai.assert.equal(err, null);
						chai.assert.equal(result.toNumber(10), 1);
						done();
					});
				});
			
				it("campaign amount raised by amount contributed", function(done){
					weifundInstance.amountRaisedBy(campaignID, function(err, result){
						chai.assert.equal(err, null);
						chai.assert.equal(result.toNumber(10), amountContributed);
						done();
					});
				});
			
				it("campaign is not success", function(done){
					weifundInstance.isSuccess(campaignID, function(err, result){
						chai.assert.equal(err, null);
						chai.assert.notOk(result);
						done();
					});
				});
			
				it("campaign has not failed", function(done){
					weifundInstance.hasFailed(campaignID, function(err, result){
						chai.assert.equal(err, null);
						chai.assert.notOk(result);
						done();
					});
				});
			
				it("contributor is contributor to campaign", function(done){
					weifundInstance.isContributor(campaignID, transactionObject.from, function(err, result){
						chai.assert.equal(err, null);
						chai.assert.ok(result);
						done();
					});
				});
				
				describe("second contribute campaign", function(){
					var error,
						transactionObject,
						amountContributed = 2500,
						contributionID = 1;

					beforeAll(function(done){
						transactionObject = _.extend(web3.eth.defaultTxObject, {value: amountContributed});
						var contirbutedEventFilter = {
							_owner: transactionObject.from
						};

						weifundInstance.contribute(campaignID, beneficiary, transactionObject, function(err, result){
							if(err) {
								error = err;
								done();
							}
						});
						weifundInstance.Contributed(contirbutedEventFilter, function(err, result){
							if(err) {
								error = err;
								done();
							}

							done();
						});
					});

					it("no errors while contributing to campaign", function(done){
						chai.assert.equal(error, null);
						done();
					});
			
					it("contributor data is correct", function(done){
						/*(address contributor, 
							address beneficiary, 
							uint amountContributed, 
							bool refunded,
							uint created)*/

						weifundInstance.contributionAt(campaignID, contributionID, function(err, result){
							chai.assert.equal(err, null);
							chai.assert.ok(result);
							chai.assert.equal(result[0], transactionObject.from);
							chai.assert.equal(result[1], transactionObject.from);
							chai.assert.equal(result[2].toNumber(10), amountContributed);
							chai.assert.equal(result[3], false);
							chai.assert.ok(result[4]);
							done();
						});
					});

					it("contributor ID is correct", function(done){
						weifundInstance.contributionID(campaignID, transactionObject.from, contributionID, function(err, result){
							chai.assert.equal(err, null);
							chai.assert.equal(result.toNumber(10), contributionID);
							done();
						});
					});

					it("two total campaign contributions", function(done){
						weifundInstance.totalContributions(campaignID, function(err, result){
							chai.assert.equal(err, null);
							chai.assert.equal(result.toNumber(10), 2);
							done();
						});
					});

					it("campaign amount raised by amount contributed", function(done){
						weifundInstance.amountRaisedBy(campaignID, function(err, result){
							chai.assert.equal(err, null);
							chai.assert.equal(result.toNumber(10), fundingGoal);
							done();
						});
					});

					it("campaign is success", function(done){
						weifundInstance.isSuccess(campaignID, function(err, result){
							chai.assert.equal(err, null);
							chai.assert.ok(result);
							done();
						});
					});

					it("campaign has not failed", function(done){
						weifundInstance.hasFailed(campaignID, function(err, result){
							chai.assert.equal(err, null);
							chai.assert.notOk(result);
							done();
						});
					});

					it("contributor is contributor to campaign", function(done){
						weifundInstance.isContributor(campaignID, transactionObject.from, function(err, result){
							chai.assert.equal(err, null);
							chai.assert.ok(result);
							done();
						});
					});
				});
			});
		});
	});
});
	
