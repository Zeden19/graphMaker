import {colord} from "colord";
import {Box} from "../Box.svelte.js";

const DEFAULT_SIZE = 200


export class Square extends Box {
  constructor(offset, getShapeArray, canvasScale, properties = {width: DEFAULT_SIZE, height: DEFAULT_SIZE}) {
    super(offset, getShapeArray, canvasScale, properties);
    this.strokeColor = $state(colord(properties.strokeColor ?? "black"));
    this.strokeWidth = $state(properties.strokeWidth ?? 2);
  }

  toJSON() {
    return {...super.toJSON(), strokeColor: this.strokeColor.toHex(), strokeWidth: this.strokeWidth};
  }
}