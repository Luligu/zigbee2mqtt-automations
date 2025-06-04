# <img src="matterbridge.svg" alt="Matterbridge Logo" width="64px" height="64px">&nbsp;&nbsp;&nbsp;zigbee2mqtt-automations changelog

All notable changes to this project will be documented in this file.

If you like this project and find it useful, please consider giving it a star on GitHub at https://github.com/Luligu/matterbridge-zigbee2mqtt and sponsoring it.

<a href="https://www.buymeacoffee.com/luligugithub">
  <img src="bmc-button.svg" alt="Buy me a coffee" width="120">
</a>

## [2.0.4] - 2025-06-04

### Fixed

- [extension]: In the release 2.4.0 commit: bdb94da46e0461337f4a61b4f2a6bfa5172f608f of zigbee2mqtt, the code changed again. This fix again.

<a href="https://www.buymeacoffee.com/luligugithub">
  <img src="bmc-button.svg" alt="Buy me a coffee" width="80">
</a>

## [2.0.3] - 2025-06-03

### Fixed

- [extension]: In the new release on zigbee2mqtt, the external extensions are now loaded from a temp directory. We use require to load the needed packages (yaml and data) from where we know they are.

<a href="https://www.buymeacoffee.com/luligugithub">
  <img src="bmc-button.svg" alt="Buy me a coffee" width="80">
</a>

## [2.0.2] - 2025-04-19

### Fixed

- [suncalc]: Fixed the daily reloading of suncalc times.

<a href="https://www.buymeacoffee.com/luligugithub">
  <img src="bmc-button.svg" alt="Buy me a coffee" width="80">
</a>

## [2.0.1] - 2025-03-19

### Added

- [typo]: Added the possibility to use turn_off_after with a specific payload_off. https://github.com/Luligu/zigbee2mqtt-automations/issues/16.
- [examples]: Added the example "Motion in the hallway with custom payload_off" to use turn_off_after with a specific payload_off.
- [examples]: Added the example "Configure daily".

### Fixed

- [logger]: The logger warning level is now warning and not warn.
- [typo]: Fixed a typo: https://github.com/Luligu/zigbee2mqtt-automations/pull/15. Thanks https://github.com/robvanoostenrijk.

<a href="https://www.buymeacoffee.com/luligugithub">
  <img src="bmc-button.svg" alt="Buy me a coffee" width="80">
</a>

## [2.0.0] - 2025-01-04

### Added

- [extension]: The extension signature has been updated in zigbee2MQTT 2.0.0. The PR https://github.com/Luligu/zigbee2mqtt-automations/pull/8 addressing the update has been merged. Many thanks to https://github.com/robvanoostenrijk for his contribution.

<a href="https://www.buymeacoffee.com/luligugithub">
  <img src="bmc-button.svg" alt="Buy me a coffee" width="80">
</a>

## [1.0.10] - 2024-11-29

### Added

- [mqtt trigger]: Merged PR https://github.com/Luligu/zigbee2mqtt-automations/pull/7 (thanks https://github.com/robvanoostenrijk)

<a href="https://www.buymeacoffee.com/luligugithub">
  <img src="bmc-button.svg" alt="Buy me a coffee" width="80">
</a>

## [1.0.9] - 2024-11-29

### Fixed

- [suncalc automations]: Fix conversion in toLocaleTimeString().

<a href="https://www.buymeacoffee.com/luligugithub">
  <img src="bmc-button.svg" alt="Buy me a coffee" width="80">
</a>
