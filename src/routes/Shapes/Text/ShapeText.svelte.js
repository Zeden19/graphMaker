import {colord} from "colord";

export class ShapeText {
  constructor({
                color = "white",
                fontSize = 12,
                bold = false,
                italic = false,
                underline = false,
                value = "Text Here"
              }) {
    this.color = $state(colord(color));
    this.fontSize = $state(fontSize);
    this.bold = $state(bold);
    this.italic = $state(italic);
    this.underline = $state(underline);
    this.value = $state(value);
  }

  toJSON() {
    return {
      color: this.color.toHex(),
      fontSize: this.fontSize,
      bold: this.bold,
      italic: this.italic,
      underline: this.underline,
      value: this.value,
    }
  }
}