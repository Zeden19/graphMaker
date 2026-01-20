import {ShapeText} from "./Text/ShapeText.svelte.js";
import rotateCords from "$lib/rotateCords.js";
import isHighlightInsideShape from "$lib/isInside.js";
import DraggableObject from "./DraggableObject.svelte.js";
import extractCoordinates from "$lib/extractCoordinates.js";

export class Shape {
  constructor(offset, properties = {}, removeShape) {
    const propertiesWithDefaults = {...this.constructor.defaultProperties, ...properties}
    this.selected = $state(false);
    this.color = $state(propertiesWithDefaults.color ?? "white");
    this.strokeColor = $state(propertiesWithDefaults.strokeColor ?? "black");
    this.strokeWidth = $state(propertiesWithDefaults.strokeWidth ?? 2);
    this.strokeStyle = $state(propertiesWithDefaults.strokeStyle ?? "0");
    this.text = $state(new ShapeText(propertiesWithDefaults.text ?? {}));
    this.removeShape = removeShape;
    this.isDeleting = $state(false);
    this.shapePosBefore = {};
    this.gRef = $state();

    this.offset = offset;

    this.drag = new DraggableObject(() => {
        Object.entries(extractCoordinates(this)).forEach(([key, value]) => {
          this.shapePosBefore[key] = value;
        });
      },
      (dx, dy) => {
        Object.keys(extractCoordinates(this)).forEach((key) => {
          this[key] = (key.includes("x") ? dx : dy) + this.shapePosBefore[key];
        });
      });
  }

  toJSON() {
    return {
      color: this.color,
      text: JSON.parse(JSON.stringify(this.text)),
      toString: this.toString(),
      strokeWidth: this.strokeWidth,
      strokeColor: this.strokeColor,
      strokeStyle: this.strokeStyle
    }
  }

  delete() {
    this.removeShape(this)
  }

  setDrag = (event) => {
    this.drag.setDrag(event);
  }

  toString() {
    return this.constructor.name;
  }
}

const DEFAULT_X = 350;
const DEFAULT_Y = 250;
const DEFAULT_SIZE = 100;
const MIN_SIZE = 10;

export class BasicShape extends Shape {
  #width = $state();
  #height = $state();

