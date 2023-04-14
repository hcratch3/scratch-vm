const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB3aWR0aD0iOS44NTg2MDkybW0iCiAgIGhlaWdodD0iMTEuMzYzMTg2bW0iCiAgIHZpZXdCb3g9IjAgMCA5Ljg1ODYwOTIgMTEuMzYzMTg2IgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmc1MjQ1IgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjUgKDIwNjBlYzFmOWYsIDIwMjAtMDQtMDgpIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzNTIzOSIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMC4zNSIKICAgICBpbmtzY2FwZTpjeD0iMTIyLjkxNjE2IgogICAgIGlua3NjYXBlOmN5PSItMjY5Ljk1NDg0IgogICAgIGlua3NjYXBlOmRvY3VtZW50LXVuaXRzPSJtbSIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJsYXllcjEiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGZpdC1tYXJnaW4tdG9wPSIwIgogICAgIGZpdC1tYXJnaW4tbGVmdD0iMCIKICAgICBmaXQtbWFyZ2luLXJpZ2h0PSIwIgogICAgIGZpdC1tYXJnaW4tYm90dG9tPSIwIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTkyMCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSIxMDE2IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIyNyIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIiAvPgogIDxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTUyNDIiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxnCiAgICAgaW5rc2NhcGU6bGFiZWw9IkxheWVyIDEiCiAgICAgaW5rc2NhcGU6Z3JvdXBtb2RlPSJsYXllciIKICAgICBpZD0ibGF5ZXIxIgogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYwLjg2OTc4MSwtNjYuMDQ0NTk3KSI+CiAgICA8cGF0aAogICAgICAgc3R5bGU9ImZpbGw6IzQyY2JhNjtmaWxsLW9wYWNpdHk6MTtzdHJva2Utd2lkdGg6MC4wMTkwNTA0NSIKICAgICAgIGQ9Im0gLTU2LjY1OTYzMSw3Ny4wMTA4NjggYyAtMC43NTgxODgsLTAuNDM4Njk3IC0yLjI1MTIyNCwtMS4zMDE1MjggLTMuNDM4NjA2LC0xLjk4NzE4MyBsIC0wLjc3MTU0NCwtMC40NDU1MjkgViA3MS43MjIzNSA2OC44NjY1NDQgbCAwLjIxOTA4MSwtMC4xMjY5ODIgYyAwLjEyMDQ5NCwtMC4wNjk4NCAwLjc1MDU4OCwtMC40MzQxODEgMS40MDAyMDgsLTAuODA5NjQ1IDAuNjQ5NjIxLC0wLjM3NTQ2NiAxLjYzOTc2NywtMC45NDgzMjcgMi4yMDAzMjcsLTEuMjczMDI2IDAuNTYwNTU5LC0wLjMyNDY5OSAxLjA0MTUzOCwtMC41OTg5MjMgMS4wNjg4NDQsLTAuNjA5Mzg5IDAuMDQ0ODgsLTAuMDE3MiAwLjEzMzQ3NiwwLjAyOTQ1IDAuOTIzOTQ2LDAuNDg2NTkgMS44Njk3NzIsMS4wODEzMDkgMi41NzczNDgsMS40ODk4OTkgMy4yNzQ2NjMsMS44OTA5NTUgMC4zOTgxNTUsMC4yMjg5OTggMC43MzQ2MzQsMC40Mjk0NTQgMC43NDc3MywwLjQ0NTQ1OSAwLjAxODgxLDAuMDIyOTkgMC4wMjM4MSwwLjYyMDA2MiAwLjAyMzgxLDIuODQyODE1IDAsMi42NTI0OTYgLTAuMDAxOSwyLjgxNTkwMSAtMC4wMzMzNCwyLjg1MTg2NCAtMC4wMTgzNCwwLjAyMDk4IC0wLjQxOTEwOSwwLjI2MDcwNSAtMC44OTA2MSwwLjUzMjcyIC0xLjI3NTc0MSwwLjczNTk5NSAtMy4wMjUwOTUsMS43NDcyNjEgLTMuNTM5OTIyLDIuMDQ2MzU5IC0wLjI0OTU2LDAuMTQ0OTg2IC0wLjQ2Mzg3NiwwLjI2MzU3IC0wLjQ3NjI1OSwwLjI2MzUxOSAtMC4wMTIzOCwtNC4xZS01IC0wLjMzMTEzNCwtMC4xNzg2NjIgLTAuNzA4MzM0LC0wLjM5NjkxNSB6IG0gMS42MTc4MzksLTAuNzk2NjMgYyAwLjQ4Mjc3MywtMC4yNzkzIDEuNDQ3ODU1LC0wLjgzNzcwNiAyLjE0NDYyOCwtMS4yNDA4OTkgMC42OTY3NzEsLTAuNDAzMTk1IDEuMjczMTcsLTAuNzQyNjE3IDEuMjgwODkzLC0wLjc1NDI3MyAwLjAwNzcsLTAuMDExNjYgMC4wMTIwMSwtMS4xNDQyMTYgMC4wMDk1LC0yLjUxNjgwMSBsIC0wLjAwNDUsLTIuNDk1NjExIC0wLjc4MTA2OSwtMC40NTI1MTMgYyAtMC40Mjk1ODksLTAuMjQ4ODgyIC0wLjg4Mzk0MiwtMC41MTE2NDYgLTEuMDA5NjczLC0wLjU4MzkyMSAtMC4xMjU3MzQsLTAuMDcyMjcgLTAuNzQyOTY4LC0wLjQyODY5MyAtMS4zNzE2MzQsLTAuNzkyMDQyIC0wLjYyODY2OCwtMC4zNjMzNDggLTEuMTU1ODg2LC0wLjY2MTU4NCAtMS4xNzE2MDQsLTAuNjYyNzQ5IC0wLjAyMjU4LC0wLjAwMTcgLTMuOTkwMTAzLDIuMjc5NjUxIC00LjI3MjA2NSwyLjQ1NjQzOCBsIC0wLjA3MTQ0LDAuMDQ0NzkgdiAyLjUwMjU2MiBjIDAsMS45NzkwMjYgMC4wMDUsMi41MDY2MTQgMC4wMjM4MSwyLjUyMTkyMiAwLjAyNDkzLDAuMDIwMjcgMC4xMTQ4MjcsMC4wNzI0OSAyLjAyNDExLDEuMTc1OTQ5IDAuNjQ5NjIsMC4zNzU0NDMgMS40MjExNjQsMC44MjIxMzEgMS43MTQ1NDIsMC45OTI2NDMgMC4yOTMzNzUsMC4xNzA1MTIgMC41NDk5MDUsMC4zMTA1MzggMC41NzAwNjIsMC4zMTExNzMgMC4wMjAxNiw2LjA5ZS00IDAuNDMxNjQ4LC0wLjIyNzM2OSAwLjkxNDQyMSwtMC41MDY2NyB6IG0gLTIuMDU1NDk3LC0wLjczMTQ5NyBjIC0wLjE0NjAyNiwtMC4wOTQyMSAtMC4yNzE5LC0wLjE4MTY0NiAtMC4yNzk3MjEsLTAuMTk0Mjk5IC0wLjAwNzgsLTAuMDEyNjYgLTAuMDE0MjIsLTEuNjE0NDcyIC0wLjAxNDI0LC0zLjU1OTU5NSAtMS4xZS01LC0yLjcyNTI5NyAwLjAwNTIsLTMuNTQzNDU4IDAuMDIyODksLTMuNTY2NTMgMC4wMjUyNCwtMC4wMzI5OSAxLjM3MDk3NCwtMC44MzIwMjggMS40MjUxNjksLTAuODQ2MTk5IDAuMDMwNTcsLTAuMDA4IDAuMjY3MjQ5LDAuMTI3MTQ1IDEuNTE2OTUsMC44NjYxMzUgMC4xNDkxNiwwLjA4ODIgMC4yNzYyNTQsMC4xNjg1NDkgMC4yODI0MzQsMC4xNzg1NDcgMC4wMTI3NywwLjAyMDY2IC0wLjMxMzQ2NywwLjUzMTUyMiAtMC4zMzk0MywwLjUzMTUyMiAtMC4wMDkzLDAgLTAuMzM4NjY0LC0wLjE5MjgzMiAtMC43MzE5MzgsLTAuNDI4NTE1IC0wLjM5MzI3MiwtMC4yMzU2ODUgLTAuNzIwNTY5LC0wLjQyNTQzMyAtMC43MjczMiwtMC40MjE2NjQgLTAuMDA2NywwLjAwMzggLTAuMTk2NTg4LDAuMTA3ODc3IC0wLjQyMTg2MSwwLjIzMTM1NCAtMC4yMjUyNzIsMC4xMjM0NzcgLTAuNDE1OTEyLDAuMjMzOTI4IC0wLjQyMzY1MSwwLjI0NTQ0OCAtMC4wMDc3LDAuMDExNTIgLTAuMDEyMDMsMC42NTEwMzggLTAuMDA5NSwxLjQyMTE1MyBsIDAuMDA0NSwxLjQwMDIwOCAxLjA4NTg3NywwLjAwOTUgMS4wODU4NzYsMC4wMDk1IHYgMC4zNTI0MzQgMC4zNTI0MzMgbCAtMS4wODU4NzYsMC4wMDk1IC0xLjA4NTg3NywwLjAwOTUgLTAuMDA0OSwxLjc3MDg0MSBjIC0wLjAwMjcsMC45NzM5NiAtMC4wMTE0MSwxLjc3NzM4MiAtMC4wMTk0LDEuNzg1Mzc5IC0wLjAwOCwwLjAwOCAtMC4xMzQwMTcsLTAuMDYyNTQgLTAuMjgwMDQzLC0wLjE1Njc1MyB6IG0gLTEuMDM2Mzk0LC0wLjU5Nzk0NCBjIC0wLjA5ODI0LC0wLjA1NjM5IC0wLjE4OTU3OSwtMC4xMTM5OTkgLTAuMjAyOTczLC0wLjEyODAxOSAtMC4wMTM0LC0wLjAxNDAyIC0wLjEyNDY4NCwtMC40MDY5NzcgLTAuMjQ3MzEyLC0wLjg3MzIzNSAtMC41MTEzNzQsLTEuOTQ0MzkzIC0wLjYzNjIwMSwtMi40MDYyMzIgLTAuNjU1NjA0LC0yLjQyNTYzNSAtMC4wMTQ1NiwtMC4wMTQ1NiAtMC4wMjA0NSwwLjM3NTE2MiAtMC4wMjA0NSwxLjM1Mzg3NCAwLDAuOTA3NzczIC0wLjAwNjUsMS4zNzgzNjkgLTAuMDE5MzEsMS4zODYyNSAtMC4wMTA2MiwwLjAwNjYgLTAuMTI2MzQ5LC0wLjA0OTMgLTAuMjU3MTgsLTAuMTI0MTMyIGwgLTAuMjM3ODc3LC0wLjEzNjA2MiBWIDcxLjg1MzY4IDY5Ljc2OTUyMSBsIDAuMDUxMzksLTAuMDMzNzggYyAwLjAyODI2LC0wLjAxODU4IDAuMTQxODUzLC0wLjA4NjY4IDAuMjUyNDE4LC0wLjE1MTMzIDAuMTU0Mjk0LC0wLjA5MDIyIDAuMjA2MzI3LC0wLjExMjM2OCAwLjIyMzgxNywtMC4wOTUyNSAwLjAxMjU0LDAuMDEyMjYgMC4xNjA4NjIsMC40OTgwODUgMC4zMjk2MjMsMS4wNzk2IDAuMzMyMDgyLDEuMTQ0Mjk3IDAuMzM5MTU3LDEuMTY2NjU5IDAuMzY0MTkzLDEuMTUxMTg3IDAuMDA5NSwtMC4wMDU5IDAuMDE2ODQsLTAuNjE4NjM1IDAuMDE2ODQsLTEuNDA2Nzc0IHYgLTEuMzk2MzY1IGwgMC4yOTk0NzksLTAuMTcyNzAzIGMgMC4xNjQ3MTMsLTAuMDk0OTkgMC4zMDYxNjMsLTAuMTY4NTcyIDAuMzE0MzMzLC0wLjE2MzUyNCAwLjAwODIsMC4wMDUgMC4wMTQ4NSwxLjQ0ODg4OSAwLjAxNDg1LDMuMjA4NTMyIDAsMi41NDcwODkgLTAuMDA0OCwzLjE5OTIzNiAtMC4wMjM4MSwzLjE5ODc4IC0wLjAxMzA5LC0zLjE3ZS00IC0wLjEwNDE5MiwtMC4wNDY3MSAtMC4yMDI0MzQsLTAuMTAzMDk5IHogbSA0Ljc1MzgxOCwtMC4xMTg2NzEgYyAtMC4wMDY5LC0wLjAwNjkgLTAuMDEyNjIsLTEuMTgwOTgxIC0wLjAxMjYyLC0yLjYwODk4NCB2IC0yLjU5NjM3IGwgLTAuMTcyMTMsLTAuMTEwMzgyIGMgLTAuNDc3OTA1LC0wLjMwNjQ2NiAtMC41ODAyNjMsLTAuMzc4ODcxIC0wLjU3ODAxNSwtMC40MDg4NjIgMC4wMDM1LC0wLjA0NjQ1IDAuMjc0NTQsLTAuNDczMjMyIDAuMjk5ODA2LC0wLjQ3MjA0MSAwLjAxMTk0LDYuMTdlLTQgMC40NDYwNTMsMC4yNjk3NDkgMC45NjQ3MDIsMC41OTgxOTEgbCAwLjk0Mjk5OSwwLjU5NzE2NiAwLjAwNTIsMC4zNDQ4MDggYyAwLjAwNDEsMC4yNzQwNjQgOC4yZS01LDAuMzQ0ODA5IC0wLjAxOTc0LDAuMzQ0ODA5IC0wLjAxMzcxLDAgLTAuMTgzMjE4LC0wLjEwODMzMiAtMC4zNzY2NzcsLTAuMjQwNzM3IC0wLjE5MzQ1OSwtMC4xMzI0MDQgLTAuMzY2NzEsLTAuMjQ0ODQxIC0wLjM4NTAwMywtMC4yNDk4NTggLTAuMDMxNDksLTAuMDA4NiAtMC4wMzM1MiwwLjEwOTg4IC0wLjAzODEsMi4yMjU4MjggbCAtMC4wMDQ4LDIuMjM0OTQ4IC0wLjE4NzA5NiwwLjExMDI4NCBjIC0wLjMyMDY2MSwwLjE4OTAxMyAtMC40MjU0MjgsMC4yNDQyNTQgLTAuNDM4NDgxLDAuMjMxMiB6IgogICAgICAgaWQ9InBhdGg1MDk0LTYiCiAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogIDwvZz4KPC9zdmc+Cg==';

