class DraggableObject {
  constructor(setFunc, moveFunc, endFunc) {
    this.mousePosBefore = {x: 0, y: 0};
    this.isDragging = $state(false);
    this.setFunc = setFunc;
    this.moveFunc = moveFunc;
    this.endFunc = endFunc;
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
      this.endFunc?.();
      window.removeEventListener("mousemove", moveObject);
    }, {once: true});
  };
}

export default DraggableObject;