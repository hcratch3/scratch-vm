const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const log = require('../../util/log');
const debugLogger = require('../../util/debug-logger');
const debug = debugLogger(true);
const formatMessage = require('format-message');
const Cast = require('../../util/cast');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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';

const PORT_M1 = 0;
const PORT_M2 = 1;

const PORT_A0 = 0;
const PORT_A1 = 1;
const PORT_A2 = 2;
const PORT_A3 = 3;
const PORT_A4 = 4;
const PORT_A5 = 5;
const PORT_A6 = 6;
const PORT_A7 = 7;

const PIDOPEN = 0;
const PIDLED = 1;
const PIDBUZZER = 2;
const PIDLIGHTSENSOR = 3;
const PIDSOUNDSENSOR = 4;
const PIDIRPHOTOREFLECTOR = 5;
const PIDACCELEROMETER = 6;
const PIDTOUCHSENSOR = 7;
const PIDPUSHSWITCH = 8;

const NORMAL = 0;
const REVERSE = 1;
const BRAKE = 2;
const COAST = 3;

const ON = 1;
const OFF = 0;

const DEFAULT_DC_MOTOR_POWER_RATIO = 50;

class SmalrubotError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SmalrubotError';
    }
}

class Smalrubot {
    static get HIGH () {
        return 255;
    }

    static get LOW () {
        return 0;
    }

    static get WRITE_COMMANDS () {
        return {
            digital_write: '01',
            analog_write: '03',
            servo_toggle: '08',
            servo_write: '09',
            set_neo_pixel_pin: '10',
            set_neo_pixel_num_pixels: '11',
            set_neo_pixel_color: '12',
            show_neo_pixel: '13',

            set_dc_motor_calibration: '20',
            init_dc_motor_port: '22',
            init_sensor_port: '25',

            dc_motor_power: '42',
            dc_motor_control: '43',

            led: '51',

            reset_v2: '91'
        };
    }

    static get READ_COMMANDS () {
        return {
            digital_read: '02',
            analog_read: '04',

            get_touch_sensor_value: '61',
            get_light_sensor_value: '62',
            get_ir_photoreflector_value: '64'
        };
    }

    constructor () {
        if ('serial' in navigator) {
            this.serial = navigator.serial;
        } else {
            throw new SmalrubotError('Web Serial API is not supported.');
        }

        this.serialPortFilter = {
            usbVendorId: 0x067b,
            usbProductId: 0x2303
        };

        this.serialPort = null;

        this.options = {
            baudrate: 19200,
            databits: 8,
            stopbits: 1,
            parity: 'none',
            buffersize: 255,
            rtscts: false,
            xon: false,
            xoff: false,
            xany: false
        };

        this.connectionState = 'disconnected';

        this.encoder = new TextEncoder();
        this.writer = null;
        this.writeQueue = [];

        this.decoder = new TextDecoder();
        this.reader = null;
        this.readBuffer = '';
    }

    scan () {
        debug(() => 'scan');

        return Promise.resolve()
            .then(() => {
                if (this.connectionState !== 'disconnected') {
                    log.info('Disconnect before connecting: reason=<Already connected>');
                    return this.disconnect();
                }
                return Promise.resolve();
            })
            .then(() => this.serial.requestPort({
                filters: [this.serialPortFilter]
            }))
            .then(serialPort => {
                this.serialPort = serialPort;
            });
    }

    disconnect () {
        debug(() => 'disconnect');

        if (!this.serialPort) {
            return Promise.resolve();
        }

        return Promise.resolve()
            .then(() => {
                if (this.connectionState === 'connected') {
                    return this.action('stop');
                }
                return Promise.resolve();
            })
            .catch(error => {
                log.error(error);
                return Promise.resolve();
            })
            .then(() => {
                let promise = Promise.resolve();
                if (this.connectionState !== 'disconnected') {
                    if (this.reader) {
                        promise = promise
                            .then(() => this.reader.cancel())
                            .catch(error => log.error(error));
                    }

                    if (this.writer) {
                        promise = promise
                            .then(() => this.writer.close())
                            .catch(error => log.error(error));
                    }

                    promise = promise
                        .then(() => this.serialPort.close())
                        .then(() => {
                            this.reader = null;
                            this.writer = null;
                            this.serialPort = null;
                            this.setConnectionState('disconnected');
                        });
                }
                return promise;
            })
            .catch(error => {
                log.error(error);
                throw error;
            });
    }

