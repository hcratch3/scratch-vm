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

    // 球体などの立体を生成するブロック
    createShape(args) {
        const shapeType = Cast.toString(args.SHAPE);
        const size = Cast.toNumber(args.SIZE);
        this.channel.postMessage({type: 'createShape', shape: shapeType, size: size});
        log.log('Sent create shape: ', shapeType, size);
    }

    // 立体を移動させるブロック
    moveShape(args) {
        const direction = Cast.toString(args.DIRECTION);
        const distance = Cast.toNumber(args.DISTANCE);
        this.channel.postMessage({type: 'moveShape', direction: direction, distance: distance});
        log.log('Sent move shape: ', direction, distance);
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
                    text: 'create [SHAPE] with size [SIZE]',
                    arguments: {
                        SHAPE: {
                            type: ArgumentType.STRING,
                            menu: 'shapeMenu',
                            defaultValue: 'sphere'
                        },
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'moveShape',
                    blockType: BlockType.COMMAND,
                    text: 'move shape [DIRECTION] by [DISTANCE]',
                    arguments: {
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
                }
            }
        };
    }
}

module.exports = Scratch3WebGLController;
