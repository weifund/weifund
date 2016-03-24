var ipfs = require('../ipfs.js');
var ipfsApi = require('ipfs-api');
var ipfsd = require('ipfsd-ctl');
var assert = require('chai').assert;

function log () {
  var args = ['    #']
  args = args.concat(Array.prototype.slice.call(arguments))
  console.log.apply(console, args)
}

describe('IPFS', function () {
  var ipfsNode;

  before(function(done) {
    log('ipfs node setup');

    ipfsd.disposable(function (err, node) {
      if (err) throw err;
      ipfsNode = node;

      ipfsNode.startDaemon(function (err, ignore) {
	if (err) throw err;
	log('ipfs daemon running');

	ipfs.setProvider(ipfsApi(ipfsNode.apiAddr));
	done();
      });
    });
  });

  it('setProvider throws error in node', function(done) {
    var err;
    try {
      ipfs.setProvider({host: ipfsNode.apiAddr});
    } catch (e) {
      err = e;
    } finally {
      assert.isNotNull(err);
      done();
    }
  });

  it('verify connection', function(done) {
    ipfs.api.id(function(err, res) {
      assert.isNull(err);
      done();
    });
  });

  it("adds text to IPFS", function(done) {
    var targetHash = 'Qmc7CrwGJvRyCYZZU64aPawPj7CJ56vyBxdhxa38Dh1aKt';
    var targetText = 'Testing...';

    ipfs.add(targetText, function(err, hash) {
      assert.strictEqual(hash, targetHash);
      done();
    });
  });

  it("gets text from IPFS", function(done) {
    var targetHash = 'Qmc7CrwGJvRyCYZZU64aPawPj7CJ56vyBxdhxa38Dh1aKt';
    var targetText = 'Testing...';

    ipfs.cat(targetHash, function(err, data) {
      assert.strictEqual(data.toString(), targetText);
      done();
    });
  });

  it("adds data to IPFS", function(done) {
    var targetHash = 'Qmc7CrwGJvRyCYZZU64aPawPj7CJ56vyBxdhxa38Dh1aKt';
    var targetText = 'Testing...';
    var buf = new Buffer(targetText);

    ipfs.add(buf, function(err, hash) {
      assert.strictEqual(hash, targetHash);
      done();
    });
  });

  it("adds JSON to IPFS", function(done) {

    var targetHash = 'QmPhbf5AoE9SF8RUqjCFf15i9ACZ449YTLUFoGnmrs1QZc';
    var jsonObject = {'x' : 1234, 
	              'y' : 'hello',
	              'arr' : [0,1,2,3,4],
	              'obj' : {'a' : 'str', 'b' : 123}};

    ipfs.addJson(jsonObject, function(err, hash) {
      assert.strictEqual(hash, targetHash);
      done();
    });
  });

  it("gets JSON from IPFS", function(done) {
    var hash = 'QmPhbf5AoE9SF8RUqjCFf15i9ACZ449YTLUFoGnmrs1QZc';
    var targetObject = {'x' : 1234, 
	                'y' : 'hello',
	                'arr' : [0,1,2,3,4],
	                'obj' : {'a' : 'str', 'b' : 123}};

    ipfs.catJson(hash, function(err, jsonObj) {
      assert.strictEqual(jsonObj.x, targetObject.x);
      assert.strictEqual(jsonObj.y, targetObject.y);
      assert.strictEqual(jsonObj.obj.a, targetObject.obj.a);
      assert.strictEqual(jsonObj.obj.b, targetObject.obj.b);

      for (var i=0; i<targetObject.arr.length; i++) {
	assert.strictEqual(jsonObj.arr[i], targetObject.arr[i]);
      }

      done();
    });
  });

  it("dropped connection throws error", function(done) {
    var isCalled;
    ipfsNode.stopDaemon(function() {
      if (!isCalled) 
	ipfs.api.id(function(err, res) {
	  assert.isNotNull(err);
	  done();
	});
      isCalled = true;
    });
  });

});
