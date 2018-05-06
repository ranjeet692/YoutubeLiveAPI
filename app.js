var request = require('request');
var mysql = require('mysql');
global.keys = require('./config.js');
var connection = mysql.createConnection(global.keys.mysql);

function refreshtoken() {
    var url = 'https://www.googleapis.com/oauth2/v4/token';
    var data = {
        client_id: global.keys.client_secrets.client_id,
        client_secret: global.keys.client_secrets.client_secrets,
        refresh_token: global.keys.client_secrets.refresh_token,
        grant_type: 'refresh_token'
    };
    request({
        "url": url,
        "method": 'POST',
        "json": true,
        "form": data,
    }, function (err, response, body) {
        //reciveing response
        if (!err && response.statusCode !== 400 && response.statusCode != 404 && response.statusCode !== 500) {
            if (body.error) {
                console.log(JSON.stringify(body.error));
            }else {
                global.keys.client_secrets.access_token = body.access_token;
                console.log('Access Token Refreshed');
            }
        } else {
            console.log('Error response');
        }
    });
}

function insertCommentOnYoutube(scope) {
    var url = 'https://www.googleapis.com/youtube/v3/liveChat/messages?part=snippet,authorDetails&alt=json&access_token=' + global.keys.client_secrets.access_token;
    var data = {
        "snippet":{
            "type":"textMessageEvent",
            "liveChatId":global.keys.message.live_chat_id,
            "textMessageDetails":{
                "messageText":global.keys.message.text_message.toString()
            }
        },
        "authorDetails":{
            "displayName":"Bitcoind Bot"
        }
    };
    //creating a request
    request({
        "url": url,
        "method": 'POST',
        "json": true,
        "body": data,
    }, function (err, response, body) {
        //reciveing response
        if (!err && response.statusCode !== 400 && response.statusCode != 404 && response.statusCode !== 500) {
            if (body.error) {
                console.log(JSON.stringify(body.error));
            }else {
                //insertCommentInDB(body);
                console.log('Comment Inserted');
            }
        } else {
            console.log('Error response');
        }
    });
}

function getYoutubeComment() {
    //required parameters
    //make a request to youtube api with required parameters
    var url = 'https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=' + global.keys.message.live_chat_id + '&part=snippet&key=' + global.keys.client_secrets.api_keys + '&maxResults=200';

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
                if (body && body.items) {
                    var chat = filterChatItems(body.items);
                    insertCommentInDB(chat);
                }
            }
        } else {
            console.log('Error response');
        }
    });
}

//Inserting information into DB
function insertCommentInDB(data) {
    var parsedMessage = data.displayMessage.replace(/\'/g, "''");;
    connection.query("INSERT INTO livechatmessage(`chat_id`, `author_id`, `published_at`,`message`) VALUES('" + data.liveChatId + "', '" + data.authorChannelId + "', '" + data.publishedAt +"', '" + parsedMessage + "')", function (error, results, fields) {
        if (error) {
            throw error;
        }else {
            console.log('Comments saved into database at ' + new Date());
        }
    });
}

refreshtoken();
getYoutubeComment();

function filterChatItems(body) {
    var chats = body.filter(function(item) {
        if (item.snippet && item.snippet.displayMessage.substring(0,4) === 'Rick') {
            return item;
        }
    });
     var snippets = chats.map(function(item) {
        return item.snippet;
     });
    return snippets[snippets.length - 1];
}

//Event execution in every 10 minutes
var interval = 600000;
setInterval(function() {
    getYoutubeComment();
    insertCommentOnYoutube();
}, interval);

//Refresh Token in every hour
setInterval(function() {
    refreshtoken();
}, 3500000);

/**
 * End of the script
 */


//MYSQl Table
/**
 * CREATE TABLE livechatmessage ( 
        id  MEDIUMINT NOT NULL AUTO_INCREMENT,
        chat_id VARCHAR(150),
        author_id VARCHAR(150),
        published_at VARCHAR(100),
        message TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    );
 */