    isConnected () {
        return this.connectionState === 'connected';
    }

    writeCommand (commandName, pin, value = 0) {
        const command = Smalrubot.WRITE_COMMANDS[commandName];

        debug(() => `writeCommand: command=<${commandName} (${command})> pin=<${pin}> value=<${value}>`);

        return this.write(`${this.normalizeCommand(command)}${this.normalizePin(pin)}${this.normalizeValue(value)}`);
    }

    write (message, wrap = true) {
        this.throwIfClosed();

        if (!this.serialPort.writable) {
            return Promise.resolve();
        }

        if (wrap) {
            message = `!${message}.`;
        }
        const bytes = this.encoder.encode(message);

        debug(() => `write: message=<${message}> length=<${bytes.length}> wrap=<${wrap}>`);

        this.writeQueue.push(bytes);

        try {
            this.writer = this.serialPort.writable.getWriter();
        } catch (e) {
            log.info(e);
            return Promise.resolve();
        }

        const writeLoop = () => {
            const bytes = this.writeQueue.shift();
            if (bytes) {
                return this.writer.write(bytes).then(() => writeLoop());
            }
            this.writer.releaseLock();
            this.writer = null;
            return Promise.resolve();
        };
        const dispose = () => {
            this.writer.releaseLock();
            this.writer = null;
        };
        return writeLoop()
            .catch(error => {
                try {
                    this.writer.releaseLock();
                    this.writer = null;
                } catch (e) {
                    log.error(e);
                }
                throw error;
            });
    }

    flushRead (timeoutSeconds = 1) {
        debug(() => `flushRead: timeout=<${timeoutSeconds} sec>`);

        const flushReadLoop = () => this.readLine(timeoutSeconds)
              .then(line => {
                  if (line.length > 0) {
                      return flushReadLoop();
                  }
                  return Promise.resolve();
              });

        return flushReadLoop();
    }

    readCommand (commandName, pin) {
        const command = Smalrubot.READ_COMMANDS[commandName];

        debug(() => `readCommand: command=<${commandName} (${command})> pin=<${pin}>`);

        let promise = this.write(`${this.normalizeCommand(command)}${this.normalizePin(pin)}${this.normalizeValue(0)}`);

        const readCommandLoop = (retryCount) => this.read(0.100)
              .then(data => {
                  if (data && data.pin && data.value) {
                      if (data.pin === pin) {
                          return Promise.resolve(Number(data.value));
                      } else {
                          log.info(`Detected noise: read=<${JSON.stringify(data, null, 2)}>`);
                      }
                  } else {
                      retryCount--;
                  }
                  if (retryCount <= 1) {
                      return Promise.resolve(0);
                  }
                  return readCommandLoop(retryCount - 1);
              });

        return promise
            .then(() => readCommandLoop(3));
    }

    read (timeoutSeconds = 1) {
        this.throwIfClosed();

        debug(() => `read: timeout=<${timeoutSeconds} sec>`);

        return this.readLine(timeoutSeconds)
            .then(line => {
                if (line.length > 0 && line.match(/^\d+:/)) {
                    const data = line.split(/:/);
                    return {
                        pin: Number(data[0]),
                        value: data[1]
                    };
                }
                return null;
            });
    }

