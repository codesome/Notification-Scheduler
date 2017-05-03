var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({

    ID: String,    

    pushEnabled: { type: Boolean, default: true},

    notificationLimit: {
        "24": { type: Number, default: 86400},
        "48": { type: Number, default: 172800}
    },

    notificationSent: {
        "24": { type: Number, default: 0},
        "48": { type: Number, default: 0}
    },
    
    timeWeights: [ Number ],

    toSend: {type: Boolean, default: false},

    notifications: [{
        
        "message": String,

        "destinationURL": String
    
    }]

});

userSchema.index({ ID:1 }, { unique: true });

var User = mongoose.model( 'User' , userSchema );

module.exports = User;
