var util = require('util');
var MathUtil = require('../util/math-util');
var Target = require('../engine/target');

/**
 * Clone (instance) of a sprite.
 * @param {!Sprite} sprite Reference to the sprite.
 * @param {Runtime} runtime Reference to the runtime.
 * @constructor
 */
function Clone(sprite, runtime) {
    Target.call(this, sprite.blocks);
    this.runtime = runtime;
    /**
     * Reference to the sprite that this is a clone of.
     * @type {!Sprite}
     */
    this.sprite = sprite;
    /**
     * Reference to the global renderer for this VM, if one exists.
     * @type {?RenderWebGLWorker}
     */
    this.renderer = null;
    if (this.runtime) {
        this.renderer = this.runtime.renderer;
    }
    /**
     * ID of the drawable for this clone returned by the renderer, if rendered.
     * @type {?Number}
     */
    this.drawableID = null;

    /**
     * Map of current graphic effect values.
     * @type {!Object.<string, number>}
     */
    this.effects = {
        'color': 0,
        'fisheye': 0,
        'whirl': 0,
        'pixelate': 0,
        'mosaic': 0,
        'brightness': 0,
        'ghost': 0
    };
}
util.inherits(Clone, Target);

/**
 * Create a clone's drawable with the this.renderer.
 */
Clone.prototype.initDrawable = function () {
    if (this.renderer) {
        this.drawableID = this.renderer.createDrawable();
    }
    // If we're a clone, start the hats.
    if (!this.isOriginal) {
        this.runtime.startHats(
            'control_start_as_clone', null, this
        );
    }
};

// Clone-level properties.
/**
 * Whether this represents an "original" clone, i.e., created by the editor
 * and not clone blocks. In interface terms, this true for a "sprite."
 * @type {boolean}
 */
Clone.prototype.isOriginal = true;

/**
 * Whether this clone represents the Scratch stage.
 * @type {boolean}
 */
Clone.prototype.isStage = false;

/**
 * Scratch X coordinate. Currently should range from -240 to 240.
 * @type {Number}
 */
Clone.prototype.x = 0;

/**
 * Scratch Y coordinate. Currently should range from -180 to 180.
 * @type {number}
 */
Clone.prototype.y = 0;

/**
 * Scratch direction. Currently should range from -179 to 180.
 * @type {number}
 */
Clone.prototype.direction = 90;

/**
 * Whether the clone is currently visible.
 * @type {boolean}
 */
Clone.prototype.visible = true;

/**
 * Size of clone as a percent of costume size. Ranges from 5% to 535%.
 * @type {number}
 */
Clone.prototype.size = 100;

/**
 * Currently selected costume index.
 * @type {number}
 */
Clone.prototype.currentCostume = 0;

/**
 * Rotation style for "all around"/spinning.
 * @enum
 */
Clone.ROTATION_STYLE_ALL_AROUND = 'all around';

/**
 * Rotation style for "left-right"/flipping.
 * @enum
 */
Clone.ROTATION_STYLE_LEFT_RIGHT = 'left-right';

/**
 * Rotation style for "no rotation."
 * @enum
 */
Clone.ROTATION_STYLE_NONE = 'don\'t rotate';

/**
 * Current rotation style.
 * @type {!string}
 */
Clone.prototype.rotationStyle = Clone.ROTATION_STYLE_ALL_AROUND;

// End clone-level properties.

/**
 * Set the X and Y coordinates of a clone.
 * @param {!number} x New X coordinate of clone, in Scratch coordinates.
 * @param {!number} y New Y coordinate of clone, in Scratch coordinates.
 */
Clone.prototype.setXY = function (x, y) {
    if (this.isStage) {
        return;
    }
    this.x = x;
    this.y = y;
    if (this.renderer) {
        this.renderer.updateDrawableProperties(this.drawableID, {
            position: [this.x, this.y]
        });
        if (this.visible) {
            this.runtime.requestRedraw();
        }
    }
};

/**
 * Get the rendered direction and scale, after applying rotation style.
 * @return {Object<string, number>} Direction and scale to render.
 */
Clone.prototype._getRenderedDirectionAndScale = function () {
    // Default: no changes to `this.direction` or `this.scale`.
    var finalDirection = this.direction;
    var finalScale = [this.size, this.size];
    if (this.rotationStyle == Clone.ROTATION_STYLE_NONE) {
        // Force rendered direction to be 90.
        finalDirection = 90;
    } else if (this.rotationStyle === Clone.ROTATION_STYLE_LEFT_RIGHT) {
        // Force rendered direction to be 90, and flip drawable if needed.
        finalDirection = 90;
        var scaleFlip = (this.direction < 0) ? -1 : 1;
        finalScale = [scaleFlip * this.size, this.size];
    }
    return {direction: finalDirection, scale: finalScale};
};

