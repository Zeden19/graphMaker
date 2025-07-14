const bottomRightAngle = 45 * Math.PI / 180; // 45 degrees
const bottomLeftAngle = 135 * Math.PI / 180; // 135 degrees
const topRightAngle = 315 * Math.PI / 180; // 315 degrees
const topLeftAngle = 225 * Math.PI / 180; // 225 degrees

export class Circle {
  constructor(x, y, r, color, offset, canvasScale) {
    this.x = $state(x);
    this.y = $state(y);
    this.r = $state(r);
    this.color = $state(color);
    this.selected = $state(false);

    this.positionX = $derived(offset.x + this.x);
    this.positionY = $derived(offset.y + this.y);
    this.radiusWithScale = $derived(canvasScale() * this.r);


    this.circleRect = $derived(
      {
        top: {
          x: this.positionX, y: this.positionY - this.radiusWithScale,
        },
        bottom: {
          x: this.positionX, y: this.positionY + this.radiusWithScale,
        },
        left: {
          x: this.positionX - this.radiusWithScale, y: this.positionY,
        },
        right: {
          x: this.positionX + this.radiusWithScale, y: this.positionY,
        },

        bottomRight: this.#createCornerPos(bottomRightAngle),
        bottomLeft: this.#createCornerPos(bottomLeftAngle),
        topLeft: this.#createCornerPos(topLeftAngle),
        topRight: this.#createCornerPos(topRightAngle),
      }
    );
  }

  // arrow function for "this" value
  // see: https://svelte.dev/docs/svelte/$state#Passing-state-into-functions
  //todo: definately need to figure out a way to combine classes into generic shape object
  delete = () => {
    dispatchEvent(new CustomEvent('deleteShape', {detail: {shape: this, type: "circle"}}));
  }

  #createCornerPos(angle) {
    return {
      x: this.positionX + this.radiusWithScale * Math.cos(angle),
      y: this.positionY + this.radiusWithScale * Math.sin(angle)
    };
  }
}


