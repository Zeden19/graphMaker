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
  const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${entries.join(",")}}`;
};

export const buildGraphPayload = (shapes) => {
  // TODO: include a schema version once graph data needs migrations.
  const shapeData = Object.values(shapes)
    .flat(4)
    .map((shape) => roundDeep(shape.toJSON()));

  const withKeys = shapeData.map((data) => ({data, key: stableStringify(data)}));
  withKeys.sort((a, b) => a.key.localeCompare(b.key));

  return {
    shapes: withKeys.map(({data}) => data)
  };
};
