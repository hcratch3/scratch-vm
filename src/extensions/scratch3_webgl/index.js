const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const mat4 = require('gl-matrix').mat4;

class Scratch3WebGL {
    constructor(runtime) {
        this.runtime = runtime;

        // BroadcastChannelの初期化
        this.channel = new BroadcastChannel('webgl_channel');
        this.receivedMessages = [];

        // WebGLコンテキストの初期化
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.gl = this.canvas.getContext('webgl');
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }

        // WebGLのセットアップ
        this.initWebGL();

        // メッセージ受信イベント
        this.channel.onmessage = (event) => {
            this.receivedMessages.push(event.data);
            if (event.data === 'rotate') {
                this.rotateCube(); // メッセージが届いたらキューブを回転
            }
        };
    }

    // WebGLの初期化
    initWebGL() {
        this.vertexShaderSource = `
            attribute vec4 a_Position;
            uniform mat4 u_ModelMatrix;
            void main() {
                gl_Position = u_ModelMatrix * a_Position;
            }
        `;
        this.fragmentShaderSource = `
            precision mediump float;
            void main() {
                gl_FragColor = vec4(1.0, 0.5, 0.5, 1.0);
            }
        `;

        this.program = this.initShaderProgram(this.vertexShaderSource, this.fragmentShaderSource);
        this.gl.useProgram(this.program);

        this.initBuffers();

        this.modelMatrix = mat4.create();
        this.u_ModelMatrix = this.gl.getUniformLocation(this.program, 'u_ModelMatrix');

        this.drawScene();
    }

    // シェーダーのコンパイルとリンク
    initShaderProgram(vsSource, fsSource) {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        return shaderProgram;
    }

    // シェーダーをコンパイル
    loadShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    // 立方体のバッファを設定
    initBuffers() {
        const vertices = new Float32Array([
            // 頂点データ（立方体の頂点座標）
            -0.5, -0.5, -0.5,
             0.5, -0.5, -0.5,
             0.5,  0.5, -0.5,
            -0.5,  0.5, -0.5,
            -0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,
             0.5,  0.5,  0.5,
            -0.5,  0.5,  0.5,
        ]);

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        const position = this.gl.getAttribLocation(this.program, 'a_Position');
        this.gl.vertexAttribPointer(position, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(position);
    }

    // シーンを描画
    drawScene() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix);

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 8);
    }

    // 立方体を回転
    rotateCube() {
        mat4.rotateY(this.modelMatrix, this.modelMatrix, Math.PI / 8);
        this.drawScene();
    }

    // メッセージを送信するブロック
    sendMessage(args) {
        const message = Cast.toString(args.MESSAGE);
        this.channel.postMessage(message);
    }

    // 受信した最新のメッセージを取得するブロック
    getLastMessage() {
        if (this.receivedMessages.length === 0) {
            return "No messages";
        }
        return this.receivedMessages[this.receivedMessages.length - 1];
    }

    // Scratch拡張機能のブロック定義
    getInfo() {
        return {
            id: 'webgl',
            name: 'WebGL',
            blocks: [
                {
                    opcode: 'sendMessage',
                    blockType: BlockType.COMMAND,
                    text: 'send message [MESSAGE]',
                    arguments: {
                        MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'rotate'
                        }
                    }
                },
                {
                    opcode: 'getLastMessage',
                    blockType: BlockType.REPORTER,
                    text: 'get last received message'
                },
                {
                    opcode: 'rotateCube',
                    blockType: BlockType.COMMAND,
                    text: 'rotate the cube'
                }
            ],
            menus: {
            }
        };
    }
}

module.exports = Scratch3WebGL;
