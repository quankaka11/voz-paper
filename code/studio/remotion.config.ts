import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
// Render nhiều luồng dễ timeout trên laptop; để Remotion tự chọn nhưng giới hạn.
Config.setConcurrency(6);
Config.setColorSpace('bt709');