/**
 * Set the direction of a clone.
 * @param {!number} direction New direction of clone.
 */
Clone.prototype.setDirection = function (direction) {
    if (this.isStage) {
        return;
    }
    // Keep direction between -179 and +180.
    this.direction = MathUtil.wrapClamp(direction, -179, 180);
    if (this.renderer) {
        var renderedDirectionScale = this._getRenderedDirectionAndScale();
        this.renderer.updateDrawableProperties(this.drawableID, {
            direction: renderedDirectionScale.direction,
            scale: renderedDirectionScale.scale
        });
        if (this.visible) {
            this.runtime.requestRedraw();
        }
    }
};

/**
 * Set a say bubble on this clone.
 * @param {?string} type Type of say bubble: "say", "think", or null.
 * @param {?string} message Message to put in say bubble.
 */
Clone.prototype.setSay = function (type, message) {
    if (this.isStage) {
        return;
    }
    // @todo: Render to stage.
    if (!type || !message) {
        console.log('Clearing say bubble');
        return;
    }
    console.log('Setting say bubble:', type, message);
};

/**
 * Set visibility of the clone; i.e., whether it's shown or hidden.
 * @param {!boolean} visible True if the sprite should be shown.
 */
Clone.prototype.setVisible = function (visible) {
    if (this.isStage) {
        return;
    }
    this.visible = visible;
    if (this.renderer) {
        this.renderer.updateDrawableProperties(this.drawableID, {
            visible: this.visible
        });
        if (this.visible) {
            this.runtime.requestRedraw();
        }
    }
};

/**
 * Set size of the clone, as a percentage of the costume size.
 * @param {!number} size Size of clone, from 5 to 535.
 */
Clone.prototype.setSize = function (size) {
    if (this.isStage) {
        return;
    }
    // Keep size between 5% and 535%.
    this.size = MathUtil.clamp(size, 5, 535);
    if (this.renderer) {
        var renderedDirectionScale = this._getRenderedDirectionAndScale();
        this.renderer.updateDrawableProperties(this.drawableID, {
            direction: renderedDirectionScale.direction,
            scale: renderedDirectionScale.scale
        });
        if (this.visible) {
            this.runtime.requestRedraw();
        }
    }
};

/**
 * Set a particular graphic effect on this clone.
 * @param {!string} effectName Name of effect (see `Clone.prototype.effects`).
 * @param {!number} value Numerical magnitude of effect.
 */
Clone.prototype.setEffect = function (effectName, value) {
    if (!this.effects.hasOwnProperty(effectName)) return;
    this.effects[effectName] = value;
    if (this.renderer) {
        var props = {};
        props[effectName] = this.effects[effectName];
        this.renderer.updateDrawableProperties(this.drawableID, props);
        if (this.visible) {
            this.runtime.requestRedraw();
        }
    }
};

/**
 * Clear all graphic effects on this clone.
 */
Clone.prototype.clearEffects = function () {
    for (var effectName in this.effects) {
        this.effects[effectName] = 0;
    }
    if (this.renderer) {
        this.renderer.updateDrawableProperties(this.drawableID, this.effects);
        if (this.visible) {
            this.runtime.requestRedraw();
        }
    }
};

/**
 * Set the current costume of this clone.
 * @param {number} index New index of costume.
 */
Clone.prototype.setCostume = function (index) {
    // Keep the costume index within possible values.
    index = Math.round(index);
    this.currentCostume = MathUtil.wrapClamp(
        index, 0, this.sprite.costumes.length - 1
    );
    if (this.renderer) {
        var costume = this.sprite.costumes[this.currentCostume];
        this.renderer.updateDrawableProperties(this.drawableID, {
            skin: costume.skin,
            costumeResolution: costume.bitmapResolution,
            rotationCenter: [
                costume.rotationCenterX / costume.bitmapResolution,
                costume.rotationCenterY / costume.bitmapResolution
            ]
        });
        if (this.visible) {
            this.runtime.requestRedraw();
        }
    }
};

/**
 * Update the rotation style for this clone.
 * @param {!string} rotationStyle New rotation style.
 */
