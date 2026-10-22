// Tự sinh bởi code/voz/tools/make_fonts.py — đừng sửa tay.
/* eslint-disable */
import f0 from './assets/fonts/Fraunces-700-latin.woff2';
import f1 from './assets/fonts/Fraunces-700-latin-ext.woff2';
import f2 from './assets/fonts/Fraunces-700-vietnamese.woff2';
import f3 from './assets/fonts/Fraunces-900-latin.woff2';
import f4 from './assets/fonts/Fraunces-900-latin-ext.woff2';
import f5 from './assets/fonts/Fraunces-900-vietnamese.woff2';
import f6 from './assets/fonts/PlayfairDisplay-700-latin.woff2';
import f7 from './assets/fonts/PlayfairDisplay-700-latin-ext.woff2';
import f8 from './assets/fonts/PlayfairDisplay-700-vietnamese.woff2';
import f9 from './assets/fonts/PlayfairDisplay-900-latin.woff2';
import f10 from './assets/fonts/PlayfairDisplay-900-latin-ext.woff2';
import f11 from './assets/fonts/PlayfairDisplay-900-vietnamese.woff2';
import f12 from './assets/fonts/BeVietnamPro-500-latin.woff2';
import f13 from './assets/fonts/BeVietnamPro-500-latin-ext.woff2';
import f14 from './assets/fonts/BeVietnamPro-500-vietnamese.woff2';
import f15 from './assets/fonts/BeVietnamPro-700-latin.woff2';
import f16 from './assets/fonts/BeVietnamPro-700-latin-ext.woff2';
import f17 from './assets/fonts/BeVietnamPro-700-vietnamese.woff2';
import f18 from './assets/fonts/BeVietnamPro-800-latin.woff2';
import f19 from './assets/fonts/BeVietnamPro-800-latin-ext.woff2';
import f20 from './assets/fonts/BeVietnamPro-800-vietnamese.woff2';
import f21 from './assets/fonts/Oswald-500-latin.woff2';
import f22 from './assets/fonts/Oswald-500-latin-ext.woff2';
import f23 from './assets/fonts/Oswald-500-vietnamese.woff2';
import f24 from './assets/fonts/Oswald-700-latin.woff2';
import f25 from './assets/fonts/Oswald-700-latin-ext.woff2';
import f26 from './assets/fonts/Oswald-700-vietnamese.woff2';
import f27 from './assets/fonts/Anton-400-latin.woff2';
import f28 from './assets/fonts/Anton-400-latin-ext.woff2';
import f29 from './assets/fonts/Anton-400-vietnamese.woff2';
import f30 from './assets/fonts/SpaceMono-400-latin.woff2';
import f31 from './assets/fonts/SpaceMono-400-latin-ext.woff2';
import f32 from './assets/fonts/SpaceMono-400-vietnamese.woff2';
import f33 from './assets/fonts/SpaceMono-700-latin.woff2';
import f34 from './assets/fonts/SpaceMono-700-latin-ext.woff2';
import f35 from './assets/fonts/SpaceMono-700-vietnamese.woff2';
import f36 from './assets/fonts/PatrickHand-400-latin.woff2';
import f37 from './assets/fonts/PatrickHand-400-latin-ext.woff2';
import f38 from './assets/fonts/PatrickHand-400-vietnamese.woff2';

export type FontFile = {family: string; weight: string; subset: string; url: string; unicodeRange: string};
export const FONT_FILES: FontFile[] = [
  {family: "Fraunces", weight: '700', subset: 'latin', url: f0, unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {family: "Fraunces", weight: '700', subset: 'latin-ext', url: f1, unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {family: "Fraunces", weight: '700', subset: 'vietnamese', url: f2, unicodeRange: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {family: "Fraunces", weight: '900', subset: 'latin', url: f3, unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {family: "Fraunces", weight: '900', subset: 'latin-ext', url: f4, unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {family: "Fraunces", weight: '900', subset: 'vietnamese', url: f5, unicodeRange: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {family: "Playfair Display", weight: '700', subset: 'latin', url: f6, unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {family: "Playfair Display", weight: '700', subset: 'latin-ext', url: f7, unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {family: "Playfair Display", weight: '700', subset: 'vietnamese', url: f8, unicodeRange: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {family: "Playfair Display", weight: '900', subset: 'latin', url: f9, unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {family: "Playfair Display", weight: '900', subset: 'latin-ext', url: f10, unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {family: "Playfair Display", weight: '900', subset: 'vietnamese', url: f11, unicodeRange: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {family: "Be Vietnam Pro", weight: '500', subset: 'latin', url: f12, unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {family: "Be Vietnam Pro", weight: '500', subset: 'latin-ext', url: f13, unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {family: "Be Vietnam Pro", weight: '500', subset: 'vietnamese', url: f14, unicodeRange: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {family: "Be Vietnam Pro", weight: '700', subset: 'latin', url: f15, unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {family: "Be Vietnam Pro", weight: '700', subset: 'latin-ext', url: f16, unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {family: "Be Vietnam Pro", weight: '700', subset: 'vietnamese', url: f17, unicodeRange: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {family: "Be Vietnam Pro", weight: '800', subset: 'latin', url: f18, unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {family: "Be Vietnam Pro", weight: '800', subset: 'latin-ext', url: f19, unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {family: "Be Vietnam Pro", weight: '800', subset: 'vietnamese', url: f20, unicodeRange: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {family: "Oswald", weight: '500', subset: 'latin', url: f21, unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {family: "Oswald", weight: '500', subset: 'latin-ext', url: f22, unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {family: "Oswald", weight: '500', subset: 'vietnamese', url: f23, unicodeRange: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {family: "Oswald", weight: '700', subset: 'latin', url: f24, unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {family: "Oswald", weight: '700', subset: 'latin-ext', url: f25, unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {family: "Oswald", weight: '700', subset: 'vietnamese', url: f26, unicodeRange: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {family: "Anton", weight: '400', subset: 'latin', url: f27, unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {family: "Anton", weight: '400', subset: 'latin-ext', url: f28, unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {family: "Anton", weight: '400', subset: 'vietnamese', url: f29, unicodeRange: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {family: "Space Mono", weight: '400', subset: 'latin', url: f30, unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {family: "Space Mono", weight: '400', subset: 'latin-ext', url: f31, unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {family: "Space Mono", weight: '400', subset: 'vietnamese', url: f32, unicodeRange: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {family: "Space Mono", weight: '700', subset: 'latin', url: f33, unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {family: "Space Mono", weight: '700', subset: 'latin-ext', url: f34, unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {family: "Space Mono", weight: '700', subset: 'vietnamese', url: f35, unicodeRange: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {family: "Patrick Hand", weight: '400', subset: 'latin', url: f36, unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {family: "Patrick Hand", weight: '400', subset: 'latin-ext', url: f37, unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {family: "Patrick Hand", weight: '400', subset: 'vietnamese', url: f38, unicodeRange: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
];
