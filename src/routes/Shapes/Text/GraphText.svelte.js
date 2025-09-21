import {Box} from "../Box.svelte.js";

const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 20;

export class GraphText extends Box {
  constructor(offset, getShapeArray, canvasScale, properties = {width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT}) {
    super(offset, getShapeArray, canvasScale, properties);
  }
}