
/********************************************************
Copyright (c) 2022 Cisco and/or its affiliates.
This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at
               https://developer.cisco.com/docs/licenses
All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
*********************************************************
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
 ********************************************************/

import xapi from 'xapi';

// Specify the URL alert you wish to display
const ALERT_URL = 'https://wxsd-sales.github.io/alarm-alert-macro/';

// Allow the user to dismiss the notication and return to normal
const ALLOW_DISMISS = true;

// The macro can automatically end any active calls
const END_CAll = true; 

/////////////////////////////////////////////
////////////.Do not change below ////////////
/////////////////////////////////////////////


// Activate the alert notifications
async function activateAlert() {

  // End any active calls
  if (END_CAll) {

    const calls = await xapi.Status.Call.get()
    
    if(calls.length > 0) {
      console.log('Call present, ending call first');
      xapi.Command.Call.Disconnect();
      return;
    }
  }

  console.log('Displaying Web View: ' +ALERT_URL);

  xapi.Command.UserInterface.WebView.Display(
  { Url: ALERT_URL });

  if (ALLOW_DISMISS) {
    displayPrompt();
  }
}


// Monitor call disconnects and activate the alert
// if there is still an active alarm
async function callDisconnect(event) {

  console.log('Call Disconnect occured');

  console.log(event);

  const active = await xapi.Status.RoomAnalytics.T3Alarm.Detected.get();

  if (active === 'True') {
    console.log('Active still active');
    setTimeout(activateAlert, 1000);
  } else {
    console.log('No active alarms');
    deactiveAlert();
  }

}

// This function removes the http/s portions of urls
function removeHttp(url) {
  if (url.startsWith('https://')) {
    const https = 'https://';
    return url.slice(https.length);
  }

  if (url.startsWith('http://')) {
    const http = 'http://';
    return url.slice(http.length);
  }

  return url;
}

// This function will compare a URL against the Alert URL
function activeURL(url) {

  const urlNoHTTP = removeHttp(url);

  const alertNoHTTP = removeHttp(ALERT_URL);

  return urlNoHTTP.indexOf(alertNoHTTP) != -1; 

}

// This function will deactivate any alert that may be present
async function deactiveAlert() {

  const webViews = await xapi.Status.UserInterface.WebView.get();

  for (let i = 0; i < webViews.length; i++) {
    if(activeURL(webViews[i].URL)) {

      console.log('Alert URL is active, clearing')
  
      xapi.Command.UserInterface.WebView.Clear();

      xapi.Command.UserInterface.Message.Prompt.Clear(
        { FeedbackId: 'dismiss_alarm' });

    }
  }

  xapi.Command.UserInterface.Message.Prompt.Clear(
        { FeedbackId: 'dismiss_alarm' });

}


// This function will process alarm events
function alarmEvent(active) {
  if (active === 'True') {
    console.log('Alarm active, activating alert')
    activateAlert();
  } else {
    console.log('Alarm deactived, deactive alert')
    deactiveAlert();
  }
}

// Display a user prompt with the option to dismiss the alarm notification
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

// Process the user repsonse
function promptResponse(event) {
  if (event.FeedbackId === 'dismiss_alarm' && event.OptionId == 1 ) {
    deactiveAlert();
  }
}


async function init() {

  // Enable Web Engine 
  xapi.Config.WebEngine.Mode.set('On');

  // Enable the T3 Alarm Dection feature
  xapi.Config.RoomAnalytics.T3AlarmDetection.Mode.set('On');

  // Check if there is already an active alarm
  const active = await xapi.Status.RoomAnalytics.T3Alarm.Detected.get();
  

  if (active === 'True') {
    console.log('Active alarm detected');
    activateAlert();
  } else {
    console.log('No active alarms, deactivating any existing alerts');
    deactiveAlert();
  }

  // Subscribe to all future alarm events
  xapi.Status.RoomAnalytics.T3Alarm.Detected.on(alarmEvent);

  // Listen for message prompt repsonses if this is enabled
  if (ALLOW_DISMISS) {
    xapi.Event.UserInterface.Message.Prompt.Response.on(promptResponse);
  }

  // Monitor call disconnects so we can display the alert at the correct time
  xapi.Event.CallDisconnect.on(callDisconnect);

}


init();
