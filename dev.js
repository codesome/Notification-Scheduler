var User = require('./model/User.js')

function randomString(N) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < N; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

module.exports.addDummyUsers = function (N, cb) {
    
    if(!N) return;

    var count = 0;

    function addUserUtil() {

        var newID = randomString(10);
        User.findOne({ID: newID}, function(err, u){
            if(u) {
                addUserUtil();
            } else {
                 User({
                    ID: newID,
                    pushEnabled: true,
                    notificationLimit: {
                        "24": 100,
                        "48": 150
                    },
                    notificationSent: {
                        "24": 0,
                        "48": 0
                    },
                    userID: newID,
                    timeWeights: [
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                    ],
                    notifications: []
                }).save(function(){
                    console.log(newID);
                    addUser();
                });
            }
        });

    }

    function addUser(){
        count++;
        if(count <= N){
            addUserUtil();
        } else {
            if(cb) cb();
        }

    }

    addUser();

}
