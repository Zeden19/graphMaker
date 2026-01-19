function getStartAndEnd(isStart, coords) {
  const start = {
    x: isStart ? coords.x1 : coords.x2, y: isStart ? coords.y1 : coords.y2
  };
  const end = {
    x: isStart ? coords.x4 : coords.x3, y: isStart ? coords.y4 : coords.y3
  };
  return {start, end};
}

// Move a point along a given direction vector by a certain distance.
function translateAlong(point, dir, distance) {
  return {
    x: point.x + dir.x * distance,
    y: point.y + dir.y * distance
  };
}

// Offset a point using a local coordinate system.
function offsetInBasis(base, axisX, axisY, dx, dy) {
  return {
    x: base.x + axisX.x * dx + axisY.x * dy,
    y: base.y + axisX.y * dx + axisY.y * dy
  };
}

// Returns a direction vector that points outward from the arrow shaft.
function outward(arrow, isStart) {
  const vectors = arrow.getEndpointVectors(isStart);
  const flip = isStart ? -1 : 1;
  return {
    x: vectors.dir.x * flip,
    y: vectors.dir.y * flip
  };
}


export const arrowEndpoints = {
  "": () => "",

  "←": (arrow, isStart = false, coords) => {
    const {start, end} = getStartAndEnd(isStart, coords);

    const out = outward(arrow, isStart);
    const perp = arrow.getEndpointVectors(isStart).perp;

    const peak = offsetInBasis(start, out, perp, arrow.width * 2, (arrow.width / 2) - arrow.width);

    const p1 = start;
    const p2 = translateAlong(start, perp, arrow.width);
    const p3 = peak;
    const p4 = translateAlong(end, perp, -arrow.width);
    const p5 = end;

    return `M ${p1.x},${p1.y} L ${p2.x},${p2.y}
          L ${p3.x},${p3.y} L ${p4.x},${p4.y} L ${p5.x},${p5.y}`;
  },

  "●": (arrow, isStart = false, coords) => {
    const radius = arrow.width * 2;

    const out = outward(arrow, isStart);

    const {start, end} = getStartAndEnd(isStart, coords);
    const mid = {x: (start.x + end.x) / 2, y: (start.y + end.y) / 2};

    const center = translateAlong(mid, out, radius);

    return `M ${center.x - radius}, ${center.y}
          a ${radius},${radius} 0 1,0 ${radius * 2},0
          a ${radius},${radius} 0 1,0 -${radius * 2},0`;
  },


  "■": (arrow, isStart = false, coords) => {
    const {start, end} = getStartAndEnd(isStart, coords);

    const out = outward(arrow, isStart);
    const perp = arrow.getEndpointVectors(isStart).perp;

    const peakDist = arrow.width * 3;

    const p1 = start;
    const p2 = translateAlong(start, perp, arrow.width);
    const p3 = offsetInBasis(start, out, perp, peakDist, arrow.width);
    const p4 = offsetInBasis(end, out, perp, peakDist, -arrow.width);
    const p5 = translateAlong(end, perp, -arrow.width);
    const p6 = end;

    return `M ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y}
          L ${p4.x},${p4.y} L ${p5.x},${p5.y} L ${p6.x},${p6.y}`;
  },

  "❘": (arrow, isStart = false, coords) => {
    const {start, end} = getStartAndEnd(isStart, coords);

    const out = outward(arrow, isStart);
    const perp = arrow.getEndpointVectors(isStart).perp;

    const peakDist = arrow.width;

    const p1 = start;
    const p2 = translateAlong(start, perp, arrow.width);
    const p3 = offsetInBasis(start, out, perp, peakDist, arrow.width);
    const p4 = offsetInBasis(end, out, perp, peakDist, -arrow.width);
    const p5 = translateAlong(end, perp, -arrow.width);
    const p6 = end;

    return `M ${p1.x},${p1.y} L ${p2.x},${p2.y} 
          L ${p3.x},${p3.y} L ${p4.x},${p4.y}
          L ${p5.x},${p5.y} L ${p6.x},${p6.y}`;
  },
};

// Get labels for select list
export const arrowEndpointLabels = Object.keys(arrowEndpoints).map((label) => ({
  label,
  value: label
}));
