import rotateCords from "$lib/rotateCords.js";
import {Arrow} from "./arrow.svelte.js";

const DEFAULT_CURVE_OFFSET = 60;

export class CurvedArrow extends Arrow {
  constructor(offset, properties = {text: {color: "white"}}, removeShape) {
    super(offset, properties, removeShape);

    const base = {
      x: this.middle.x + this.unitVectors.perp.x * DEFAULT_CURVE_OFFSET,
      y: this.middle.y + this.unitVectors.perp.y * DEFAULT_CURVE_OFFSET
    };

    this.cx = $state(properties.cx ?? base.x - this.offset.x);
    this.cy = $state(properties.cy ?? base.y - this.offset.y);

    this.curveControl = $derived({
      x: this.cx + this.offset.x,
      y: this.cy + this.offset.y
    });

    this.bezierControl = $derived.by(() => {
      const x = (2 * this.curveControl.x) - (this.position.x1 + this.position.x2) / 2;
      const y = (2 * this.curveControl.y) - (this.position.y1 + this.position.y2) / 2;
      return {x, y};
    });

    this.curveMiddle = $derived.by(() => this.getQuadraticPoint(0.5));
    this.curveTangent = $derived.by(() => this.getQuadraticTangent(0.5));
  }

  getQuadraticPoint(t) {
    const inv = 1 - t;
    return {
      x: (inv * inv * this.position.x1) +
        (2 * inv * t * this.bezierControl.x) +
        (t * t * this.position.x2),
      y: (inv * inv * this.position.y1) +
        (2 * inv * t * this.bezierControl.y) +
        (t * t * this.position.y2)
    };
  }

  getQuadraticTangent(t) {
    const dx = (2 * (1 - t) * (this.bezierControl.x - this.position.x1)) +
      (2 * t * (this.position.x2 - this.bezierControl.x));
    const dy = (2 * (1 - t) * (this.bezierControl.y - this.position.y1)) +
      (2 * t * (this.position.y2 - this.bezierControl.y));
    const fallbackDx = this.position.x2 - this.position.x1;
    const fallbackDy = this.position.y2 - this.position.y1;
    const primaryLength = Math.hypot(dx, dy);
    const fallbackLength = Math.hypot(fallbackDx, fallbackDy);
    const length = primaryLength || fallbackLength || 1;
    const dir = primaryLength ? {x: dx / length, y: dy / length} :
      {x: fallbackDx / length, y: fallbackDy / length};
    return {
      dir,
      perp: {x: -dir.y, y: dir.x}
    };
  }

  getEndpointVectors(isStart) {
    return this.getQuadraticTangent(isStart ? 0 : 1);
  }

  captureCurveControl(dragState) {
    dragState.cx = this.cx;
    dragState.cy = this.cy;
  }

  moveCurveControlPoint(dx, dy) {
    this.cx = this.dragState.cx + dx;
    this.cy = this.dragState.cy + dy;
  }

  set rotation(targetRotation) {
    const fixedMiddle = {x: this.middle.x, y: this.middle.y};
    const currentRotation = this.rotation;

    super.rotation = targetRotation;

    const rotationDelta = targetRotation - currentRotation;
    const newCurveControl = rotateCords(this.curveControl.x, this.curveControl.y, fixedMiddle, rotationDelta);
    this.cx = newCurveControl.x - this.offset.x;
    this.cy = newCurveControl.y - this.offset.y;
  }

  get rotation() {
    return super.rotation;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      cx: this.cx,
      cy: this.cy
    };
  }
}

export default CurvedArrow;