    readLine (timeoutSeconds = 1) {
        this.throwIfClosed();

        debug(() => `readLine: timeout=<${timeoutSeconds} sec>`);

        if (!this.serialPort.readable) {
            return Promise.resolve('');
        }

        if (!this.reader) {
            this.reader = this.serialPort.readable.getReader();
        }
        let timeoutId = setTimeout(() => {
            if (this.reader) {
                debug(() => `Timeouted reading`);
                //this.reader.cancel();
            }
        }, timeoutSeconds * 1000);

        const readLineLoop = () => this.reader.read()
              .then(data => {
                  const { value, done } = data;
                  if (value) {
                      const s = this.decoder.decode(value);
                      debug(() => `reader.read: value=<${JSON.stringify(value, null, 2)}> decoded=<${this.lineToString(s)}> done=<${done}>`);
                      this.readBuffer += s;
                  } else {
                      debug(() => `reader.read: value=<> decoded=<> done=<${done}>`);
                  }
                  if (done) {
                      debug(() => `Canceled reading`);
                      return Promise.resolve();
                  }
                  if (this.readBuffer.includes('\r\n')) {
                      return Promise.resolve();
                  }
                  return readLineLoop();
              });

        let promise = readLineLoop()
            .then(() => {
                clearTimeout(timeoutId);

                //this.reader.releaseLock();
                //this.reader = null;

                debug(() => `After read loop: readBuffer=<${this.lineToString(this.readBuffer)}>`);
                const position = this.readBuffer.indexOf('\r\n');
                if (position === -1) {
                    return '';
                }

                const line = this.readBuffer.substring(0, position);
                this.readBuffer = this.readBuffer.substring(position + '\r\n'.length);
                debug(() => `Got line from readBuffer: line=<${this.lineToString(line)}> readBuffer=<${this.lineToString(this.readBuffer)}>`);

                return line;
            });

        promise = promise
            .catch(error => {
                log.error(`Error in readLine: ${e}`);

                clearTimeout(timeoutId);

                this.reader.releaseLock();
                this.reader = null;

                return '';
            });

        return promise;
    }

    setConnectionState (connectionState) {
        debug(() => `Set connection state: from=<${this.connectionState}> to=<${connectionState}>`);

        this.connectionState = connectionState;
    }

    sleep (seconds) {
        debug(() => `Sleep: senconds=<${seconds}>`);

        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    throwIfClosed () {
        if (!this.serialPort) {
            throw new SmalrubotError('Serial port closed');
        }
    }

    normalizePin (pin) {
        if (String(pin).match(/^a/i)) {
            pin = this.analogZero + String(pin).substring(1);
        }
        if (Number(pin) > 99) {
            throw new SmalrubotError(`Pin number must be in 0-99: pin=<${pin}>`);
        }
        return this.normalize(pin, 2);
    }

    normalizeCommand (command) {
        if (String(command).length > 2) {
            throw new SmalrubotError(`Commands can only be two digits: command=<${command}>`);
        }
        return this.normalize(command, 2);
    }

    normalizeValue (value) {
        if (String(value).length > 3) {
            throw new SmalrubotError(`Values are limited to three digits: value=<${value}>`);
        }
        return this.normalize(value, 3);
    }

    normalize (value, spaces) {
        const paddingLength = spaces - String(value).length;
        let padding = '';
        for (let i = 0; i < paddingLength; i++) {
            padding += '0';
        }
        return padding + value;
    }

    lineToString (line) {
        return line.replace('\r', '[CR]').replace('\n', '[LF]');
    }
}

class SmalrubotS1 extends Smalrubot {
    constructor () {
        super();

        this.dcMotorPowerRatios = {
            left: DEFAULT_DC_MOTOR_POWER_RATIO,
            right: DEFAULT_DC_MOTOR_POWER_RATIO
        };
    }

