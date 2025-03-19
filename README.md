# zigbee2mqtt-automations
Automations extension for zigbee2mqtt (www.zigbee2mqtt.io)

Features:
- Support multiple event based triggers;
- Support time automations (execution at specified time);
- Support suncalc automations like sunset, sunrise and others at a specified location and altitude;
- Provides comprehensive logging within the zigbee2mqtt logging system for triggers, conditions and actions;
- Performs thorough validation of the automation configuration file for errors (errors are logged at loading time and the erroneous automation is discarded);
- Error messages and execution notifications can be displayed as pop-up messages in frontend.
- User can filter automation events in the frontend by entering [Automations] in the 'Filter by text' field. 

If you like this project and find it useful, please consider giving it a star on GitHub at https://github.com/Luligu/zigbee2mqtt-automations and sponsoring it.

Check also the https://github.com/Luligu/matterbridge-zigbee2mqtt matterbridge zigbee2mqtt plugin.

# What is an automation
An automation typically consists of one or more triggers and executes one or more actions.
Optionally, it can also include one or more conditions. 
Any trigger can start the automation while conditions must all be true for the automation to run.

# How to install
Create an automations.yaml file in the zigbee2mqtt\data directory (alongside configuration.yaml) and write your first automation (copy from the examples).
Don't modify configuration.yaml.

