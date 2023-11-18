# zigbee2mqtt-automations
Automations extension for zigbee2mqtt.
Features:
- support for multiple triggers;
- support for time automations (execution at specified time);
- support for suncalc automations like sunset and sunrise at specified location (uses the suncalc package);
- comprehensive logging within the zigbee2mqtt logging system for triggers, conditions and actions;
- thorough validation of the automation configuration file for errors (errors are logged at loading time and the automation is discarded);
- error messages and execution notifications are displayed as pop-up messages in the frontend.
- you can filter automation events in the frontend by entering [Automations] in the 'Filter by text' field. 
  
# What is an automation
An automation typically consists of one or more triggers and executes one or more actions.
Optionally, it can also include one or more conditions.

# How to install
Download the file dist\automation.js and place it in the zigbee2mqtt\data\extension directory (create the directory if it doesn't exist).
Create a file automations.yaml in the directory zigbee2mqtt\data (next to configuration.yaml).
Add to the end of the file configuration.yaml this line: automations: automations.yaml
Run in zigbee2mqtt: npm install suncalc
In frontend Extensions add an extensione. Name it automation.js. In the editor delete the default extensione and copy paste automation.js.
Restart zigbee2mqtt so it load all the extensions (this seems to me the best way).

# Config file automations.yaml:

```
<Your name for automation>:
  active?:                ## Values: true or false Default: true (true: the automation is active)
  execute_once?:          ## Values: true or false Default: false (true: the automatione is executed only once)
  trigger: 
    ---------------------- time trigger ------------------------------            
    time:                 ## Values: time string hh:mm:ss or any suncalc sunrise, sunset ... 
    latitude?:            ## Numeric latitude   Use https://www.latlong.net/ to get latidute and longitude based on your adress
    longitude?:           ## Numeric longitude  Use https://www.latlong.net/ to get latidute and longitude based on your adress
    elevation?:           ## Numeric elevation in meters for precise suncalc results Default: 0
    ---------------------- event trigger ------------------------------            
    entity:               ## Name of the entity (device or group friendly name)
    for?: 
    action: 
    state: 
    attribute:
    equal?:
    not_equal?:
    above?:
    below?:
  condition?:
    ---------------------- event condition ------------------------------            
    entity:               ## Name of the entity (device or group friendly name)
    state?:               ## Values: ON OFF 
    attribute?:           ## Name of the attribute (example: state, brightness, illuminance_lux, occupancy)
    equal?:               ## Value of the attribute to evaluate
    above?:               ## Numeric value of attribute to evaluate
    below?:               ## Numeric value of attribute to evaluate
    ---------------------- time condition ------------------------------            
    after?:               ## Time string hh:mm:ss
    before?:              ## Time string hh:mm:ss
    weekday?:             ## Day string or array of day strings: 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
  action: 
    entity:               ## Name of the entity (device or group friendly name) to send the payload to
    payload:              ## Values: turn_on turn_off toggle or any supported attributes in an object or indented on the next rows (example: { state: OFF, brightness: 254, color: { r: 0, g: 255, b: 0 } })
    logger?:              ## Values: debug info warn error Default: debug
    turn_off_after?:      ## Number: seconds to wait before turning off entity
```

# trigger:

# time condition examples:
```
  condition:
    after: 08:30:00
    before: 22:30:00
    weekday: ['mon', 'tue', 'fri']
```
The automation is run only on monday, tuesday and friday and only after 08:30 and before 22:30

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
For multiple entity conditions entity must be indented

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

Originally forked from https://github.com/Anonym-tsk/zigbee2mqtt-extensions.
