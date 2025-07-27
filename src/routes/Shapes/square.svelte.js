import {Shape} from "./shape.svelte.js";
import {colord} from "colord";
import {ShapeText} from "./Text/Text.svelte.js";

const DEFAULT_SIZE = 200

export class Square extends Shape {
  constructor(offset, canvasScale, getShapeArray) {
    super(offset, "Square", colord("white"), getShapeArray);
    this.width = $state(DEFAULT_SIZE);
    this.height = $state(DEFAULT_SIZE);
    this.text = new ShapeText("black");
    this.strokeColor = $state(colord("black"));
    this.strokeWidth = $state(2);

    this.widthWithScale = $derived(this.width * canvasScale());
    this.heightWithScale = $derived(this.height * canvasScale());
  }
}