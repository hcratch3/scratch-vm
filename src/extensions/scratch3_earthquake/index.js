const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');


class EarthquakeAlertExtension {
    constructor() {
        this.earthquakeData = null;  // 最新の地震データ
        this.connectWebSocket();     // WebSocket接続を開始
    }

    // WebSocketに接続し、リアルタイムで地震データを受信する
    connectWebSocket() {
        const ws = new WebSocket('wss://ws-api.wolfx.jp/jma_eew');

        // WebSocket接続が確立した際の処理
        ws.onopen = () => {
            console.log('WebSocket connection opened.');
        };

        // WebSocketからデータを受信した際の処理
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data); // 受信データをJSON形式に変換
                console.log('Received data:', data);

                // 必要な地震情報を抽出
                this.earthquakeData = {
                    type: data.type,
                    title: data.Title,
                    codeType: data.CodeType,
                    source: data.Issue.Source,
                    status: data.Issue.Status,
                    eventID: data.EventID,
                    serial: data.Serial,
                    announcedTime: data.AnnouncedTime,
                    originTime: data.OriginTime,
                    hypocenter: data.Hypocenter,
                    latitude: data.Latitude,
                    longitude: data.Longitude,
                    magnitude: data.Magunitude,
                    depth: data.Depth,
                    maxIntensity: data.MaxIntensity,
                    accuracyEpicenter: data.Accuracy.Epicenter,
                    accuracyDepth: data.Accuracy.Depth,
                    accuracyMagnitude: data.Accuracy.Magnitude,
                    maxIntChangeString: data.MaxIntChange.String,
                    maxIntChangeReason: data.MaxIntChange.Reason,
                    isSea: data.isSea,
                    isTraining: data.isTraining,
                    isAssumption: data.isAssumption,
                    isWarn: data.isWarn,
                    isFinal: data.isFinal,
                    isCancel: data.isCancel,
                    originalText: data.OriginalText
                };
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        // WebSocketエラー発生時の処理
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // WebSocket接続が閉じられた際の処理
        ws.onclose = () => {
            console.log('WebSocket connection closed.');
            // 再接続を試みる
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }

    // Scratchのブロック情報定義
    getInfo() {
        return {
            id: 'earthquakeAlertExtension',
            name: 'Earthquake Alert',
            blocks: [
                { opcode: 'getType', blockType: Scratch.BlockType.REPORTER, text: 'Get type' },
                { opcode: 'getTitle', blockType: Scratch.BlockType.REPORTER, text: 'Get title' },
                { opcode: 'getCodeType', blockType: Scratch.BlockType.REPORTER, text: 'Get code type' },
                { opcode: 'getSource', blockType: Scratch.BlockType.REPORTER, text: 'Get source' },
                { opcode: 'getStatus', blockType: Scratch.BlockType.REPORTER, text: 'Get status' },
                { opcode: 'getEventID', blockType: Scratch.BlockType.REPORTER, text: 'Get event ID' },
                { opcode: 'getSerial', blockType: Scratch.BlockType.REPORTER, text: 'Get serial' },
                { opcode: 'getAnnouncedTime', blockType: Scratch.BlockType.REPORTER, text: 'Get announced time' },
                { opcode: 'getOriginTime', blockType: Scratch.BlockType.REPORTER, text: 'Get origin time' },
                { opcode: 'getHypocenter', blockType: Scratch.BlockType.REPORTER, text: 'Get hypocenter' },
                { opcode: 'getLatitude', blockType: Scratch.BlockType.REPORTER, text: 'Get latitude' },
                { opcode: 'getLongitude', blockType: Scratch.BlockType.REPORTER, text: 'Get longitude' },
                { opcode: 'getMagnitude', blockType: Scratch.BlockType.REPORTER, text: 'Get magnitude' },
                { opcode: 'getDepth', blockType: Scratch.BlockType.REPORTER, text: 'Get depth' },
                { opcode: 'getMaxIntensity', blockType: Scratch.BlockType.REPORTER, text: 'Get max intensity' },
                { opcode: 'getAccuracyEpicenter', blockType: Scratch.BlockType.REPORTER, text: 'Get accuracy epicenter' },
                { opcode: 'getAccuracyDepth', blockType: Scratch.BlockType.REPORTER, text: 'Get accuracy depth' },
                { opcode: 'getAccuracyMagnitude', blockType: Scratch.BlockType.REPORTER, text: 'Get accuracy magnitude' },
                { opcode: 'getMaxIntChangeString', blockType: Scratch.BlockType.REPORTER, text: 'Get max intensity change description' },
                { opcode: 'getMaxIntChangeReason', blockType: Scratch.BlockType.REPORTER, text: 'Get max intensity change reason' },
                { opcode: 'getIsSea', blockType: Scratch.BlockType.REPORTER, text: 'Is sea' },
                { opcode: 'getIsTraining', blockType: Scratch.BlockType.REPORTER, text: 'Is training' },
                { opcode: 'getIsAssumption', blockType: Scratch.BlockType.REPORTER, text: 'Is assumption' },
                { opcode: 'getIsWarn', blockType: Scratch.BlockType.REPORTER, text: 'Is warn' },
                { opcode: 'getIsFinal', blockType: Scratch.BlockType.REPORTER, text: 'Is final' },
                { opcode: 'getIsCancel', blockType: Scratch.BlockType.REPORTER, text: 'Is cancel' },
                { opcode: 'getOriginalText', blockType: Scratch.BlockType.REPORTER, text: 'Get original text' }
            ]
        };
    }

