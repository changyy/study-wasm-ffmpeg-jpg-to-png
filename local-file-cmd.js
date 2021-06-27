const ffmpeg = require('./ffmpeg-20210624_1550/ffmpeg-mp4.js');
//const ffmpeg = require('./ffmpeg-default/ffmpeg-mp4.js');
const fs = require('fs');
const crypto = require('crypto');

let from_local_file = '/tmp/test.jpg';
let raw_data = fs.readFileSync(from_local_file);
let testData = Uint8Array.from(raw_data);
const md5sum = crypto.createHash('md5');
md5sum.update(raw_data);
console.log('[INFO][from_local_file][size:'+raw_data.length+'][md5:'+md5sum.digest('hex')+'][path:'+from_local_file+']');

const result = ffmpeg({
	MEMFS: [{name: 'test.jpg', data: testData}],
	arguments: ['-i', 'test.jpg', 'test.png']
})
const out = result.MEMFS[0];
const outputContent = Buffer.from(out.data);

console.log('[INFO] Done. Input size: ' + raw_data.length +', testData size: '+testData.length+', output size: '+outputContent.length);
