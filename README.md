# Alarm Alert Macro

Webex Devices are able to listen for the sound of T3 Alarms in a building or room and can trigger an event which we are able to monitor via the device APIs. This Macro demostrates how to do this and once an alarm event has been triggered, it ends all active calls and then displays a notification on the Webex Device. If this device is running in Kiosk Mode, it will change the Kiosk URL to the alert URL and restore it after the alarm event is over. 

Providing a visual alert on the Webex Device enables us to notify people in the vicinity which may have hearing impairments and cannot hear the buildings alarm. Also by ending any calls, we can encourage those who may be reluctent to leave the building while on a call.

## Notification on the main display

![ezgif-1-318c603dd6](https://user-images.githubusercontent.com/21026209/167028319-ea55bff9-faa5-4e3a-9c9c-b0863b509e37.gif)


## Notification on the touch device

<img src="https://user-images.githubusercontent.com/21026209/166694771-ccca6d8d-b98b-4f4f-905b-9f2f2718bfa7.png" width="600" />


## Alarm Detection on Webex Devices

More information on this features is available here:

https://help.webex.com/en-us/article/n76l9zbb/Alarm-detection-on-Webex-Board,-Desk,-and-Room-devices

## Requirements

1. Webex Device running RoomOS 10.14 or greater.
2. Web admin access to the device to upload the macro.


## Setup

1. Download the ``alarm-alert.js`` file and upload it to your Webex Room devices Macro editor via the web interface.
2. Configure the Macro by toggling the values at the beginning of the file and set a static URL to display.
3. Enable the Macro on the editor.


## Uninstall

1. Delete the ``alarm-detection.js`` Macro from your devices Macro editor.


## Images used

[Fire icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/fire)

[Evacuation icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/evacuation)


## Support

Please reach out to the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?cc=<your_cec>@cisco.com&subject=RepoName)
or contact me on Webex (<your_cec>@cisco.com).
