const sharp = require('sharp');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

function getWebpmuxExe() {
  const base = path.join(__dirname, '../node_modules/@nwrks/webp-converter/bin');
  const platform = process.platform;
  const arch = process.arch;

  if (platform === 'win32') {
    return path.join(base, 'libwebp_win64/bin/webpmux.exe');
  } else if (platform === 'darwin') {
    const dir = arch === 'arm64' ? 'libwebp_osx_arm' : 'libwebp_osx';
    return path.join(base, dir, 'bin/webpmux');
  } else if (platform === 'linux') {
    const dir = arch === 'arm64' ? 'libwebp_linux_arm' : 'libwebp_linux';
    return path.join(base, dir, 'bin/webpmux');
  }
  return path.join(base, 'libwebp_win64/bin/webpmux.exe');
}

const webpmuxExe = getWebpmuxExe();

async function createAnimatedWebp(framesSvg, outputPath, frameDurationMs = 100) {
  const tmpDir = path.join(__dirname, '../.tmp_frames_' + Math.random().toString(36).substring(7));
  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    const args = [];
    for (let i = 0; i < framesSvg.length; i++) {
      const framePath = path.join(tmpDir, `frame_${i}.webp`);
      await sharp(Buffer.from(framesSvg[i])).webp({ lossless: true }).toFile(framePath);
      args.push('-frame', framePath, `+${frameDurationMs}+0+0+1-b`);
    }

    args.push('-loop', '0', '-bgcolor', '0,0,0,0', '-o', outputPath);

    await new Promise((resolve, reject) => {
      execFile(webpmuxExe, args, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve({ stdout, stderr });
      });
    });
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// 1. BLINK ANIMATION
function generateBlinkFrames() {
  const totalFrames = 24;
  const frames = [];

  for (let i = 0; i < totalFrames; i++) {
    let openProgress = 1;
    let gazeX = 0;
    let eyebrowOffset = 0;
    let starOpacity = 0;

    if (i < 9) {
      openProgress = 1;
      gazeX = Math.sin((i / 9) * Math.PI) * 2;
      starOpacity = 0.5 + 0.5 * Math.sin((i / 9) * Math.PI);
    } else if (i >= 9 && i <= 12) {
      const t = (i - 9) / 3;
      openProgress = Math.cos(t * Math.PI * 0.5);
      eyebrowOffset = t * 4;
      starOpacity = (1 - t) * 0.5;
    } else if (i > 12 && i <= 16) {
      openProgress = 0;
      eyebrowOffset = 4;
      starOpacity = 0;
    } else if (i > 16 && i <= 20) {
      const t = (i - 16) / 4;
      openProgress = Math.sin(t * Math.PI * 0.5);
      eyebrowOffset = (1 - t) * 4;
      starOpacity = t * 0.4;
    } else {
      openProgress = 1;
      starOpacity = 0.5;
    }

    const ry = Math.max(1, openProgress * 15);
    const eyeStroke = '#16A34A';
    const accentFill = '#22C55E';

    function renderEye(cx, cy, clipId) {
      if (openProgress <= 0.08) {
        return `
          <path d="M ${cx - 24} ${cy + 2} Q ${cx} ${cy + 9} ${cx + 24} ${cy + 2}" 
                fill="none" stroke="${eyeStroke}" stroke-width="4" stroke-linecap="round" />
          <path d="M ${cx - 14} ${cy + 7} L ${cx - 18} ${cy + 13}" stroke="${eyeStroke}" stroke-width="2.5" stroke-linecap="round" />
          <path d="M ${cx} ${cy + 9} L ${cx} ${cy + 16}" stroke="${eyeStroke}" stroke-width="2.5" stroke-linecap="round" />
          <path d="M ${cx + 14} ${cy + 7} L ${cx + 18} ${cy + 13}" stroke="${eyeStroke}" stroke-width="2.5" stroke-linecap="round" />
        `;
      }

      return `
        <defs>
          <clipPath id="${clipId}">
            <ellipse cx="${cx}" cy="${cy}" rx="25" ry="${ry}" />
          </clipPath>
        </defs>
        <ellipse cx="${cx}" cy="${cy}" rx="25" ry="${ry}" fill="#FFFFFF" stroke="${eyeStroke}" stroke-width="3.5" />
        <g clip-path="url(#${clipId})">
          <circle cx="${cx + gazeX}" cy="${cy}" r="11" fill="${accentFill}" />
          <circle cx="${cx + gazeX}" cy="${cy}" r="11" fill="none" stroke="${eyeStroke}" stroke-width="1.5" />
          <circle cx="${cx + gazeX}" cy="${cy}" r="6" fill="#0F172A" />
          <circle cx="${cx + gazeX + 3}" cy="${cy - 3}" r="2.5" fill="#FFFFFF" />
          <circle cx="${cx + gazeX - 3}" cy="${cy + 3}" r="1.2" fill="#FFFFFF" opacity="0.8" />
        </g>
        <ellipse cx="${cx}" cy="${cy}" rx="25" ry="${ry}" fill="none" stroke="${eyeStroke}" stroke-width="3.5" />
      `;
    }

    const svg = `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g opacity="${starOpacity.toFixed(2)}">
          <path d="M 28 65 Q 28 75 18 75 Q 28 75 28 85 Q 28 75 38 75 Q 28 75 28 65" fill="#7EC8A4" />
          <path d="M 172 60 Q 172 68 164 68 Q 172 68 172 76 Q 172 68 180 68 Q 172 68 172 60" fill="#7EC8A4" />
        </g>
        <path d="M 45 ${76 + eyebrowOffset} Q 68 ${67 + eyebrowOffset} 91 ${76 + eyebrowOffset}" 
              fill="none" stroke="${eyeStroke}" stroke-width="3.5" stroke-linecap="round" />
        <path d="M 109 ${76 + eyebrowOffset} Q 132 ${67 + eyebrowOffset} 155 ${76 + eyebrowOffset}" 
              fill="none" stroke="${eyeStroke}" stroke-width="3.5" stroke-linecap="round" />
        ${renderEye(68, 105, `eyeL_${i}`)}
        ${renderEye(132, 105, `eyeR_${i}`)}
      </svg>
    `;
    frames.push(svg);
  }
  return frames;
}

