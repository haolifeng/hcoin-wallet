#!/usr/bin/env node
/**
 * 生成 electron-builder 所需的图标资源（零依赖，全平台可用）。
 *
 * 为什么不用 sharp / ImageMagick / iconutil：
 *  - sharp：体积大，需要下载平台二进制，CI 上经常失败；
 *  - ImageMagick / iconutil：Linux / Windows 上没有。
 * 本脚本直接用 Node 内置模块完成「矢量描述 → 光栅化 → PNG → ICO / ICNS」，
 * 因此一次编写，三平台都能生成图标。
 *
 * 产物：
 *  build/icon.svg          矢量源文件（仅作参考，不参与打包）
 *  build/icon.ico          Windows 安装包 / 快捷方式图标
 *  build/icon.icns         macOS App 图标
 *  build/icon.png          Linux 回退图标（512×512）
 *  build/icons/<w>x<h>.png Linux 各尺寸标准目录
 *
 * 使用：
 *  node scripts/gen-icons.js            # 已存在则跳过
 *  node scripts/gen-icons.js --force    # 强制重新生成
 */

'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build');
const LINUX_ICONS_DIR = path.join(BUILD_DIR, 'icons');

/** 设计稿：与 App 主色一致（#1677ff → #0a3d6b），白色 "H" 字形，圆角矩形。见 src/components/Header.tsx */
const DESIGN = {
  gradient: ['#2b8cff', '#0a3d6b'],
  glyphColor: [255, 255, 255],
  radius: 0.22,
  glyph: [
    { x: 0.3, y: 0.24, w: 0.13, h: 0.52 },
    { x: 0.57, y: 0.24, w: 0.13, h: 0.52 },
    { x: 0.3, y: 0.435, w: 0.4, h: 0.13 },
  ],
};

const MAX_SIZE = 1024;
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];
// icns 各类型对应的像素尺寸（macOS 10.7+ 直接支持内嵌 PNG）
const ICNS_TYPES = [
  { type: 'ic11', size: 32 },
  { type: 'ic12', size: 64 },
  { type: 'ic07', size: 128 },
  { type: 'ic08', size: 256 },
  { type: 'ic09', size: 512 },
  { type: 'ic10', size: 1024 },
];
const LINUX_SIZES = [16, 32, 48, 64, 128, 256, 512];

// ---------------------------------------------------------------- 矢量 → 像素

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function inRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

/** 圆角矩形命中测试（归一化坐标） */
function inRoundRect(px, py, r) {
  const cx = Math.min(Math.max(px, r.x), r.x + r.w);
  const cy = Math.min(Math.max(py, r.y), r.y + r.h);
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r.radius * r.radius;
}

function inGlyph(px, py) {
  return DESIGN.glyph.some((r) => inRect(px, py, r));
}

/** 纵向线性渐变取样 */
function gradientAt(t) {
  const [from, to] = DESIGN.gradient.map(hexToRgb);
  return from.map((c, i) => Math.round(c + (to[i] - c) * t));
}

/** 按超采样光栅化为 RGBA 缓冲区 */
function rasterize(size) {
  const ss = 3; // 每像素每方向采样次数，用于边缘抗锯齿
  const inv = 1 / (ss * ss);
  const shape = { x: 0, y: 0, w: 1, h: 1, radius: DESIGN.radius };
  const out = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    const bgColor = gradientAt((y + 0.5) / size);
    for (let x = 0; x < size; x++) {
      let bg = 0;
      let fg = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const px = (x + (sx + 0.5) / ss) / size;
          const py = (y + (sy + 0.5) / ss) / size;
          if (!inRoundRect(px, py, shape)) continue;
          bg++;
          if (inGlyph(px, py)) fg++;
        }
      }

      const i = (y * size + x) * 4;
      if (bg === 0) continue; // 透明像素，Buffer 已初始化为 0

      // alpha：圆角边缘的背景覆盖率；color：背景与前景按覆盖率混合
      out[i + 3] = Math.round(255 * bg * inv);
      const mix = fg / bg;
      out[i] = Math.round(bgColor[0] + (DESIGN.glyphColor[0] - bgColor[0]) * mix);
      out[i + 1] = Math.round(bgColor[1] + (DESIGN.glyphColor[1] - bgColor[1]) * mix);
      out[i + 2] = Math.round(bgColor[2] + (DESIGN.glyphColor[2] - bgColor[2]) * mix);
    }
  }
  return out;
}

