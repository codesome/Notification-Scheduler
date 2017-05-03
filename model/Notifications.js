var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var notificationSchema = new Schema({

    targetUser: String,
    
    message: String,
    
    destinationURL: String

});

var Notifications = mongoose.model( 'Notifications' , notificationSchema );

module.exports = Notifications;