// 2. WRIST ANIMATION
function generateWristFrames() {
  const totalFrames = 24;
  const frames = [];

  for (let i = 0; i < totalFrames; i++) {
    const angleRad = (i / totalFrames) * Math.PI * 2;
    const handRotationDeg = Math.sin(angleRad) * 20;
    const handTranslateX = Math.sin(angleRad) * 6;
    const handTranslateY = -Math.cos(angleRad) * 4;

    // Arrow rotation around center (100, 100)
    const arrowAngleDeg = (i / totalFrames) * 360;

    const strokeColor = '#0284C7';
    const accentColor = '#38BDF8';
    const softFill = '#E0F2FE';

    const svg = `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Circular rotation guide orbit -->
        <circle cx="100" cy="100" r="70" fill="none" stroke="${accentColor}" stroke-width="2" stroke-dasharray="6 6" opacity="0.4" />
        
        <!-- Rotating directional curved arrow -->
        <g transform="rotate(${arrowAngleDeg} 100 100)">
          <path d="M 100 30 A 70 70 0 0 1 160 65" fill="none" stroke="${strokeColor}" stroke-width="3.5" stroke-linecap="round" />
          <polygon points="163,55 167,73 149,67" fill="${strokeColor}" />
        </g>

        <!-- Static Forearm -->
        <path d="M 86 150 L 86 195 M 114 150 L 114 195" stroke="${strokeColor}" stroke-width="3.5" stroke-linecap="round" />
        <rect x="83" y="142" width="34" height="10" rx="5" fill="${accentColor}" stroke="${strokeColor}" stroke-width="2.5" />

        <!-- Rotating Hand anchored at wrist (100, 142) -->
        <g transform="translate(${100 + handTranslateX}, ${142 + handTranslateY}) rotate(${handRotationDeg}) translate(-100, -142)">
          <!-- Palm & Fingers Silhouette -->
          <!-- Palm base -->
          <path d="M 87 142 
                   L 87 110 
                   Q 87 95 91 75 Q 93 68 96 68 Q 99 68 100 75 
                   Q 102 65 105 65 Q 108 65 109 75 
                   Q 111 67 114 67 Q 116 67 117 76 
                   Q 119 75 121 77 Q 123 79 123 85
                   L 121 114 
                   Q 133 118 135 125 Q 136 132 128 134
                   L 115 137
                   L 113 142 Z" 
                fill="${softFill}" stroke="${strokeColor}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" />
          
          <!-- Palm crease line -->
          <path d="M 94 116 Q 104 122 114 118" fill="none" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round" />
          <!-- Finger division hints -->
          <line x1="99" y1="78" x2="99" y2="100" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" opacity="0.6" />
          <line x1="108" y1="78" x2="108" y2="100" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" opacity="0.6" />
        </g>
      </svg>
    `;
    frames.push(svg);
  }
  return frames;
}

