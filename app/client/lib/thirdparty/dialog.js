/**
Dialog module for simple dialogs in Metoer.

Requires:
 - Underscore.js v1.8.3+  <http://underscorejs.org/>
 - Blaze.js v* <http://meteor.github.io/blaze/>
 - Meteor.js v* <https://www.meteor.com/>
 - JQuery.js v* <https://jquery.com/>
**/

/**
Construct the Dialog as a global window object.

@class [Object] Dialog
@constructor
**/

var Dialog = window.Dialog = Dialog = {};


/**
These are the default options for the various kinds of Dialog windows. These default options include default header titles, button text and inputs.

@var (defaultOptions)
**/

Dialog.defaultOptions = {
    confirm: {
        title: 'Confirm',
        buttons: {
            positive: 'Confirm',
            negative: 'Deny',
        },
    },
    promt: {
        title: 'Promt',
        inputs: [
            {type: 'input', options: {type: 'text', placeholder: 'Value'}}
        ],
        buttons: {
            positive: 'Ok',
            negative: 'Canel',
        },
    },
    alert: {
        title: 'Alert',
        buttons: {
            positive: 'Ok',
            negative: '',
        },
    },
};


/*
The confirm Dialog used for confirming or denying a point of decision making.

    Dialog.confirm('Are you sure?', {title: 'Please Confirm'}, function(result, values){
        if(result)
            console.log('Thanks for confirming!');
    });

@method (confirm)
@param {String} msg          The dialog message
@param {Object} options
@param {Function} callback   ex: function(result, values){}
**/

Dialog.confirm = function(msg, options, callback){ //yes or no
    // Build the confirm dialog window
    this._make(msg, options, callback, 'confirm');
};


/*
The promt dialog used for promting input fields. The default promt comes with a single text field.

    Dialog.promt('What is your email?', {title: 'Email Please', inputs:['email']}, function(result, values){
        if(result)
            console.log('Thanks for providing your email', values[0]);     
    });

@method (confirm)
@param {String} msg          The dialog message
@param {Object} options
@param {Function} callback   e.g. function(result, values){}
**/

Dialog.promt = function(msg, options, callback){
    // Build the promt dialog window
    this._make(msg, options, callback, 'promt');
};


/*
The confirm Dialog used for confirming or denying a point of decision making.

    Dialog.alert('Wow, please be alert!');

@method (confirm)
@param {String} msg          The dialog message
@param {Object} options
@param {Function} callback   e.g. function(result, values){}
**/

Dialog.alert = function(msg, options, callback){
    // Build the alert dialog window
    this._make(msg, options, callback, 'alert');
};


/*
This method will build the dialog window.

@method (_make)
@param {String} msg          The dialog message
@param {Object} options
@param {Function} callback   e.g. function(result, values){}
@param {String} defaultOption   e.g. 'promt'
**/

Dialog._make = function(msg, options, callback, defaultOption){
    if(_.isUndefined(callback))
        callback = function(result, values){};
    
    if(_.isFunction(options))
        callback = options;
    
    if(_.isFunction(options) || _.isUndefined(options))
        options = {};
    
    if(_.isUndefined(msg) || !_.isString(msg))
        msg = '';
    
    // setup default options
    options = _.extend(this.defaultOptions[defaultOption], options);
    options.msg = msg;
    options.callback = callback;
    
    // render the confirm dialog
    this._renderDialog(options);  
    
    if(defaultOption != 'promt')
        return;
    
    _.each(options.inputs, function(input, inputIndex){
        if(_.isString(input)) {
            jQuery('<input/>', {type: 'text', placeholder: input})
                .appendTo('.dialog-inputs');
        }else{
            jQuery('<' + input.type + '/>', input.options)
                .appendTo('.dialog-inputs');
        }
    });
};


/*
This method will render the dialog window.

@method (_make)
@param {Object} data        THe data object
@param {Object} the rendered template
**/

Dialog._renderDialog = function (data) {
  return Blaze.renderWithData(Template.components_dialog, data, document.body);
};