/**
 * Host for the NFT-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3NftBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
	this.mediaRecorder = {};
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'nft',
            name: formatMessage({
                id: 'nft.categoryName',
                default: 'NFT',
                description: 'Label for the nft extension category'
            }),
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'download',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'nft.download',
                        default: 'save image',
                        description: 'save snapshot image from canvas in png format'
                    })
                },
                {
                    opcode: 'start',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'nft.start',
                        default: 'start recording',
                        description: 'start recording viewer'
                    })
                },
                {
                    opcode: 'stop',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'nft.stop',
                        default: 'stop recording',
                        description: 'stop recording viewer'
                    })
                }
            ]
        };
    }

    download () {
        this.runtime.renderer.draw();

        const image = this.runtime.renderer.canvas.toDataURL('image/png');

        const tmpLink = document.createElement('a');
        tmpLink.download = 'image-' + Date.now() + '.png';
        tmpLink.href = image;

        document.body.appendChild(tmpLink);
        tmpLink.click();
        document.body.removeChild(tmpLink);
    }

    start () {
	const canvas = this.runtime.renderer.canvas;
	var video = document.createElement('video');
	var videoStream = canvas.captureStream(30);
	var chunks = [];

	const options = {
	  mimeType: "video/webm; codecs=vp9",
	};

	this.mediaRecorder = new MediaRecorder(videoStream, options);

	this.mediaRecorder.ondataavailable = function(e) {
	  chunks.push(e.data);
	};

	this.mediaRecorder.onstop = function(e) {
	  var blob = new Blob(chunks, { 'type' : 'video/mp4' });
	  chunks = [];
	  var videoURL = URL.createObjectURL(blob);
	  video.src = videoURL;

	  // Attach the object URL to an <a> element, setting the download file name
	  const a = document.createElement('a');
	  a.style = "display: none;";
	  a.href = videoURL;
	  a.download = "video.webm";
	  document.body.appendChild(a);
	  // Trigger the file download
	  a.click();
	  setTimeout(() => {
	    // Clean up - see https://stackoverflow.com/a/48968694 for why it is in a timeout
	    URL.revokeObjectURL(videoURL);
	    document.body.removeChild(a);
	    document.body.removeChild(video);
	  }, 0);
	};

	this.mediaRecorder.start();
    }

    stop () {
	this.mediaRecorder.stop();
    }
}

module.exports = Scratch3NftBlocks;
