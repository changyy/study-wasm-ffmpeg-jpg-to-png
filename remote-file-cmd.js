const ffmpeg = require('./ffmpeg-20210624_1550/ffmpeg-mp4.js');
//const ffmpeg = require('./ffmpeg-default/ffmpeg-mp4.js');
const fs = require('fs');
const http = require('http');
const url = require('url');
const crypto = require('crypto');

function download(request_url) {
	return new Promise((resolve, reject) => {
		try {
			let urlInfo = url.parse(request_url, true);
			//console.log(urlInfo);
			let buffer = []
			http.request({
				host: urlInfo.hostname,
				port: urlInfo.port,
				path: urlInfo.path+(urlInfo.search === null ? '' : urlInfo.search),
				method: 'GET'
			},function(res) {
				res.setEncoding('binary');
				res.on('data', function (chunk) {
					console.log('[INFO][download][event=data] chunk: '+chunk.length);
					buffer.push(Buffer.from(chunk, 'binary'))
				})
				res.on('end', function () {
					let data = Buffer.concat(buffer)
					const md5sum = crypto.createHash('md5');
					md5sum.update(data);
					const md5sum_hex = md5sum.digest('hex')
					console.log('[INFO][download][event=end]data length: '+data.length+', md5: '+md5sum_hex);
					if (res.statusCode != 200)
						reject('HTTP ERROR: '+res.statusCode+'\n\n'+data+'\n\n');
					else if (!res.complete)
						reject('HTTP ERROR FAILED: '+res.statusCode+'\n\n'+data+'\n\n');
					else
						resolve({'code': res.statusCode, 'response_headers': res.headers, 'data': data, 'md5': md5sum_hex, 'urlInfo': urlInfo, 'url': request_url});
				})
			}).end();
		} catch(e) {
			reject("ERROR:"+e);
		}
	});
}

let from_local_file = '/tmp/test.jpg';
let raw_data = fs.readFileSync(from_local_file);
let testData = Uint8Array.from(raw_data);
const md5sum = crypto.createHash('md5');
md5sum.update(raw_data);
console.log('[INFO][from_local_file][size:'+raw_data.length+'][md5:'+md5sum.digest('hex')+'][path:'+from_local_file+']');

//
// cd /tmp ; php -S localhost:8888
//
let from_remote_file = 'http://localhost:8888/test.jpg';

(async function () {
	let raw_data = '';
	let testData = undefined;
	await download(from_remote_file).then(function (ret) {
		raw_data = ret.data
		testData = Uint8Array.from(raw_data);
	});
	const md5sum = crypto.createHash('md5');
	md5sum.update(raw_data);
	console.log('[INFO][from_remote_file][size:'+raw_data.length+'][md5:'+md5sum.digest('hex')+'][path:'+from_remote_file+']');
	const result = ffmpeg({
		MEMFS: [{name: 'test.jpg', data: testData}],
		arguments: ['-i', 'test.jpg', 'test.png']
	});
	const out = result.MEMFS[0];
	const outputContent = Buffer.from(out.data);

	console.log('[INFO] Done. Input size: ' + raw_data.length +', testData size: '+testData.length+', output size: '+outputContent.length);
})();
