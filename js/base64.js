
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

window.addEventListener('load', function () {
    document.getElementById('drop-area').addEventListener('dragover', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
    });
    document.getElementById('drop-area').addEventListener('drop', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.dataTransfer.files;
        for (var i = 0; i < files.length; i++) {
            var reader = new FileReader();
            reader.onload = function (evt) {
                console.log('evt', evt);
                const dataUrl = evt.target.result;

                console.log(targets.test(dataUrl))
                if (targets.test(dataUrl)) {
                    document.getElementById('result-encoded').innerHTML = '<div><img onclick="if(navigator.clipboard){navigator.clipboard.writeText(this.src);}" src="' +
                        dataUrl +
                        '"><textarea id="encoded" onclick="this.select();if(navigator.clipboard){navigator.clipboard.writeText(this.value);}">' +
                        dataUrl +
                        '</textarea></div>' +
                        document.getElementById('result-encoded').innerHTML;
                }
            };
            reader.readAsDataURL(files[i]);
        }
    });

    document.getElementById('todecode').addEventListener('change', async function () {
        const decoded = await decode(document.getElementById('todecode').value);

        if ((decoded.type).includes('image/')) {
            document.getElementById('result-decoded').innerHTML = '<div><img onclick="if(navigator.clipboard){navigator.clipboard.writeText(this.src);}" src="' + window.URL.createObjectURL(decoded) + '"></div>';
        }
    });

    document.getElementById('textPlain').addEventListener('keyup', async function () {
        encoded = await encode(document.getElementById('textPlain').value);
        document.getElementById('textBase64').value = encoded;
    });

    document.getElementById('textBase64').addEventListener('keyup', async function () {
        decoded = await decodeText(document.getElementById('textBase64').value);
        console.log('decoded', decoded)
        document.getElementById('textPlain').value = decoded;
    });
});
