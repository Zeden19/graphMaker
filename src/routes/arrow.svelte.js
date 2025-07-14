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

    this.position = $derived.by(() => {
      let start;
      let end;

      if (this.startSnapped) start = {x1: this.startSnapped().x, y1: this.startSnapped().y};
      else start = {x1: this.x1 + offset.x, y1: this.y1 + offset.y};

      if (this.endSnapped) end = {x2: this.endSnapped().x, y2: this.endSnapped().y};
      else end = {x2: this.x2 + offset.x, y2: this.y2 + offset.y};

      return {...start, ...end}
    });

    this.widthWithScale = $derived({marker: MARKER_SIZE * canvasScale(), line: this.width * canvasScale()});
    this.middle = $derived({
      x: (this.position.x1 + this.position.x2) / 2,
      y: (this.position.y1 + this.position.y2) / 2
    });
    this.length = $derived(Math.sqrt(((this.position.x2 - this.position.x1) ** 2) + ((this.position.y2 - this.position.y1) ** 2)))
    this.rotation = $derived(Math.atan((this.position.y2 - this.position.y1) / (this.position.x2 - this.position.x1)));
  }

  delete = () => {
    dispatchEvent(new CustomEvent('deleteShape', {detail: {shape: this, type: "arrow"}}));
  }
}


export default Arrow;