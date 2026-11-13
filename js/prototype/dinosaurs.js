import { pathPoint } from './model.js';

export const DINOSAURS = [
  { key:'brachiosaurus', stop:.068, width:135, lane:-92, range:66, period:13, stride:36, lift:3, knees:.75, feet:[.25,.40,.53,.69] },
  { key:'triceratops', stop:.24, width:195, lane:138, range:85, period:12, stride:32, lift:3, knees:.76, feet:[.24,.45,.58,.75] },
  { key:'stegosaurus', stop:.47, width:230, lane:145, range:91, period:14, stride:42, lift:4, knees:.77, feet:[.22,.38,.51,.66] },
  { key:'ankylosaurus', stop:.67, width:190, lane:136, range:68, period:16, stride:24, lift:2, knees:.78, feet:[.19,.41,.53,.69] },
  { key:'tyrannosaurus', stop:.85, width:232, lane:-52, range:116, period:10, stride:53, lift:6, knees:.66, feet:[.35,.63] }
];

const frameCount = 12;
const turn = Math.PI * 2;

function walkingTexture(scene, dinosaur) {
  const key = dinosaur.key + '-walk';
  if (scene.textures.exists(key)) return key;
  const source = scene.textures.get(dinosaur.key).getSourceImage();
  const { width, height } = source;
  const texture = scene.textures.createCanvas(key, width * 4, height * 3);
  const ctx = texture.context;
  const firstRow = Math.ceil(height * dinosaur.knees);
  const joints = [0, ...dinosaur.feet, .85, 1].map(x => Math.round(x * width));

  // Keep the painted silhouette intact above the knees. Below them, stretch
  // between the feet so each pair can swing while the body stays connected.
  for (let frame = 0; frame < frameCount; frame++) {
    const x = frame % 4 * width, y = Math.floor(frame / 4) * height;
    const phase = frame / frameCount * turn;
    const swings = dinosaur.feet.map((_, i) => Math.sin(phase + i * Math.PI) * width * .036);
    const shifts = [0, ...swings, 0, 0];
    ctx.drawImage(source, 0, 0, width, firstRow, x, y, width, firstRow);
    for (let row = firstRow; row < height; row += 2) {
      const band = Math.min(2, height - row);
      const weight = ((row - firstRow) / (height - firstRow)) ** 1.35;
      let left = 0;
      for (let i = 1; i < joints.length; i++) {
        const right = Math.round(joints[i] + shifts[i] * weight);
        ctx.drawImage(source, joints[i - 1], row, joints[i] - joints[i - 1], band,
          x + left, y + row, right - left, band);
        left = right;
      }
    }
    texture.add(frame, 0, x, y, width, height);
  }
  texture.refresh();
  return key;
}

export function createDinosaur(scene, dinosaur, reduced) {
  const root = scene.add.container(0, 0).setDepth(dinosaur.lane < 0 ? -4 : 4.5);
  const shadow = scene.add.ellipse(0, 0, dinosaur.width * .55, dinosaur.width * .05, 0x564222, .23);
  const drawing = reduced
    ? scene.add.image(0, 0, dinosaur.key)
    : scene.add.image(0, 0, walkingTexture(scene, dinosaur), 0);
  const scale = dinosaur.width / drawing.width;
  drawing.setOrigin(.5, 1).setScale(scale);
  root.add([shadow, drawing]);
  const animal = { root, drawing, shadow, scale, dinosaur };
  poseDinosaur(animal, 0, reduced);
  return animal;
}

export function poseDinosaur({ root, drawing, shadow, scale, dinosaur }, seconds, reduced = false) {
  const { stop, lane, range, period, stride, lift } = dinosaur;
  const phase = seconds / period * turn;
  const pace = Math.cos(phase);
  const distance = reduced ? 0 : Math.sin(phase) * range;
  const point = pathPoint(stop + distance / 3160);
  root.setPosition(point.x, point.y + lane);
  if (reduced) return;

  const walking = Math.min(1, Math.abs(pace) * 2);
  const travelled = pace >= 0 ? distance + range : range - distance;
  const step = travelled / stride * turn;
  const frame = Math.floor(travelled / stride * frameCount) % frameCount;
  const bounce = Math.sin(step) ** 2 * lift * walking;
  drawing.setFrame(frame).setFlipX(pace >= 0);
  drawing.y = -bounce;
  drawing.angle = Math.cos(step) * 2.3 * walking;
  drawing.scaleX = scale * (.72 + .28 * walking);
  drawing.scaleY = scale * (1 + Math.sin(seconds * 1.8) * .013);
  shadow.alpha = .23 - bounce * .012;
}
