# Alarm Alert Macro

Webex Devices are able to listen for the sound of T3 Alarms in a building or room and can trigger an event which we are able to monitor via the device APIs. This Macro demostrates how to do this and once an alarm event has been triggered, it ends all active calls and then displays a notification on the Webex Device. If this device is running in Kiosk Mode, it will change the Kiosk URL to the alert URL and restore it after the alarm event is over. 

Providing a visual alert on the Webex Device enables us to notify people in the vicinity which may have hearing impairments and cannot hear the buildings alarm. Also by ending any calls, we can encourage those who may be reluctent to leave the building while on a call.

> IMPORTANT
> 
> The alarm detection feature supports T3 alarms only, which is the industry-standard alarm pattern in the United States.
> 
> It is not guaranteed that your device will detect an alarm. For example purposes only: low microphone levels will block detection. Therefore, you should not rely on this feature to raise awareness of an alarm and it does not replace any other safety and security measures and documentation.

More information on this feature is available here:

https://help.webex.com/en-us/article/n76l9zbb/Alarm-detection-on-Webex-Board,-Desk,-and-Room-devices


## Example notification on the main display

![Cisco Project Workplace - hero co creation content collaboration large](https://user-images.githubusercontent.com/21026209/167173892-b02e9cfa-8b71-4f44-8fa8-dd798bfe6549.gif)


## Notification on the touch device

<img src="https://user-images.githubusercontent.com/21026209/166694771-ccca6d8d-b98b-4f4f-905b-9f2f2718bfa7.png" width="600" />


## Requirements

1. Webex Device running RoomOS 10.14 or greater.
2. Web admin access to the device to upload the macro.


## Setup

1. Download the ``alarm-alert.js`` file and upload it to your Webex Room devices Macro editor via the web interface.
2. Configure the Macro by toggling the values at the beginning of the file and set a static URL to display.
3. Enable the Macro on the editor.

## Testing the Macro

Once you have the Macro running on your Webex Device, try playing the T3 Alarm sound nearby.

Here is an example you can find on Youtube: https://www.youtube.com/watch?v=czyGmRXJ184


## Uninstall

1. Delete the ``alarm-detection.js`` Macro from your devices Macro editor.


## Images used

[Fire icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/fire)

[Evacuation icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/evacuation)


## Support

Please reach out to the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=Alarm-alert-macro)
.
