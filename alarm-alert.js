/********************************************************
 * 
 * Macro Author:      	William Mills
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-1-0
 * Released: 08/05/23
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
 * Update: 1-1-0:
 * 
 * - Added support for auto converted connected Room Scheduler to PWA Mode
 * and displaying Alert Web App on the display.
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
  autoEndCall: false,
  displayOnScheduler: true
}

/*********************************************************
 * Main functions and event subscriptions
**********************************************************/


xapi.Config.WebEngine.Mode.set('On');
xapi.Config.RoomAnalytics.T3AlarmDetection.Mode.set('On');
xapi.Status.RoomAnalytics.T3Alarm.Detected.on(processAlarms);
xapi.Event.UserInterface.Message.Prompt.Response.on(promptResponse);
xapi.Event.CallDisconnect.on(processDisconnects);

xapi.Status.RoomAnalytics.T3Alarm.Detected.get().then(result => processAlarms(result))

// This function will process alarm events
function processAlarms(status) {
  console.log(`T3 Alarm Detection Mode set to [${status}]`)
  status === 'True' ? activateAlert() : deactiveAlert();
}

// Activate the alert notifications
async function activateAlert() {

  console.log('Activating Alert');

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
  
  if(!config.displayOnScheduler) return

  // Identify any Room Schedulers
  const schedulers = await identifySchedulers();
  if (!schedulers) return

  // Backup Room Schedulers IDs
  await saveData('schedulers', schedulers);

  // Backup PWA URL
  const pwaURL = await xapi.Config.UserInterface.HomeScreen.Peripherals.WebApp.URL.get();
  await saveData('pwaURL', pwaURL);

  // Set PWA URL to Alert URL
  xapi.Config.UserInterface.HomeScreen.Peripherals.WebApp.URL.set(config.alertURL);

  // Convert all Schedulers to PWA Mode
  schedulers.forEach(scheduler => convertToPWA(scheduler));

}

async function deactiveAlert() {
  console.log(`Deactivating Any Active Alerts`)
  const webViews = await xapi.Status.UserInterface.WebView.get();
  const alertWebView = webViews.find(view => view.URL == config.alertURL)

  if (alertWebView) {
    xapi.Command.UserInterface.WebView.Clear();
  }
  xapi.Command.UserInterface.Message.Prompt.Clear({ FeedbackId: 'dismiss_alarm' });


  if(!config.displayOnScheduler) return

  // Recover any stored Room Schedulers IDs
  const schedulers = await readData('schedulers');
  if (!schedulers) return

  // Convert all Schedulers to PWA Mode
  schedulers.forEach(scheduler => convertToScheduler(scheduler));

  // Recover any stored PWA URL
  const pwaURL = await readData('pwaURL') ?? '';
  
  // Set recovered PWA URL
  xapi.Config.UserInterface.HomeScreen.Peripherals.WebApp.URL.set(pwaURL);

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
  if (event.FeedbackId != 'dismiss_alarm' ) return
  if (event.OptionId != 1) return
  deactiveAlert();
}

async function identifySchedulers() {
  const result = await xapi.Command.Peripherals.List({ Connected: 'True', Type: 'All' });
  const devices = result?.Device;
  if (!devices) return
  //const schedulers = devices.filter(device => device.Type === 'RoomScheduler');
  const schedulers = devices.filter(device => device.Type === 'RoomScheduler').map(device => device.ID);
  console.log(schedulers)
  return schedulers
}


async function convertToScheduler(id) {
  console.debug(`Converting Navigator [${id}] - To RoomScheduler`)
  try {
    await xapi.Command.Peripherals.TouchPanel.Configure({ ID: id, Mode: 'RoomScheduler' });
  } catch (e) {
    console.debug(`Unable To Convert Navigator [${id}] - To RoomScheduler`, e)
  }
}

async function convertToPWA(id) {
  console.debug(`Converting Navigator [${id}] - To PersistentWebApp`)
  try {
    await xapi.Command.Peripherals.TouchPanel.Configure({ ID: id, Mode: 'PersistentWebApp' });
  } catch (e) {
    console.debug(`Unable To Convert Navigator [${id}] - To RoomScheduler`, e)
  }
}

function parseJSON(jsonText) {
  try {
    return JSON.parse(jsonText)
  } catch (e) {
    console.debug('Could not parse string:', jsonText)
  }
}

async function saveData(key, value) {
  const storageMacro = 'alert-storage';
  const macro = await xapi.Command.Macros.Macro.Get({ Name: storageMacro, Content: 'True' }).catch(e => { })
  let data = parseJSON(macro?.Macro?.[0]?.Content)?.[0] ?? {};
  data[key] = value
  await xapi.Command.Macros.Macro.Save({ Name: storageMacro, Overwrite: 'True', Transpile: 'True' }, JSON.stringify([data], null, 4))
  return value
}

async function readData(key) {
  const storageMacro = 'alert-storage';
  const macro = await xapi.Command.Macros.Macro.Get({ Name: storageMacro, Content: 'True' }).catch(e => { })
  const data = parseJSON(macro?.Macro?.[0]?.Content)?.[0] ?? {};
  return data?.[key]
}
