import {BasicShape} from "../shape.svelte.js";

export class Triangle extends BasicShape {

  constructor(offset, getShapeArray, canvasScale, properties = {strokeWidth: 1, strokeColor: "black"}) {
    super(offset, getShapeArray, canvasScale, properties);

    this.coords = $derived.by(() => {
      // Get axis-aligned top-left for calculating triangle points
      const aabbTopLeft = this.getAxisAlignedTopLeft();

      return {
        point1: {
          x: aabbTopLeft.x + this.width / 2,
          y: aabbTopLeft.y
        },
        point2: {
          x: aabbTopLeft.x,
          y: aabbTopLeft.y + this.height
        },
        point3: {
          x: aabbTopLeft.x + this.width,
          y: aabbTopLeft.y + this.height
        }
      };
    });
  }

  // todo make this standardized maybe in BasicShape
  isInside(x1, y1, x2, y2) {
    if (x2 < x1) {
      [x1, x2] = [x2, x1];
    }

    if (y2 < y1) {
      [y1, y2] = [y2, y1];
    }

    const pointInside = (px, py) => px > x1 && px < x2 && py > y1 && py < y2;

    return (
      pointInside(this.coords.point1.x, this.coords.point1.y) ||
      pointInside(this.coords.point2.x, this.coords.point2.y) ||
      pointInside(this.coords.point3.x, this.coords.point3.y)
    );
  }
}


export default Triangle;