    connect () {
        debug(() => 'connect');

        if (!this.serialPort) {
            return Promise.reject('Failed to connect: reason=<Not scan>');
        }

        let promise = Promise.resolve();
        promise = promise
            .then(() => this.serialPort.open(this.options))
            .then(() => {
                this.setConnectionState('connecting');

                return this.sleep(2);
            });

        let found = false;
        const resetV2Loop = (i) => this.writeCommand('reset_v2', 0)
              .then(() => this.read(1))
              .then(data => {
                  if (data && data.pin && data.value === 'S1') {
                      this.analogZero = data.pin;
                      return Promise.resolve();
                      return this.flushRead(0.25);
                  }
                  if (i <= 1) {
                      throw new SmalrubotError('Smalrubot S1 not found.');
                  }
                  return resetV2Loop(i - 1);
              });

        promise = promise
            .then(() => resetV2Loop(5))
            .then(() => this.initDcMotorPort(PORT_M1, 0))
            .then(() => this.initDcMotorPort(PORT_M2, 0))
            .then(() => this.initSensorPort(PORT_A0, PIDLED))
            .then(() => this.initSensorPort(PORT_A1, PIDLED))
            .then(() => this.initSensorPort(PORT_A2, PIDTOUCHSENSOR))
            .then(() => this.initSensorPort(PORT_A3, PIDLIGHTSENSOR))
            .then(() => this.initSensorPort(PORT_A4, PIDIRPHOTOREFLECTOR))
            .then(() => this.initSensorPort(PORT_A5, PIDIRPHOTOREFLECTOR))
            .then(() => {
                this.setConnectionState('connected');
                return Promise.resolve();
            });

        promise = promise
            .catch(error => {
                log.error(`Error in connect: ${error}`);
                return this.disconnect().then(() => {
                    throw error;
                });
            });

        return promise;
    }

    led (position, state) {
        debug(() => `led: position=<${position}> state=<${state}>`);

        const pin = position === 'left' ? PORT_A0: PORT_A1;
        const value = state ? ON : OFF;
        return this.writeCommand('led', pin, value);
    }

    getMotorSpeed (position) {
        debug(() => `getMotorSpeed: position=<${position}>`);

        return this.dcMotorPowerRatios[position];
    }

    setMotorSpeed (position, speedRatio) {
        debug(() => `setMotorSpeed: position=<${position}> speed=<${speedRatio} %>`);

        if (speedRatio > 100) {
            speedRatio = 100;
        } else if (speedRatio < 0) {
            speedRatio = 0;
        }
        this.dcMotorPowerRatios[position] = speedRatio;
    }

    action (direction) {
        debug(() => `action: direction=<${direction}>`);

        let leftValue;
        let rightValue;
        switch (direction) {
        case 'forward':
            leftValue = NORMAL;
            rightValue = NORMAL;
            break;
        case 'backward':
            leftValue = REVERSE;
            rightValue = REVERSE;
            break;
        case 'left':
            leftValue = REVERSE;
            rightValue = NORMAL;
            break;
        case 'right':
            leftValue = NORMAL;
            rightValue = REVERSE;
            break;
        case 'stop':
            leftValue = COAST;
            rightValue = COAST;
            break;
        default:
            return Promise.reject(`Could not action: reason=<Invalid direction> direction=<${direction}>`);
        }

        return Promise.resolve()
            .then(() => {
                if (direction !== 'stop') {
                    return this.applyDcMotorPowers();
                }
                return Promise.resolve();
            })
            .then(() => this.writeCommand('dc_motor_control', PORT_M1, leftValue))
            .then(() => this.writeCommand('dc_motor_control', PORT_M2, rightValue));
    }

    getSensorValue (position) {
        debug(() => `getSensorValue: position=<${position}>`);

        let commandName;
        let pin;
        switch (position) {
        case 'touch':
            commandName = 'get_touch_sensor_value';
            pin = PORT_A2;
            break;
        case 'light':
            commandName = 'get_light_sensor_value';
            pin = PORT_A3;
            break;
        case 'left':
            commandName = 'get_ir_photoreflector_value';
            pin = PORT_A4;
            break;
        case 'right':
            commandName = 'get_ir_photoreflector_value';
            pin = PORT_A5;
            break;
        }

        return this.readCommand(commandName, pin);
    }

    initDcMotorPort (port) {
        debug(() => `initDcMotorPort: port=<${port}>`);

        return this.writeCommand('init_dc_motor_port', port);
    }

    initSensorPort (port, pid) {
        debug(() => `initSensorPort: port=<${port}> pid=<${pid}>`);

        return this.writeCommand('init_sensor_port', port, pid);
    }

    applyDcMotorPowers () {
        return this.applyDcMotorPower('left')
            .then(() => this.applyDcMotorPower('right'));
    }

