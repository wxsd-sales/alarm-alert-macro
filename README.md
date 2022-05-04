# Alarm Alert Macro

This Macro monitors T3 alarm events on Webex Devices and once an alarm has been detected, it ends all active calls and then displays a web page based notification on the Webex Device. This is useful for providing a visual aid to people in the vicinity which may have hearing impairments and by ending the call, we can force reluctent people to leave the building.

## Notification on the main display

![image](https://user-images.githubusercontent.com/21026209/166694724-45e5a0c5-c209-4279-8b5f-8a3b51050e53.png)

## Notification on the touch device

![image](https://user-images.githubusercontent.com/21026209/166694771-ccca6d8d-b98b-4f4f-905b-9f2f2718bfa7.png)

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
