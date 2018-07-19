'use strict';

const Alexa = require('alexa-sdk');
const http = require('http');
const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
const amberAlertUrl = 'http://www.missingkids.com/missingkids/servlet/JSONDataServlet?action=amberAlert&LanguageId=en_US';
var alexaSDK;
var serviceError = "Sorry, We are not able to get the active amber alerts";
var noDataError = "There are no AMBER Alerts at this time";

function getActiveAmberAlerts() {
    makeActiveAmberAlertRequest(function AmberAbertCallback(err, alerts) {
        var speechOutput;

        if (err) {
            
        } else {
             var alertObj = JSON.parse(alerts);
             if (alertObj.status != 'success')
             alexaSDK.emit(':tellWithCard', errorStr,'Active Amber Alerts');
             else
             {
             if (alertObj.alertCount == 0) 
              alexaSDK.emit(':tellWithCard', noDataError,'Active Amber Alerts');
             else
             {
             var speechOutput = '';
             if (alertObj.alertCount > 1)
             speechOutput += "There are " + alertObj.alertCount + " active amber alerts. ";
             else
             speechOutput += "There is " + alertObj.alertCount + " active amber alert. ";
            
               
             for (var i = 0; i < alertObj.persons.length;i++)
             {
                 speechOutput += alertObj.persons[i].firstName + " " + alertObj.persons[i].lastName 
                 + " missing from " + alertObj.persons[i].city + ", " + alertObj.persons[i].state +
                 " on " + alertObj.persons[i].alertDate;
                 speechOutput += " ";
             }
             alexaSDK.emit(':tellWithCard', speechOutput,'Active Amber Alerts',speechOutput, null);

             }
             }
        }
       
    });
}

function makeActiveAmberAlertRequest(AmberAbertCallback) {

    http.get(amberAlertUrl, function (res) {
        var response = '';
        console.log('Status Code: ' + res.statusCode);

        if (res.statusCode != 200) {
            AmberAbertCallback(new Error("Non 200 Response"));
        }

        res.on('data', function (data) {
            response += data;
        });

        res.on('end', function () {
           AmberAbertCallback(null, response);
        });
    }).on('error', function (e) {
        console.log("Communications error: " + e.message);
        AmberAbertCallback(new Error(e.message));
    });
}
const handlers = {
    'LaunchRequest': function () {
        alexaSDK = this;
       getActiveAmberAlerts();
    },
    'GetActiveAmberAlert': function () {
        alexaSDK = this;
       getActiveAmberAlerts();
    }
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
