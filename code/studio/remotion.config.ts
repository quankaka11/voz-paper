import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
// CRF truyền qua CLI (voz/render.py: 18 bản cuối, 28 bản nháp) — đặt ở đây thì lượt render âm thanh (--codec=wav) báo lỗi.
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
// Render nhiều luồng dễ timeout trên laptop; để Remotion tự chọn nhưng giới hạn.
Config.setConcurrency(6);
Config.setColorSpace('bt709');
