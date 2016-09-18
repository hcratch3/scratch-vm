var loadProject = function () {
    var id = location.hash.substring(1);
    if (id.length < 1) {
        id = '119615668';
    }
    var url = 'https://projects.scratch.mit.edu/internalapi/project/' +
        id + '/get/';
    var r = new XMLHttpRequest();
    r.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (r.status === 200) {
                window.vm.loadProject(this.responseText);
            } else {
                window.vm.createEmptyProject();
            }
        }
    };
    r.open('GET', url);
    r.send();
};

window.onload = function() {
    // Lots of global variables to make debugging easier
    // Instantiate the VM worker.
    var vm = new window.VirtualMachine();
    window.vm = vm;
    window.vm.assets = '../assets/';

    // Loading projects from the server.    
    loadProject();

    // Instantiate the renderer and connect it to the VM.
    var canvas = document.getElementById('scratch-stage');
    window.renderer = new window.RenderWebGL(canvas);

    // Instantiate scratch-blocks and attach it to the DOM.
    var toolbox = document.getElementById('toolbox');
    var workspace = window.Blockly.inject('blocks', {
        toolbox: toolbox,
        media: '../node_modules/scratch-blocks/media/',
        zoom: {
            controls: true,
            wheel: true,
            startScale: 0.75
        },
        colours: {
            workspace: '#334771',
            flyout: '#283856',
            scrollbar: '#24324D',
            scrollbarHover: '#0C111A',
            insertionMarker: '#FFFFFF',
            insertionMarkerOpacity: 0.3,
            fieldShadow: 'rgba(255, 255, 255, 0.3)',
            dragShadowOpacity: 0.6
        }
    });
    window.workspace = workspace;

    // Attach scratch-blocks events to VM.
    // @todo: Re-enable flyout listening after fixing GH-69.
    workspace.addChangeListener(vm.blockListener);

    // VM handlers.
    // Receipt of new playground data (thread, block representations).

    // Receipt of new block XML for the selected target.
    vm.on('workspaceUpdate', function (data) {
        window.Blockly.Events.disable();
        workspace.clear();
        var dom = window.Blockly.Xml.textToDom(data.xml);
        window.Blockly.Xml.domToWorkspace(dom, workspace);
        window.Blockly.Events.enable();
    });

    // Feedback for stacks and blocks running.
    vm.on('STACK_GLOW_ON', function(data) {
        workspace.glowStack(data.id, true);
    });
    vm.on('STACK_GLOW_OFF', function(data) {
        workspace.glowStack(data.id, false);
    });
    vm.on('BLOCK_GLOW_ON', function(data) {
        workspace.glowBlock(data.id, true);
    });
    vm.on('BLOCK_GLOW_OFF', function(data) {
        workspace.glowBlock(data.id, false);
    });
    vm.on('VISUAL_REPORT', function(data) {
        workspace.reportValue(data.id, data.value);
    });

    // Feed mouse events as VM I/O events.
    document.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();
        var coordinates = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            canvasWidth: rect.width,
            canvasHeight: rect.height
        };
        window.vm.postIOData('mouse', coordinates);
    });
    canvas.addEventListener('mousedown', function (e) {
        var rect = canvas.getBoundingClientRect();
        var data = {
            isDown: true,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            canvasWidth: rect.width,
            canvasHeight: rect.height
        };
        window.vm.postIOData('mouse', data);
        e.preventDefault();
    });
    canvas.addEventListener('mouseup', function (e) {
        var rect = canvas.getBoundingClientRect();
        var data = {
            isDown: false,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            canvasWidth: rect.width,
            canvasHeight: rect.height
        };
        window.vm.postIOData('mouse', data);
        e.preventDefault();
    });

    // Feed keyboard events as VM I/O events.
    document.addEventListener('keydown', function (e) {
        // Don't capture keys intended for Blockly inputs.
        if (e.target != document && e.target != document.body) {
            return;
        }
        window.vm.postIOData('keyboard', {
            keyCode: e.keyCode,
            isDown: true
        });
        e.preventDefault();
    });
    document.addEventListener('keyup', function(e) {
        // Always capture up events,
        // even those that have switched to other targets.
        window.vm.postIOData('keyboard', {
            keyCode: e.keyCode,
            isDown: false
        });
        // E.g., prevent scroll.
        if (e.target != document && e.target != document.body) {
            e.preventDefault();
        }
    });

    // Run threads
    vm.start();

    // Inform VM of animation frames.
    var animate = function() {
        window.vm.animationFrame();
        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    // Handlers for green flag and stop all.
    document.getElementById('greenflag').addEventListener('click', function() {
        vm.greenFlag();
    });
    document.getElementById('stopall').addEventListener('click', function() {
        vm.stopAll();
    });
};
