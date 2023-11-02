/**
 * This file contains the class AutomationsExtension and its definitions.
 *
 * @file automations.ts
 * @author Luligu
 * @date 2023-10-15
 *
 * All rights reserved.
 *
 */

//
// [@ts-ignore is because the packages are defined inside zigbee2mqtt and so not available here]
//

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
// import * as stringify from 'json-stable-stringify-without-jsonify';
// @ts-ignore
import yaml from '../util/yaml';
// @ts-ignore
import data from '../util/data';
// @ts-ignore
import * as SunCalc from 'suncalc';
import { Buffer } from 'buffer';
//
// Use https://www.latlong.net/ to get latidute and longitude based on your adress
//

import type Zigbee from 'zigbee2mqtt/dist/zigbee';
import type MQTT from 'zigbee2mqtt/dist/mqtt';
import type State from 'zigbee2mqtt/dist/state';
import type EventBus from 'zigbee2mqtt/dist/eventBus';
import type Settings from 'zigbee2mqtt/dist/util/settings';
import type Logger from 'zigbee2mqtt/dist/util/logger';

function toArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}

enum ConfigPlatform {
  ACTION = 'action',
  STATE = 'state',
  NUMERIC_STATE = 'numeric_state',
  TIME = 'time',
  SUNCALC = 'suncalc',
}

enum ConfigTimeTrigger {
  SUNRISE = 'sunrise',
  SUNSET = 'sunset',
}

enum StateOnOff {
  ON = 'ON',
  OFF = 'OFF',
  TOGGLE = 'TOGGLE',
}

enum ConfigService {
  TOGGLE = 'toggle',
  TURN_ON = 'turn_on',
  TURN_OFF = 'turn_off',
  CUSTOM = 'custom',
}

const WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const TIME_STRING_REGEXP = /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/;

type ConfigStateType = string | number | boolean;
type ConfigActionType = string;
type ConfigAttributeType = string;

type StateChangeType = string | number | boolean;
type StateChangeUpdate = Record<string, StateChangeType>;
type StateChangeFrom = Record<string, StateChangeType>;
type StateChangeTo = Record<string, StateChangeType>;

type TriggerForType = number;
type TurnOffAfterType = number;
type TimeStringType = string; // e.g. "15:05:00"
type LoggerType = string;

class Time {
  private readonly h: number;
  private readonly m: number;
  private readonly s: number;

  constructor(time?: TimeStringType) {
    if (!time) {
      const now = new Date();
      this.h = now.getHours();
      this.m = now.getMinutes();
      this.s = now.getSeconds();
    } else if (!TIME_STRING_REGEXP.test(time)) {
      throw new Error(`Wrong time string: ${time}`);
    } else {
      [this.h, this.m, this.s] = time.split(':').map(Number);
    }
  }

  isEqual(time: Time): boolean {
    return this.h === time.h
      && this.m === time.m
      && this.s === time.s;
  }

  isGreater(time: Time): boolean {
    if (this.h > time.h) {
      return true;
    }
    if (this.h < time.h) {
      return false;
    }
    if (this.m > time.m) {
      return true;
    }
    if (this.m < time.m) {
      return false;
    }
    return this.s > time.s;
  }

  isLess(time: Time) {
    return !this.isGreater(time) && !this.isEqual(time);
  }

  isInRange(after: Time, before: Time): boolean {
    if (before.isEqual(after)) {
      return false;
    }

    // Граничные значения считаем всегда подходящими
    if (this.isEqual(before) || this.isEqual(after)) {
      return true;
    }

    let inverse = false;
    // Если интервал переходит через 00:00, инвертируем его
    if (after.isGreater(before)) {
      const tmp = after;
      after = before;
      before = tmp;
      inverse = true;
    }

    const result = this.isGreater(after) && this.isLess(before);
    return inverse ? !result : result;
  }
}

interface ConfigTrigger {
  platform: ConfigPlatform;
  entity: EntityId | EntityId[];
  for?: TriggerForType;
  event?: string;
  latitude?: number;
  longitude?: number;
}

interface ConfigActionTrigger extends ConfigTrigger {
  action: ConfigActionType | ConfigActionType[];
}

interface ConfigStateTrigger extends ConfigTrigger {
  attribute?: ConfigAttributeType;
  state: ConfigStateType | ConfigStateType[];
}