    // 各フィールドのデータを返すメソッドを定義
    getType() { return this.earthquakeData?.type || 'No data'; }
    getTitle() { return this.earthquakeData?.title || 'No data'; }
    getCodeType() { return this.earthquakeData?.codeType || 'No data'; }
    getSource() { return this.earthquakeData?.source || 'No data'; }
    getStatus() { return this.earthquakeData?.status || 'No data'; }
    getEventID() { return this.earthquakeData?.eventID || 'No data'; }
    getSerial() { return this.earthquakeData?.serial || 'No data'; }
    getAnnouncedTime() { return this.earthquakeData?.announcedTime || 'No data'; }
    getOriginTime() { return this.earthquakeData?.originTime || 'No data'; }
    getHypocenter() { return this.earthquakeData?.hypocenter || 'No data'; }
    getLatitude() { return this.earthquakeData?.latitude || 'No data'; }
    getLongitude() { return this.earthquakeData?.longitude || 'No data'; }
    getMagnitude() { return this.earthquakeData?.magnitude || 'No data'; }
    getDepth() { return this.earthquakeData?.depth || 'No data'; }
    getMaxIntensity() { return this.earthquakeData?.maxIntensity || 'No data'; }
    getAccuracyEpicenter() { return this.earthquakeData?.accuracyEpicenter || 'No data'; }
    getAccuracyDepth() { return this.earthquakeData?.accuracyDepth || 'No data'; }
    getAccuracyMagnitude() { return this.earthquakeData?.accuracyMagnitude || 'No data'; }
    getMaxIntChangeString() { return this.earthquakeData?.maxIntChangeString || 'No data'; }
    getMaxIntChangeReason() { return this.earthquakeData?.maxIntChangeReason || 'No data'; }
    getIsSea() { return this.earthquakeData?.isSea ? 'Yes' : 'No'; }
    getIsTraining() { return this.earthquakeData?.isTraining ? 'Yes' : 'No'; }
    getIsAssumption() { return this.earthquakeData?.isAssumption ? 'Yes' : 'No'; }
    getIsWarn() { return this.earthquakeData?.isWarn ? 'Yes' : 'No'; }
    getIsFinal() { return this.earthquakeData?.isFinal ? 'Yes' : 'No'; }
    getIsCancel() { return this.earthquakeData?.isCancel ? 'Yes' : 'No'; }
    getOriginalText() { return this.earthquakeData?.originalText || 'No data'; }
}

Scratch.extensions.register(new EarthquakeAlertExtension());
