export const strokeStyles = {
  Solid: "0",
  "Regular Dash": "5 5",
  "Spaced Dash": "5 10",
  "Tight Dash": "10 5",
  "Ultra Tight Dash": "5 1",
  "Ultra Spaced Dash": "1 5",
  "Ultra Tiny Tight Dash": "0.9",
  "Weird Spaced": "15 10 5",
  Complex: "5, 5, 1, 5",
};

export const strokeStyleOptions = Object.entries(strokeStyles).map(([label, value]) => ({
  label,
  value,
  dash: value
}));
