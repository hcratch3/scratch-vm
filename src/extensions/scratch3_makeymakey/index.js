const formatMessage = require('format-message');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHN0eWxlPi5zdDJ7ZmlsbDpyZWR9LnN0M3tmaWxsOiNlMGUwZTB9LnN0NHtmaWxsOm5vbmU7c3Ryb2tlOiM2NjY7c3Ryb2tlLXdpZHRoOi41O3N0cm9rZS1taXRlcmxpbWl0OjEwfTwvc3R5bGU+PHBhdGggZD0iTTM1IDI4SDVhMSAxIDAgMCAxLTEtMVYxMmMwLS42LjQtMSAxLTFoMzBjLjUgMCAxIC40IDEgMXYxNWMwIC41LS41IDEtMSAxeiIgZmlsbD0iI2ZmZiIgaWQ9IkxheWVyXzYiLz48ZyBpZD0iTGF5ZXJfNCI+PHBhdGggY2xhc3M9InN0MiIgZD0iTTQgMjVoMzJ2Mi43SDR6TTEzIDI0aC0yLjJhMSAxIDAgMCAxLTEtMXYtOS43YzAtLjYuNC0xIDEtMUgxM2MuNiAwIDEgLjQgMSAxVjIzYzAgLjYtLjUgMS0xIDF6Ii8+PHBhdGggY2xhc3M9InN0MiIgZD0iTTYuMSAxOS4zdi0yLjJjMC0uNS40LTEgMS0xaDkuN2MuNSAwIDEgLjUgMSAxdjIuMmMwIC41LS41IDEtMSAxSDcuMWExIDEgMCAwIDEtMS0xeiIvPjxjaXJjbGUgY2xhc3M9InN0MiIgY3g9IjIyLjgiIGN5PSIxOC4yIiByPSIzLjQiLz48Y2lyY2xlIGNsYXNzPSJzdDIiIGN4PSIzMC42IiBjeT0iMTguMiIgcj0iMy40Ii8+PHBhdGggY2xhc3M9InN0MiIgZD0iTTQuMiAyN2gzMS45di43SDQuMnoiLz48L2c+PGcgaWQ9IkxheWVyXzUiPjxjaXJjbGUgY2xhc3M9InN0MyIgY3g9IjIyLjgiIGN5PSIxOC4yIiByPSIyLjMiLz48Y2lyY2xlIGNsYXNzPSJzdDMiIGN4PSIzMC42IiBjeT0iMTguMiIgcj0iMi4zIi8+PHBhdGggY2xhc3M9InN0MyIgZD0iTTEyLjUgMjIuOWgtMS4yYy0uMyAwLS41LS4yLS41LS41VjE0YzAtLjMuMi0uNS41LS41aDEuMmMuMyAwIC41LjIuNS41djguNGMwIC4zLS4yLjUtLjUuNXoiLz48cGF0aCBjbGFzcz0ic3QzIiBkPSJNNy4yIDE4Ljd2LTEuMmMwLS4zLjItLjUuNS0uNWg4LjRjLjMgMCAuNS4yLjUuNXYxLjJjMCAuMy0uMi41LS41LjVINy43Yy0uMyAwLS41LS4yLS41LS41ek00IDI2aDMydjJINHoiLz48L2c+PGcgaWQ9IkxheWVyXzMiPjxwYXRoIGNsYXNzPSJzdDQiIGQ9Ik0zNS4yIDI3LjlINC44YTEgMSAwIDAgMS0xLTFWMTIuMWMwLS42LjUtMSAxLTFoMzAuNWMuNSAwIDEgLjQgMSAxVjI3YTEgMSAwIDAgMS0xLjEuOXoiLz48cGF0aCBjbGFzcz0ic3Q0IiBkPSJNMzUuMiAyNy45SDQuOGExIDEgMCAwIDEtMS0xVjEyLjFjMC0uNi41LTEgMS0xaDMwLjVjLjUgMCAxIC40IDEgMVYyN2ExIDEgMCAwIDEtMS4xLjl6Ii8+PC9nPjwvc3ZnPg==';

