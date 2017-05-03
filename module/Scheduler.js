var User  = require('../model/User.js');
var async = require('async');
var request = require('request');

const errorCodes = {
    "noUser" : {
        "code": 1,
        "type": "noUser"
    },
    "noMessage" : {
        "code": 2,
        "type": "noType"
    },
    "noMessage" : {
        "code": 3,
        "type": "noMessage"
    },
    "noDestination" : {
        "code": 4,
        "type": "noDestination"
    },
};

function getMaskedDestination(targetUser, destinationURL) {
    return host
        + "/notification"
        + "/" + targetUser
        + "?dest=" + destinationURL
}

function sendNotificationUtil(targetUser, message, destinationURL, cb) {
    request.post(
        'http://localhost:3001/sendPushNotif',

        { 
            json: { 
                targetUser: targetUser,
                message: message,
                destinationURL: getMaskedDestination(targetUser, destinationURL) 
            } 
        },

        function (error, response, body) {
            cb(error);
        }
    );
}

function sendNotification(targetUser, message, destinationURL, cb){
    
    User.findOne({ID: targetUser},function(err, user){
        if(user) {
        
            if(!user.pushEnabled) return cb("Push not enabled");
            if(user.notificationSent["24"] >= user.notificationLimit["24"] || user.notificationSent["48"] >= user.notificationLimit["48"] ){
                return schedule(targetUser, message, destinationURL, cb);
            }

            sendNotificationUtil(targetUser, message, destinationURL, function(error){
                if(!error){
                    user.notificationSent["24"]++;
                    user.notificationSent["48"]++;
                    user.save(function(){
                        cb(false);
                    });
                } else {
                    cb(error);
                }
            });

        } else {
            return cb("User not found");
        }
    });

}

function schedule(targetUser, message, destinationURL, cb){
    
    User.findOne({ID: targetUser},function(err, user){
        if(user) {
        
            if(!user.pushEnabled) return cb("Push not enabled");
            
            user.notifications.push({
                message: message,
                destinationURL: destinationURL
            });
            user.toSend = true;
            user.save(function(){
                cb(false);
            });

        } else {
            return cb("User not found");
        }
    });

}

function getMinuteID(minute){
    if(minute < 10) return 0;
    if(minute < 20) return 10;
    if(minute < 30) return 20;
    if(minute < 40) return 30;
    if(minute < 50) return 40;
    else return 50;
}

// function getTimeID() {
//     var d = new Date();
//     return "" + d.getHours() + "x" + getMinuteID(d.getMinutes());
// }

// function getTimeIndex(timeID){
//     var l = timeID.split('x');
//     return (Number(l[0]) * 6) + (Number(l[1])/10)
// }

function currentTimeIndex() {
    var d = new Date();
    return (d.getHours()*6) + (getMinuteID(d.getMinutes())/10)
}

function nextGreaterExists(l, i) {
    var val = l[i];
    var len = l.length;
    for(var j=i+1; j<len; j++) {
        if(l[j] > val) return true;
    }
    return false;
}

function cronJob() {
    
    var timeIndex = currentTimeIndex();

    User.find({toSend: true}, function(err, users) {
        
        async.eachSeries(users, function(user, callback) {
            
            var n = user.notifications.length; 
            if (user.notificationLimit["24"]-user.notificationSent["24"] < n) {
                n = user.notificationLimit["24"]-user.notificationSent["24"];
            }
            if (user.notificationLimit["48"]-user.notificationSent["48"] < n) {
                n = user.notificationLimit["48"]-user.notificationSent["48"];
            }

            if(n == 0) {
                user.toSend = false;
                user.save(function(){
                    callback();
                });
            } else if() {
                nextGreaterExists( user.timeWeights, timeIndex);
            } else {
                var userID = user.ID;
                async.eachSeries(user.notifications.slice(0,n), function(notif, cb){
                    sendNotificationUtil(
                            userID, 
                            notif.message, 
                            notif.destinationURL, 
                            function(){ cb(); }
                    );
                }, 
                function done(){
                    user.notificationSent["24"] += n;
                    user.notificationSent["48"] += n;
                    user.notifications = user.notifications.slice(n);
                    if(user.notifications.length == 0) {
                        user.toSend = false;
                    }
                    user.save(function(){
                        callback();
                    });
                });
            }

        });
        

    });

}

function resetLimits() {

    User.find({}, function(err, users){

        async.eachSeries(users, function(user, callback) {
            
            user.notificationSent["48"] = user.notificationSent["24"];
            user.notificationSent["24"] = 0;
            if(user.notifications.length > 0){
                user.toSend = true;
            }
            user.save(function(){
                callback();
            });
        
        });

    });

}

module.exports.errorCodes       = errorCodes;
module.exports.sendNotification = sendNotification;
module.exports.schedule         = schedule;
module.exports.cronJob          = cronJob;
// module.exports.getTimeID        = getTimeID;
// module.exports.getTimeIndex     = getTimeIndex;
module.exports.currentTimeIndex = currentTimeIndex;
module.exports.resetLimits      = resetLimits;