    applyDcMotorPower (position) {
        const ratio = this.dcMotorPowerRatios[position];
        const power = Math.round(Smalrubot.HIGH * (ratio / 100));

        debug(() => `applyDcMotorPower: position=<${position}> speed=<${ratio} %> power=<${power}>`);

        let pin = PORT_M1;
        if (position === 'right') {
            pin = PORT_M2;
        }

        return this.writeCommand('dc_motor_power', pin, power);
    }
}

/**
 * Host for the Smalrubot S1-related blocks
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3SmalrubotS1Blocks {
    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return 'Smalrubot S1';
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return 'smalrubotS1';
    }

    /**
     * @return {array} - text and values for each actions menu element
     */
    get ACTIONS_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'smalrubotS1.actionMenu.forward',
                    default: 'forward',
                    description: 'label for "forward" element in action picker for Smalrubot S1 extension'
                }),
                value: 'forward'
            },
            {
                text: formatMessage({
                    id: 'smalrubotS1.actionMenu.backward',
                    default: 'backward',
                    description: 'label for "backward" element in action picker for Smalrubot S1 extension'
                }),
                value: 'backward'
            },
            {
                text: formatMessage({
                    id: 'smalrubotS1.actionMenu.turnLeft',
                    default: 'turn left',
                    description: 'label for "turn left" element in action picker for Smalrubot S1 extension'
                }),
                value: 'left'
            },
            {
                text: formatMessage({
                    id: 'smalrubotS1.actionMenu.turnRight',
                    default: 'turn right',
                    description: 'label for "turn right" element in action picker for Smalrubot S1 extension'
                }),
                value: 'right'
            },
            {
                text: formatMessage({
                    id: 'smalrubotS1.actionMenu.stop',
                    default: 'stop',
                    description: 'label for "stop" element in action picker for Smalrubot S1 extension'
                }),
                value: 'stop'
            }
        ];
    }

    /**
     * @return {array} - text and values for each positions menu element
     */
    get POSITIONS_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'smalrubotS1.positionsMenu.left',
                    default: 'left',
                    description: 'label for "left" element in position picker for Smalrubot S1 extension'
                }),
                value: 'left'
            },
            {
                text: formatMessage({
                    id: 'smalrubotS1.positionsMenu.right',
                    default: 'right',
                    description: 'label for "right" element in position picker for Smalrubot S1 extension'
                }),
                value: 'right'
            }
        ];
    }

    /**
     * @return {array} - text and values for each sensor positions menu element
     */
    get SENSOR_POSITIONS_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'smalrubotS1.positionsMenu.left',
                    default: 'left',
                    description: 'label for "left" element in position picker for Smalrubot S1 extension'
                }),
                value: 'left'
            },
            {
                text: formatMessage({
                    id: 'smalrubotS1.positionsMenu.right',
                    default: 'right',
                    description: 'label for "right" element in position picker for Smalrubot S1 extension'
                }),
                value: 'right'
            },
            {
                text: formatMessage({
                    id: 'smalrubotS1.positionsMenu.touch',
                    default: 'touch',
                    description: 'label for "touch" element in position picker for Smalrubot S1 extension'
                }),
                value: 'touch'
            },
            {
                text: formatMessage({
                    id: 'smalrubotS1.positionsMenu.light',
                    default: 'light',
                    description: 'label for "light" element in position picker for Smalrubot S1 extension'
                }),
                value: 'light'
            }
        ];
    }

    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this));

        this.runtime.registerPeripheralExtension(Scratch3SmalrubotS1Blocks.EXTENSION_ID, this);

        this._smalrubot = null;
    }

    get smalrubot () {
        try {
            if (!this._smalrubot) {
                this._smalrubot = new SmalrubotS1();
                this._smalrubot.debugMode = true;
            }
            return this._smalrubot;
        } catch (e) {
            log.error(e);

            this.emitRuntime('PERIPHERAL_REQUEST_ERROR', {
                extensionId: Scratch3SmalrubotS1Blocks.EXTENSION_ID
            });
        }
        return null;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: Scratch3SmalrubotS1Blocks.EXTENSION_ID,
            name: Scratch3SmalrubotS1Blocks.EXTENSION_NAME,
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'action',
                    text: formatMessage({
                        id: 'smalrubotS1.action',
                        default: '[ACTION]',
                        description: 'action block text'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ACTION: {
                            type: ArgumentType.STRING,
                            menu: 'actions',
                            defaultValue: this.ACTIONS_MENU[0].value
                        }
                    }
                },
                {
                    opcode: 'actionAndStopAfter',
                    text: formatMessage({
                        id: 'smalrubotS1.actionAndStopAfter',
                        default: '[ACTION] for [SEC] seconds',
                        description: 'actionAndStopAfter block text'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ACTION: {
                            type: ArgumentType.STRING,
                            menu: 'actions',
                            defaultValue: this.ACTIONS_MENU[0].value
                        },
                        SEC: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.5
                        }
                    }
                },
                {
                    opcode: 'getSensorValue',
                    text: formatMessage({
                        id: 'smalrubotS1.getSensorValue',
                        default: '[POSITION] sensor value',
                        description: 'getSnsorValue block text'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        POSITION: {
                            type: ArgumentType.STRING,
                            menu: 'sensorPositions',
                            defaultValue: this.SENSOR_POSITIONS_MENU[0].value
                        }
                    }
                },
                {
                    opcode: 'turnLedOn',
                    text: formatMessage({
                        id: 'smalrubotS1.turnLedOn',
                        default: 'turn [POSITION] LED on',
                        description: 'turnLedOn block text'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        POSITION: {
                            type: ArgumentType.STRING,
                            menu: 'positions',
                            defaultValue: this.POSITIONS_MENU[0].value
                        }
                    }
                },
                {
                    opcode: 'turnLedOff',
                    text: formatMessage({
                        id: 'smalrubotS1.turnLedOff',
                        default: 'turn [POSITION] LED off',
                        description: 'turnLedOff block text'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        POSITION: {
                            type: ArgumentType.STRING,
                            menu: 'positions',
                            defaultValue: this.POSITIONS_MENU[0].value
                        }
                    }
                },
                {
                    opcode: 'getMotorSpeed',
                    text: formatMessage({
                        id: 'smalrubotS1.getMotorSpeed',
                        default: '[POSITION] DC motor speed (%)',
                        description: 'getMotorSpeed block text'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        POSITION: {
                            type: ArgumentType.STRING,
                            menu: 'positions',
                            defaultValue: this.POSITIONS_MENU[0].value
                        }
                    }
                },
                {
                    opcode: 'setMotorSpeed',
                    text: formatMessage({
                        id: 'smalrubotS1.setMotorSpeed',
                        default: 'set [POSITION] DC motor speed [SPEED] (%)',
                        description: 'setMotorSpeed block text'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        POSITION: {
                            type: ArgumentType.STRING,
                            menu: 'positions',
                            defaultValue: this.POSITIONS_MENU[0].value
                        },
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                }
            ],
            menus: {
                actions: {
                    acceptReporters: true,
                    items: this.ACTIONS_MENU
                },
                sensorPositions: {
                    acceptReporters: true,
                    items: this.SENSOR_POSITIONS_MENU
                },
                positions: {
                    acceptReporters: true,
                    items: this.POSITIONS_MENU
                }
            }
        };
    }

    action (args) {
        try {
            debug(() => `action: args=<${JSON.stringify(args, null, 2)}>`);

            if (!this.smalrubot) {
                return;
            }

            this.smalrubot.action(args.ACTION);
        } catch (error) {
            log.error(error);
        }
    }

    actionAndStopAfter (args, util) {
        try {
            if (!this.smalrubot) {
                return;
            }

            if (util.stackTimerNeedsInit()) {
                debug(() => `actionAndStopAfter: args=<${JSON.stringify(args, null, 2)}>`);

                const duration = Math.max(0, 1000 * Cast.toNumber(args.SEC));
                util.startStackTimer(duration);
                this.runtime.requestRedraw();

                this.smalrubot.action(args.ACTION);

                util.yield();
            } else if (util.stackTimerFinished()) {
                if (args.ACTION !== 'stop') {
                    this.smalrubot.action('stop');
                }
            } else {
                util.yield();
            }
        } catch (error) {
            log.error(error);
        }
    }

    getSensorValue (args) {
        try {
            debug(() => `getSensorValue: args=<${JSON.stringify(args, null, 2)}>`);

            if (!this.smalrubot) {
                return Promise.resolve(0);
            }

            return this.smalrubot.getSensorValue(args.POSITION);
        } catch (error) {
            log.error(error);
        }
        return Promise.resolve(0);
    }

    turnLedOn (args) {
        try {
            debug(() => `turnLedOn: args=<${JSON.stringify(args, null, 2)}>`);

            if (!this.smalrubot) {
                return Promise.resolve();
            }

            return this.smalrubot.led(args.POSITION, true);
        } catch (error) {
            log.error(error);
        }
        return Promise.resolve();
    }

    turnLedOff (args) {
        try {
            debug(() => `turnLedOff: args=<${JSON.stringify(args, null, 2)}>`);

            if (!this.smalrubot) {
                return Promise.resolve();
            }

            return this.smalrubot.led(args.POSITION, false);
        } catch (error) {
            log.error(error);
        }
        return Promise.resolve();
    }

    getMotorSpeed (args) {
        try {
            debug(() => `getMotorSpeed: args=<${JSON.stringify(args, null, 2)}>`);

            if (!this.smalrubot) {
                return 0;
            }

            return this.smalrubot.getMotorSpeed(args.POSITION);
        } catch (error) {
            log.error(error);
        }
        return 0;
    }

    setMotorSpeed (args) {
        try {
            debug(() => `setMotorSpeed: args=<${JSON.stringify(args, null, 2)}>`);

            if (!this.smalrubot) {
                return;
            }

            this.smalrubot.setMotorSpeed(args.POSITION, Cast.toNumber(args.SPEED));
        } catch (error) {
            log.error(error);
        }
    }

    isConnected () {
        debug(() => `isConnected`);

        return this.smalrubot ? this.smalrubot.isConnected() : false;
    }

    scan () {
        debug(() => 'scan');

        if (!this.smalrubot) {
            this.emitRuntime('PERIPHERAL_REQUEST_ERROR', {
                extensionId: Scratch3SmalrubotS1Blocks.EXTENSION_ID
            });
            return;
        }

        this.smalrubot.scan()
            .then(() => this.emitRuntime('PERIPHERAL_LIST_UPDATE', {0: {peripheralId: 0}}))
            .catch(error => this.emitRuntime('PERIPHERAL_REQUEST_ERROR', {
                extensionId: Scratch3SmalrubotS1Blocks.EXTENSION_ID
            }));
    }

    connect (id) {
        debug(() => `connect: id=<${id}>`);

        if (!this.smalrubot) {
            this.emitRuntime('PERIPHERAL_REQUEST_ERROR', {
                extensionId: Scratch3SmalrubotS1Blocks.EXTENSION_ID
            });
            return;
        }

        this.smalrubot.connect()
            .then(() => this.emitRuntime('PERIPHERAL_CONNECTED'));
    }

    disconnect () {
        debug(() => 'disconnect');

        if (!this.smalrubot) {
            this.emitRuntime('PERIPHERAL_DISCONNECTED');
            return;
        }

        this.smalrubot.disconnect()
            .then(() => this.emitRuntime('PERIPHERAL_DISCONNECTED'));
    }

    emitRuntime(eventName, ...args) {
        debug(() => `emitRuntime: eventName=<${eventName}> args=<${JSON.stringify(...args)}>`);

        return new Promise(() => this.runtime.emit(this.runtime.constructor[eventName], ...args));
    }

    stopAll () {
        this.turnLedOff({POSITION: 'left'});
        this.turnLedOff({POSITION: 'right'});
        this.action({ACTION: 'stop'});
    }
}

module.exports = Scratch3SmalrubotS1Blocks;
