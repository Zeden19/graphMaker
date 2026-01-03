function cornerInShape(p, poly) {
  let inside = false;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;

    const straddles = (yi > p.y) !== (yj > p.y);
    if (!straddles) continue;

    const xIntersect = xj + ((p.y - yj) * (xi - xj)) / (yi - yj);

    if (p.x < xIntersect) inside = !inside;
  }
  return inside;
}

function segmentsIntersect(p1, p2, q1, q2) {
  const o1 = orient(p1, p2, q1);
  const o2 = orient(p1, p2, q2);
  const o3 = orient(q1, q2, p1);
  const o4 = orient(q1, q2, p2);

  // General case
  if (o1 * o2 < 0 && o3 * o4 < 0) return true;

  // Collinear / touching cases
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, p2, q2)) return true;
  if (o3 === 0 && onSegment(q1, q2, p1)) return true;
  if (o4 === 0 && onSegment(q1, q2, p2)) return true;

  return false;
}

function orient(a, b, c) {
  const v = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const EPS = 1e-9;
  return Math.abs(v) < EPS ? 0 : Math.sign(v);
}

function onSegment(a, b, p) {
  return (
    Math.min(a.x, b.x) - 1e-9 <= p.x && p.x <= Math.max(a.x, b.x) + 1e-9 &&
    Math.min(a.y, b.y) - 1e-9 <= p.y && p.y <= Math.max(a.y, b.y) + 1e-9
  );
}

export default function isHiglightInsideShape(x1, y1, x2, y2, shapeCorners) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  const highlightCorners = [
    {x: minX, y: minY},
    {x: maxX, y: minY},
    {x: maxX, y: maxY},
    {x: minX, y: maxY},
  ];

  if (shapeCorners.some(p => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY)) {
    return true;
  }

  if (highlightCorners.some(corner => cornerInShape(corner, shapeCorners))) {
    return true;
  }

  const rectEdges = [
    [highlightCorners[0], highlightCorners[1]],
    [highlightCorners[1], highlightCorners[2]],
    [highlightCorners[2], highlightCorners[3]],
    [highlightCorners[3], highlightCorners[0]],
  ];

  const poly = shapeCorners;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];

    for (const [c, d] of rectEdges) {
      if (segmentsIntersect(a, b, c, d)) return true;
    }
  }

  return false;

}