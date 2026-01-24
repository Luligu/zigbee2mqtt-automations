# <img src="matterbridge.svg" alt="Matterbridge Logo" width="64px" height="64px">&nbsp;&nbsp;&nbsp; zigbee2mqtt-automations

Automations and scenes extension for zigbee2mqtt (www.zigbee2mqtt.io)

# Features

## Automations

- Support multiple event based triggers;
- Support time automations (execution at specified time);
- Support suncalc automations like sunset, sunrise and others at a specified location and altitude;
- Provides comprehensive logging within the zigbee2mqtt logging system for triggers, conditions and actions;
- Performs thorough validation of the automation configuration file for errors (errors are logged at loading time and the erroneous automation is discarded);
- Error messages and execution notifications can be displayed as pop-up messages in frontend.
- User can filter automation events in the frontend by entering [Automations] in the 'Filter by text' field.
- An automations can be manually triggered by publishing a message to mqtt.

## Scenes

- Provides comprehensive logging within the zigbee2mqtt logging system;
- A scene can be executed by an automation.
- A scene can be manually executed by publishing a message to mqtt.

If you like this project and find it useful, please consider giving it a star on GitHub at https://github.com/Luligu/zigbee2mqtt-automations and sponsoring it.

<a href="https://www.buymeacoffee.com/luligugithub">
  <img src="bmc-button.svg" alt="Buy me a coffee" width="120">
</a>

Check also the https://github.com/Luligu/matterbridge-zigbee2mqtt matterbridge zigbee2mqtt plugin.

<a href="https://github.com/Luligu/matterbridge-zigbee2mqtt">
  <img src="matterbridge.svg" alt="Matterbridge Zigbee2MQTT Plugin" width="60">
</a>

# What is an automation

An automation typically consists of one or more triggers and executes one or more actions.
Optionally, it can also include one or more conditions.
Any trigger can start the automation while conditions must all be true for the automation to run.

# What is a scene

A scene consists of one or more actions (scenes can be nested).

# How to install

### Method 1

