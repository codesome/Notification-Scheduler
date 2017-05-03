var express   = require('express');
var router    = express.Router();
var User      = require('../model/User.js');
var request   = require('request');
var Scheduler = require('../module/Scheduler.js');

router.get('/', function(req, res) {
    res.render('index');
});

router.post('/scheduleNotification', function(req, res){
    
    var data = req.body;

    if( !data.targetUser) {
        console.log('Error', Scheduler.errorCodes.noUser);
        return res.send({"status":false, "error": Scheduler.errorCodes.noUser });    
    } else if( !data.notificationType) {
        console.log('Error', Scheduler.errorCodes.noType);
        return res.send({"status":false, "error": Scheduler.errorCodes.noType });    
    } else if( !data.message) {
        console.log('Error', Scheduler.errorCodes.noMessage);
        return res.send({"status":false, "error": Scheduler.errorCodes.noMessage });    
    } else if( !data.destinationURL) {
        console.log('Error', Scheduler.errorCodes.noDestination);
        return res.send({"status":false, "error": Scheduler.errorCodes.noDestination });    
    }

    data.priority = data.priority || 2;

    if( data.priority == 1 ) {
    
        console.log("Notification requested to send",data);
    
        Scheduler.sendNotification(
            data.targetUser, 
            data.message, 
            data.destinationURL, 
            function(error){
                if (!error) {
                    return res.send({ "status": true, "message": "sent" });
                } else {
                    return res.send({ "status": false, "message": error });
                }
            }
        );

    } else {
        
        console.log("Notification requested to schedule",data);

        Scheduler.schedule(
            data.targetUser, 
            data.message, 
            data.destinationURL, 
            function(error){
                if (!error) {
                    return res.send({ "status": true, "message": "scheduled" });
                } else {
                    return res.send({ "status": false, "message": error });
                }
            }
        );

    }

}); 

router.get('/notification/:user', function(req, res){
    var userID      = req.params.user;
    var destination = req.query.dest;

    if(!destination) {
        return res.send("Invalid URL");
    }

    User.findOne({ ID: userID}, function(err, user){
        if(!user) {
            return res.send("Invalid URL");
        } else {
            var timeid = Scheduler.currentTimeIndex();
            user.timeWeights[timeid]++;
            user.markModified('timeWeights');
            user.save(function(err){
                res.redirect(destination);
            });
        }
    });

});

router.get('/addUsers/:N', function(req, res){
    var N = Number(req.params.N) || 0;
    require('../dev').addDummyUsers(N, function(){
        res.send(N + " users added");
    });
});

module.exports = router;
