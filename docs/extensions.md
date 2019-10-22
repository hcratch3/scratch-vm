# Scratch 3.0 Extensions

This document describes technical topics related to Scratch 3.0 extension development, including the Scratch 3.0
extension specification.

For documentation regarding other aspects of Scratch 3.0 extensions see [this Extensions page on the
wiki](https://github.com/LLK/docs/wiki/Extensions).

## Types of Extensions

There are four types of extensions that can define everything from the Scratch's core library (such as the "Looks" and
"Operators" categories) to unofficial extensions that can be loaded from a remote URL.

**Scratch 3.0 does not yet support unofficial extensions.**

For more details, see [this Extensions page on the wiki](https://github.com/LLK/docs/wiki/Extensions).

|                                | Core | Team | Official | Unofficial |
| ------------------------------ | ---- | ---- | -------- | ---------- |
| Developed by Scratch Team      | √    | √    | O        | X          |
| Maintained by Scratch Team     | √    | √    | O        | X          |
| Shown in Library               | X    | √    | √        | X          |
| Sandboxed                      | X    | X    | √        | √          |
| Can save projects to community | √    | √    | √        | X          |

## JavaScript Environment

Most Scratch 3.0 is written using JavaScript features not yet commonly supported by browsers. For compatibility we
transpile the code to ES5 before publishing or deploying. Any extension included in the `scratch-vm` repository may
use ES6+ features and may use `require` to reference other code within the `scratch-vm` repository.

Unofficial extensions must be self-contained. Authors of unofficial extensions are responsible for ensuring browser
compatibility for those extensions, including transpiling if necessary.

## Translation

Scratch extensions use the [ICU message format](http://userguide.icu-project.org/formatparse/messages) to handle
translation across languages. For **core, team, and official** extensions, the function `formatMessage` is used to
wrap any ICU messages that need to be exported to the [Scratch Transifex group](https://www.transifex.com/llk/public/)
for translation.

**All extensions** may additionally define a `translation_map` object within the `getInfo` function which can provide
translations within an extension itself. The "Annotated Example" below provides a more complete illustration of how
translation within an extension can be managed. **WARNING:** the `translation_map` feature is currently in the
proposal phase and may change before implementation.

## Backwards Compatibility

Scratch is designed to be fully backwards compatible. Because of this, block definitions and opcodes should *never*
change in a way that could cause previously saved projects to fail to load or to act in unexpected / inconsistent
ways.

## Defining an Extension

Scratch extensions are defined as a single Javascript class which accepts either a reference to the Scratch
[VM](https://github.com/llk/scratch-vm) runtime or a "runtime proxy" which handles communication with the Scratch VM
across a well defined worker boundary (i.e. the sandbox).

```js
class SomeBlocks {
    constructor (runtime) {
        /**
         * Store this for later communication with the Scratch VM runtime.
         * If this extension is running in a sandbox then `runtime` is an async proxy object.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    // ...
}
```

All extensions must define a function called `getInfo` which returns an object that contains the information needed to
render both the blocks and the extension itself.

```js
// Core, Team, and Official extensions can `require` VM code:
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');

class SomeBlocks {
    // ...
    getInfo () {
        return {
            id: 'someBlocks',
            name: 'Some Blocks',
            blocks: [
                {
                    opcode: 'myReporter',
                    blockType: BlockType.REPORTER,
                    text: 'letter [LETTER_NUM] of [TEXT]',
                    arguments: {
                        LETTER_NUM: {
                            type: ArgumentType.STRING,
                            defaultValue: '1'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'text'
                        }
                    }
                }
            ]
        };
    }
    // ...
}
```

Finally the extension must define a function for any "opcode" defined in the blocks. For example:

```js
class SomeBlocks {
    // ...
    myReporter (args) {
        return args.TEXT.charAt(args.LETTER_NUM);
    };
    // ...
}
```

### Defining a Menu

To display a drop-down menu for a block argument, specify the `menu` property of that argument and a matching item in
the `menus` section of your extension's definition:

```js
return {
    // ...
    blocks: [
        {
            // ...
            arguments: {
                FOO: {
                    type: ArgumentType.NUMBER,
                    menu: 'fooMenu'
                }
            }
        }
    ],
    menus: {
        fooMenu: {
            items: ['a', 'b', 'c']
        }
    }
}
```

The items in a menu may be specified with an array or with the name of a function which returns an array. The two
simplest forms for menu definitions are:

```js
getInfo () {
    return {
        menus: {
            staticMenu: ['static 1', 'static 2', 'static 3'],
            dynamicMenu: 'getDynamicMenuItems'
        }
    };
}
// this member function will be called each time the menu opens
getDynamicMenuItems () {
    return ['dynamic 1', 'dynamic 2', 'dynamic 3'];
}
```

The examples above are shorthand for these equivalent definitions:

```js
getInfo () {
    return {
        menus: {
            staticMenu: {
                items: ['static 1', 'static 2', 'static 3']
            },
            dynamicMenu: {
                items: 'getDynamicMenuItems'
            }
        }
    };
}
// this member function will be called each time the menu opens
getDynamicMenuItems () {
    return ['dynamic 1', 'dynamic 2', 'dynamic 3'];
}
```

If a menu item needs a label that doesn't match its value -- for example, if the label needs to be displayed in the
user's language but the value needs to stay constant -- the menu item may be an object instead of a string. This works
for both static and dynamic menu items:

```js
menus: {
    staticMenu: [
        {
            text: formatMessage(/* ... */),
            value: 42
        }
    ]
}
```

#### Accepting reporters ("droppable" menus)

By default it is not possible to specify the value of a dropdown menu by inserting a reporter block. While we
encourage extension authors to make their menus accept reporters when possible, doing so requires careful
consideration to avoid confusion and frustration on the part of those using the extension.

A few of these considerations include:

* The valid values for the menu should not change when the user changes the Scratch language setting.
  * In particular, changing languages should never break a working project.
* The average Scratch user should be able to figure out the valid values for this input without referring to extension
  documentation.
  * One way to ensure this is to make an item's text match or include the item's value. For example, the official Music
    extension contains menu items with names like "(1) Piano" with value 1, "(8) Cello" with value 8, and so on.
* The block should accept any value as input, even "invalid" values.
  * Scratch has no concept of a runtime error!
  * For a command block, sometimes the best option is to do nothing.
  * For a reporter, returning zero or the empty string might make sense.
* The block should be forgiving in its interpretation of inputs.
  * For example, if the block expects a string and receives a number it may make sense to interpret the number as a
    string instead of treating it as invalid input.

The `acceptReporters` flag indicates that the user can drop a reporter onto the menu input:

```js
menus: {
    staticMenu: {
        acceptReporters: true,
        items: [/*...*/]
    },
    dynamicMenu: {
        acceptReporters: true,
        items: 'getDynamicMenuItems'
    }
}
```

### Custom serialization

Sometimes Scratch needs to serialize some or all of the blocks in a project, such as when saving the project or
copying blocks into the backpack. In some cases the default method of serialization may not be appropriate for a block
defined by an extension; in these cases the extension may choose to override the default behavior.

For custom serialization, an extension may add a `serialization` property to the object returned by `getInfo()`. The
`serialization` property should contain a property for each block opcode which requires custom serialization, and the
value of the property should be an object which specifies a function name for `serialize` and `deserialize` functions.
If multiple blocks need custom serialization or deserialization they may share functions but are not required to do so.

The `serialize` function should take a block as a parameter and return JSON -- see `serializePrimitiveBlock` from the
`scratch-vm` source code as an example. The `deserialize` function should reverse the operation. Note that the
default deserialization code must be able to recognize the extension ID and block opcode from the output of the
`serialize` function in order to call the extension's custom `deserialize` function.

**WARNING**: the serialization format may change without warning to extension authors. Please use custom serialization
only when absolutely necessary, and only within "core" extensions.

For example:

```js
class SomeBlocks {
    // ...
    serializeSpecialBlock (block) {
        return [/* ... */];
    }
    deserializeSpecialBlock (serializedBlock) {
        return {
            opcode: 'specialBlock',
            // ...
        };
    }
    getInfo () {
        return {
            // ...
            blocks: [
                {
                    opcode: 'mySpecialBlock',
                    arguments: {/* ... */}
                },
                // ...
            ],
            serialization: {
                mySpecialBlock: {
                    serialize:'serializeSpecialBlock',
                    deserialize:'deserializeSpecialBlock'
                },
            }
            // ...
        };
    }
}
```

## Annotated Example

```js
// Core, Team, and Official extensions can `require` VM code:
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const TargetType = require('../../extension-support/target-type');

// ...or VM dependencies:
const formatMessage = require('format-message');

// Core, Team, and Official extension classes should be registered statically with the Extension Manager.
// See: scratch-vm/src/extension-support/extension-manager.js
class SomeBlocks {
    constructor (runtime) {
        /**
         * Store this for later communication with the Scratch VM runtime.
         * If this extension is running in a sandbox then `runtime` is an async proxy object.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    /**
     * @return {object} This extension's metadata.
     */
    getInfo () {
        return {
            // Required: the machine-readable name of this extension.
            // Will be used as the extension's namespace.
            id: 'someBlocks',

            // Core extensions only: override the default extension block colors.
            color1: '#FF8C1A',
            color2: '#DB6E00',

            // Optional: the human-readable name of this extension as string.
            // This and any other string to be displayed in the Scratch UI may either be
            // a string or a call to `formatMessage`; a plain string will not be
            // translated whereas a call to `formatMessage` will connect the string
            // to the translation map (see below). The `formatMessage` call is
            // similar to `formatMessage` from `react-intl` in form, but will actually
            // call some extension support code to do its magic. For example, we will
            // internally namespace the messages such that two extensions could have
            // messages with the same ID without colliding.
            // See also: https://github.com/yahoo/react-intl/wiki/API#formatmessage
            name: formatMessage({
                id: 'extensionName',
                defaultMessage: 'Some Blocks',
                description: 'The name of the "Some Blocks" extension'
            }),

            // Optional: URI for a block icon, to display at the edge of each block for this
            // extension. Data URI OK.
            // TODO: what file types are OK? All web images? Just PNG?
            blockIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',

            // Optional: URI for an icon to be displayed in the blocks category menu.
            // If not present, the menu will display the block icon, if one is present.
            // Otherwise, the category menu shows its default filled circle.
            // Data URI OK.
            // TODO: what file types are OK? All web images? Just PNG?
            menuIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',

            // Optional: Link to documentation content for this extension.
            // If not present, offer no link.
            docsURI: 'https://....',

            // Required: the list of blocks implemented by this extension,
            // in the order intended for display.
            blocks: [
                {
                    // Required: the machine-readable name of this operation.
                    // This will appear in project JSON.
                    opcode: 'myReporter', // becomes 'someBlocks.myReporter'

                    // Required: the kind of block we're defining, from a predefined list.
                    // Fully supported block types:
                    //   BlockType.BOOLEAN - same as REPORTER but returns a Boolean value
                    //   BlockType.COMMAND - a normal command block, like "move {} steps"
                    //   BlockType.HAT - starts a stack if its value changes from falsy to truthy ("edge triggered")
                    //   BlockType.REPORTER - returns a value, like "direction"
                    // Block types in development or for internal use only:
                    //   BlockType.BUTTON - place a button in the block palette
                    //   BlockType.CONDITIONAL - control flow, like "if {}" or "if {} else {}"
                    //     A CONDITIONAL block may return the one-based index of a branch to
                    //     run, or it may return zero/falsy to run no branch.
                    //   BlockType.EVENT - starts a stack in response to an event (full spec TBD)
                    //   BlockType.LOOP - control flow, like "repeat {} {}" or "forever {}"
                    //     A LOOP block is like a CONDITIONAL block with two differences:
                    //     - the block is assumed to have exactly one child branch, and
                    //     - each time a child branch finishes, the loop block is called again.
                    blockType: BlockType.REPORTER,

                    // Required for CONDITIONAL blocks, ignored for others: the number of
                    // child branches this block controls. An "if" or "repeat" block would
                    // specify a branch count of 1; an "if-else" block would specify a
                    // branch count of 2.
                    // TODO: should we support dynamic branch count for "switch"-likes?
                    branchCount: 0,

                    // Optional, default false: whether or not this block ends a stack.
                    // The "forever" and "stop all" blocks would specify true here.
                    terminal: true,

                    // Optional, default false: whether or not to block all threads while
                    // this block is busy. This is for things like the "touching color"
                    // block in compatibility mode, and is only needed if the VM runs in a
                    // worker. We might even consider omitting it from extension docs...
                    blockAllThreads: false,

                    // Required: the human-readable text on this block, including argument
                    // placeholders. Argument placeholders should be in [MACRO_CASE] and
                    // must be [ENCLOSED_WITHIN_SQUARE_BRACKETS].
                    text: formatMessage({
                        id: 'myReporter',
                        defaultMessage: 'letter [LETTER_NUM] of [TEXT]',
                        description: 'Label on the "myReporter" block'
                    }),

                    // Required: describe each argument.
                    // Argument order may change during translation, so arguments are
                    // identified by their placeholder name. In those situations where
                    // arguments must be ordered or assigned an ordinal, such as interaction
                    // with Scratch Blocks, arguments are ordered as they are in the default
                    // translation (probably English).
                    arguments: {
                        // Required: the ID of the argument, which will be the name in the
                        // args object passed to the implementation function.
                        LETTER_NUM: {
                            // Required: type of the argument / shape of the block input
                            type: ArgumentType.NUMBER,

                            // Optional: the default value of the argument
                            default: 1
                        },

                        // Required: the ID of the argument, which will be the name in the
                        // args object passed to the implementation function.
                        TEXT: {
                            // Required: type of the argument / shape of the block input
                            type: ArgumentType.STRING,

                                // Optional: the default value of the argument
                            default: formatMessage({
                                id: 'myReporter.TEXT_default',
                                defaultMessage: 'text',
                                description: 'Default for "TEXT" argument of "someBlocks.myReporter"'
                            })
                        }
                    },

                    // Optional: the function implementing this block.
                    // If absent, assume `func` is the same as `opcode`.
                    func: 'myReporter',

                    // Optional: list of target types for which this block should appear.
                    // If absent, assume it applies to all builtin targets -- that is:
                    // [TargetType.SPRITE, TargetType.STAGE]
                    filter: [TargetType.SPRITE]
                },
                {
                    // Another block...
                }
            ],

            // Optional: define extension-specific menus here.
            menus: {
                // Required: an identifier for this menu, unique within this extension.
                menuA: [
                    // Static menu: list items which should appear in the menu.
                    {
                        // Required: the value of the menu item when it is chosen.
                        value: 'itemId1',

                        // Optional: the human-readable label for this item.
                        // Use `value` as the text if this is absent.
                        text: formatMessage({
                            id: 'menuA_item1',
                            defaultMessage: 'Item One',
                            description: 'Label for item 1 of menu A in "Some Blocks" extension'
                        })
                    },

                    // The simplest form of a list item is a string which will be used as
                    // both value and text.
                    'itemId2'
                ],

                // Dynamic menu: returns an array as above.
                // Called each time the menu is opened.
                menuB: 'getItemsForMenuB',

                // The examples above are shorthand for setting only the `items` property in this full form:
                menuC: {
                    // This flag makes a "droppable" menu: the menu will allow dropping a reporter in for the input.
                    acceptReporters: true,

                    // The `item` property may be an array or function name as in previous menu examples.
                    items: [/*...*/] || 'getItemsForMenuC'
                }
            },

            // Optional: translations (UNSTABLE - NOT YET SUPPORTED)
            translation_map: {
                de: {
                    'extensionName': 'Einige Blöcke',
                    'myReporter': 'Buchstabe [LETTER_NUM] von [TEXT]',
                    'myReporter.TEXT_default': 'Text',
                    'menuA_item1': 'Artikel eins',

                    // Dynamic menus can be translated too
                    'menuB_example': 'Beispiel',

                    // This message contains ICU placeholders (see `myReporter()` below)
                    'myReporter.result': 'Buchstabe {LETTER_NUM} von {TEXT} ist {LETTER}.'
                },
                it: {
                    // ...
                }
            }
        };
    };

    /**
     * Implement myReporter.
     * @param {object} args - the block's arguments.
     * @property {string} MY_ARG - the string value of the argument.
     * @returns {string} a string which includes the block argument value.
     */
    myReporter (args) {
        // This message contains ICU placeholders, not Scratch placeholders
        const message = formatMessage({
            id: 'myReporter.result',
            defaultMessage: 'Letter {LETTER_NUM} of {TEXT} is {LETTER}.',
            description: 'The text template for the "myReporter" block result'
        });

        // Note: this implementation is not Unicode-clean; it's just here as an example.
        const result = args.TEXT.charAt(args.LETTER_NUM);

        return message.format({
            LETTER_NUM: args.LETTER_NUM,
            TEXT: args.TEXT,
            LETTER: result
        });
    };
}
```

## Experimental / In Development Features

The following are experimental features that are under active development and subject to change during the process
of converting the core Scratch blocks into using the extension spec.

### Dynamic Blocks
The content above describes defining static extension blocks (e.g. blocks that will always keep the same shape). While most
blocks in the Scratch language fall into this category, there are others which may dynamically change their shape based
state information. An example of this is the `control_stop` block which changes whether or not it can have a command block
attached after it based on which menu item is selected. Blocks that may dynamically change their shape are referred to below as
"dynamic blocks".

In order to support Scratch blocks like variables or custom procedure call blocks, we have added the support for dynamic blocks.
A block is specified to be dynamic by using the `isDynamic` flag in the block specification.

```js
class SomeBlocks {
    // ...
    getInfo () {
        return {
            // ...
            blocks: [
                {
                    isDynamic: true
                    opcode: 'dynamicReporter',
                    blockType: BlockType.REPORTER,
                    text: 'my dynamic reporter block',
                }
            ]
        };
    }
    // ...
}
```

#### Specifying a palette key for a block instance
With the addition of dynamic blocks, an extension can specify multiple blocks with the same opcode. The extension developer can optionally specify a `paletteKey` to differentiate the blocks in the toolbox (in particular this will
be necessary if there are multiple reporter blocks with the same opcode, and they don't disable monitors).

#### Adding Custom Context Menu Options
Dynamic blocks can have custom context menu options in addition to the default options for adding
a block comment, deleting the block, and duplicating the block.

In order to specify custom context menu options, you can provide a list of context menu item descriptors
which contain the text label for the menu item as well as the name of the function in the extension that should be run when
the block is selected.

The context menu callback function will have access to an object with at least two properties:

* `blockInfo` - The extension block descriptor for the block instance whose context menu was triggered.
* `blockId` - An identifier for the specific block instance whose context menu was triggered.

```js
class SomeBlocks {
    // ...
    getInfo () {
        return {
            // ...
            blocks: [
                {
                    isDynamic: true
                    opcode: 'dynamicReporter',
                    blockType: BlockType.REPORTER,
                    text: 'my dynamic reporter block',
                    customContextMenu: [
                        {
                            text: 'Context Menu Item 1',
                            callback: 'myContextMenuFunction'
                        },
                        {
                            text: 'Context Menu Item 2',
                            callback: 'anotherContextMenuFunction'
                        }
                    ]
                }
            ]
        };
    }

    myContextMenuFunction ({blockInfo, blockId}) {
        // ...
    }

    anotherContextMenuFunction ({blockInfo, blockId}) {
        // ...
    }
    // ...
}
```

For each context menu item, you can also optionally specify which situations that context menu item
should appear in.

The options for the context menu item context are as follows:

`ContextMenuContext.ALL` - The context menu item should always appear in the block's context menu. This is the default option.

`ContextMenuContext.TOOLBOX_ONLY` - The context menu item should only appear in the block's context menu when the block is in the toolbox.

`ContextMenuContext.WORKSPACE_ONLY` - The context menu item should only appear in the block's context menu when the block is on the main workspace.

By default, a context menu item will appear on the block in both the toolbox as well as the
main workspace.

```
customContextMenu: [
    {
        text: 'Context Menu Item Hidden From Toolbox',
        callback: 'myContextMenuFunction',
        context: ContextMenuContext.WORKSPACE_ONLY
    },
    {
        text: 'Context Menu Item Hidden From Workspace',
        callback: 'anotherContextMenuFunction',
        context: ContextMenuContext.TOOLBOX_ONLY
    }
]
```

#### Specifying/Changing the selected value of a dropdown menu
Specifying a dynamic block allows dynamically properties that
define what the block looks like (block text, how many arguments it has, etc.).
One new block property that can be set or changed in a dynamic block is
the currently `selectedValue` of a menu. E.g. you may have a custom context menu item that changes the selected value of a drop down menu on a block:

```js
class SomeBlocks {
    // ...
    getInfo () {
        return {
            // ...
            menus: {
                myMenu: ['value 1', 'value 2'];
            }
            blocks: [
                {
                    isDynamic: true
                    opcode: 'dynamicReporter',
                    blockType: BlockType.REPORTER,
                    text: 'my dynamic reporter block [MENU]',
                    arguments: {
                        MENU: {
                            type: ArgumentType.STRING,
                            menu: 'myMenu',
                            defaultValue: 'value 1'
                        }
                    }
                    customContextMenu: [
                        {
                            text: 'Change Dropdown Menu',
                            callback: 'changeDropdown'
                        }
                    ]
                }
            ]
        };
    }

    changeDropdown ({blockInfo, blockId}) {
        blockInfo.arguments.MENU.selectedValue = 'value 2';
        // Tell the runtime to update the block with the new info.
        this.runtime.updateBlock(blockId, blockInfo);
    }
    // ...
}
```
