const AudioEngine = require('scratch-audio');
const ScratchStorage = require('scratch-storage');
const ScratchRender = require('scratch-render');
const ScratchSVGRenderer = require('scratch-svg-renderer');
const VirtualMachine = require('..');

// This file is an example of how to create a standalone, full screen
// minimal scratch player without the editor view.
// This file does not presentally include monitors, which are drawn by the GUI.

/**
 * @param {Asset} projectAsset - calculate a URL for this asset.
 * @returns {string} a URL to download a project file.
 */
const projectGetConfig = function (projectAsset) {
    return `https://projects.scratch.mit.edu/${projectAsset.assetId}`;
};

/**
 * @param {Asset} asset - calculate a URL for this asset.
 * @returns {string} a URL to download a project asset (PNG, WAV, etc.)
 */
const assetGetConfig = function (asset) {
    return `https://assets.scratch.mit.edu/internalapi/asset/${asset.assetId}.${asset.dataFormat}/get/`;
};

window.onload = function () {

    // Get the project id from the hash, or use the default project.
    let projectId;
    if (window.location.hash) {
        projectId = window.location.hash.substring(1);
    }

    // Instantiate the VM.
    const vm = new VirtualMachine();
    vm.attachV2BitmapAdapter(new ScratchSVGRenderer.BitmapAdapter());
    vm.attachV2SVGAdapter(new ScratchSVGRenderer.SVGRenderer());

    // Initialize storage
    const storage = new ScratchStorage();
    const AssetType = storage.AssetType;
    storage.addWebStore([AssetType.Project], projectGetConfig);
    storage.addWebStore([AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound], assetGetConfig);

    vm.attachStorage(storage);

    // Compatibility mode will set the frame rate to 30 TPS,
    // which is the standard for the scratch player.
    vm.setCompatibilityMode(true);

    if (projectId) {
        vm.downloadProjectId(projectId);
    } else {
        // If no project ID is supplied, load a local project
        fetch('./playground.sb3').then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                vm.loadProject(arrayBuffer);
            });
    }

    vm.on('workspaceUpdate', () => {
        document.getElementById('overlay').classList.remove('hidden');
    });

    // Instantiate the renderer and connect it to the VM.
    const canvas = document.getElementById('scratch-stage');
    const renderer = new ScratchRender(canvas);
    vm.attachRenderer(renderer);
    const audioEngine = new AudioEngine();
    vm.attachAudioEngine(audioEngine);

    // Resets size of canvas directly for proper image calcuations
    // when the window is resized
    const resize = () => {
        renderer.resize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', resize);

    resize();

    // Start project after green flag clicked and attempt to go
    // fullscreen
    let attemptFullscreen = Boolean(document.body.requestFullscreen);
    document.getElementById('green-flag').addEventListener('click', () => {
        document.getElementById('overlay').classList.add('hidden');
        vm.greenFlag();
        if (attemptFullscreen) {
            document.body.requestFullscreen();
            attemptFullscreen = false;
        }
    });

    // Feed mouse events as VM I/O events.
    document.body.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const coordinates = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            canvasWidth: rect.width,
            canvasHeight: rect.height
        };
        vm.postIOData('mouse', coordinates);
    });
    canvas.addEventListener('mousedown', e => {
        const rect = canvas.getBoundingClientRect();
        const data = {
            isDown: true,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            canvasWidth: rect.width,
            canvasHeight: rect.height
        };
        vm.postIOData('mouse', data);
        e.preventDefault();
    });
    canvas.addEventListener('mouseup', e => {
        const rect = canvas.getBoundingClientRect();
        const data = {
            isDown: false,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            canvasWidth: rect.width,
            canvasHeight: rect.height
        };
        vm.postIOData('mouse', data);
        e.preventDefault();
    });

    // Feed keyboard events as VM I/O events.
    document.body.addEventListener('keydown', e => {
        // Don't capture keys intended for Blockly inputs.
        if (e.target !== document && e.target !== document.body) {
            return;
        }
        vm.postIOData('keyboard', {
            key: e.code,
            isDown: true
        });
        e.preventDefault();
    });
    document.body.addEventListener('keyup', e => {
        // Always capture up events,
        // even those that have switched to other targets.
        vm.postIOData('keyboard', {
            key: e.code,
            isDown: false
        });
        // E.g., prevent scroll.
        if (e.target !== document && e.target !== document.body) {
            e.preventDefault();
        }
    });

    // Run threads
    vm.start();
};
