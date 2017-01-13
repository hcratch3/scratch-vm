var EventEmitter = require('events');
var util = require('util');
var Blocks = require('./engine/blocks');
var Sprite = require('./sprites/sprite');
var Runtime = require('./engine/runtime');
var sb2import = require('./import/sb2import');

/**
 * Handles connections between blocks, stage, and extensions.
 * @constructor
 */
var VirtualMachine = function () {
    var instance = this;
    // Bind event emitter and runtime to VM instance
    EventEmitter.call(instance);
    /**
     * VM runtime, to store blocks, I/O devices, sprites/targets, etc.
     * @type {!Runtime}
     */
    instance.runtime = new Runtime();
    /**
     * The "currently editing"/selected target ID for the VM.
     * Block events from any Blockly workspace are routed to this target.
     * @type {!string}
     */
    instance.editingTarget = null;
    // Runtime emits are passed along as VM emits.
    instance.runtime.on(Runtime.SCRIPT_GLOW_ON, function (glowData) {
        instance.emit(Runtime.SCRIPT_GLOW_ON, glowData);
    });
    instance.runtime.on(Runtime.SCRIPT_GLOW_OFF, function (glowData) {
        instance.emit(Runtime.SCRIPT_GLOW_OFF, glowData);
    });
    instance.runtime.on(Runtime.BLOCK_GLOW_ON, function (glowData) {
        instance.emit(Runtime.BLOCK_GLOW_ON, glowData);
    });
    instance.runtime.on(Runtime.BLOCK_GLOW_OFF, function (glowData) {
        instance.emit(Runtime.BLOCK_GLOW_OFF, glowData);
    });
    instance.runtime.on(Runtime.PROJECT_RUN_START, function () {
        instance.emit(Runtime.PROJECT_RUN_START);
    });
    instance.runtime.on(Runtime.PROJECT_RUN_STOP, function () {
        instance.emit(Runtime.PROJECT_RUN_STOP);
    });
    instance.runtime.on(Runtime.VISUAL_REPORT, function (visualReport) {
        instance.emit(Runtime.VISUAL_REPORT, visualReport);
    });
    instance.runtime.on(Runtime.SPRITE_INFO_REPORT, function (spriteInfo) {
        instance.emit(Runtime.SPRITE_INFO_REPORT, spriteInfo);
    });

    this.blockListener = this.blockListener.bind(this);
    this.flyoutBlockListener = this.flyoutBlockListener.bind(this);
};

/**
 * Inherit from EventEmitter
 */
util.inherits(VirtualMachine, EventEmitter);

/**
 * Start running the VM - do this before anything else.
 */
VirtualMachine.prototype.start = function () {
    this.runtime.start();
};

/**
 * "Green flag" handler - start all threads starting with a green flag.
 */
VirtualMachine.prototype.greenFlag = function () {
    this.runtime.greenFlag();
};

/**
 * Set whether the VM is in "turbo mode."
 * When true, loops don't yield to redraw.
 * @param {Boolean} turboModeOn Whether turbo mode should be set.
 */
VirtualMachine.prototype.setTurboMode = function (turboModeOn) {
    this.runtime.turboMode = !!turboModeOn;
};

/**
 * Set whether the VM is in 2.0 "compatibility mode."
 * When true, ticks go at 2.0 speed (30 TPS).
 * @param {Boolean} compatibilityModeOn Whether compatibility mode is set.
 */
VirtualMachine.prototype.setCompatibilityMode = function (compatibilityModeOn) {
    this.runtime.setCompatibilityMode(!!compatibilityModeOn);
};

/**
 * Stop all threads and running activities.
 */
VirtualMachine.prototype.stopAll = function () {
    this.runtime.stopAll();
};

/**
 * Clear out current running project data.
 */
VirtualMachine.prototype.clear = function () {
    this.runtime.dispose();
    this.editingTarget = null;
    this.emitTargetsUpdate();
};

/**
 * Get data for playground. Data comes back in an emitted event.
 */
VirtualMachine.prototype.getPlaygroundData = function () {
    var instance = this;
    // Only send back thread data for the current editingTarget.
    var threadData = this.runtime.threads.filter(function (thread) {
        return thread.target === instance.editingTarget;
    });
    // Remove the target key, since it's a circular reference.
    var filteredThreadData = JSON.stringify(threadData, function (key, value) {
        if (key === 'target') return;
        return value;
    }, 2);
    this.emit('playgroundData', {
        blocks: this.editingTarget.blocks,
        threads: filteredThreadData
    });
};

/**
 * Post I/O data to the virtual devices.
 * @param {?string} device Name of virtual I/O device.
 * @param {Object} data Any data object to post to the I/O device.
 */
VirtualMachine.prototype.postIOData = function (device, data) {
    if (this.runtime.ioDevices[device]) {
        this.runtime.ioDevices[device].postData(data);
    }
};

