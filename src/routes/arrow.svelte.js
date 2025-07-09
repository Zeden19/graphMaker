const MARKER_SIZE = 4;

export class Arrow {
  constructor(x1, x2, y1, y2, width, color, offset, canvasScale) {
    this.x1 = $state(x1);
    this.x2 = $state(x2);
    this.y1 = $state(y1);
    this.y2 = $state(y2);
    this.width = width
    this.color = $state(color);
    this.selected = $state(false);

    this.startSnapped = $state(null);
    this.endSnapped = $state(null);

    this.positionX1 = $derived.by(() => {
      if (this.startSnapped !== null) {
        return this.startSnapped().x
      }
      return offset.x + this.x1
    });
    this.positionX2 = $derived.by(() => {
      if (this.endSnapped !== null) {
        return this.endSnapped().x
      }
      return offset.x + this.x2
    });
    this.positionY1 = $derived.by(() => {
      if (this.startSnapped !== null) {
        return this.startSnapped().y
      }
      return offset.y + this.y1
    });
    this.positionY2 = $derived.by(() => {
      if (this.endSnapped !== null) {
        return this.endSnapped().y
      }
      return offset.y + this.y2
    });
    this.widthWithScale = $derived({marker: MARKER_SIZE * canvasScale(), line: this.width * canvasScale()});
  }
}


export default Arrow;