/** 盒式降采样（预乘 alpha，避免透明边缘出现暗边） */
function downsample(rgba, from, to) {
  const out = Buffer.alloc(to * to * 4);
  const step = from / to;
  for (let y = 0; y < to; y++) {
    for (let x = 0; x < to; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      const x0 = Math.floor(x * step);
      const y0 = Math.floor(y * step);
      const x1 = Math.min(from, Math.max(x0 + 1, Math.floor((x + 1) * step)));
      const y1 = Math.min(from, Math.max(y0 + 1, Math.floor((y + 1) * step)));
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * from + sx) * 4;
          const pa = rgba[i + 3] / 255;
          r += rgba[i] * pa;
          g += rgba[i + 1] * pa;
          b += rgba[i + 2] * pa;
          a += pa;
          n++;
        }
      }
      const o = (y * to + x) * 4;
      if (a === 0 || n === 0) continue;
      out[o] = Math.round(r / a);
      out[o + 1] = Math.round(g / a);
      out[o + 2] = Math.round(b / a);
      out[o + 3] = Math.round((255 * a) / n);
    }
  }
  return out;
}

// ---------------------------------------------------------------- PNG 编码

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** RGBA → PNG（颜色类型 6，逐行 filter 0） */
function encodePng(size, rgba) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    const head = y * (stride + 1);
    raw[head] = 0; // filter type: None
    rgba.copy(raw, head + 1, y * stride, (y + 1) * stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------- ICO / ICNS

/** ICO：Vista+ 允许直接内嵌 PNG，无需 BMP 位图 */
function encodeIco(items) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(items.length, 4);

  const dirSize = 16 * items.length;
  let offset = 6 + dirSize;
  const dirs = [];
  for (const { size, png } of items) {
    const dir = Buffer.alloc(16);
    dir[0] = size >= 256 ? 0 : size; // 宽（256 用 0 表示）
    dir[1] = size >= 256 ? 0 : size; // 高
    dir[2] = 0; // 调色板色数
    dir[3] = 0; // reserved
    dir.writeUInt16LE(1, 4); // color planes
    dir.writeUInt16LE(32, 6); // bits per pixel
    dir.writeUInt32LE(png.length, 8);
    dir.writeUInt32LE(offset, 12);
    dirs.push(dir);
    offset += png.length;
  }

  return Buffer.concat([header, ...dirs, ...items.map((i) => i.png)]);
}

/** ICNS：'icns' 容器直接串联若干 (type, length, PNG) 条目 */
function encodeIcns(items) {
  const parts = items.map(({ type, size, png }) => {
    const head = Buffer.alloc(8);
    head.write(type, 0, 'latin1');
    head.writeUInt32BE(png.length + 8, 4);
    return Buffer.concat([head, png]);
  });
  const total = 8 + parts.reduce((sum, p) => sum + p.length, 0);
  const header = Buffer.alloc(8);
  header.write('icns', 0, 'latin1');
  header.writeUInt32BE(total, 4);
  return Buffer.concat([header, ...parts]);
}

// ---------------------------------------------------------------- 参考 SVG

function svgSource() {
  const [from, to] = DESIGN.gradient;
  const rects = DESIGN.glyph
    .map((r) => {
      const round = (n, scale = 512) => Number((n * scale).toFixed(2));
      return `    <rect x="${round(r.x)}" y="${round(r.y)}" width="${round(r.w)}" height="${round(
        r.h
      )}" rx="12" ry="12"/>`;
    })
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="113" ry="113" fill="url(#g)"/>
  <g fill="#ffffff">
${rects}
  </g>
</svg>
`;
}

// ---------------------------------------------------------------- 主流程

function main() {
  const force = process.argv.includes('--force');
  const targets = ['icon.ico', 'icon.icns', 'icon.png'].map((f) => path.join(BUILD_DIR, f));
  if (!force && targets.every((f) => fs.existsSync(f))) {
    console.log('[gen-icons] 图标已存在，跳过（如需重建：node scripts/gen-icons.js --force）');
    return;
  }

  fs.mkdirSync(LINUX_ICONS_DIR, { recursive: true });
  console.log('[gen-icons] 生成中…');

  const base = rasterize(MAX_SIZE);
  /** 按需渲染指定尺寸（< 1024 时由基准图降采样，保证各尺寸观感一致） */
  const render = (size) =>
    size >= MAX_SIZE ? encodePng(size, base) : encodePng(size, downsample(base, MAX_SIZE, size));

  fs.writeFileSync(path.join(BUILD_DIR, 'icon.svg'), svgSource());
  fs.writeFileSync(
    path.join(BUILD_DIR, 'icon.ico'),
    encodeIco(ICO_SIZES.map((size) => ({ size, png: render(size) })))
  );
  fs.writeFileSync(
    path.join(BUILD_DIR, 'icon.icns'),
    encodeIcns(ICNS_TYPES.map(({ type, size }) => ({ type, size, png: render(size) })))
  );
  for (const size of LINUX_SIZES) {
    const png = render(size);
    fs.writeFileSync(path.join(LINUX_ICONS_DIR, `${size}x${size}.png`), png);
    if (size === 512) fs.writeFileSync(path.join(BUILD_DIR, 'icon.png'), png);
  }

  console.log('[gen-icons] 完成 ✓ -> build/');
}

main();