Clone.prototype.setRotationStyle = function (rotationStyle) {
    if (rotationStyle == Clone.ROTATION_STYLE_NONE) {
        this.rotationStyle = Clone.ROTATION_STYLE_NONE;
    } else if (rotationStyle == Clone.ROTATION_STYLE_ALL_AROUND) {
        this.rotationStyle = Clone.ROTATION_STYLE_ALL_AROUND;
    } else if (rotationStyle == Clone.ROTATION_STYLE_LEFT_RIGHT) {
        this.rotationStyle = Clone.ROTATION_STYLE_LEFT_RIGHT;
    }
    if (this.renderer) {
        var renderedDirectionScale = this._getRenderedDirectionAndScale();
        this.renderer.updateDrawableProperties(this.drawableID, {
            direction: renderedDirectionScale.direction,
            scale: renderedDirectionScale.scale
        });
        if (this.visible) {
            this.runtime.requestRedraw();
        }
    }
};

/**
 * Get a costume index of this clone, by name of the costume.
 * @param {?string} costumeName Name of a costume.
 * @return {number} Index of the named costume, or -1 if not present.
 */
Clone.prototype.getCostumeIndexByName = function (costumeName) {
    for (var i = 0; i < this.sprite.costumes.length; i++) {
        if (this.sprite.costumes[i].name == costumeName) {
            return i;
        }
    }
    return -1;
};

/**
 * Update all drawable properties for this clone.
 * Use when a batch has changed, e.g., when the drawable is first created.
 */
Clone.prototype.updateAllDrawableProperties = function () {
    if (this.renderer) {
        var renderedDirectionScale = this._getRenderedDirectionAndScale();
        var costume = this.sprite.costumes[this.currentCostume];
        this.renderer.updateDrawableProperties(this.drawableID, {
            position: [this.x, this.y],
            direction: renderedDirectionScale.direction,
            scale: renderedDirectionScale.scale,
            visible: this.visible,
            skin: costume.skin,
            costumeResolution: costume.bitmapResolution,
            rotationCenter: [
                costume.rotationCenterX / costume.bitmapResolution,
                costume.rotationCenterY / costume.bitmapResolution
            ]
        });
        if (this.visible) {
            this.runtime.requestRedraw();
        }
    }
};

/**
 * Return the human-readable name for this clone, i.e., the sprite's name.
 * @override
 * @returns {string} Human-readable name for the clone.
 */
Clone.prototype.getName = function () {
    return this.sprite.name;
};

/**
 * Return the clone's tight bounding box.
 * Includes top, left, bottom, right attributes in Scratch coordinates.
 * @return {?Object} Tight bounding box of clone, or null.
 */
Clone.prototype.getBounds = function () {
    if (this.renderer) {
        return this.runtime.renderer.getBounds(this.drawableID);
    }
    return null;
};

/**
 * Return whether the clone is touching a point.
 * @param {number} x X coordinate of test point.
 * @param {number} y Y coordinate of test point.
 * @return {Boolean} True iff the clone is touching the point.
 */
Clone.prototype.isTouchingPoint = function (x, y) {
    if (this.renderer) {
        // @todo: Update once pick is in Scratch coordinates.
        // Limits test to this Drawable, so this will return true
        // even if the clone is obscured by another Drawable.
        var pickResult = this.runtime.renderer.pick(
            x + this.runtime.constructor.STAGE_WIDTH / 2,
            -y + this.runtime.constructor.STAGE_HEIGHT / 2,
            null, null,
            [this.drawableID]
        );
        return pickResult === this.drawableID;
    }
    return false;
};

/**
 * Return whether the clone is touching a stage edge.
 * @return {Boolean} True iff the clone is touching the stage edge.
 */
Clone.prototype.isTouchingEdge = function () {
    if (this.renderer) {
        var stageWidth = this.runtime.constructor.STAGE_WIDTH;
        var stageHeight = this.runtime.constructor.STAGE_HEIGHT;
        var bounds = this.getBounds();
        if (bounds.left < -stageWidth / 2 ||
            bounds.right > stageWidth / 2 ||
            bounds.top > stageHeight / 2 ||
            bounds.bottom < -stageHeight / 2) {
            return true;
        }
    }
    return false;
};

/**
 * Return whether the clone is touching a named sprite.
 * @param {string} spriteName Name fo the sprite.
 * @return {Boolean} True iff the clone is touching a clone of the sprite.
 */
Clone.prototype.isTouchingSprite = function (spriteName) {
    var firstClone = this.runtime.getSpriteTargetByName(spriteName);
    if (!firstClone || !this.renderer) {
        return false;
    }
    var drawableCandidates = firstClone.sprite.clones.map(function(clone) {
        return clone.drawableID;
    });
    return this.renderer.isTouchingDrawables(
        this.drawableID, drawableCandidates);
};

