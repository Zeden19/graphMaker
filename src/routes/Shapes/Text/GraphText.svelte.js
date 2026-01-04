import {Box} from "../Box.svelte.js";

const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 20;

export class GraphText extends Box {
  static defaultProperties = {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    strokeColor: "white",
    strokeWidth: 0,
    text: {color: "white"}
  }
}