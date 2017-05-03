var express       = require('express');
var router        = express.Router();
var User          = require('../model/User.js');
var Notifications = require('../model/Notifications.js');
var request       = require('request');

// var allNotifications = [];

router.get('/', function(req, res) {
    User.find({},function(err, users){
        res.render('test', {
            users: users.map(function(val){
                return val.ID;
            })
        });
    });
});

router.post('/sendPushNotif', function(req,res){

    console.log("Notification received " ,req.body);
    Notifications(req.body).save(function(err){
        res.send('done');
    });

});

router.get('/notif', function(req, res) {
    Notifications.find({}, function(err, allNotifications){
        res.render('allnotif', {n: allNotifications});
    });
});

router.get('/success/:user', function(req, res) {
    var u = req.params.user;
    res.send('Success for ' + u);
});

module.exports = router;
