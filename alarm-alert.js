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

  // Check to see if this device has kiosk mode enable
  // and change the Kiosk URL to the Alert URL
  try {

    const kiosk = await xapi.Config.UserInterface.Kiosk.Mode.get();

    if (kiosk === 'On') {

      console.log('Kiosk mode enabled, setting Kiosk URL to Alert URL')

      const kioskURL = await xapi.Config.UserInterface.Kiosk.Mode.URL.get();

      console.log('Saving Kiosk URL for later recovery');

      mem.write('KioskURL', kioskURL);

      xapi.Config.UserInterface.Kiosk.Mode.URL.set(ALERT_URL);

      return;
    } 
  } catch {

    console.log('Kiosk Mode not available on this device');

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

  // First check if kisk mode is enabled and change alert URL 
  // back the the saved kiosk URL
  try {

    const kiosk = await xapi.Config.UserInterface.Kiosk.Mode.get();

    if (kiosk === 'On') {

      const kioskURL = await xapi.Config.UserInterface.Kiosk.Mode.URL.get();

      if (activeURL(kioskURL)) {

        console.log('Kiosk URL is the Alert URL');

        const storedURL = mem.read('KioskURL');

        console.log('Restoring stored Kiosk URL: ' + storedURL);
        xapi.Config.UserInterface.Kiosk.Mode.URL.set(storedURL);

        return;

      } else {

        console.log('Alarm URL not active');
        return;

      }

    }

  } catch {
    console.log('Kiosk mode not available on this device');
  }



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

  // Initialize persistent memory
  await memoryInit()

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

  xapi.Event.CallDisconnect.on(callDisconnect);

}


init();


//--__--__--__--__--__--__
//Memory Related Macros

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

var mem = {
  "localScript": module.name.replace('./', '')
};

function memoryInit() {
  return new Promise((resolve) => {
    xapi.command('macros macro get', {
      Name: "Memory_Storage"
    }).then(() => {
      resolve();
    }).catch(e => {
      xapi.Command.UserInterface.Message.Alert.Display({
        Title: '⚠ Setting up USB mode ⚠',
        Text: 'Set-up detected, running initial USB mode check<p>Please Wait until this prompt clears. Approximate Wait 25-30 seconds'
      })
      console.debug('Uh-Oh, no storage Macro found, building "' + "Memory_Storage");
      xapi.command('macros macro save', {
        Name: "Memory_Storage"
      },
        `var memory = {\n\t"./_$Info": {\n\t\t"Warning": "Do NOT modify this document, as other Scripts/Macros may rely on this information", \n\t\t"AvailableFunctions": {\n\t\t\t"local": ["mem.read('key')", "mem.write('key', 'value')", "mem.remove('key')", "mem.print()"],\n\t\t\t"global": ["mem.read.global('key')", "mem.write.global('key', 'value')", "mem.remove.global('key')", "mem.print.global()"]\n\t\t},\n\t\t"Guide": "https://github.com/Bobby-McGonigle/Cisco-RoomDevice-Macro-Projects-Examples/tree/master/Macro%20Memory%20Storage"\n\t},\n\t"ExampleKey": "Example Value"\n}`
      ).then(() => {
        sleep(500).then(() => {
          xapi.Command.Macros.Runtime.Restart();
        })
      });

    });
  });
};

mem.read = function (key) {
  return new Promise((resolve, reject) => {
    xapi.command('Macros Macro Get', {
      Content: 'True',
      Name: "Memory_Storage"
    }).then((event) => {
      let raw = event.Macro[0].Content.replace(/var.*memory.*=\s*{/g, '{')
      let store = JSON.parse(raw)
      let temp;
      if (store[mem.localScript] == undefined) {
        store[mem.localScript] = {}
        temp = store[mem.localScript]
      } else {
        temp = store[mem.localScript]
      }
      if (temp[key] != undefined) {
        resolve(temp[key])
      } else {
        reject(new Error('Local Read Error. Object Key: "' + key + '" not found in \'' + "Memory_Storage" + '\' from script "' + mem.localScript + '"'))
      }
    })
  });
}

mem.write = function (key, value) {
  return new Promise((resolve) => {
    xapi.command('Macros Macro Get', {
      Content: 'True',
      Name: "Memory_Storage"
    }).then((event) => {
      let raw = event.Macro[0].Content.replace(/var.*memory.*=\s*{/g, '{');
      let store = JSON.parse(raw);
      let temp;
      if (store[mem.localScript] == undefined) {
        store[mem.localScript] = {};
        temp = store[mem.localScript];
      } else {
        temp = store[mem.localScript]
      };
      temp[key] = value;
      store[mem.localScript] = temp;
      let newStore = JSON.stringify(store, null, 4);
      xapi.command('Macros Macro Save', {
        Name: "Memory_Storage"
      },
        `var memory = ${newStore}`
      ).then(() => {
        console.debug('Local Write Complete => "' + mem.localScript + '" : {"' + key + '" : "' + value + '"}');
        resolve(value);
      });
    });
  });
};