Method 1
Download the file dist\automation.js and place it in the zigbee2mqtt\data\extension directory (create the directory if it doesn't exist).
Stop zigbee2mqtt, ensure it has completely stoppped, and then start it again. This method ensures all extensions are loaded.

Method 2
In frontend go to Extensions add an extension. Name it automation.js and confirm. In the editor delete the default extension content and copy paste the entire content of automation.js. Save it.

# How to reload the automations when the file automations.yaml has been modified.
In frontend go to Extensions. Select automation.js and save. The extension is reloaded and the automations.yaml is reloaded too.

# Config file automations.yaml:

```
<Your name for automation>:
  active?:                ## Values: true or false Default: true (true: the automation is active)
  execute_once?:          ## Values: true or false Default: false (true: the automatione is executed only once)
  trigger: 
    ---------------------- time trigger ------------------------------            
    time:                 ## Values: time string hh:mm:ss or any suncalc sunrise, sunset ... 
    latitude?:            ## Numeric latitude (mandatory for suncalc triggers) Use https://www.latlong.net/ to get latidute and longitude based on your adress
    longitude?:           ## Numeric longitude (mandatory for suncalc triggers) Use https://www.latlong.net/ to get latidute and longitude based on your adress
    elevation?:           ## Numeric elevation in meters for precise suncalc results Default: 0
    ---------------------- event trigger ------------------------------            
    entity:               ## Name of the entity (device or group friendly name) to evaluate
    for?:                 ## Number: duration in seconds for the specific attribute to remain in the triggered state
    state:                ## Values: ON OFF
    attribute:            ## Name of the attribute to evaluate (example: state, brightness, illuminance_lux, occupancy)
    equal?:               ## Value of the attribute to evaluate with =
    not_equal?:           ## Value of the attribute to evaluate with !=
    above?:               ## Numeric value of the attribute to evaluate with >
    below?:               ## Numeric value of the attribute to evaluate with <
    action:               ## Value of the action to evaluate e.g. single, double, hold ...
  condition?:
    ---------------------- event condition ------------------------------            
    entity:               ## Name of the entity (device or group friendly name) to evaluate
    state?:               ## Values: ON OFF 
    attribute?:           ## Name of the attribute (example: state, brightness, illuminance_lux, occupancy)
    equal?:               ## Value of the attribute to evaluate with =
    above?:               ## Numeric value of attribute to evaluate with >
    below?:               ## Numeric value of attribute to evaluate with <
    ---------------------- time condition ------------------------------            
    after?:               ## Time string hh:mm:ss
    before?:              ## Time string hh:mm:ss
    between?:             ## Time range string hh:mm:ss-hh:mm:ss
    weekday?:             ## Day string or array of day strings: 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
  action: 
    entity:               ## Name of the entity (device or group friendly name) to send the payload to
    payload:              ## Values: turn_on, turn_off, toggle or any supported attributes in an object or indented on the next rows 
                          (example: { state: OFF, brightness: 254, color: { r: 0, g: 255, b: 0 } })
    logger?:              ## Values: debug info warning error. Default: debug. The action will be logged on z2m logger with the specified logging level
    turn_off_after?:      ## Number: seconds to wait before turning off entity. Will send a turn_off to the entity.
    payload_off?:         ## Values: any supported attributes in an object. Will use payload_off instead of { state: "OFF" }.
```

# trigger examples:
```
Turn off at 23:
  trigger:
    time: 23:00:00
```
The automation is run at the specified time
```
Sunset:
  trigger:
    time: sunset
    latitude: 48.858372
    longitude: 2.294481
    elevation: 330
```
The automation is run at sunset time at the coordinates and elevation specified
```
Contact sensor OPENED:
  trigger:
    entity: Contact sensor
    attribute: contact
    equal: false
```
The automation is run when contact change to false (the contact is opened) for the device Contact sensor


# time condition examples:
```
  condition:
    after: 08:30:00
    before: 22:30:00
    weekday: ['mon', 'tue', 'fri']
```
The automation is run only on monday, tuesday and friday and only after 08:30 and before 22:30

```
  condition:
    between: 08:00:00-20:00:00
```
The automation is run only between 08:00 and 20:00

```
  condition:
    between: 20:00:00-08:00:00
```
The automation is run only after 20:00 and before 08:00

# event condition examples:
```
  condition:
    entity: At home
    state: ON
```
The automation is run only if 'At home' is ON

```
  condition:
    entity: Light sensor
    attribute: illuminance_lux
    below: 100
```
The automation is run only if the illuminance_lux attribute of 'Light sensor' is below 100.

```
  condition:
    - entity: At home
      state: ON
    - entity: Is night
      state: OFF
```
The automation is run only if 'At home' is ON and 'Is night' is OFF.
For multiple entity conditions entity must be indented

# time and event condition examples:
```
  condition:
    - after: 08:00:00
    - before: 22:30:00
    - weekday: ['mon', 'tue', 'thu', 'fri']
    - entity: Is night
      state: ON
    - entity: Is dark
      state: ON
```
For multiple conditions after, before, weekday and entity must be indented

# action examples:
```
  action:
    - entity: Miboxer RGB led controller
      payload: { brightness: 255, color: { r: 0, g: 0, b: 255 }, transition: 5 }
    - entity: Moes RGB CCT led controller
      payload: { brightness: 255, color_temp: 500, transition: 10 }
    - entity: Aqara switch T1
      payload: turn_on
      turn_off_after: 10
    - entity: Moes switch double
      payload: { state_l1: ON } 
```
Payload can be a string (turn_on, turn_off and toggle or an object)
```
  action:
    - entity: Moes switch double
      payload: 
        state_l1: ON
```
Instead of specify an object it's possible to indent each attribute

# Complete automation examples
```
Sunrise:
  trigger:
    time: sunrise
    latitude: 48.858372
    longitude: 2.294481
    elevation: 330
  action:
    - entity: Moes RGB CCT led controller
      payload: { state: OFF }
    - entity: Is night
      payload: { state: OFF }

Sunset:
  trigger:
    time: sunset
    latitude: 48.858372
    longitude: 2.294481
    elevation: 330
  action:
    - entity: Moes RGB CCT led controller
      payload: { state: ON }
    - entity: Is night
      payload: { state: ON }
```
If there was a zigbee2mqtt installation in the top of the Eiffel Tower this would be the perfect automation.


```
Light sensor below 50lux for 60s:
  trigger:
    entity: Light sensor
    attribute: illuminance_lux
    below: 50
    for: 60
  action:
    entity: Is dark
    payload: turn_on

Light sensor above 60lux for 60s:
  trigger:
    entity: Light sensor
    attribute: illuminance_lux
    above: 60
    for: 60
  action:
    entity: Is dark
    payload: turn_off
```
These automations turn on and off the group 'Is dark' based on the light mesured by a common light sensor for 60 secs (so there is not false reading)

```
Contact sensor OPENED:
  trigger:
    entity: Contact sensor
    attribute: contact
    equal: false
  condition:
    entity: At home
    state: ON
  action:
    entity: Aqara switch T1
    logger: info
    payload: turn_on

Contact sensor CLOSED:
  trigger:
    entity: Contact sensor
    attribute: contact
    state: true
    for: 5
  action:
    entity: Aqara switch T1
    logger: info
    payload:
      state: OFF
```
These automations turn on and off the device 'Aqara switch T1'

```
Motion in the hallway:
  active: true
  trigger:
    entity: Hallway motion sensor
    attribute: occupancy
    equal: true
  action:
    entity: Hallway light
    payload: turn_on
    turn_off_after: 60
    logger: info
```
Turn on the light for 60 secs after occupancy is detected by 'Motion sensor'

```
Motion in the hallway with custom payload_off:
  active: true
  trigger:
    entity: Hallway motion sensor
    attribute: occupancy
    equal: true
  action:
    entity: Hallway light
    payload: turn_on
    turn_off_after: 60
    payload_off: { state: "OFF" }
    logger: info
```
Turn on the light for 60 secs after occupancy is detected by 'Motion sensor'. Configure the payload_off to send.


```
Configure daily:
  active: true
  trigger:
    time: 20:00:00
  action:
    - entity: Bathroom Lights
      payload: { switch_type: "momentary" }
      logger: info
    - entity: Bathroom Leds
      payload: { switch_type: "momentary" }
      logger: info
```
Creates a daily routine to configure any devices that sometimes loose the correct setting.


# Sponsor
If you like the extension and want to sponsor it:
- https://www.paypal.com/paypalme/LuliguGitHub
- https://www.buymeacoffee.com/luligugithub

# Bug report and feature request
https://github.com/Luligu/zigbee2mqtt-automations/issues

# Credits
Sun calculations are derived entirely from suncalc package https://www.npmjs.com/package/suncalc.
This extension was originally forked from https://github.com/Anonym-tsk/zigbee2mqtt-extensions.
