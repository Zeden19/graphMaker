const rotateCords = (x, y, center, rotation) => {
  const angleRadians = rotation * Math.PI / 180;

  const shifted = {x: x - center.x, y: y - center.y};

  const rotated = {
    x: shifted.x * Math.cos(angleRadians) - shifted.y * Math.sin(angleRadians),
    y: shifted.x * Math.sin(angleRadians) + shifted.y * Math.cos(angleRadians),
  }

  return {
    x: rotated.x + center.x,
    y: rotated.y + center.y,
  }
};

export default rotateCords;