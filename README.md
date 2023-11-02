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
Run: npm -g install suncalc
Restart zigbee2mqtt so it load all the extensions (this seems to me the best way).

# Config file automations.yaml:

```
[Your name for automation]
  active?: 
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
    entity: 
    service: 
    data?: 
    turn_off_after?: 
```