Download the file dist\automation.js and place it in the zigbee2mqtt\data\external_extensions directory (create the directory if it doesn't exist).
Stop zigbee2mqtt, ensure it has completely stoppped, and then start it again. This method ensures all extensions are loaded.

### Method 2

In frontend go to Extensions add an extension. Name it automation.js and confirm. In the editor delete the default extension content and copy paste the entire content of automation.js. Save it.

# How to set the automations

Create an automations.yaml file in the zigbee2mqtt\data directory (alongside configuration.yaml) and write your first automation (copy from the examples).
Don't modify configuration.yaml.

# How to set the scenes

Create a scenes.yaml file in the zigbee2mqtt\data directory (alongside configuration.yaml) and write your first scene (copy from the examples).
Don't modify configuration.yaml.

# How to reload the automations when the file automations.yaml has been modified

In the frontend go to Extensions. Select automation.js and save. The extension is reloaded and the automations.yaml ans scenes.yaml are reloaded too.

# How to execute an automations publishing a command to mqtt

Publish topic: **"zigbee2mqtt-automations/Name"** and a raw message: **"execute"** where "Name" is the name of your automation in automations.yaml.

# How to execute a scene publishing a command to mqtt

Publish topic: **"zigbee2mqtt-scenes/Name"** and raw message: **"execute"** where "Name" is the name of your scene in scenes.yaml..

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
    cycle:                ## Array of payloads to cycle through on each trigger
                          Each trigger advances to the next payload, wrapping back to the first after the last.
                          (example: [{ scene_recall: 1 }, { scene_recall: 2 }, { scene_recall: 3 }])
    scene:                ## Name of the scene to run
    logger?:              ## Values: debug info warning error. Default: debug. The action will be logged on z2m logger with the specified logging level
    turn_off_after?:      ## Number: seconds to wait before turning off entity. Will send a turn_off to the entity.
    payload_off?:         ## Values: any supported attributes in an object. Will use payload_off instead of { state: "OFF" }.
```

# Trigger examples:

### The automation is run at the specified time

```yaml
Turn off at 23:
  trigger:
    time: 23:00:00
```

### The automation is run at sunset time at the coordinates and elevation specified

```yaml
Sunset:
  trigger:
    time: sunset
    latitude: 48.858372
    longitude: 2.294481
    elevation: 330
```

### The automation is run when contact change to false (the contact is opened) for the device Contact sensor

```yaml
Contact sensor OPENED:
  trigger:
    entity: Contact sensor
    attribute: contact
    equal: false
```

# Time condition examples:

### The automation is run only on monday, tuesday and friday and only after 08:30 and before 22:30

```yaml
condition:
  after: 08:30:00
  before: 22:30:00
  weekday: ["mon", "tue", "fri"]
```

### The automation is run only between 08:00 and 20:00

```yaml
condition:
  between: 08:00:00-20:00:00
```

### The automation is run only after 20:00 and before 08:00

```yaml
condition:
  between: 20:00:00-08:00:00
```

# Event condition examples:

### The automation is run only if 'At home' is ON

```yaml
condition:
  entity: At home
  state: ON
```

### The automation is run only if the illuminance_lux attribute of 'Light sensor' is below 100.

```yaml
condition:
  entity: Light sensor
  attribute: illuminance_lux
  below: 100
```

### The automation is run only if 'At home' is ON and 'Is night' is OFF. For multiple entity conditions entity must be indented.

```yaml
condition:
  - entity: At home
    state: ON
  - entity: Is night
    state: OFF
```

# Time and event condition examples:

### For multiple conditions after, before, weekday and entity must be indented

```yaml
condition:
  - after: 08:00:00
  - before: 22:30:00
  - weekday: ["mon", "tue", "thu", "fri"]
  - entity: Is night
    state: ON
  - entity: Is dark
    state: ON
```

# Action examples:

### Payload can be a string (turn_on, turn_off and toggle or an object)

```yaml
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

### Instead of specify an object it's possible to indent each attribute

```yaml
action:
  - entity: Moes switch double
    payload:
      state_l1: ON
```

### Cycle can be an array of payloads

```yaml
action:
  entity: Office Ceiling Light
  cycle:
    - { scene_recall: 1 }
    - { scene_recall: 2 }
    - { scene_recall: 3 }
  logger: info
```

# Complete automation examples

### If there was a zigbee2mqtt installation in the top of the Eiffel Tower this would be the perfect automation.

```yaml
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
```

```yaml
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

### These automations turn on and off the group 'Is dark' based on the light mesured by a common light sensor for 60 secs (so there is not false reading)

```yaml
Light sensor below 50lux for 60s:
  trigger:
    entity: Light sensor
    attribute: illuminance_lux
    below: 50
    for: 60
  action:
    entity: Is dark
    payload: turn_on
```

```yaml
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

### These automations turn on and off the device 'Aqara switch T1'

```yaml
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
```

```yaml
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

### Turn on the light for 60 secs after occupancy is detected by 'Motion sensor'

```yaml
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

### Turn on the light for 60 secs after occupancy is detected by 'Hallway motion sensor'. Configure the payload_off to send.

```yaml
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

### Creates a daily routine to configure any devices that sometimes loose the correct setting.

```yaml
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

### Cycle through light scenes with a button press.

```yaml
Change office light scene:
  trigger:
    entity: Office Wall Switch
    action: press_1
  action:
    entity: Office Ceiling Light
    cycle:
      - { scene_recall: 1 }
      - { scene_recall: 2 }
      - { scene_recall: 3 }
      - { scene_recall: 5 }
    logger: info
```

# Config file scenes.yaml:

## Scene example

```yaml
Guest room off:
  - entity: Guest room Floor leds
    payload: { state: "OFF" }
  - entity: Guest room Lights
    payload: { state: "OFF" }
  - entity: Guest room Desk light strip
    payload: { state: "OFF" }
  - entity: Guest room Wardrobe light strip
    payload: { state: "OFF" }
```

## How to run it from an automation:

In the action section, add scene: Name

```yaml
Guest room Scenes 1_double:
  trigger:
    entity: Guest room Scenes switch
    action: 1_double
  action:
    - scene: Guest room off
```

# Sponsor

If you like the extension and want to sponsor it:

- https://www.paypal.com/paypalme/LuliguGitHub
- https://www.buymeacoffee.com/luligugithub

<a href="https://www.buymeacoffee.com/luligugithub">
  <img src="bmc-button.svg" alt="Buy me a coffee" width="120">
</a>

# Bug report and feature request

https://github.com/Luligu/zigbee2mqtt-automations/issues

# Credits

Sun calculations are derived entirely from suncalc package https://www.npmjs.com/package/suncalc.
This extension was originally forked from https://github.com/Anonym-tsk/zigbee2mqtt-extensions.
