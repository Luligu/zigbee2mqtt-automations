# zigbee2mqtt-automations
Automations extension for zigbee2mqtt.
Originally forked from https://github.com/Anonym-tsk/zigbee2mqtt-extensions.
Today we have:
- full logging on zigbee2mqtt logging system for triggers, conditions and actions;
- full checking of automation file for config errors (errors are logged at loading time and the automation is discarded);
- errors and executions have a popup messages in frontend
- you can check on frontend the automations events putting [Automations] in the 'Filter by text' field. 
- support for multiple triggers;
- support for time automations (execution at specified time);
- support for suncalc automations like sunset and sunrise at specified location (uses the suncalc package);
  
# What is an automation
An automation is generally composed by one or more trigger and has one or more action.
It can also have optionally one or more condition.

# How to install
Download the file dist\automation.js and place it in the zigbee2mqtt\data\extension directory (create the directory if it doesn't exist).
Create a file automations.yaml in the directory zigbee2mqtt\data (next to configuration.yaml).
Add to the end of the file configuration.yaml this line: automations: automations.yaml
Run in zigbee2mqtt: npm install suncalc
In frontend Extensions add an extensione. Name it automation.js. In the editor delete the default extensione and copy paste automation.js.
Restart zigbee2mqtt so it load all the extensions (this seems to me the best way).

# Config file automations.yaml:

```
[Your name for automation]
  active?:                ## Values: true or false Default: true (true: the automation is active)
  execute_once?:          ## Values: true or false Default: false (true: the automatione is executed only once)
  trigger: 
    platform:
    entity: 
    for?: 
    event?: 
    latitude?: 
    longitude?:
    action: 
    attribute?: 
    state: 
    attribute:
    above?:
    below?:

  condition?:
    entity:
    attribute?:
    state: 
    attribute: 
    above?: 
    below?: 
    after?: 
    before?:
    weekday?:

  action: 
    entity:               ## Name of the entity to send the payload to
    payload:              ## Any supported attributes indented on the next rows (example: state: OFF, brightness: 254, color: { r: 0, g: 255, b: 0 })
    logger?:              ## Values: debug info warn error Default: debug
    turn_off_after?:      ## Number: seconds to wait before turning off entity
```