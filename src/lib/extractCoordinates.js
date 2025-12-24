function extractCoordinates(obj) {
  if (obj.x !== undefined) return {x: obj.x, y: obj.y};

  const coordinates = {};
  let counter = 1;
  while (true) {
    if (obj[`x${counter}`] === undefined) break;
    coordinates[`x${counter}`] = obj[`x${counter}`];
    coordinates[`y${counter}`] = obj[`y${counter}`];
    counter++;
  }
  return coordinates;
}

export default extractCoordinates;