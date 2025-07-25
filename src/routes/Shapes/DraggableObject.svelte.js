// this might be able to render if i put this into a component instead of js file. test later.
class DraggableObject {
  constructor(setFunc, moveFunc) {
    this.mousePosBefore = {x: 0, y: 0};
    this.isDragging = $state(false);
    this.setFunc = setFunc;
    this.moveFunc = moveFunc;
  }

  setDrag = (event) => {
    this.mousePosBefore.x = event.clientX;
    this.mousePosBefore.y = event.clientY;
    this.setFunc(event, this.mousePosBefore.x, this.mousePosBefore.y);

    const moveObject = (event) => {
      this.isDragging = true;
      const dx = event.clientX - this.mousePosBefore.x;
      const dy = event.clientY - this.mousePosBefore.y;

      this.moveFunc(dx, dy);
    };

    window.addEventListener("mousemove", moveObject);
    window.addEventListener("mouseup", () => {
      this.isDragging = false;
      window.removeEventListener("mousemove", moveObject);
    }, {once: true});
  };
}

export class DraggableShape extends DraggableObject {
  shapePosBefore = {x: 0, y: 0};
  constructor(shape) {
    super(
      () => {
        shape().selected = true;
        this.shapePosBefore.x = shape().x;
        this.shapePosBefore.y = shape().y;
      },
      (dx, dy) => {
        shape().x = dx + this.shapePosBefore.x;
        shape().y = dy + this.shapePosBefore.y;
      })
  }
}

export default DraggableObject;