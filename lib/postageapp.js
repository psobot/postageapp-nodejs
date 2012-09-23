var http = require('http'),
    crypto = require('crypto');

var postageVersion = '1.1.2';

module.exports = function(apiKey) {
    return {
        sendMessage: function (options, callback) {
            var request = http.request({
                'port': 80,
                'host': 'api.postageapp.com',
                'method': 'POST',
                'path': '/v.1.0/send_message.json',
                'headers': {
                    'host': 'api.postageapp.com',
                    'content-type': 'application/json',
                    'user-agent': 'PostageApp Node.JS ' + postageVersion + ' (Node.JS ' + process.version + ')'
                }
            });

            var recipients = options.recipients;

            var subject = options.subject;
            var from = options.from;

            var attachments = options.attachments ? options.attachments : {};
            var content = options.content;

            var template = options.template;
            var variables = options.variables;

            /*
             Payload is the aggregated data that will be passed to the API server including all of the parameters
             required to send an email through PostageApp.
             */
            var payload = {
                api_key: apiKey,
                arguments: {
                    recipients: recipients,
                    headers: {
                        subject: subject,
                        from: from
                    },
                    content: content,
                    attachments: attachments,
                    template: template,
                    variables: variables
                }
            };

            /*
             Creates a hash to be used for the UID, which has to be a unique identifier in order
             to prevent duplicate sending through PostageApp. We also need to make sure this is a string rather
             than just an integer - so a hash of the timestamp and payload will do nicely.
            */
            payload['uid'] = crypto.createHash('sha1').update(
                (new Date).getTime().toString() + JSON.stringify(payload)
            ).digest('hex');
            

            // Do we care about our API response? If the user has passed in a callback, then we do.
            if (typeof callback !== 'undefined') {
                request.on('response', function (response) {
                    response.setEncoding('utf8');
                    response.on('data', function (chunk) {
                        callback(null, chunk);
                    });
                });
            }

            request.end(JSON.stringify(payload));
        },

        accountInfo: function () {
            var request = http.request({
                'port': 80,
                'host': 'api.postageapp.com',
                'method': 'POST',
                'path': '/v.1.0/get_account_info.json',
                'headers': {
                    'host': 'api.postageapp.com',
                    'content-type': 'application/json',
                    'user-agent': 'PostageApp Node.JS ' + postageVersion + ' (Node.JS ' + process.version + ')'
                }
            });

            var payload = {
                api_key: apiKey
            };

            request.on('response', function (response) {
                console.log('STATUS: ' + response.statusCode);
                response.setEncoding('utf8');
                response.on('data', function (chunk) {
                    console.log('BODY: ' + chunk);
                });
            });
            request.end(JSON.stringify(payload));
        },
        
        messageStatus: function (options) {
             var request = http.request({
                'port': 80,
                'host': 'api.postageapp.com',
                'method': 'POST',
                'path': '/v.1.0/message_status.json',
                'headers': {
                    'host': 'api.postageapp.com',
                    'content-type': 'application/json',
                    'user-agent': 'PostageApp Node.JS ' + postageVersion + ' (Node.JS ' + process.version + ')'
                }
            });

            var desiredUID = options.desiredUID;

            var date = new Date;
            var epochDate = date.getTime();

            var payload = {
                api_key: apiKey,
                uid: desiredUID,
            }

            console.log(JSON.stringify(payload));

            request.on('response', function (response) {
          	    console.log('STATUS: ' + response.statusCode);
          	    response.setEncoding('utf8');
          	    response.on('data', function (chunk) {
          		      console.log('BODY: ' + chunk);
          	    });
            });     
            request.end(JSON.stringify(payload));
        }
    }
};
