import {Box} from "../Box.svelte.js";

const DEFAULT_SIZE = 200


export class Square extends Box {
  constructor(offset, canvasScale, properties = {width: DEFAULT_SIZE, height: DEFAULT_SIZE}, removeShape) {
    super(offset, canvasScale, properties, removeShape);
  }
}