interface ConfigNumericStateTrigger extends ConfigTrigger {
  attribute: ConfigAttributeType;
  above?: number;
  below?: number;
}

type ConfigActionData = Record<ConfigAttributeType, ConfigStateType>;

interface ConfigAction {
  entity: EntityId;
  service: ConfigService;
  data?: ConfigActionData;
  turn_off_after?: TurnOffAfterType;
  logger?: LoggerType;
}

interface ConfigCondition {
  platform: ConfigPlatform;
}

interface ConfigEntityCondition extends ConfigCondition {
  entity: EntityId;
}

interface ConfigStateCondition extends ConfigEntityCondition {
  attribute?: ConfigAttributeType;
  state: ConfigStateType;
}

interface ConfigNumericStateCondition extends ConfigEntityCondition {
  attribute: ConfigAttributeType;
  above?: number;
  below?: number;
}

interface ConfigTimeCondition extends ConfigCondition {
  after?: TimeStringType;
  before?: TimeStringType;
  weekday?: string[];
}

// Yaml defined automations
type ConfigAutomations = {
  [key: string]: {
    active?: boolean,
    trigger: ConfigTrigger,
    action: ConfigAction | ConfigAction[],
    condition?: ConfigCondition | ConfigCondition[],
  }
};

// Internal event based automations
type EventAutomation = {
  name: string,
  trigger: ConfigTrigger,
  action: ConfigAction[],
  condition: ConfigCondition[],
};

type EntityId = string;

type EventAutomations = {
  [key: EntityId]: EventAutomation[],
};

// Internal time based automations
type TimeAutomation = {
  name: string,
  trigger: ConfigTrigger,
  condition: ConfigCondition[],
  action: ConfigAction[],
};

type TimeId = string;

type TimeAutomations = {
  [key: TimeId]: TimeAutomation[],
};

class InternalLogger {
  constructor() { }

  debug(message: string, ...args: unknown[]): void {
    console.log(`\x1b[46m\x1b[97m[Automations]\x1b[0m \x1b[38;5;247m${message}\x1b[0m`, ...args);
  }

