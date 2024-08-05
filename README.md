# Alarm Alert Macro

This Webex Device macro displays a web based alert when the device detects a T3 Alarm sound.

This is example macro demostrates how to subcribe to the T3 Alarm status change and open webviews on a Webex device. This can be used by an admin to build and launch custom alert messages as well as enforce call ending possiblity.

## Overview

Webex Devices are able to listen for the sound of T3 Alarms in a building or room and can trigger an event which we are able to monitor via the device APIs. This Macro demostrates how to do this and once an alarm event has been triggered, it ends all active calls and then displays a notification on the Webex Device.

Providing a visual alert on the Webex Device enables us to notify people in the vicinity which may have hearing impairments and cannot hear the buildings alarm. Also by ending any calls, we can encourage those who may be reluctent to leave the building while on a call.

> [!IMPORTANT]  
> The alarm detection feature supports T3 alarms only, which is the industry-standard alarm pattern in the United States.
> 
> It is not guaranteed that your device will detect an alarm. For example purposes only: low microphone levels will block detection. Therefore, you should not rely on this feature to raise awareness of an alarm and it does not replace any other safety and security measures and documentation.

More information on this feature is available here:

https://help.webex.com/en-us/article/n76l9zbb/Alarm-detection-on-Webex-Board,-Desk,-and-Room-devices


### Example notification on the main display

![Cisco Project Workplace - hero co creation content collaboration large](https://user-images.githubusercontent.com/21026209/167173892-b02e9cfa-8b71-4f44-8fa8-dd798bfe6549.gif)


### Notification on the touch device

<img src="https://user-images.githubusercontent.com/21026209/166694771-ccca6d8d-b98b-4f4f-905b-9f2f2718bfa7.png" width="600" />

## Setup

### Prerequisites & Dependencies: 

* Webex Device running RoomOS 10.14 or greater.
* Web admin access to the device to upload the macro.

### Installation Steps:

1. Download the ``alarm-alert.js`` file and upload it to your Webex Room devices Macro editor via the web interface.
2. Configure the Macro by toggling the values at the beginning of the file and set a static URL to display.
3. Enable the Macro on the editor.

### Testing the Macro:

Once you have the Macro running on your Webex Device, try playing the T3 Alarm sound nearby.

Here is an example you can find on Youtube: https://www.youtube.com/watch?v=czyGmRXJ184

## Validation

Validated Hardware:

* Room Kit Pro
* Board 55
* Desk Pro

## Demo

*For more demos & PoCs like this, check out our [Webex Labs site](https://collabtoolbox.cisco.com/webex-labs).

## License

All contents are licensed under the MIT license. Please see [license](LICENSE) for details.


## Disclaimer

Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex usecases, but are not Official Cisco Webex Branded demos.


## Questions
Please contact the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=alarm-alert-macro) for questions. Or, if you're a Cisco internal employee, reach out to us on the Webex App via our bot (globalexpert@webex.bot). In the "Engagement Type" field, choose the "API/SDK Proof of Concept Integration Development" option to make sure you reach our team. 
