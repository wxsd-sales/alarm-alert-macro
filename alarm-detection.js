import xapi from 'xapi';

// Specify the URL alert you wish to display
const ALERT_URL = 'https://wxsd-sales.github.io/alarm-detection/';

// All the user to dismiss the notication and return to normal
const ALLOW_DISMISS = true;

// The macro can automatically end any active calls
const END_CAll = true; 

// Activate our the alert notifications
async function activateAlert() {

  // TODO, detect if kiosk mode is enabled and display


  if (END_CAll) {
    const callState = await xapi.Status.Call.AnswerState.get()
    console.log(callState)
    if (callState) {
      xapi.Command.Call.Disconnect();
    }
  } {
    xapi.Command.UserInterface.WebView.Display(
    { Url: ALERT_URL });

    if (ALLOW_DISMISS) {
      displayPrompt();
    }
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

async function deactiveAlert() {

  const url = await xapi.Status.UserInterface.WebView.URL.get();

  const urlNoHTTP = removeHttp(url);

  const alertNoHTTP = removeHttp(ALERT_URL);

  if (urlNoHTTP.indexOf(alertNoHTTP) != -1 ) {
    console.log('Alert URL is active, clearing')
    xapi.Command.UserInterface.WebView.Clear();
  }

  xapi.Command.UserInterface.Message.Prompt.Clear(
    { FeedbackId: 'dismiss_alarm' });

  // TODO, restore kiosk mode 

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
