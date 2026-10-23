export function zoomAt(camera, factor, point, min, max) {
  const scale = Math.max(min, Math.min(max, camera.scale * factor));
  const ratio = scale / camera.scale;
  return { scale, x: point.x - (point.x - camera.x) * ratio, y: point.y - (point.y - camera.y) * ratio };
}
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