/**
 * Load a project from a Scratch 2.0 JSON representation.
 * @param {?string} json JSON string representing the project.
 */
VirtualMachine.prototype.loadProject = function (json) {
    this.clear();
    // @todo: Handle other formats, e.g., Scratch 1.4, Scratch 3.0.
    sb2import(json, this.runtime);
    // Select the first target for editing, e.g., the first sprite.
    this.editingTarget = this.runtime.targets[1];
    // Update the VM user's knowledge of targets and blocks on the workspace.
    this.emitTargetsUpdate();
    this.emitWorkspaceUpdate();
    this.runtime.setEditingTarget(this.editingTarget);
};

VirtualMachine.prototype.toPrettyJSON = function (testing) {
    this.runtime.targets.testing = testing;
    var json = JSON.stringify(this.toJSON(), null, 4);
    this.runtime.targets.testing = false;
    if (testing == true) {
        console.log('Exported To JSON');
    }
    return json;
};

VirtualMachine.prototype.toJSON = function () {
    if (this.runtime.targets.hasOwnProperty('testing') == false) {
        this.runtime.targets.testing = false;
    }
    var obj = new Object();
    obj.sprites = this.runtime.targets;
    obj.meta = new Object();
    obj.meta.name = 'WIP';
    obj.meta.useragent = navigator.userAgent;
    return obj;
};

VirtualMachine.prototype.fromJSON = function (json, testing) {
    this.clear();
    if (testing == true) {
        console.log('Importing JSON');
    }
    var obj = JSON.parse(json);
    var i = 0;
    for (; i < obj.sprites.length; i++) {
        var blocks = new Blocks();
        var z = null;
        for (z in obj.sprites[i].sprite.blocks) {
            blocks[z] = obj.sprites[i].sprite.blocks[z];
            if (testing == true) {
                console.log('Importing ' + z + ' to Blocks');
            }
        }
        var sprite = new Sprite(blocks, this.runtime);
        var y = null;
        for (y in obj.sprites[i].sprite) {
            if (y === 'blocks') {
                continue;
            }
            sprite[y] = obj.sprites[i].sprite[y];
            if (testing == true) {
                console.log('Importing ' + y + ' to Sprite');
            }
        }
        var target = sprite.createClone();
        this.runtime.targets.push(target);
        var x = null;
        for (x in obj.sprites[i]) {
            if (x === 'sprite') {
                continue;
            }
            target[x] = obj.sprites[i][x];
            console.log('Importing ' + x + ' to Rendered Target');
        }
        target.updateAllDrawablePropertie();
    }
    this.editingTarget = this.runtime.targets[0];
    // Update the VM user's knowledge of targets and blocks on the workspace.
    this.emitTargetsUpdate();
    this.emitWorkspaceUpdate();
    this.runtime.setEditingTarget(this.editingTarget);
    if (testing == true) {
        console.log('Imported from JSON');
    }
};

VirtualMachine.prototype.testJSON = function (debug) {
    if (debug == true) {
        console.log('Exporting to JSON...');
    }
    var json = this.toPrettyJSON(debug);
    if (debug == true) {
        console.log('Importing from JSON...');
    }
    this.fromJSON(json, debug);
    if (debug == true) {
        console.log('Exporting to JSON...');
    }
    var json2 = this.toPrettyJSON(debug);
    if (json == json2) {
        if (debug == true) {
            console.log('JSON Test: Successful');
        }
    } else {
        if (debug == true) {
            console.log('JSON Test: Failed: JSON Not Equivalent');
            console.log('JSON 1:');
            console.log(json);
            console.log('JSON 2:');
            console.log(json2);
        }
    }
    this.editingTarget = this.runtime.targets[0];
    this.emitTargetsUpdate();
    this.emitWorkspaceUpdate();
    this.runtime.setEditingTarget(this.editingTarget);
    return json == json2;
};

/**
 * Add a single sprite from the "Sprite2" (i.e., SB2 sprite) format.
 * @param {?string} json JSON string representing the sprite.
 */
VirtualMachine.prototype.addSprite2 = function (json) {
    // Select new sprite.
    this.editingTarget = sb2import(json, this.runtime, true);
    // Update the VM user's knowledge of targets and blocks on the workspace.
    this.emitTargetsUpdate();
    this.emitWorkspaceUpdate();
    this.runtime.setEditingTarget(this.editingTarget);
};

/**
 * Add a costume to the current editing target.
 * @param {!Object} costumeObject Object representing the costume.
 */
VirtualMachine.prototype.addCostume = function (costumeObject) {
    this.editingTarget.sprite.costumes.push(costumeObject);
    // Switch to the costume.
    this.editingTarget.setCostume(
        this.editingTarget.sprite.costumes.length - 1
    );
};

/**
 * Add a backdrop to the stage.
 * @param {!Object} backdropObject Object representing the backdrop.
 */