/**
 * Length of the buffer to store key presses for the "when keys pressed in order" hat
 * @type {number}
 */
const KEY_BUFFER_LENGTH = 100;

/**
 * Timeout in milliseconds to reset the completed flag for a sequence.
 * @type {number}
 */
const SEQUENCE_HAT_TIMEOUT = 100;

/**
 * Class for the makey makey blocks in Scratch 3.0
 * @constructor
 */
class Scratch3MakeyMakeyBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        /**
         * A toggle that alternates true and false each frame, so that an
         * edge-triggered hat can trigger on every other frame.
         * @type {boolean}
         */
        this.frameToggle = false;

        // Set an interval that toggles the frameToggle every frame.
        setInterval(() => {
            this.frameToggle = !this.frameToggle;
        }, this.runtime.currentStepTime);

        this.keyPressed = this.keyPressed.bind(this);
        this.runtime.on('KEY_PRESSED', this.keyPressed);

        /*
         * An object containing a set of sequence objects.
         * These are the key sequences currently being detected by the "when
         * keys pressed in order" hat block. Each sequence is keyed by its
         * string representation (the sequence's value in the menu, which is a
         * string of KEY_ID_SHORTs separated by spaces). Each sequence object
         * has an array property (an array of KEY_ID_SHORTs) and a boolean
         * completed property that is true when the sequence has just been
         * pressed.
         * @type {object}
         */
        this.sequences = {};

        /*
         * An array of the key codes of recently pressed keys.
         * @type {array}
         */
        this.keyPressBuffer = [];
    }

    /*
     * IDs for the space bar and arrow keys.
     */
    get KEY_ID () {
        return {
            SPACE: 'space',
            LEFT: 'left arrow',
            UP: 'up arrow',
            RIGHT: 'right arrow',
            DOWN: 'down arrow'
        };
    }

    /*
     * Localized names of the space bar and arrow keys.
     */
    get KEY_TEXT () {
        return {
            [this.KEY_ID.SPACE]: formatMessage({
                id: 'makeymakey.spaceKey',
                default: 'space',
                description: 'The space key on a computer keyboard.'
            }),
            [this.KEY_ID.LEFT]: formatMessage({
                id: 'makeymakey.leftArrow',
                default: 'left arrow',
                description: 'The left arrow key on a computer keyboard.'
            }),
            [this.KEY_ID.UP]: formatMessage({
                id: 'makeymakey.upArrow',
                default: 'up arrow',
                description: 'The up arrow key on a computer keyboard.'
            }),
            [this.KEY_ID.RIGHT]: formatMessage({
                id: 'makeymakey.rightArrow',
                default: 'right arrow',
                description: 'The right arrow key on a computer keyboard.'
            }),
            [this.KEY_ID.DOWN]: formatMessage({
                id: 'makeymakey.downArrow',
                default: 'down arrow',
                description: 'The down arrow key on a computer keyboard.'
            })
        };
    }

    /*
     * Short form IDs for the space bar and arrow keys.
     */
    get KEY_ID_SHORT () {
        return {
            SPACE: 'space',
            LEFT: 'left',
            UP: 'up',
            RIGHT: 'right',
            DOWN: 'down'
        };
    }

    /*
    * Localized short-form names of the space bar and arrow keys.
    */
    get KEY_TEXT_SHORT () {
        return {
            [this.KEY_ID_SHORT.SPACE]: formatMessage({
                id: 'makeymakey.spaceKeyShort',
                default: 'space',
                description: 'Short name for the space key on a computer keyboard.'
            }),
            [this.KEY_ID_SHORT.LEFT]: formatMessage({
                id: 'makeymakey.leftArrowShort',
                default: 'left',
                description: 'Short name for the left arrow key on a computer keyboard.'
            }),
            [this.KEY_ID_SHORT.UP]: formatMessage({
                id: 'makeymakey.upArrowShort',
                default: 'up',
                description: 'Short name for the up arrow key on a computer keyboard.'
            }),
            [this.KEY_ID_SHORT.RIGHT]: formatMessage({
                id: 'makeymakey.rightArrowShort',
                default: 'right',
                description: 'Short name for the right arrow key on a computer keyboard.'
            }),
            [this.KEY_ID_SHORT.DOWN]: formatMessage({
                id: 'makeymakey.downArrowShort',
                default: 'down',
                description: 'Short name for the down arrow key on a computer keyboard.'
            })
        };
    }

    /*
     * An array of strings of KEY_IDs representing the default set of
     * key sequences for use by the "when keys pressed in order" block.
     * @type {array}
     */
    get DEFAULT_SEQUENCES () {
        return [
            `${this.KEY_ID_SHORT.LEFT} ${this.KEY_ID_SHORT.UP} ${this.KEY_ID_SHORT.RIGHT}`,
            `${this.KEY_ID_SHORT.RIGHT} ${this.KEY_ID_SHORT.UP} ${this.KEY_ID_SHORT.LEFT}`,
            `${this.KEY_ID_SHORT.LEFT} ${this.KEY_ID_SHORT.RIGHT}`,
            `${this.KEY_ID_SHORT.RIGHT} ${this.KEY_ID_SHORT.LEFT}`,
            `${this.KEY_ID_SHORT.UP} ${this.KEY_ID_SHORT.DOWN}`,
            `${this.KEY_ID_SHORT.DOWN} ${this.KEY_ID_SHORT.UP}`,
            `${this.KEY_ID_SHORT.UP} ${this.KEY_ID_SHORT.RIGHT} ` +
                `${this.KEY_ID_SHORT.DOWN} ${this.KEY_ID_SHORT.LEFT}`,
            `${this.KEY_ID_SHORT.SPACE} ${this.KEY_ID_SHORT.SPACE} ${this.KEY_ID_SHORT.SPACE}`,
            `${this.KEY_ID_SHORT.UP} ${this.KEY_ID_SHORT.UP} ` +
                `${this.KEY_ID_SHORT.DOWN} ${this.KEY_ID_SHORT.DOWN} ` +
                `${this.KEY_ID_SHORT.LEFT} ${this.KEY_ID_SHORT.RIGHT} ` +
                `${this.KEY_ID_SHORT.LEFT} ${this.KEY_ID_SHORT.RIGHT}`
        ];
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'makeymakey',
            name: 'Makey Makey',
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'whenMakeyKeyPressed',
                    text: 'when [KEY] key pressed',
                    blockType: BlockType.HAT,
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            menu: 'KEY',
                            defaultValue: this.KEY_ID.SPACE
                        }
                    }
                },
                {
                    opcode: 'whenCodePressed',
                    text: 'when [SEQUENCE] pressed in order',
                    blockType: BlockType.HAT,
                    arguments: {
                        SEQUENCE: {
                            type: ArgumentType.STRING,
                            menu: 'SEQUENCE',
                            defaultValue: this.DEFAULT_SEQUENCES[0]
                        }
                    }
                }
            ],
            menus: {
                KEY: [
                    {
                        text: this.KEY_TEXT[this.KEY_ID.SPACE],
                        value: this.KEY_ID.SPACE
                    },
                    {
                        text: this.KEY_TEXT[this.KEY_ID.LEFT],
                        value: this.KEY_ID.LEFT
                    },
                    {
                        text: this.KEY_TEXT[this.KEY_ID.RIGHT],
                        value: this.KEY_ID.RIGHT
                    },
                    {
                        text: this.KEY_TEXT[this.KEY_ID.DOWN],
                        value: this.KEY_ID.DOWN
                    },
                    {
                        text: this.KEY_TEXT[this.KEY_ID.UP],
                        value: this.KEY_ID.UP
                    },
                    {text: 'w', value: 'w'},
                    {text: 'a', value: 'a'},
                    {text: 's', value: 's'},
                    {text: 'd', value: 'd'},
                    {text: 'f', value: 'f'},
                    {text: 'g', value: 'g'}
                ],
                SEQUENCE: this.buildSequenceMenu(this.DEFAULT_SEQUENCES)
            }
        };
    }

    /*
     * Build the menu of key sequences.
     * @param {array} sequencesArray an array of strings of KEY_IDs.
     * @returns {array} an array of objects with text and value properties.
     */
    buildSequenceMenu (sequencesArray) {
        return sequencesArray.map(
            str => this.getMenuItemForSequenceString(str)
        );
    }

    /*
     * Create a menu item for a sequence string.
     * @param {string} sequenceString a string of KEY_IDs.
     * @return {object} an object with text and value properties.
     */
    getMenuItemForSequenceString (sequenceString) {
        let sequenceArray = sequenceString.split(' ');
        sequenceArray = sequenceArray.map(str => this.KEY_TEXT_SHORT[str]);
        return {
            text: sequenceArray.join(' '),
            value: sequenceString
        };
    }

    /*
     * Check whether a keyboard key is currently pressed.
     * Also, toggle the results of the test on alternate frames, so that the
     * hat block fires repeatedly.
     * @param {object} args - the block arguments.
     * @property {number} KEY - a key code.
     * @param {object} util - utility object provided by the runtime.
     */
    whenMakeyKeyPressed (args, util) {
        const isDown = util.ioQuery('keyboard', 'getKeyIsDown', [args.KEY]);
        return (isDown && this.frameToggle);
    }

    /*
     * A function called on the KEY_PRESSED event, to update the key press
     * buffer and check if any of the key sequences have been completed.
     * @param {string} key A key code.
     */
    keyPressed (key) {
        this.keyPressBuffer.push(key);
        // Keep the buffer under the length limit
        if (this.keyPressBuffer.length > KEY_BUFFER_LENGTH) {
            this.keyPressBuffer.shift();
        }
        // Check the buffer for each sequence in use
        for (const str in this.sequences) {
            const arr = this.sequences[str].array;
            // Bail out if we don't have enough presses for this sequence
            if (this.keyPressBuffer.length < arr.length) {
                continue;
            }
            let missFlag = false;
            // Slice the buffer to the length of the sequence we're checking
            const bufferSegment = this.keyPressBuffer.slice(-1 * arr.length);
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] !== bufferSegment[i]) {
                    missFlag = true;
                }
            }
            // If the miss flag is false, the sequence matched the buffer
            if (!missFlag) {
                this.sequences[str].completed = true;
                // Clear the completed flag after a timeout. This is necessary because
                // the hat is edge-triggered (not event triggered). Multiple hats
                // may be checking the same sequence, so this timeout gives them enough
                // time to all trigger before resetting the flag.
                setTimeout(() => {
                    this.sequences[str].completed = false;
                }, SEQUENCE_HAT_TIMEOUT);
            }
        }
    }

    /*
     * Add a key sequence to the set currently being checked on each key press.
     * @param {string} sequenceString a string of space-separated KEY_IDs.
     * @param {array} sequenceArray an array of KEY_IDs.
     */
    addSequence (sequenceString, sequenceArray) {
        // If we already have this sequence string, return.
        if (this.sequences.hasOwnProperty(sequenceString)) {
            return;
        }
        // Convert shorthand versions of arrow key IDs.
        const newArray = sequenceArray.map(entry => {
            entry = entry.toUpperCase();
            if (this.KEY_ID_SHORT[entry]) {
                return this.KEY_ID[entry];
            }
            return entry;
        });
        const newSeq = {
            array: newArray,
            completed: false
        };
        this.sequences[sequenceString] = newSeq;
    }

    /*
     * Check whether a key sequence was recently completed.
     * @param {object} args The block arguments.
     * @property {number} SEQUENCE A string of KEY_IDs.
     */
    whenCodePressed (args) {
        const sequenceString = Cast.toString(args.SEQUENCE);
        const sequenceArray = sequenceString.split(' ');
        if (sequenceArray.length < 2) {
            return;
        }
        this.addSequence(sequenceString, sequenceArray);

        return this.sequences[sequenceString].completed;
    }
}
module.exports = Scratch3MakeyMakeyBlocks;
