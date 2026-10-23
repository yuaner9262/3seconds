export function layerFrames(story) {
  const frames = []; let x = 0, y = 0, width = story.width, height = story.height;
  let layer = story.layers[0]; const seen = new Set();
  while (layer) {
    if (seen.has(layer.id)) throw new Error('Story contains a cycle');
    seen.add(layer.id); frames.push({ ...layer, x, y, width, height });
    if (!layer.portal) break;
    const p = layer.portal;
    x += width * p.x; y += height * p.y; width *= p.width; height *= p.height;
    layer = story.layers.find(l => l.id === p.child);
    if (!layer) throw new Error('Missing child layer');
  }
  return frames;
}

// A single reversible path. Input changes progress, never the pointer anchor.
export function cameraOnPath(frames, progress, viewport) {
  const clamped = Math.max(0, Math.min(frames.length - 1, progress));
  const index = Math.min(frames.length - 2, Math.floor(clamped));
  if (frames.length === 1) return cameraForFrame(frames[0], viewport);
  const t = clamped - index;
  const a = cameraForFrame(frames[index], viewport, index ? frames[index - 1].portal?.targetScale : 1);
  const b = cameraForFrame(frames[index + 1], viewport, frames[index].portal?.targetScale);
  const blend = t * t * (3 - 2 * t);
  const scale = Math.exp(Math.log(a.scale) * (1 - t) + Math.log(b.scale) * t);
  const cx = a.cx + (b.cx - a.cx) * blend;
  const cy = a.cy + (b.cy - a.cy) * blend;
  return { x: viewport.width / 2 - cx * scale, y: viewport.height / 2 - cy * scale, scale };
}
function cameraForFrame(frame, viewport, targetScale = 1) {
  const view = frame.view ?? {};
  const scale = Math.min(viewport.width / frame.width, viewport.height / frame.height) * (view.zoom ?? targetScale ?? 1);
  const cx = frame.x + frame.width * (view.focusX ?? .5);
  const cy = frame.y + frame.height * (view.focusY ?? .5);
  return { x: viewport.width / 2 - cx * scale, y: viewport.height / 2 - cy * scale, scale, cx, cy };
}
