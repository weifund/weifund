import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveTimer } from 'meteor/frozeman:reactive-timer';
import { moment } from 'meteor/mrt:moment';
import { web3 } from './lib/thirdparty/web3.js';
import { numeral } from 'meteor/numeral:numeral';
//import { BigNumber } from 'meteor/3stack:bignumber';
///import { WeiFund } from './lib/contracts/WeiFund.sol.js';

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
        
        console.log(WeiFund);
        
        console.log(window);
        
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