/**
 * Return whether the clone is touching a color.
 * @param {Array.<number>} rgb [r,g,b], values between 0-255.
 * @return {Promise.<Boolean>} True iff the clone is touching the color.
 */
Clone.prototype.isTouchingColor = function (rgb) {
    if (this.renderer) {
        return this.renderer.isTouchingColor(this.drawableID, rgb);
    }
    return false;
};

/**
 * Return whether the clone's color is touching a color.
 * @param {Object} targetRgb {Array.<number>} [r,g,b], values between 0-255.
 * @param {Object} maskRgb {Array.<number>} [r,g,b], values between 0-255.
 * @return {Promise.<Boolean>} True iff the clone's color is touching the color.
 */
Clone.prototype.colorIsTouchingColor = function (targetRgb, maskRgb) {
    if (this.renderer) {
        return this.renderer.isTouchingColor(
            this.drawableID,
            targetRgb,
            maskRgb
        );
    }
    return false;
};

/**
 * Move clone to the front layer.
 */
Clone.prototype.goToFront = function () {
    if (this.renderer) {
        this.renderer.setDrawableOrder(this.drawableID, Infinity);
    }
};

/**
 * Move clone back a number of layers.
 * @param {number} nLayers How many layers to go back.
 */
Clone.prototype.goBackLayers = function (nLayers) {
    if (this.renderer) {
        this.renderer.setDrawableOrder(this.drawableID, -nLayers, true, 1);
    }
};

/**
 * Keep a desired position within a fence.
 * @param {number} newX New desired X position.
 * @param {number} newY New desired Y position.
 * @param {Object=} opt_fence Optional fence with left, right, top bottom.
 * @return {Array.<number>} Fenced X and Y coordinates.
 */
Clone.prototype.keepInFence = function (newX, newY, opt_fence) {
    var fence = opt_fence;
    if (!fence) {
        fence = {
            left: -this.runtime.constructor.STAGE_WIDTH / 2,
            right: this.runtime.constructor.STAGE_WIDTH / 2,
            top: this.runtime.constructor.STAGE_HEIGHT / 2,
            bottom: -this.runtime.constructor.STAGE_HEIGHT / 2
        };
    }
    var bounds = this.getBounds();
    if (!bounds) return;
    // Adjust the known bounds to the target position.
    bounds.left += (newX - this.x);
    bounds.right += (newX - this.x);
    bounds.top += (newY - this.y);
    bounds.bottom += (newY - this.y);
    // Find how far we need to move the target position.
    var dx = 0;
    var dy = 0;
    if (bounds.left < fence.left) {
        dx += fence.left - bounds.left;
    }
    if (bounds.right > fence.right) {
        dx += fence.right - bounds.right;
    }
    if (bounds.top > fence.top) {
        dy += fence.top - bounds.top;
    }
    if (bounds.bottom < fence.bottom) {
        dy += fence.bottom - bounds.bottom;
    }
    return [newX + dx, newY + dy];
};

/**
 * Make a clone of this clone, copying any run-time properties.
 * If we've hit the global clone limit, returns null.
 * @return {!Clone} New clone object.
 */
Clone.prototype.makeClone = function () {
    if (!this.runtime.clonesAvailable()) {
        return; // Hit max clone limit.
    }
    this.runtime.changeCloneCounter(1);
    var newClone = this.sprite.createClone();
    newClone.x = this.x;
    newClone.y = this.y;
    newClone.direction = this.direction;
    newClone.visible = this.visible;
    newClone.size = this.size;
    newClone.currentCostume = this.currentCostume;
    newClone.rotationStyle = this.rotationStyle;
    newClone.effects = JSON.parse(JSON.stringify(this.effects));
    newClone.variables = JSON.parse(JSON.stringify(this.variables));
    newClone.lists = JSON.parse(JSON.stringify(this.lists));
    newClone.initDrawable();
    newClone.updateAllDrawableProperties();
    return newClone;
};

/**
 * Called when the project receives a "green flag."
 * For a clone, this clears graphic effects.
 */
Clone.prototype.onGreenFlag = function () {
    this.clearEffects();
};

/**
 * Dispose of this clone, destroying any run-time properties.
 */
Clone.prototype.dispose = function () {
    this.runtime.changeCloneCounter(-1);
    if (this.renderer && this.drawableID !== null) {
        this.renderer.destroyDrawable(this.drawableID);
        if (this.visible) {
            this.runtime.requestRedraw();
        }
    }
};

module.exports = Clone;
