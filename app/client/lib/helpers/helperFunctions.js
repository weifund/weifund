/**
Helper functions

@module Helpers
**/

/**
The Helpers class containing helper functions

@class Helpers
@constructor
**/

Helpers = {};

/**
Reruns functions reactively, based on an interval. Use it like so:

    Helpers.rerun['10s'].tick();

@method (rerun)
**/

Helpers.rerun = {
    '10s': new ReactiveTimer(10)
};

Helpers.cleanAscii = function(str) {
	str = String(str);
	
	return str.replace(/[^\x00-\x7F]/g, "");	
};

/**
Clear localStorage

@method (getLocalStorageSize)
**/

Helpers.getLocalStorageSize = function(){

    var size = 0;
    if(localStorage) {
        _.each(Object.keys(localStorage), function(key){
            size += localStorage[key].length * 2 / 1024 / 1024;
        });
    }

    return size;
};

/**
Reactive wrapper for the moment package.

@method (moment)
@param {String} time    a date object passed to moment function.
@return {Object} the moment js package
**/

Helpers.moment = function(time){

    // react to language changes as well
    TAPi18n.getLanguage();

    if(_.isFinite(time) && moment.unix(time).isValid())
        return moment.unix(time);
    else
        return moment(time);

};

/**
Formats a timestamp to any format given.

    Helpers.formatTime(myTime, "YYYY-MM-DD")

@method (formatTime)
@param {String} time         The timstamp, can be string or unix format
@param {String} format       the format string, can also be "iso", to format to ISO string, or "fromnow"
@return {String} The formated time
**/

Helpers.formatTime = function(time, format) { //parameters
    
    // make sure not existing values are not Spacebars.kw
    if(format instanceof Spacebars.kw)
        format = null;

    if(time) {

        if(_.isString(format) && !_.isEmpty(format)) {

            if(format.toLowerCase() === 'iso')
                return Helpers.moment(time).format('YYYY-MM-DD HH:mm Z'); 
			if(format.toLowerCase() == 'daystogo')
				time = Math.round((time - moment().unix())/(60 * 60 * 24));
            else if(format.toLowerCase() === 'fromnow') {
                // make reactive updating
                Helpers.rerun['10s'].tick();
                time = Helpers.moment(time).fromNow().replace(/in/g, '');
            } else
                time = Helpers.moment(time).format(format);
        }

        return time;

    } else
        return '';
};


/**
Add an http prefix to a url string.

@method (addhttp)
@param {String} url         Prefix with http if not already
@return {String} The formatted URL
**/

Helpers.addhttp = function(url){
   if (!/^(f|ht)tps?:\/\//i.test(String(url)))
      url = "http://" + String(url);
   
   return url;
};


/**
Clean up a url for display.

@method (cleanURL)
@param {String} url         The raw URL to be parsed
@return {String} The parsed URL
**/

Helpers.cleanURL = function(url){
    return String(url).replace("http://", "").replace("https://", "").replace("www.", "");
};

Helpers.cleanString = function(input) {
    return input.replace(/[^a-z0-9 ,.?!_*&%$#@+=-]/ig, '');
};

Helpers.cleanXSS = function(obj){
	if(typeof obj === "object") {
		for(key in obj) {
			if(!obj.hasOwnProperty(key))
				continue;

			if(typeof obj[key] === "object")
				obj[key] = Helpers.cleanXSS(obj[key]);
			else
				obj[key] = Helpers.cleanAscii(Sanitizer.sanitize(obj[key]));
		}
	}else{
		obj = Helpers.cleanAscii(Sanitizer.sanitize(obj));
	}
	
	return obj;
};


/**
A simple post method.

@method (post)
@param {path} url         The raw URL to be parsed)
@param {params} url         The raw URL to be parsed
@param {method} url         The raw URL to be parsed
**/

Helpers.post = function(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("target", '_blank');
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
         }
    }

    document.body.appendChild(form);
    form.submit();
}



/**
Parse incoming video URL.

@method (parseVideoUrl)
@param {String} url         The uncompressed video URL
@return {Object} The compressed URL object, that includes the type of URL (i.e youtube "yt" or vimeo "vm")
**/

Helpers.parseVideoUrl = function(url) {
    // - Supported YouTube URL formats:
    //   - http://www.youtube.com/watch?v=My2FRPA3Gf8
    //   - http://youtu.be/My2FRPA3Gf8
    //   - https://youtube.googleapis.com/v/My2FRPA3Gf8
    // - Supported Vimeo URL formats:
    //   - http://vimeo.com/25451551
    //   - http://player.vimeo.com/video/25451551
    // - Also supports relative URLs:
    //   - //player.vimeo.com/video/25451551

    url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

    if (RegExp.$3.indexOf('youtu') > -1) {
        var type = 'yt';
    } else if (RegExp.$3.indexOf('vimeo') > -1) {
        var type = 'vm';
    }

    return {
        type: type,
        id: RegExp.$6
    };
}

    
/**
Build video data from bytes32 type and id.

@method (parseVideo)
@param {String} data         The compressed URL data
@return {Object} The video data object, that includes the type, url and iframe src.
**/
    
Helpers.parseVideo = function(data) {
    var return_data = {valid: false, type: "", url: "", src: ""},
		type = '',
		rawId = '';
	
	if(_.isUndefined(data))
		return return_data;
	
    data.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

    if (RegExp.$3.indexOf('youtu') > -1) {
       	type = 'yt';
		rawId = RegExp.$6;
    } else if (RegExp.$3.indexOf('vimeo') > -1) {
        type = 'vm';
		rawId = RegExp.$6;
    }
    
    switch(type){
        case "yt":
            return_data.type = "youtube";
            return_data.url = "https://www.youtube.com/watch?v=" + rawId;
            return_data.src = "https://www.youtube.com/embed/" + rawId + "?modestbranding=1&autohide=1&showinfo=0&controls=0";
        break;
    
        case "vm": 
            return_data.type = "vimeo";
            return_data.url = "https://vimeo.com/" + rawId;
            return_data.src = "https://player.vimeo.com/video/" + rawId;
        break;
            
        default:
            return return_data;
    }
    
    return_data.valid = true;
	return return_data;
    
    /*if(_.isUndefined(data) || !_.isString(data) || data == "")
        return return_data;
    
    data = _.trim(data);
    var raw = data.split(" ");
    
    var rawType = false;
    var rawId = false;
    
    if(raw.length != 2) {
        var parseAttempt = this.parseVideoUrl(data);
        
        rawType = parseAttempt.type;
        rawId = parseAttempt.url;
    }else{
        rawType = raw[0];
        rawId = Helpers.cleanString(raw[1]);
    }
    
    if(!_.isString(rawType) || !_.isString(rawId))
        return return_data;
    
    if(rawId.length < 6 || rawId.length > 13)
        return return_data;
    
    switch(rawType){
        case "yt":
            return_data.type = "youtube";
            return_data.url = "https://www.youtube.com/watch?v=" + rawId;
            return_data.src = "https://www.youtube.com/embed/" + rawId + "?modestbranding=1&autohide=1&showinfo=0&controls=0";
        break;
    
        case "vm": 
            return_data.type = "vimeo";
            return_data.url = "https://vimeo.com/" + rawId;
            return_data.src = "https://player.vimeo.com/video/" + rawId;
        break;
            
        default:
            return return_data;
    }
    
    return_data.valid = true;
    return return_data;*/
};