  warning(message: string, ...args: unknown[]): void {
    console.log(`\x1b[46m\x1b[97m[Automations]\x1b[0m \x1b[38;5;220m${message}\x1b[0m`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    console.log(`\x1b[46m\x1b[97m[Automations]\x1b[0m \x1b[38;5;255m${message}\x1b[0m`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.log(`\x1b[46m\x1b[97m[Automations]\x1b[0m \x1b[38;5;9m${message}\x1b[0m`, ...args);
  }
}

class AutomationsExtension {
  private readonly mqttBaseTopic: string;
  private readonly eventAutomations: EventAutomations = {};
  private readonly timeAutomations: TimeAutomations = {};
  private readonly triggerForTimeouts: Record<string, NodeJS.Timeout>;
  private readonly turnOffAfterTimeouts: Record<string, NodeJS.Timeout>;
  private midnightTimeout: NodeJS.Timeout;
  private readonly log: InternalLogger;

  constructor(
    protected zigbee: Zigbee,
    protected mqtt: MQTT,
    protected state: State,
    protected publishEntityState: unknown,
    protected eventBus: EventBus,
    protected settings: typeof Settings,
    protected logger: typeof Logger,
  ) {
    this.log = new InternalLogger();
    this.mqttBaseTopic = settings.get().mqtt.base_topic;
    this.triggerForTimeouts = {};
    this.turnOffAfterTimeouts = {};
    //this.midnightTimeout;
    this.parseConfig(settings.get().automations || {});

    this.logger.info(`[Automations] Extension loaded`);

    this.log.info(`Event automation:`);
    Object.keys(this.eventAutomations).forEach(key => {
      const eventAutomationArray = this.eventAutomations[key];
      eventAutomationArray.forEach(eventAutomation => {
        this.log.info(`- key: #${key}# automation: ${this.stringify(eventAutomation, true)}`);
      });
    });

    this.log.info(`Time automation:`);
    Object.keys(this.timeAutomations).forEach(key => {
      const timeAutomationArray = this.timeAutomations[key];
      timeAutomationArray.forEach(timeAutomation => {
        this.log.info(`- key: #${key}# automation: ${this.stringify(timeAutomation, true)}`);
        this.startTimeTriggers(key, timeAutomation);
      });
    });

    this.startMidnightTimeout();
  }

  /**
   * Start a timeout in the first second of tomorrow date.
   * The timeout callback then will start the time triggers for tomorrow and start again a timeout for the next day.
   */
  private startMidnightTimeout(): void {
    const now = new Date();
    const timeEvent = new Date();
    timeEvent.setHours(23);
    timeEvent.setMinutes(59);
    timeEvent.setSeconds(59);
    this.logger.debug(`[Automations] Set timeout for automations reloading at ${timeEvent.toLocaleString()}`);
    this.midnightTimeout = setTimeout(() => {
      this.logger.info(`[Automations] Timeout for automations reloading executing`);
      Object.keys(this.timeAutomations).forEach(key => {
        const timeAutomationArray = this.timeAutomations[key];
        timeAutomationArray.forEach(timeAutomation => {
          this.startTimeTriggers(key, timeAutomation);
        });
      });
      this.startMidnightTimeout();
    }, timeEvent.getTime() - now.getTime() + 2000);
    this.midnightTimeout.unref();
  }

  private parseConfig(configAutomations: ConfigAutomations | string) {
    if (typeof configAutomations === 'string') {
      configAutomations = (yaml.readIfExists(data.joinPath(configAutomations)) || {}) as ConfigAutomations;
    }

    const services = Object.values(ConfigService);
    const platforms = Object.values(ConfigPlatform);

    Object.entries(configAutomations).forEach(([key, configAutomation]) => {
      const conditions = configAutomation.condition ? toArray(configAutomation.condition) : [];
      const actions = toArray(configAutomation.action);
      const triggers = toArray(configAutomation.trigger);

      //this.log.debug(`Entries Start`, key);
      if (configAutomation.active === false) {
        this.logger.info(`[Automations] Automation [${key}] not registered since active is false`);
        return;
      }
      if (!configAutomation.trigger) {
        this.logger.error(`[Automations] Config validation error for [${key}]: trigger not specified`);
        return;
      }
      if (!configAutomation.action) {
        this.logger.error(`[Automations] Config validation error for [${key}]: no actions specified`);
        return;
      }
      // Check triggers
      //this.log.debug(`Entries Check triggers`, key);
      for (const trigger of triggers) {
        //this.log.debug(`Entries Check triggers 2`, key, trigger, trigger.platform);
        if (!platforms.includes(trigger.platform)) {
          this.logger.error(`[Automations] Config validation error for [${key}]: unknown trigger platform '${trigger.platform}'`);
          return;
        }
        //this.log.debug(`Entries Check triggers 3`, key, trigger, trigger.entity);
        if (trigger.entity !== undefined && !this.zigbee.resolveEntity(trigger.entity)) {
          this.logger.error(`[Automations] Config validation error for [${key}]: trigger entity #${trigger.entity}# not found`);
          return;
        }
      }
      // Check actions
      //this.log.debug(`Entries Check actions`, key);
      for (const action of actions) {
        if (!services.includes(action.service)) {
          this.logger.error(`[Automations] Config validation error for [${key}]: unknown action service '${action.service}'`);
          return;
        }
        if (!this.zigbee.resolveEntity(action.entity)) {
          this.logger.error(`[Automations] Config validation error for [${key}]: action entity #${action.entity}# not found`);
          return;
        }
      }
      // Check conditions
      //this.log.debug(`Entries Check conditions`, key);
      for (const condition of conditions) {
        if (!platforms.includes(condition.platform)) {
          this.logger.error(`[Automations] Config validation error for [${key}]: unknown condition platform '${condition.platform}'`);
          return;
        }
      }

      for (const trigger of triggers) {
        //this.log.debug(`Switch `, trigger.platform, trigger.entity);
        switch (trigger.platform) {
          case ConfigPlatform.TIME:
            this.logger.info(`[Automations] Registering time automation [${key}]`);
            if (configAutomation.trigger.event) {
              if (!this.timeAutomations[configAutomation.trigger.event])
                this.timeAutomations[configAutomation.trigger.event] = [];
              this.timeAutomations[configAutomation.trigger.event].push({ name: key, trigger: configAutomation.trigger, action: actions, condition: conditions });
            } else {
              this.logger.error(`[Automations] Config validation error for [${key}]: trigger event not found`);
              return;
            }
            break;
          case ConfigPlatform.SUNCALC: {
            this.logger.info(`[Automations] Registering suncalc automation [${key}]`);
            const times = SunCalc.getTimes(new Date(), configAutomation.trigger.latitude, configAutomation.trigger.longitude);
            this.logger.debug(`[Automations] Sunrise at ${times.sunrise.toLocaleTimeString()} sunset at ${times.sunset.toLocaleTimeString()} for latitude:${configAutomation.trigger.latitude} longitude:${configAutomation.trigger.longitude}`);
            if (configAutomation.trigger.event === ConfigTimeTrigger.SUNRISE) {
              if (!this.timeAutomations[times.sunrise.toLocaleTimeString()])
                this.timeAutomations[times.sunrise.toLocaleTimeString()] = [];
              this.timeAutomations[times.sunrise.toLocaleTimeString()].push({ name: key, trigger: configAutomation.trigger, action: actions, condition: conditions });
            }
            if (configAutomation.trigger.event === ConfigTimeTrigger.SUNSET) {
              if (!this.timeAutomations[times.sunset.toLocaleTimeString()])
                this.timeAutomations[times.sunset.toLocaleTimeString()] = [];
              this.timeAutomations[times.sunset.toLocaleTimeString()].push({ name: key, trigger: configAutomation.trigger, action: actions, condition: conditions });
            }
            break;
          }
          case ConfigPlatform.ACTION:
          case ConfigPlatform.NUMERIC_STATE:
          case ConfigPlatform.STATE: {
            this.logger.info(`[Automations] Registering event automation [${key}] platform ${trigger.platform} entity ${trigger.entity}`);
            if (!trigger.entity) {
              this.logger.error(`[Automations] Config validation error for [${key}]: trigger entity not specified`);
              return;
            }
            if (!this.zigbee.resolveEntity(trigger.entity)) {
              this.logger.error(`[Automations] Config validation error for [${key}]: trigger entity #${trigger.entity}# not found`);
              return;
            }
            const entities = toArray(trigger.entity);
            for (const entityId of entities) {
              if (!this.eventAutomations[entityId]) {
                this.eventAutomations[entityId] = [];
              }
              this.eventAutomations[entityId].push({ name: key, trigger: trigger, action: actions, condition: conditions });
            }
            //this.logger.info(`[Automations] Registered event automation [${key}] platform ${trigger.platform} entity ${trigger.entity}`);
            break;
          }
          default:
            return;
        } // switch
      }
    });
  }

  /**
   * Take the key of TimeAutomations that is a string like hh:mm:ss, convert it in a Date object of today
   * and set the timer if not already passed for today.
   * The timeout callback then will run the automations
   */
  private startTimeTriggers(key: TimeId, automation: TimeAutomation): void {
    const now = new Date();
    const timeEvent = new Date();
    const match = key.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      timeEvent.setHours(parseInt(match[1], 10));
      timeEvent.setMinutes(parseInt(match[2], 10));
      timeEvent.setSeconds(parseInt(match[3], 10));
      if (timeEvent.getTime() > now.getTime()) {
        //this.log.debug(`Set timout at ${timeEvent.toLocaleString()} for [${automation.name}]`);
        this.logger.debug(`[Automations] Set timout at ${timeEvent.toLocaleString()} for [${automation.name}]`);

        const timeout = setTimeout(() => {
          delete this.triggerForTimeouts[automation.name];
          //this.log.debug(`Timout for [${automation.name}]`);
          this.logger.debug(`[Automations] Timout for [${automation.name}]`);
          this.runActionsWithConditions(automation, automation.condition, automation.action);
        }, timeEvent.getTime() - now.getTime());

        timeout.unref();
        this.triggerForTimeouts[automation.name] = timeout;
      }
      else {
        //this.log.debug(`Timout at ${timeEvent.toLocaleString()} is passed for [${automation.name}]`);
        this.logger.debug(`[Automations] Timout at ${timeEvent.toLocaleString()} is passed for [${automation.name}]`);
      }
    } else {
      //this.log.error(`Timout config error at ${key} for [${automation.name}]`);
      this.logger.error(`[Automations] Timout config error at ${key} for [${automation.name}]`);
    }
  }

  /**
   * null - return
   * false - return and stop timer
   * true - start the automation
   */
  private checkTrigger(automation: EventAutomation, configTrigger: ConfigTrigger, update: StateChangeUpdate, from: StateChangeFrom, to: StateChangeTo): boolean | null {
    let trigger;
    let attribute;
    let result;
    let actions;
    let states;

    //this.logger.debug(`[Automations] Trigger check [${automation.name}]`);

    switch (configTrigger.platform) {
      case ConfigPlatform.ACTION:
        if (!Object.prototype.hasOwnProperty.call(update, 'action')) {
          this.logger.debug(`[Automations] Trigger check [${automation.name}] no action in update for #${configTrigger.entity}#`);
          return null;
        }

        trigger = configTrigger as ConfigActionTrigger;
        actions = toArray(trigger.action);
        result = actions.includes(update.action as ConfigActionType);
        this.logger.debug(`[Automations] Trigger check [${automation.name}] trigger is ${result} for #${configTrigger.entity}# action:${this.stringify(actions)}`);
        return result;

      case ConfigPlatform.STATE:
        trigger = configTrigger as ConfigStateTrigger;
        attribute = trigger.attribute || 'state';

        //this.log.warning(`Trigger check [${automation.name}]`, update, from, to);
        if (!Object.prototype.hasOwnProperty.call(update, attribute) || /*!from.hasOwnProperty(attribute) ||*/ !Object.prototype.hasOwnProperty.call(to, attribute)) {
          this.logger.debug(`[Automations] Trigger check [${automation.name}] no ${attribute} in update or to for #${configTrigger.entity}#`);
          return null;
        }

        if (from[attribute] === to[attribute]) {
          this.logger.debug(`[Automations] Trigger check [${automation.name}] no ${attribute} change for #${configTrigger.entity}#`);
          return null;
        }

        states = toArray(trigger.state);
        result = states.includes(update[attribute] as ConfigStateType);
        this.logger.debug(`[Automations] Trigger check [${automation.name}] trigger is ${result} for #${configTrigger.entity}# state:${this.stringify(states)}`);
        return result;

      case ConfigPlatform.NUMERIC_STATE:
        trigger = configTrigger as ConfigNumericStateTrigger;
        attribute = trigger.attribute;

        if (!Object.prototype.hasOwnProperty.call(update, attribute) || /*!from.hasOwnProperty(attribute) ||*/ !Object.prototype.hasOwnProperty.call(to, attribute)) {
          this.logger.debug(`[Automations] Trigger check [${automation.name}] no ${attribute} in update or to for #${configTrigger.entity}#`);
          return null;
        }

        if (from[attribute] === to[attribute]) {
          this.logger.debug(`[Automations] Trigger check [${automation.name}] no ${attribute} change for #${configTrigger.entity}#`);
          return null;
        }

        if (typeof trigger.above !== 'undefined') {
          if (to[attribute] < trigger.above) {
            this.logger.debug(`[Automations] Trigger check [${automation.name}] ${attribute} < ${trigger.above} for #${configTrigger.entity}#`);
            return false;
          }
          if (from[attribute] >= trigger.above) {
            this.logger.debug(`[Automations] Trigger check [${automation.name}] ${attribute} already triggered for #${configTrigger.entity}#`);
            return null;
          }
        }

        if (typeof trigger.below !== 'undefined') {
          if (to[attribute] > trigger.below) {
            this.logger.debug(`[Automations] Trigger check [${automation.name}] ${attribute} > ${trigger.below} for #${configTrigger.entity}#`);
            return false;
          }
          if (from[attribute] <= trigger.below) {
            this.logger.debug(`[Automations] Trigger check [${automation.name}] ${attribute} already triggered for #${configTrigger.entity}#`);
            return null;
          }
        }

        this.logger.debug(`[Automations] Trigger check [${automation.name}] trigger is true for #${configTrigger.entity}# attribute: ${attribute}`);
        return true;
    }

    return false;
  }

  private checkCondition(automation: EventAutomation, condition: ConfigCondition): boolean {
    this.logger.debug(`[Automations] Condition check [${automation.name}]`);

    switch (condition.platform) {
      case ConfigPlatform.STATE:
      case ConfigPlatform.NUMERIC_STATE:
        return this.checkEntityCondition(automation, condition as ConfigEntityCondition);
      case ConfigPlatform.TIME:
        return this.checkTimeCondition(automation, condition as ConfigTimeCondition);
      default:
        this.logger.error(`[Automations] Condition check [${automation.name}] config validation error: wrong condition platform so ignoring condition`);
        return true;
    }
  }

  private checkTimeCondition(automation: EventAutomation, condition: ConfigTimeCondition): boolean {
    const beforeStr = condition.before || '23:59:59';
    const afterStr = condition.after || '00:00:00';
    const weekday = condition.weekday || WEEK;

    try {
      const after = new Time(afterStr);
      const before = new Time(beforeStr);
      const current = new Time()
      const now = new Date();
      const day = now.getDay();
      const result = current.isInRange(after, before) && weekday.includes(WEEK[day]);
      this.logger.debug(`[Automations] Condition check [${automation.name}] time condition is ${result}`);
      return result;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      this.logger.warning(e);
      this.logger.error(`[Automations] Condition check [${automation.name}] TimeCondition parse error so ignoring condition`);
      return true;
    }
  }

  private checkEntityCondition(automation: EventAutomation, condition: ConfigEntityCondition): boolean {
    if (!condition.entity) {
      this.logger.error(`[Automations] Condition check [${automation.name}] config validation error: condition entity not specified so ignoring condition`);
      return true;
    }
    const entity = this.zigbee.resolveEntity(condition.entity);
    if (!entity) {
      this.logger.error(`[Automations] Condition check [${automation.name}] config validation error: entity #${condition.entity}# not found so ignoring condition`);
      return true;
    }

    let currentCondition;
    let currentState;
    let attribute;

    switch (condition.platform) {
      case ConfigPlatform.STATE:
        currentCondition = condition as ConfigStateCondition;
        attribute = currentCondition.attribute || 'state';
        currentState = this.state.get(entity)[attribute];

        if (currentState === undefined) {
          this.logger.error(`[Automations] Condition check [${automation.name}] condition false for entity #${condition.entity}# attribute ${attribute}:undefined`);
          return false;
        }
        if (currentState !== currentCondition.state) {
          this.logger.debug(`[Automations] Condition check [${automation.name}] condition false for entity #${condition.entity}# attribute ${attribute}:${currentState}`);
          return false;
        }
        break;

      case ConfigPlatform.NUMERIC_STATE:
        currentCondition = condition as ConfigNumericStateCondition;
        attribute = currentCondition.attribute;
        currentState = this.state.get(entity)[attribute];

        if (typeof currentCondition.above !== 'undefined' && currentState < currentCondition.above) {
          this.logger.debug(`[Automations] Condition check [${automation.name}] condition false for entity #${condition.entity}# attribute ${attribute}:${currentState}`);
          return false;
        }
        if (typeof currentCondition.below !== 'undefined' && currentState > currentCondition.below) {
          this.logger.debug(`[Automations] Condition check [${automation.name}] condition false for entity #${condition.entity}# attribute ${attribute}:${currentState}`);
          return false;
        }
        break;
    }

    this.logger.debug(`[Automations] Condition check [${automation.name}] condition true for entity #${condition.entity}# attribute ${attribute}:${currentState} run automation`);

    return true;
  }

  private runActions(automation: EventAutomation, actions: ConfigAction[]): void {
    for (const action of actions) {
      const entity = this.zigbee.resolveEntity(action.entity);
      if (!entity) {
        this.logger.error(`[Automations] Entity #${action.entity}# not found so ignoring this action`);
        continue;
      }
      let data: ConfigActionData;
      switch (action.service) {
        case ConfigService.TURN_ON:
          data = { state: StateOnOff.ON };
          break;

        case ConfigService.TURN_OFF:
          data = { state: StateOnOff.OFF };
          break;

        case ConfigService.TOGGLE:
          data = { state: StateOnOff.TOGGLE };
          break;

        case ConfigService.CUSTOM:
          data = action.data as ConfigActionData;
          break;
      }
      //this.logger.info(`[Automations] Run automation [${automation.name}] send ${stringify(data)} to entity #${action.entity}# `);
      if (action.logger === 'info')
        this.logger.info(`[Automations] Run automation [${automation.name}] send ${this.payloadStringify(data)} to entity #${action.entity}#`);
      else if (action.logger === 'warn')
        this.logger.warn(`[Automations] Run automation [${automation.name}] send ${this.payloadStringify(data)} to entity #${action.entity}#`);
      else if (action.logger === 'error')
        this.logger.error(`[Automations] Run automation [${automation.name}] send ${this.payloadStringify(data)} to entity #${action.entity}#`);
      else
        this.logger.debug(`[Automations] Run automation [${automation.name}] send ${this.payloadStringify(data)} to entity #${action.entity}#`);
      this.mqtt.onMessage(`${this.mqttBaseTopic}/${entity.name}/set`, Buffer.from(this.payloadStringify(data)));
      if (action.turn_off_after) {
        this.startActionTimeout(automation, action);
      }
    }
  }

  private stopActionTimeout(automation: EventAutomation, action: ConfigAction): void {
    const timeout = this.turnOffAfterTimeouts[automation.name + action.entity];
    if (timeout) {
      this.logger.debug(`[Automations] Stop turn_off_after timeout for automation [${automation.name}]`);
      clearTimeout(timeout);
      delete this.turnOffAfterTimeouts[automation.name + action.entity];
    }
  }

  private startActionTimeout(automation: EventAutomation, action: ConfigAction): void {
    this.logger.debug(`[Automations] Start ${action.turn_off_after} seconds turn_off_after timeout for automation [${automation.name}]`);
    const timeout = setTimeout(() => {
      delete this.turnOffAfterTimeouts[automation.name + action.entity];
      this.logger.debug(`[Automations] Turn_off_after timeout for automation [${automation.name}]`);
      const entity = this.zigbee.resolveEntity(action.entity);
      if (!entity) {
        this.logger.error(`[Automations] Entity #${action.entity}# not found so ignoring this action`);
        this.stopActionTimeout(automation, action);
        return;
      }
      const data = { state: StateOnOff.OFF };
      if (action.logger === 'info')
        this.logger.info(`[Automations] Turn_off_after timeout for automation [${automation.name}] send ${this.payloadStringify(data)} to entity #${action.entity}# `);
      else if (action.logger === 'warn')
        this.logger.warn(`[Automations] Turn_off_after timeout for automation [${automation.name}] send ${this.payloadStringify(data)} to entity #${action.entity}# `);
      else if (action.logger === 'error')
        this.logger.error(`[Automations] Turn_off_after timeout for automation [${automation.name}] send ${this.payloadStringify(data)} to entity #${action.entity}# `);
      else
        this.logger.debug(`[Automations] Turn_off_after timeout for automation [${automation.name}] send ${this.payloadStringify(data)} to entity #${action.entity}# `);

      this.mqtt.onMessage(`${this.mqttBaseTopic}/${entity.name}/set`, Buffer.from(this.payloadStringify(data)));
    }, action.turn_off_after! * 1000);
    timeout.unref();
    this.turnOffAfterTimeouts[automation.name + action.entity] = timeout;
  }

  private runActionsWithConditions(automation: EventAutomation, conditions: ConfigCondition[], actions: ConfigAction[]): void {
    for (const condition of conditions) {
      if (!this.checkCondition(automation, condition)) {
        return;
      }
    }
    this.runActions(automation, actions);
  }

  private stopTimeout(automation: EventAutomation): void {
    const timeout = this.triggerForTimeouts[automation.name];
    if (timeout) {
      //this.log.debug(`Stop timeout for automation [${automation.name}] trigger: ${this.stringify(automation.trigger)}`);
      this.logger.debug(`[Automations] Stop trigger-for timeout for automation [${automation.name}]`);
      clearTimeout(timeout);
      delete this.triggerForTimeouts[automation.name];
    }
  }

  private startTimeout(automation: EventAutomation): void {
    if (automation.trigger.for === undefined || automation.trigger.for === 0) {
      this.logger.error(`[Automations] Start ${automation.trigger.for} seconds trigger-for timeout error for automation [${automation.name}]`);
      return;
    }
    //this.log.debug(`Start timeout ${time} sec for automation [${automation.name}] trigger: ${this.stringify(automation.trigger)}`);
    this.logger.debug(`[Automations] Start ${automation.trigger.for} seconds trigger-for timeout for automation [${automation.name}]`);
    const timeout = setTimeout(() => {
      delete this.triggerForTimeouts[automation.name];
      //this.log.debug(`Timeout for automation [${automation.name}] trigger: ${this.stringify(automation.trigger)}`);
      this.logger.debug(`[Automations] Trigger-for timeout for automation [${automation.name}]`);
      this.runActionsWithConditions(automation, automation.condition, automation.action);
    }, automation.trigger.for * 1000);
    timeout.unref();
    this.triggerForTimeouts[automation.name] = timeout;
  }

  private runAutomationIfMatches(automation: EventAutomation, update: StateChangeUpdate, from: StateChangeFrom, to: StateChangeTo): void {
    const triggerResult = this.checkTrigger(automation, automation.trigger, update, from, to);
    if (triggerResult === false) {
      this.stopTimeout(automation);
      return;
    }
    if (triggerResult === null) {
      return;
    }
    const timeout = this.triggerForTimeouts[automation.name];
    if (timeout) {
      //this.log.warning(`Waiting trigger-for timeout for automation [${automation.name}]`);
      this.logger.debug(`[Automations] Waiting trigger-for timeout for automation [${automation.name}]`);
      return;
    } else {
      //this.log.warning(`Start automation [${automation.name}]`);
      this.logger.debug(`[Automations] Start automation [${automation.name}]`);
    }
    if (automation.trigger.for) {
      this.startTimeout(automation);
      return;
    }
    this.runActionsWithConditions(automation, automation.condition, automation.action);
  }

  private findAndRun(entityId: EntityId, update: StateChangeUpdate, from: StateChangeFrom, to: StateChangeTo): void {
    const automations = this.eventAutomations[entityId];
    if (!automations) {
      return;
    }
    for (const automation of automations) {
      this.runAutomationIfMatches(automation, update, from, to);
    }
  }

  async start() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.eventBus.onStateChange(this, (data: any) => {
      this.findAndRun(data.entity.name, data.update, data.from, data.to);
    });
  }

