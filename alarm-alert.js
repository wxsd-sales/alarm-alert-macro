/********************************************************
 * 
 * Macro Author:      	William Mills
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-0-0
 * Released: 06/14/22
 * 
 * This macro will monitor the T3 Alarm Detection status on your Webex Device.
 * Once an alarm event has been detected, it will end any active calls and 
 * display the alert URL. You can create a custom alert web page and change
 * the example alert URL to yours if you want, just ensure the Webex Device
 * can reach the site from the network its connected to.
 * 
 * Configure the desired alert URL you whish to diplay and select the macro
 * behaviou using the below toggles.
 *
 * Full Readme, source code and license agreement available on Github:
 * https://github.com/wxsd-sales/alarm-alert-macro
 * 
 ********************************************************/

import xapi from 'xapi';

/*********************************************************
 * Configure the settings below
**********************************************************/

const config = {
  alertURL: 'https://wxsd-sales.github.io/alarm-alert-macro/',
  allowDismiss: true,
  autoEndCall: true
}

/*********************************************************
 * Main functions and event subscriptions
**********************************************************/


xapi.Config.WebEngine.Mode.set('On');
xapi.Config.RoomAnalytics.T3AlarmDetection.Mode.set('On');
xapi.Status.RoomAnalytics.T3Alarm.Detected.on(processAlarms);
xapi.Event.UserInterface.Message.Prompt.Response.on(promptResponse);
xapi.Event.CallDisconnect.on(processDisconnects);

xapi.Status.RoomAnalytics.T3Alarm.Detected.get()
  .then(result => processAlarms(result))


// This function will process alarm events
function processAlarms(status) {
  console.log(`T3 Alarm Detection Mode set to [${status}]`)
  status === 'True' ? activateAlert() : deactiveAlert();
}

// Activate the alert notifications
async function activateAlert() {
  if (config.autoEndCall) {
    const calls = await xapi.Status.Call.get()
    if (calls.length > 0) {
      console.log('Call detected, disonnnecting call first');
      xapi.Command.Call.Disconnect();
      return;
    } 
  }

  displayWebview();
  if (config.allowDismiss) {
    displayPrompt();
  }
}

async function deactiveAlert() {
  console.log(`Deasctivating any active alerts`)
  const webViews = await xapi.Status.UserInterface.WebView.get();
  const alertWebView = webViews.find(view => view.URL == config.alertURL)

  if (alertWebView) {
    xapi.Command.UserInterface.WebView.Clear();
  }
  xapi.Command.UserInterface.Message.Prompt.Clear({ FeedbackId: 'dismiss_alarm' });
}

function displayWebview() {
  console.log('Displaying Web View: ' + config.alertURL);
  xapi.Command.UserInterface.WebView.Display({
    Target: 'OSD',
    Url: config.alertURL
  });
}

function processDisconnects() {
  console.log('Call Disconnect occured');
  xapi.Status.RoomAnalytics.T3Alarm.Detected.get()
    .then(result => processAlarms(result))
}

function displayPrompt() {
  console.log('Displaying dismiss prompt');
  xapi.Command.UserInterface.Message.Prompt.Display(
    {
      Title: 'Alarm Detected',
      Text: 'Alarm detected, tap below to dismiss notification',
      FeedbackId: 'dismiss_alarm',
      "Option.1": 'Dismiss notification'
    });
}

function promptResponse(event) {
  if (event.FeedbackId === 'dismiss_alarm' && event.OptionId == 1) {
    deactiveAlert();
  }
}
