// test timeout
/*var timeout = 20000,
	//rpcProvider = LocalStore.get('rpcProvider'),
	transactionObject = null,
	weifundInstance = null;

describe("web3 connectivity", function(){
	before(function(done){
		web3.setProvider(new web3.providers.HttpProvider("http://104.236.65.136:8545/"));

		web3.eth.getAccounts(function(err, result){
			chai.assert.notOkay(err);
			chai.assert.isArray(result);
			chai.assert.ok(result.length);

			if(result.length == 0)
				return;

			transactionObject = {
				from: result[0],
				gas: web3.eth.defaultGas
			};

			done();
		});
	});

	it("has a provider set", function(done){
		chai.assert.ok(web3.currentProvider);
		done();
	});
});*/

var transactionObject = null,
	weifundInstance = null;
			
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

describe('WeiFund testing', function () {
	beforeAll(function(done){
		web3.setProvider(new web3.providers.HttpProvider("http://104.236.65.136:8545/"));

		web3.eth.getAccounts(function(err, result){
			chai.assert.equal(err, null);
			chai.assert.isArray(result);
			chai.assert.ok(result.length);

			if(result.length == 0)
				return;

			transactionObject = {
				from: result[0],
				gas: web3.eth.defaultGas
			};

			done();
		});
	});
	
	it('should have global WeiFund and tx object', function () {
		chai.assert.ok(web3);
		chai.assert.ok(WeiFund);
		chai.assert.ok(transactionObject);
	});
	
	describe("contract testing", function(){		
		beforeAll(function(done){
			WeiFund.new(_.extend(transactionObject, {data: WeiFund.bytecode}), function(err, result){
				if(!result.address)
					return;

				weifundInstance = WeiFund.at(result.address);
				done();
			});
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
		
		describe("new campaign", function(){
			var name = "Nicks New Crowdfund",
				transactionObject = {
					from: '0x2f9a8d47e91ac10f32f5b37b6ae8197548de049a',
					gas: web3.eth.defaultGas
				},
				owner = transactionObject.from,
				beneficiary = transactionObject.from,
				fundingGoal = 50000,
				expiry = moment.unix() + 3500000,
				config = 0,
				eventFilter = {
					owner: transactionObject.from
				},
				campaignID = 0;
			
			beforeAll(function(done){
				weifundInstance.newCampaign(name, beneficiary, fundingGoal, expiry, config, transactionObject, function(err, result){});
				weifundInstance.CampaignCreated(eventFilter, function(err, result){
					done();
				});
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
				weifundInstance.isFailure(campaignID, function(err, result){
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
			
			it("the owner of the campaign is correct", function(done){
				weifundInstance.ownerOf(campaignID, owner, function(err, result){
					chai.assert.equal(err, null);
					chai.assert.ok(result);
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
			
			/*describe("contribute to campaign", function(){
				beforeAll(function(done){
					var transactionObject = {
						from: '0x2f9a8d47e91ac10f32f5b37b6ae8197548de049a',
						gas: web3.eth.defaultGas,
						value: 50000,
					};
					
					weifundInstance.contribute(0, 0, transactionObject, function(err, result){});
					weifundInstance.Contributed(eventFilter, function(err, result){
						done();
					});
				});
			});*/
		});
	});
});
	
