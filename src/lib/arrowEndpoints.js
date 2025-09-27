export const arrowEndpoints = {
  "": () => "",
  "←": (arrow) => `<path fill="${arrow.color.toHex()}" d="M 0 0 L 10 5 L 0 10 z"/>`,
  "●": (arrow) => `<circle r="${arrow.widthWithScale.marker}" fill="${arrow.color.toHex()}" cx="5" cy="5"></circle>`,
  "■": (arrow) => `<rect x="0.5" y="0.5" width="${arrow.widthWithScale.marker + 5}" height="${arrow.widthWithScale.marker + 5}" fill="${arrow.color.toHex()}"></rect>`,
  "❘": (arrow) => `<line stroke-width="${arrow.widthWithScale.marker}" stroke="${arrow.color.toHex()}" x1="5" y1="0" x2="5" y2="10"></line>`
};

// Get labels for select list
export const arrowEndpointLabels = Object.keys(arrowEndpoints);