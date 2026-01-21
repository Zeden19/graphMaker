const ROUND_PRECISION = 3;

const roundNumber = (value) => Number.isFinite(value)
  ? Number(value.toFixed(ROUND_PRECISION))
  : value;

const roundDeep = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => roundDeep(item));
  }
  if (value && typeof value === "object") {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = roundDeep(value[key]);
      return acc;
    }, {});
  }
  if (typeof value === "number") {
    return roundNumber(value);
  }
  return value;
};

const stableStringify = (value) => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  const entries = keys.map((key) => {
    let stringifiedKey = JSON.stringify(key);
    let stringifiedValue = stableStringify(value[key]);
    return `${stringifiedKey}:${stringifiedValue}`;
  });
  return `{${entries.join(",")}}`;
};

export const buildGraphPayload = (shapes) => {
  // TODO: include a schema version once graph data needs migrations.
  // round the JSON Data
  const shapeData = Object.values(shapes)
    .flat()
    .map((shape) => roundDeep(shape.toJSON()));

  // key only used to sort shapes
  const withKeys = shapeData.map((shape) => ({shape, key: stableStringify(shape)}));
  const sortedShapes = withKeys.sort((a, b) => a.key.localeCompare(b.key)).map(({shape}) => shape);

  return {
    shapes: sortedShapes,
  };
};
