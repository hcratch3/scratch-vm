const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');

class Scratch3WebGLController {
    constructor(runtime) {
        this.runtime = runtime;

        // BroadcastChannelの初期化
        this.channel = new BroadcastChannel('webgl_channel');
        this.receivedMessages = [];

        // メッセージ受信イベント
        this.channel.onmessage = (event) => {
            this.receivedMessages.push(event.data);
            log.log('Received message: ', event.data);
        };
    }

    // 背景色を変更するブロック
    setBackgroundColor(args) {
        const color = Cast.toString(args.COLOR);
        this.channel.postMessage({type: 'setBackgroundColor', color: color});
        log.log('Sent background color change: ', color);
    }

    // 名前付きの立体を生成するブロック
    createShape(args) {
        const shapeName = Cast.toString(args.NAME);
        const shapeType = Cast.toString(args.SHAPE);
        const size = Cast.toNumber(args.SIZE);
        this.channel.postMessage({type: 'createShape', name: shapeName, shape: shapeType, size: size});
        log.log('Sent create shape: ', shapeName, shapeType, size);
    }

    // 立体の色を変更するブロック
    setShapeColor(args) {
        const shapeName = Cast.toString(args.NAME);
        const color = Cast.toString(args.COLOR);
        this.channel.postMessage({type: 'setShapeColor', name: shapeName, color: color});
        log.log('Sent set shape color: ', shapeName, color);
    }

    // 名前付きの立体を移動させるブロック
    moveShape(args) {
        const shapeName = Cast.toString(args.NAME);
        const direction = Cast.toString(args.DIRECTION);
        const distance = Cast.toNumber(args.DISTANCE);
        this.channel.postMessage({type: 'moveShape', name: shapeName, direction: direction, distance: distance});
        log.log('Sent move shape: ', shapeName, direction, distance);
    }

    // カメラの視点を移動させるブロック
    moveCamera(args) {
        const axis = Cast.toString(args.AXIS);
        const amount = Cast.toNumber(args.AMOUNT);
        this.channel.postMessage({type: 'moveCamera', axis: axis, amount: amount});
        log.log('Sent move camera: ', axis, amount);
    }

    getInfo() {
        return {
            id: 'webgl',
            name: 'WebGL',
            blocks: [
                {
                    opcode: 'setBackgroundColor',
                    blockType: BlockType.COMMAND,
                    text: 'set background color [COLOR]',
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#0000ff' // 青色
                        }
                    }
                },
                {
                    opcode: 'createShape',
                    blockType: BlockType.COMMAND,
                    text: 'create [SHAPE] named [NAME] with size [SIZE]',
                    arguments: {
                        SHAPE: {
                            type: ArgumentType.STRING,
                            menu: 'shapeMenu',
                            defaultValue: 'sphere'
                        },
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'myShape'
                        },
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'setShapeColor',
                    blockType: BlockType.COMMAND,
                    text: 'set shape [NAME] color [COLOR]',
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'myShape'
                        },
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#ff0000' // 赤色
                        }
                    }
                },
                {
                    opcode: 'moveShape',
                    blockType: BlockType.COMMAND,
                    text: 'move shape [NAME] [DIRECTION] by [DISTANCE]',
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'myShape'
                        },
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'directionMenu',
                            defaultValue: 'up'
                        },
                        DISTANCE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'moveCamera',
                    blockType: BlockType.COMMAND,
                    text: 'move camera [AXIS] by [AMOUNT]',
                    arguments: {
                        AXIS: {
                            type: ArgumentType.STRING,
                            menu: 'axisMenu',
                            defaultValue: 'x'
                        },
                        AMOUNT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                }
            ],
            menus: {
                shapeMenu: {
                    acceptReporters: true,
                    items: ['sphere', 'cube', 'cone']
                },
                directionMenu: {
                    acceptReporters: true,
                    items: ['up', 'down', 'left', 'right', 'forward', 'backward']
                },
                axisMenu: {
                    acceptReporters: true,
                    items: ['x', 'y', 'z']
                }
            }
        };
    }
}

module.exports = Scratch3WebGLController;