  constructor(offset, properties = {}, removeShape) {
    super(offset, properties, removeShape);
    const propertiesWithDefaults = {...this.constructor.defaultProperties, ...properties}

    this.rotation = $state(propertiesWithDefaults.rotation ?? 0);
    this.#width = propertiesWithDefaults.width ?? DEFAULT_SIZE;
    this.#height = propertiesWithDefaults.height ?? DEFAULT_SIZE;

    // Store center position internally
    this.x = $state((propertiesWithDefaults.x ?? DEFAULT_X - offset.x) + this.#width / 2);
    this.y = $state((propertiesWithDefaults.y ?? DEFAULT_Y - offset.y) + this.#height / 2);

    // Derived center in canvas space
    this.center = $derived({
      x: offset.x + this.x,
      y: offset.y + this.y
    });

    // Derive the ROTATED top-left corner
    this.position = $derived(() => {
      const cx = this.center.x;
      const cy = this.center.y;
      const w = this.#width;
      const h = this.#height;
      const rad = (this.rotation * Math.PI) / 180;

      // Vector from center to unrotated top-left
      const dx = -w / 2;
      const dy = -h / 2;

      // Rotate this vector
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rotatedDx = dx * cos - dy * sin;
      const rotatedDy = dx * sin + dy * cos;

      return {
        x: cx + rotatedDx,
        y: cy + rotatedDy
      };
    });

    // Get the axis-aligned bounding box for handle positioning
    let aabbTopLeft = $derived(this.getAxisAlignedTopLeft());

    this.points = $derived([
      { // top-left
        handle: "topLeft",
        bbox: true,
        x: aabbTopLeft.x - this.strokeWidth,
        y: aabbTopLeft.y - this.strokeWidth,
        resizeFnc: (dx, dy, width, height) => {
          this.changeTop(dy, height);
          this.changeLeft(dx, width);
        }
      },
      {   // top-center
        handle: "top",
        x: aabbTopLeft.x + this.width / 2,
        y: aabbTopLeft.y - this.strokeWidth,
        resizeFnc: (dx, dy, width, height) => {
          this.changeTop(dy, height);
        }
      },
      {    // top-right
        handle: "topRight",
        bbox: true,
        x: aabbTopLeft.x + this.width + this.strokeWidth,
        y: aabbTopLeft.y - this.strokeWidth,
        resizeFnc: (dx, dy, width, height) => {
          this.changeTop(dy, height);
          this.changeRight(dx, width);
        }
      },
      {   // middle-right
        handle: "right",
        x: aabbTopLeft.x + this.width + this.strokeWidth,
        y: aabbTopLeft.y + this.height / 2,
        resizeFnc: (dx, dy, width) => {
          this.changeRight(dx, width);
        }
      },
      {   // bottom-right
        handle: "bottomRight",
        bbox: true,
        x: aabbTopLeft.x + this.width + this.strokeWidth,
        y: aabbTopLeft.y + this.height + this.strokeWidth,
        resizeFnc: (dx, dy, width, height) => {
          this.changeBottom(dy, height);
          this.changeRight(dx, width);
        }
      },
      {   // bottom-center
        handle: "bottom",
        x: aabbTopLeft.x + this.width / 2,
        y: aabbTopLeft.y + this.height + this.strokeWidth,
        resizeFnc: (dx, dy, width, height) => {
          this.changeBottom(dy, height);
        }
      },
      {   // bottom-left
        handle: "bottomLeft",
        bbox: true,
        x: aabbTopLeft.x - this.strokeWidth,
        y: aabbTopLeft.y + this.height + this.strokeWidth,
        resizeFnc: (dx, dy, width, height) => {
          this.changeBottom(dy, height);
          this.changeLeft(dx, width);
        }
      },
      {  // middle-left
        handle: "left",
        x: aabbTopLeft.x - this.strokeWidth,
        y: aabbTopLeft.y + this.height / 2,
        resizeFnc: (dx, dy, width) => {
          this.changeLeft(dx, width);
        }
      }
    ].map(point => {
      return {
        ...rotateCords(point.x, point.y, this.center, this.rotation),
        bbox: point.bbox,
        resizeFnc: point.resizeFnc,
        handle: point.handle
      };
    }));

    this.corners = $derived(this.points.filter(point => point.bbox).map(point => {
      return {x: point.x, y: point.y}
    }));
  }

  set width(width) {
    this.#width = Math.max(width, MIN_SIZE);
  }

  set height(height) {
    this.#height = Math.max(height, MIN_SIZE);
  }

  get height() {
    return this.#height;
  }

  get width() {
    return this.#width;
  }

  changeRight(dx, sizeBeforeWidth) {
    const newWidth = Math.max(dx + sizeBeforeWidth, MIN_SIZE);
    const widthDelta = newWidth - this.#width;

    const rad = (this.rotation * Math.PI) / 180;
    this.x += (widthDelta / 2) * Math.cos(rad);
    this.y += (widthDelta / 2) * Math.sin(rad);

    this.#width = newWidth;
  }

  changeBottom(dy, sizeBeforeHeight) {
    const newHeight = Math.max(dy + sizeBeforeHeight, MIN_SIZE);
    const heightDelta = newHeight - this.#height;

    const rad = (this.rotation * Math.PI) / 180;
    this.x -= (heightDelta / 2) * Math.sin(rad);
    this.y += (heightDelta / 2) * Math.cos(rad);

    this.#height = newHeight;
  }

  changeLeft(dx, sizeBeforeWidth) {
    const newWidth = Math.max(sizeBeforeWidth - dx, MIN_SIZE);
    const widthDelta = this.#width - newWidth;

    const rad = (this.rotation * Math.PI) / 180;
    this.x += (widthDelta / 2) * Math.cos(rad);
    this.y += (widthDelta / 2) * Math.sin(rad);

    this.#width = newWidth;
  }

  changeTop(dy, sizeBeforeHeight) {
    const newHeight = Math.max(sizeBeforeHeight - dy, MIN_SIZE);
    const heightDelta = this.#height - newHeight;

    const rad = (this.rotation * Math.PI) / 180;
    this.x -= (heightDelta / 2) * Math.sin(rad);
    this.y += (heightDelta / 2) * Math.cos(rad);

    this.#height = newHeight;
  }

  getAxisAlignedTopLeft() {
    return {
      x: this.center.x - this.#width / 2,
      y: this.center.y - this.#height / 2
    };
  }

  toJSON() {
    return {
      ...super.toJSON(),
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      x: this.x,
      y: this.y
    };
  }

  // i don't want to look at the code, so i put it elsewhere
  isInside(x1, y1, x2, y2) {
    return isHighlightInsideShape(x1, y1, x2, y2, this.corners);
  }
}
