import React from 'react';
import {Scene} from '../types';
import {BigNumberScene, ListScene, QuestionScene, TitleScene} from './TextScenes';
import {BarsScene, CompareScene, ReceiptScene} from './DataScenes';
import {FlowScene} from './FlowScene';
import {ImageScene, PhoneScene} from './MediaScenes';
import {CollageScene, DocumentScene, MapScene} from './CollageScenes';

/** Danh mục loại cảnh. Thêm loại mới: viết component rồi đăng ký ở đây + docs/scene-types.md + SCENE_TYPES (episode.py). */
export const SCENES: Record<string, React.FC<{scene: Scene}>> = {
  title: TitleScene,
  bigNumber: BigNumberScene,
  list: ListScene,
  question: QuestionScene,
  receipt: ReceiptScene,
  bars: BarsScene,
  compare: CompareScene,
  flow: FlowScene,
  image: ImageScene,
  phone: PhoneScene,
  collage: CollageScene,
  map: MapScene,
  document: DocumentScene,
};

/** Nền mặc định theo loại cảnh (ghi đè bằng props.tone). Còn lại dùng nền của tập (mặc định than chì). */
export const SCENE_TONE: Record<string, string> = {map: 'map'};

/** Cảnh tự điều khiển máy quay bên trong (không áp máy quay chung). */
export const SELF_CAMERA = new Set(['map']);
