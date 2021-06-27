const http = require('http');
const url = require('url');
const fs = require('fs');
const crypto = require('crypto');

const ffmpegResource = {
	'default': {
		'webm': require('./ffmpeg-default/ffmpeg-webm.js'),
		'mp4': require('./ffmpeg-default/ffmpeg-mp4.js')
	},
	'20210624_1550': {
		'webm': require('./ffmpeg-20210624_1550/ffmpeg-webm.js'),
		'mp4': require('./ffmpeg-20210624_1550/ffmpeg-mp4.js')
	},
};
const http_api_port = 8080;

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

http.createServer(async function (req, res) {
	try {
		let urlInfo = url.parse(req.url, true)
		let urlPath = urlInfo.pathname
		let stdout = ''
		let stderr = ''
		let ffmpeg_resource = 'default' 
		let ffmpeg_target = 'mp4'
		if (urlInfo.query.resource !== undefined && ffmpegResource[urlInfo.query.resource] !== undefined)
			ffmpeg_resource = urlInfo.query.resource
		if (urlInfo.query.target !== undefined && ffmpegResource[ffmpeg_resource] !== undefined && ffmpegResource[ffmpeg_resource][urlInfo.query.target] !== undefined)
			ffmpeg_target = urlInfo.query.target
		let ffmpeg = ffmpegResource[ffmpeg_resource][ffmpeg_target]

		console.log('[INFO][ffmpeg_resource='+ffmpeg_resource+'][ffmpeg_target='+ffmpeg_target+']')

		let ffmpegargs = ['-version']
		let output_data = ''
		let output_content_type = 'text/plain'
		let output_status_code = 200
		if (urlInfo.pathname.indexOf('/ffmpeg_') == 0) {
			switch(urlInfo.pathname) {
				case '/ffmpeg_version':
					ffmpegargs = ['-version']
					break
				case '/ffmpeg_formats':
					ffmpegargs = ['-formats']
					break
				case '/ffmpeg_codecs':
					ffmpegargs = ['-codecs']
					break
				default:
			}
			ffmpeg({
				arguments: ffmpegargs,
				print: function (data) { stdout += data + '\n' },
				printErr: function (data) { stderr += data + '\n' },
				onExit: function (code) {
					console.log('CODE: [' + code + ']')
					console.log('STDOUT: [' + stdout + ']')
					console.log('STDERR: [' + stderr + ']')
				}
			})
			output_content_type = 'text/plain'
			output_data = stdout
		} else if (urlInfo.pathname.indexOf('/to') == 0) {
			let input_Uint8Array = null
			let input_filename = 'test.jpg'
			let output_filename = 'test.png'
			let from_local_file = urlInfo.query.local_file
			let from_remote_file = urlInfo.query.remote_file
			if (from_local_file !== undefined) {
				const check_file_exists = fs.existsSync(from_local_file)
				console.log('[INFO][from_local_file][exists:'+check_file_exists+'][path:'+from_local_file+']')
				if (check_file_exists) {
					raw_data = fs.readFileSync(from_local_file)
					console.log('[INFO][from_local_file][size:'+raw_data.length+'][path:'+from_local_file+']')
            				input_Uint8Array = Uint8Array.from(raw_data)
					console.log('[INFO] Local Init Done. Input size: ' + raw_data.length +', input_Uint8Array size: '+input_Uint8Array.length)
				}
			} else if (from_remote_file != undefined) {
				await download(from_remote_file).then(function(response) {
					raw_data = response.data
					console.log('[INFO][from_remote_file][size:'+raw_data.length+'][url:'+from_remote_file+']')
					console.log(response.response_headers)
					console.log()
            				input_Uint8Array = Uint8Array.from(raw_data)
					console.log('[INFO] Remote Init Done. Input size: ' + raw_data.length +', input_Uint8Array size: '+input_Uint8Array.length)
				}, function(err) {
					console.log('[INFO][from_remote_file][error:'+err+'][url:'+from_remote_file+']')
				});
			}
			if (input_Uint8Array === null) {
				output_content_type = 'text/plain'
				output_data = 'file not found'
			} else {
				const result = ffmpeg({
					MEMFS: [{name: input_filename, data: input_Uint8Array}],
					arguments: ['-i', input_filename, output_filename]
					//arguments: ['-i', input_filename, '-f', 'image2', output_filename]
					//arguments: ['-i', input_filename, '-vframes' ,'1', outputName]
					//arguments: ['-i', input_filename, output_filename]
					//arguments: ['-i', 'test.h264', '-r', '1/1', outputName]
					//arguments: ['-i', 'test.h264', outputName]
					//arguments: ['-i', 'test.h264', '-vsync', 'cfr','-r' ,'1', '-f' ,'image2', outputName]
					//arguments: ['-i', 'test.h264', '-vframes' ,'1', '-c:v', 'png', '-f' ,'image2', outputName]
					//arguments: ['-i', 'test.h264', '-r' ,'1/1', outputName]
					//arguments: ['-i', 'test.h264', outputName]
					//arguments: ['-i', 'test.jpg', outputName]
				})

				if (result.MEMFS[0] === undefined) {
					output_content_type = 'text/plain'
					output_data = 'FFMPEG Done, something wrong\n\n'
				} else {
					const outputContent = Buffer.from(result.MEMFS[0].data)
					console.log('FFMPEG Done, length: '+outputContent.length)
					output_content_type = 'image/png'
					output_data = outputContent
				}
			}
		} else {
			output_content_type = 'text/plain'
			output_data = 'api list:\n\n'
			output_data += '\t/ffmpeg_version\n'
			output_data += '\t/ffmpeg_formats\n'
			output_data += '\t/ffmpeg_codecs\n'
		}
		res.writeHead(output_status_code, {
			'Content-Type': output_content_type
		})
		res.end(output_data)
	} catch (e) {
		res.writeHead(500, {
			'Content-Type': 'text/plain'
		})
		res.end(e)
	}
}).listen(http_api_port)
