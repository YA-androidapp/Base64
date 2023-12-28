// Copyright (c) 2022 YA-androidapp(https://github.com/YA-androidapp) All rights reserved.


const ignoreformat = 'ignoreformat';
const png1x1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=';
const targetFormats = [
    'image/bmp',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/tiff',
    'image/vnd.mozilla.apng',
];
const targets = new RegExp(targetFormats.join('|'));

function encode(...parts) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
            const offset = reader.result.indexOf(",") + 1;
            resolve(reader.result.slice(offset));
        };
        reader.readAsDataURL(new Blob(parts));
    });
}

function decodeText(message) {
    return fetch('data:text/plain;charset=UTF-8;base64,' + message).then(response => response.text());
}

function decode(message, mimetype = 'image/png') {
    return fetch(((message.startsWith('data:')) ? '' : 'data:' + mimetype + ';base64,') + message).then(response => response.blob());
}

window.addEventListener('DOMContentLoaded', _ => {
    document.getElementById('drop-area').addEventListener('dragover', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
    });


    const loadFiles = (files) => {
        const searchParams = new URLSearchParams(window.location.search);

        for (var i = 0; i < files.length; i++) {
            const reader = new FileReader();
            reader.onload = function (evt) {
                const dataUrl = evt.target.result;
                if (searchParams.has(ignoreformat) || targets.test(dataUrl)) {
                    document.getElementById('result-encoded').innerHTML = '<div><img onclick="if(navigator.clipboard){navigator.clipboard.writeText(this.src);}" src="' +
                        dataUrl +
                        '"><textarea class="form-control" id="encoded" onclick="this.select();if(navigator.clipboard){navigator.clipboard.writeText(this.value);}">' +
                        dataUrl +
                        '</textarea></div>' +
                        document.getElementById('result-encoded').innerHTML;
                }
            };
            reader.readAsDataURL(files[i]);
        }
    };

    document.getElementById('drop-area').addEventListener('drop', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();

        const files = evt.dataTransfer.files;
        loadFiles(files);
    });


    document.getElementById('base64files').addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        loadFiles(files);
    });

    document.getElementById('todecode').addEventListener('change', async function () {
        const decoded = await decode(document.getElementById('todecode').value);

        if ((decoded.type).includes('image/')) {
            document.getElementById('result-decoded').innerHTML = '<div><img onclick="if(navigator.clipboard){navigator.clipboard.writeText(this.src);}" src="' + window.URL.createObjectURL(decoded) + '"></div>';
        }
    });

    document.getElementById('textPlain').addEventListener('keyup', async function () {
        const encoded = await encode(document.getElementById('textPlain').value);
        document.getElementById('textBase64').value = encoded;
    });

    document.getElementById('textBase64').addEventListener('keyup', async function () {
        const decoded = await decodeText(document.getElementById('textBase64').value);
        console.log('decoded', decoded)
        document.getElementById('textPlain').value = decoded;
    });

    document.getElementById('remote-img').addEventListener('load', function (event) {
        let img = event.target;
        if (img.src != png1x1) {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL();
            if (targets.test(dataUrl)) {
                document.getElementById('result-encoded').innerHTML = '<div><img onclick="if(navigator.clipboard){navigator.clipboard.writeText(this.src);}" src="' +
                    dataUrl +
                    '"><textarea class="form-control" id="encoded" onclick="this.select();if(navigator.clipboard){navigator.clipboard.writeText(this.value);}">' +
                    dataUrl +
                    '</textarea></div>' +
                    document.getElementById('result-encoded').innerHTML;
            }

            // canvas.toBlob(function (blob) {
            //     const link = document.createElement('a');
            //     link.download = 'out.png';
            //     link.href = URL.createObjectURL(blob);
            //     link.click();
            //     URL.revokeObjectURL(link.href);
            // }, 'image/png');
        }
    }, false);

    document.getElementById('remote-img-url').addEventListener('keyup', async function (event) {
        document.getElementById('remote-img').src = event.target.value;
    });
});
