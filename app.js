var request = require('request');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'host address',
    user     : 'mysql username',
    password : 'mysql password',
    database : 'databasename'
});

//Inserting information into DB
function insert(data) {
    if (!data.items || !data.items.length) {
        console.log('No message found');
        return;
    }
    connection.connect();
    connection.query('INSERT INTO livechatmessage(`comments`) VALUES(' + data.items + ')', function (error, results, fields) {
        if (error) {
            throw error;
        }
    });
    connection.end();
}

//Event execution in every 10 minutes
var interval = 10000;
setInterval(function() {
    //required parameters
    //make a request to youtube api with required parameters
    var url = 'https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=&part=';

    //creating a request
    request({
        url: url,
        method: 'GET',
        json: true,
    }, function (err, response, body) {
        //reciveing response
        if (!err && response.statusCode !== 400 && response.statusCode != 404 && response.statusCode !== 500) {
            if (body.error) {
                console.log(JSON.stringify(body.error));
            }else {
                insert(body);
            }
        } else {
            console.log('Unable to create a request');
        }
    });
}, interval);


//MYSQl Table
/**
 * CREATE TABLE livechatmessage ( 
        id  MEDIUMINT NOT NULL AUTO_INCREMENT,
        comments JSON,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    );
 */