// 3. NECK ANIMATION
function generateNeckFrames() {
  const totalFrames = 24;
  const frames = [];

  for (let i = 0; i < totalFrames; i++) {
    // 0..3: center, 4..8: turn left, 9..12: hold left, 13..16: through center to right, 17..20: hold right, 21..23: return center
    let headAngle = 0;
    let headDx = 0;
    let arrowIndicatorT = 0.5; // 0 = full left, 1 = full right

    if (i <= 3) {
      headAngle = 0;
      headDx = 0;
      arrowIndicatorT = 0.5;
    } else if (i > 3 && i <= 8) {
      const t = (i - 3) / 5;
      const ease = 0.5 - 0.5 * Math.cos(t * Math.PI);
      headAngle = -ease * 20;
      headDx = -ease * 12;
      arrowIndicatorT = 0.5 - ease * 0.45;
    } else if (i > 8 && i <= 12) {
      headAngle = -20;
      headDx = -12;
      arrowIndicatorT = 0.05;
    } else if (i > 12 && i <= 17) {
      const t = (i - 12) / 5;
      const ease = 0.5 - 0.5 * Math.cos(t * Math.PI);
      headAngle = -20 + ease * 40;
      headDx = -12 + ease * 24;
      arrowIndicatorT = 0.05 + ease * 0.9;
    } else if (i > 17 && i <= 20) {
      headAngle = 20;
      headDx = 12;
      arrowIndicatorT = 0.95;
    } else {
      const t = (i - 20) / 3;
      const ease = 0.5 - 0.5 * Math.cos(t * Math.PI);
      headAngle = 20 - ease * 20;
      headDx = 12 - ease * 12;
      arrowIndicatorT = 0.95 - ease * 0.45;
    }

    const strokeColor = '#D97706';
    const accentColor = '#F59E0B';
    const softFill = '#FEF3C7';

    // Dot along top curve (M 55 42 Q 100 24 145 42)
    // Bezier parameter: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const t = arrowIndicatorT;
    const dotX = (1 - t) * (1 - t) * 55 + 2 * (1 - t) * t * 100 + t * t * 145;
    const dotY = (1 - t) * (1 - t) * 42 + 2 * (1 - t) * t * 24 + t * t * 42;

    const svg = `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Top stretch guidance double arrow -->
        <path d="M 55 42 Q 100 24 145 42" fill="none" stroke="${accentColor}" stroke-width="2.5" stroke-dasharray="4 4" opacity="0.6" />
        <!-- Arrow heads -->
        <polygon points="58,36 50,44 60,47" fill="${accentColor}" />
        <polygon points="142,36 150,44 140,47" fill="${accentColor}" />
        <!-- Active guidance position bead -->
        <circle cx="${dotX.toFixed(1)}" cy="${dotY.toFixed(1)}" r="4.5" fill="${strokeColor}" />

        <!-- Stationary Shoulders and Torso -->
        <path d="M 42 165 Q 100 152 158 165 L 165 195 L 35 195 Z" 
              fill="${softFill}" stroke="${strokeColor}" stroke-width="3.5" stroke-linejoin="round" />
        <line x1="88" y1="130" x2="88" y2="155" stroke="${strokeColor}" stroke-width="3.5" stroke-linecap="round" />
        <line x1="112" y1="130" x2="112" y2="155" stroke="${strokeColor}" stroke-width="3.5" stroke-linecap="round" />

        <!-- Rotating Head & Neck anchored at base of neck (100, 145) -->
        <g transform="translate(${100 + headDx}, 145) rotate(${headAngle.toFixed(1)}) translate(-100, -145)">
          <!-- Neck -->
          <rect x="88" y="115" width="24" height="25" fill="#FFFFFF" />

          <!-- Head Shape -->
          <ellipse cx="100" cy="90" rx="30" ry="34" fill="#FFFFFF" stroke="${strokeColor}" stroke-width="3.5" />

          <!-- Ears -->
          <ellipse cx="69" cy="91" rx="5" ry="8" fill="#FFFFFF" stroke="${strokeColor}" stroke-width="2.5" />
          <ellipse cx="131" cy="91" rx="5" ry="8" fill="#FFFFFF" stroke="${strokeColor}" stroke-width="2.5" />

          <!-- Hair / Cap detail -->
          <path d="M 72 84 Q 100 58 128 84 Q 120 62 100 60 Q 80 62 72 84 Z" fill="${accentColor}" />

          <!-- Facial features that shift with head turn -->
          <g transform="translate(${(headAngle * 0.4).toFixed(1)}, 0)">
            <!-- Eyes -->
            <ellipse cx="90" cy="88" rx="3" ry="4" fill="#1E293B" />
            <ellipse cx="110" cy="88" rx="3" ry="4" fill="#1E293B" />
            <!-- Gentle smile -->
            <path d="M 94 99 Q 100 104 106 99" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" />
          </g>
        </g>
      </svg>
    `;
    frames.push(svg);
  }
  return frames;
}

async function main() {
  const assetsDir = path.join(__dirname, '../src/assets/exercises');
  fs.mkdirSync(assetsDir, { recursive: true });

  console.log('Generating blink.webp...');
  await createAnimatedWebp(generateBlinkFrames(), path.join(assetsDir, 'blink.webp'), 90);

  console.log('Generating wrist.webp...');
  await createAnimatedWebp(generateWristFrames(), path.join(assetsDir, 'wrist.webp'), 90);

  console.log('Generating neck.webp...');
  await createAnimatedWebp(generateNeckFrames(), path.join(assetsDir, 'neck.webp'), 90);

  console.log('All exercise animations generated successfully!');
}

main().catch(console.error);
