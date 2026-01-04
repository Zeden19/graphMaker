import {Box} from "../Box.svelte.js";

const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 20;

export class GraphText extends Box {
  constructor(offset, canvasScale,
              properties = {
                width: DEFAULT_WIDTH,
                height: DEFAULT_HEIGHT,
                strokeColor: "white",
                strokeWidth: 0,
                text: {color: "white"}
              }, removeShape) {
    super(offset, canvasScale, properties, removeShape);
  }
}