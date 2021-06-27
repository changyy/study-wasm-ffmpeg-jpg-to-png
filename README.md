# README

ref: https://github.com/Kagami/ffmpeg.js 

This is a simple HTTP API server used to call ffmpeg.js to decode and encode from jpg to png.

Env:

```
% file /tmp/test.jpg 
/tmp/test.jpg: JPEG image data, baseline, precision 8, 1920x1080, components 3

% cd /tmp ; php -S 0.0.0.0:8888
```

Example:
- `curl 'http://localhost:8080/to?resource=20210624_1550&remote_file=http%3A%2F%2Flocalhost%3A8888%2Ftest.jpg'`
- `curl 'http://localhost:8080/to?resource=20210624_1550&local_file=%2Ftmp%2Ftest.jpg'`
- `node local-file-cmd.js`
- `node remote-file-cmd.js`

# Usage

```
node HttpApiServer.js
```

```
% curl http://localhost:8080/
api list:

	/ffmpeg_version
	/ffmpeg_formats
	/ffmpeg_codecs
```

# Get ffmpeg version

```
% curl http://localhost:8080/ffmpeg_version
ffmpeg version n4.2.2 Copyright (c) 2000-2019 the FFmpeg developers

built with emcc (Emscripten gcc/clang-like replacement) 1.39.13

configuration: --cc=emcc --ranlib=emranlib --enable-cross-compile --target-os=none --arch=x86 --disable-runtime-cpudetect --disable-asm --disable-fast-unaligned --disable-pthreads --disable-w32threads --disable-os2threads --disable-debug --disable-stripping --disable-safe-bitstream-reader --disable-all --enable-ffmpeg --enable-avcodec --enable-avformat --enable-avfilter --enable-swresample --enable-swscale --disable-network --disable-d3d11va --disable-dxva2 --disable-vaapi --disable-vdpau --enable-decoder=vp8 --enable-decoder=h264 --enable-decoder=vorbis --enable-decoder=opus --enable-decoder=mp3 --enable-decoder=aac --enable-decoder=pcm_s16le --enable-decoder=mjpeg --enable-decoder=png --enable-demuxer=matroska --enable-demuxer=ogg --enable-demuxer=mov --enable-demuxer=mp3 --enable-demuxer=wav --enable-demuxer=image2 --enable-demuxer=concat --enable-protocol=file --enable-filter=aresample --enable-filter=scale --enable-filter=crop --enable-filter=overlay --enable-filter=hstack --enable-filter=vstack --disable-bzlib --disable-iconv --disable-libxcb --disable-lzma --disable-sdl2 --disable-securetransport --disable-xlib --enable-zlib --enable-encoder=libx264 --enable-encoder=libmp3lame --enable-encoder=aac --enable-muxer=mp4 --enable-muxer=mp3 --enable-muxer=null --enable-gpl --enable-libmp3lame --enable-libx264 --extra-cflags='-s USE_ZLIB=1 -I../lame/dist/include' --extra-ldflags=-L../lame/dist/lib

libavutil      56. 31.100 / 56. 31.100

libavcodec     58. 54.100 / 58. 54.100

libavformat    58. 29.100 / 58. 29.100

libavfilter     7. 57.100 /  7. 57.100

libswscale      5.  5.100 /  5.  5.100

libswresample   3.  5.100 /  3.  5.100
```

# Get ffmpeg formats

```
% curl 'http://localhost:8080/ffmpeg_formats'           
File formats:

 D. = Demuxing supported

 .E = Muxing supported

 --

 D  concat          Virtual concatenation script

 D  image2          image2 sequence

 D  matroska,webm   Matroska / WebM

  E mov             QuickTime / MOV

 D  mov,mp4,m4a,3gp,3g2,mj2 QuickTime / MOV

 DE mp3             MP3 (MPEG audio layer 3)

  E mp4             MP4 (MPEG-4 Part 14)

  E null            raw null video

 D  ogg             Ogg

 D  wav             WAV / WAVE (Waveform Audio)

% curl 'http://localhost:8080/ffmpeg_formats?resource=20210624_1550'
File formats:

 D. = Demuxing supported

 .E = Muxing supported

 --

 D  concat          Virtual concatenation script

 D  h264            raw H.264 video

 DE image2          image2 sequence

 D  matroska,webm   Matroska / WebM

 D  mjpeg           raw MJPEG video

  E mov             QuickTime / MOV

 D  mov,mp4,m4a,3gp,3g2,mj2 QuickTime / MOV

 DE mp3             MP3 (MPEG audio layer 3)

  E mp4             MP4 (MPEG-4 Part 14)

  E null            raw null video

 D  ogg             Ogg

 D  wav             WAV / WAVE (Waveform Audio)
```