VirtualMachine.prototype.addBackdrop = function (backdropObject) {
    var stage = this.runtime.getTargetForStage();
    stage.sprite.costumes.push(backdropObject);
    // Switch to the backdrop.
    stage.setCostume(stage.sprite.costumes.length - 1);
};

/**
 * Rename a sprite.
 * @param {string} targetId ID of a target whose sprite to rename.
 * @param {string} newName New name of the sprite.
 */
VirtualMachine.prototype.renameSprite = function (targetId, newName) {
    var target = this.runtime.getTargetById(targetId);
    if (target) {
        if (!target.isSprite()) {
            throw new Error('Cannot rename non-sprite targets.');
        }
        var sprite = target.sprite;
        if (!sprite) {
            throw new Error('No sprite associated with this target.');
        }
        sprite.name = newName;
        this.emitTargetsUpdate();
    } else {
        throw new Error('No target with the provided id.');
    }
};

/**
 * Delete a sprite and all its clones.
 * @param {string} targetId ID of a target whose sprite to delete.
 */
VirtualMachine.prototype.deleteSprite = function (targetId) {
    var target = this.runtime.getTargetById(targetId);
    if (target) {
        if (!target.isSprite()) {
            throw new Error('Cannot delete non-sprite targets.');
        }
        var sprite = target.sprite;
        if (!sprite) {
            throw new Error('No sprite associated with this target.');
        }
        var currentEditingTarget = this.editingTarget;
        for (var i = 0; i < sprite.clones.length; i++) {
            var clone = sprite.clones[i];
            this.runtime.stopForTarget(sprite.clones[i]);
            this.runtime.disposeTarget(sprite.clones[i]);
            // Ensure editing target is switched if we are deleting it.
            if (clone === currentEditingTarget) {
                this.setEditingTarget(this.runtime.targets[0].id);
            }
        }
        // Sprite object should be deleted by GC.
        this.emitTargetsUpdate();
    } else {
        throw new Error('No target with the provided id.');
    }
};

/**
 * Set the renderer for the VM/runtime
 * @param {!RenderWebGL} renderer The renderer to attach
 */
VirtualMachine.prototype.attachRenderer = function (renderer) {
    this.runtime.attachRenderer(renderer);
};

/**
 * Set the audio engine for the VM/runtime
 * @param {!AudioEngine} audioEngine The audio engine to attach
 */
VirtualMachine.prototype.attachAudioEngine = function (audioEngine) {
    this.runtime.attachAudioEngine(audioEngine);
};

/**
 * Handle a Blockly event for the current editing target.
 * @param {!Blockly.Event} e Any Blockly event.
 */
VirtualMachine.prototype.blockListener = function (e) {
    if (this.editingTarget) {
        this.editingTarget.blocks.blocklyListen(e, this.runtime);
    }
};

/**
 * Handle a Blockly event for the flyout.
 * @param {!Blockly.Event} e Any Blockly event.
 */
VirtualMachine.prototype.flyoutBlockListener = function (e) {
    this.runtime.flyoutBlocks.blocklyListen(e, this.runtime);
};

/**
 * Set an editing target. An editor UI can use this function to switch
 * between editing different targets, sprites, etc.
 * After switching the editing target, the VM may emit updates
 * to the list of targets and any attached workspace blocks
 * (see `emitTargetsUpdate` and `emitWorkspaceUpdate`).
 * @param {string} targetId Id of target to set as editing.
 */
VirtualMachine.prototype.setEditingTarget = function (targetId) {
    // Has the target id changed? If not, exit.
    if (targetId === this.editingTarget.id) {
        return;
    }
    var target = this.runtime.getTargetById(targetId);
    if (target) {
        this.editingTarget = target;
        // Emit appropriate UI updates.
        this.emitTargetsUpdate();
        this.emitWorkspaceUpdate();
        this.runtime.setEditingTarget(target);
    }
};

/**
 * Emit metadata about available targets.
 * An editor UI could use this to display a list of targets and show
 * the currently editing one.
 */
VirtualMachine.prototype.emitTargetsUpdate = function () {
    this.emit('targetsUpdate', {
        // [[target id, human readable target name], ...].
        targetList: this.runtime.targets.filter(function (target) {
            // Don't report clones.
            return !target.hasOwnProperty('isOriginal') || target.isOriginal;
        }).map(function (target) {
            return target.toJSON();
        }),
        // Currently editing target id.
        editingTarget: this.editingTarget ? this.editingTarget.id : null
    });
};

/**
 * Emit an Blockly/scratch-blocks compatible XML representation
 * of the current editing target's blocks.
 */
VirtualMachine.prototype.emitWorkspaceUpdate = function () {
    this.emit('workspaceUpdate', {
        xml: this.editingTarget.blocks.toXML()
    });
};

/**
 * Post/edit sprite info for the current editing target.
 * @param {object} data An object with sprite info data to set.
 */
VirtualMachine.prototype.postSpriteInfo = function (data) {
    this.editingTarget.postSpriteInfo(data);
};

module.exports = VirtualMachine;
