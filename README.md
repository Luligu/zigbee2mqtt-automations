# zigbee2mqtt-automations
Automations extension for zigbee2mqtt.
Originally forked from https://github.com/Anonym-tsk/zigbee2mqtt-extensions.
Today we have:
- full logging on zigbee2mqtt logging system for triggers, conditions and actions;
- full checking of automation file for config errors (errors are logged at loading time and the automation is discarded);
- errors and executions have the popup messages in frontend
- you can check on frontend the automations events putting [Automations] in the 'Filter by text' field. 
- support for multiple triggers;
- support for time automations (execution at specified time);
- support for suncalc automations like sunset and sunrise at specified location (uses the suncalc package);
  
# What is an automation
An automation is generally composed by one or more trigger ans has one or more action.
It can also have optionally one or more condition.

# How to install
Download the dist\automation.js file and place in the zigbee2mqtt\data\extension directory (create it if it doesn't exist).
Create a file automations.yaml in the directory zigbee2mqtt\data (next to configuration.yaml).
Add to the end of configuration.yaml the line: automations: automations.yaml.
Restart zigbee2mqtt so it load again the extensions.