  async stop() {
    this.logger.debug(`[Automations] Extension unloading`);
    for (const key of Object.keys(this.triggerForTimeouts)) {
      this.logger.debug(`[Automations] Clearing timeout ${key}`);
      clearTimeout(this.triggerForTimeouts[key]);
      delete this.triggerForTimeouts[key];
    }
    for (const key of Object.keys(this.turnOffAfterTimeouts)) {
      this.logger.debug(`[Automations] Clearing timeout ${key}`);
      clearTimeout(this.turnOffAfterTimeouts[key]);
      delete this.turnOffAfterTimeouts[key];
    }
    clearTimeout(this.midnightTimeout);
    this.logger.debug(`[Automations] Removing listeners`);
    this.eventBus.removeListeners(this);
    this.logger.debug(`[Automations] Extension unloaded`);
  }

  private payloadStringify(payload: object): string {
    return this.stringify(payload, false, 255, 255, 35, 220, 159, 1, '"', '"')
  }

  private stringify(payload: object, enableColors = false, colorPayload = 255, colorKey = 255, colorString = 35, colorNumber = 220, colorBoolean = 159, colorUndefined = 1, keyQuote = '', stringQuote = '\''): string {
    const clr = (color: number) => {
      return enableColors ? `\x1b[38;5;${color}m` : '';
    };
    const reset = () => {
      return enableColors ? `\x1b[0m` : '';
    };
    const isArray = Array.isArray(payload);
    //console.log(payload, 'isArray', isArray, 'typeof', typeof payload);
    let string = `${reset()}${clr(colorPayload)}` + (isArray ? '[ ' : '{ ');
    Object.entries(payload).forEach(([key, value], index) => {
      if (index > 0) {
        string += ', ';
      }
      let newValue = '';
      newValue = value;
      if (typeof newValue === 'string') {
        newValue = `${clr(colorString)}${stringQuote}${newValue}${stringQuote}${reset()}`;
      }
      if (typeof newValue === 'number') {
        newValue = `${clr(colorNumber)}${newValue}${reset()}`;
      }
      if (typeof newValue === 'boolean') {
        newValue = `${clr(colorBoolean)}${newValue}${reset()}`;
      }
      if (typeof newValue === 'undefined') {
        newValue = `${clr(colorUndefined)}undefined${reset()}`;
      }
      if (typeof newValue === 'object') {
        newValue = this.stringify(newValue, enableColors, colorPayload, colorKey, colorString, colorNumber, colorBoolean, colorUndefined, keyQuote, stringQuote);
      }
      // new
      if (isArray)
        string += `${newValue}`;
      else
        string += `${clr(colorKey)}${keyQuote}${key}${keyQuote}${reset()}: ${newValue}`;
    });
    return string += ` ${clr(colorPayload)}` + (isArray ? ']' : '}') + `${reset()}`;
  }
}

export = AutomationsExtension;
