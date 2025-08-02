import {colord} from "colord";

//todo implement text property
export class ShapeText {
  constructor(color) {
    this.color = $state(colord(color));
    this.fontSize = $state(12);
    this.bold = $state(false);
    this.italic = $state(false);
    this.underline = $state(false);
    this.value = $state("Text here");
  }

  toJSON() {
    return {
      color: this.color.toHex(),
      fontSize: this.fontSize,
      bold: this.bold,
      italic: this.italic,
      underline: this.underline,
    }
  }
}