import React from 'react';
import {Scene} from '../types';
import {BigNumberScene, ListScene, QuestionScene, TitleScene} from './TextScenes';
import {BarsScene, CompareScene, ReceiptScene} from './DataScenes';
import {FlowScene} from './FlowScene';
import {ImageScene, PhoneScene} from './MediaScenes';

/** Danh mục loại cảnh. Thêm loại mới: viết component rồi đăng ký ở đây + docs/scene-types.md. */
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
};

/** Cảnh dùng nền tối (navy). */
export const DARK_SCENES = new Set(['question']);
