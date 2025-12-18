<script>
  import Circle from "./Shapes/Circle/Circle.svelte";
  import {Circle as CircleClass} from "./Shapes/Circle/circle.svelte.js";
  import {Arrow as ArrowClass} from "./Shapes/Arrow/arrow.svelte.js";
  import {GraphText as GraphTextClass} from "./Shapes/Text/GraphText.svelte.js";
  import {Square as SquareClass} from "./Shapes/Square/square.svelte.js";
  import Square from "./Shapes/Square/Square.svelte";
  import Arrow from "./Shapes/Arrow/Arrow.svelte";
  import DraggableObject from "./Shapes/DraggableObject.svelte.js";
  import Shape from "./Shapes/Shape.svelte";
  import EditShape from "./Edit Shape Window/EditShape.svelte";
  import GraphText from "./Shapes/Text/GraphText.svelte";
  import ResizeFromEdges from "./Shapes/ResizeFromEdges.svelte";
  import Clipboard from "./Clipboard.svelte";
  import {fade} from "svelte/transition";
  import HandleSnap from "./Shapes/HandleSnap.svelte";

  const DEFAULT_PRIMARY_SEP = 40;
  const DEFAULT_SECONDARY_SEP = 20;

  let offset = $state({x: 0, y: 0});
  let canvasScale = $state(1);

  let materialsRef = $state();

  let offsetBefore = {x: 0, y: 0};
  let highlightSelection = $state(false);
  let highlightDimensions = $state({x1: 0, y1: 0, x2: 0, y2: 0});

  const moveGrid = new DraggableObject(
    (event) => {
      highlightSelection = event.ctrlKey || event.metaKey;
      offsetBefore.x = offset.x;
      offsetBefore.y = offset.y;

      highlightDimensions.x1 = highlightDimensions.x2 = event.clientX - materialsRef.offsetWidth;
      highlightDimensions.y1 = highlightDimensions.y2 = event.clientY;
    },
    (dx, dy) => {
      // we want to select things whilst still being able to move the highlight
      if (highlightSelection) {
        highlightDimensions.x2 = highlightDimensions.x1 + dx;
        highlightDimensions.y2 = highlightDimensions.y1 + dy;
        return;
      }
      if (selectedShapes.length !== 0) return;
      offset.x = offsetBefore.x + dx;
      offset.y = offsetBefore.y + dy;
    },
    () => {
      highlightSelection = false;
    });

  let shapes = $state({
    circles: [],
    arrows: [],
    squares: [],
    texts: [],
  })
  let selectedShapes = $derived(Object.values(shapes).flat(4).filter(shape => shape.selected))
  let editShapeContainerRef = $state();

  let shapeProps = $derived({
    editShapeContainerRef,
    highlightSelection,
    highlightDimensions,
    selectedShapes,
  });

  const addShape = (array, ShapeClassRef, shapeProperties) => {
    array.push(new ShapeClassRef(offset, () => array, () => canvasScale, shapeProperties));
  }

  export const removeObject = (array, index) => {
    // need selected to be false so popup transition out plays
    array[index].selected = false;
    setTimeout(() => { // idk why but we also need timemeout
      array.splice(index, 1);
    });
  }

  const clear = () => {
    Object.keys(shapes).forEach(shapeArray => {
      shapes[shapeArray] = [];
    })
  }

  const changeScale = (event) => {
    canvasScale = event.target?.value ?? 1;
  }

  const mapShapeToArray = (shapeString) => {
    switch (shapeString.toLowerCase()) {
      case "circle":
        return {array: shapes.circles, class: CircleClass};
      case "arrow":
        return {array: shapes.arrows, class: ArrowClass};
      case "square":
        return {array: shapes.squares, class: SquareClass};
      case "graphtext":
        return {array: shapes.texts, class: GraphTextClass};
    }
  }

</script>

<Clipboard {selectedShapes} addShape={(shapeString, shapeProperties) => {
  const shapeAdder = mapShapeToArray(shapeString);
  addShape(shapeAdder.array, shapeAdder.class, shapeProperties);
}}/>

<div class="container">
  <div class="materials" bind:this={materialsRef}>
    <div style="height: 30%">
      <button class="button" onclick={() => addShape(shapes.circles, CircleClass)}>Add Circle</button>
      <button class="button" onclick={() => addShape(shapes.arrows, ArrowClass)}>Add Arrow</button>
      <button class="button" onclick={() => addShape(shapes.texts, GraphTextClass)}>Add Text</button>
      <button class="button" onclick={() => addShape(shapes.squares, SquareClass)}>Add Square</button>
      <button class="button" onclick="{clear}">Clear</button>
      <button class="button" onclick="{() => changeScale(1)}">Reset scale</button>
      <button class="button" onclick="{() => {offset.x = 0; offset.y = 0;}}">Reset Position</button>
      <input type="range" min="0.3" max="2" step="0.1" oninput="{changeScale}">
    </div>

    <EditShape bind:container={editShapeContainerRef} bind:shapes={selectedShapes}/>
  </div>


  <svg
    style="background-position: {offset.x}px {offset.y}px;
    --big-line-sep: {DEFAULT_PRIMARY_SEP * canvasScale}px;
    --small-line-sep: {DEFAULT_SECONDARY_SEP * canvasScale}px;"
    onmousedown="{moveGrid.setDrag}"
    class="canvas"
    role="presentation"
    aria-label="Interactive canvas"
    xmlns="http://www.w3.org/2000/svg"
  >


    <!-- need to key each block so transition doesn't happen on object that isn't deleted-->
    {#each Object.entries(shapes) as [shapesName, shapeList] (shapesName)}
      {#each shapeList as shape, index (shape)}
        <Shape bind:shape={shapeList[index]} {...shapeProps}>
          {#if shapesName === "circles"}
            <Circle bind:circle={shapes.circles[index]}/>
            <ResizeFromEdges bind:shape={shapes.circles[index]}/>

          {:else if shapesName === "squares"}
            <Square bind:square={shapes.squares[index]}/>
            <ResizeFromEdges bind:shape={shapes.squares[index]}/>

          {:else if shapesName === "texts"}
            <GraphText bind:text={shapes.texts[index]}/>
            <ResizeFromEdges bind:shape={shapes.texts[index]}/>

          {:else if shapesName === "arrows"}
            <Arrow bind:arrow={shapes.arrows[index]} {index}/>
            <HandleSnap arrow={shape} {shapes}/>
          {/if}
        </Shape>
      {/each}
    {/each}

    <circle cx="{offset.x}" cy="{offset.y}" r="2" fill="red"></circle>

    {#if highlightSelection === true}
      <polyline out:fade={{duration: 150}}
                points="
          {highlightDimensions.x1} {highlightDimensions.y1}
          {highlightDimensions.x2} {highlightDimensions.y1}
          {highlightDimensions.x2} {highlightDimensions.y2}
          {highlightDimensions.x1} {highlightDimensions.y2}
          {highlightDimensions.x1} {highlightDimensions.y1}"
                fill="#FFFFFF44" stroke="#CCC"></polyline>
    {/if}
  </svg>

  <div class="toolbox">
    <p>CanMoveGrid: {selectedShapes.length !== 0}</p>
    <p>Offset: {offset.x}, {offset.y}</p>
    <p>Drag Position Before: {offsetBefore.x}, {offsetBefore.y}</p>
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 45% 55%;
    grid-template-rows: 65% 1fr;
    grid-template-areas:
      'materials canvas'
      'materials toolbox';
    height: 98vh;
  }

  .materials {
    grid-area: materials;
    border-right: var(--mainBorder);
    resize: horizontal;
    border-right: var(--mainBorder);
    display: flex;
    flex-direction: column;
  }

  /*.materials-border {*/
  /*  height: 100%;*/
  /*  width: 2px;*/
  /*  background-color: white;*/
  /*  position: absolute;*/
  /*  right: 0;*/
  /*  top:0;*/
  /*  cursor: ew-resize;*/
  /*}*/

  .canvas {
    grid-area: canvas;
    background-color: var(--canvasBg);
    background-image: /* big lines */ linear-gradient(to right, rgba(255, 255, 255, 0.08) 2px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 2px, transparent 1px),
      /* small lines */ linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);

    background-size: var(--big-line-sep) var(--big-line-sep), var(--big-line-sep) var(--big-line-sep),
    var(--small-line-sep) var(--small-line-sep), var(--small-line-sep) var(--small-line-sep);
    background-repeat: repeat;
    cursor: move;

    position: relative;
    overflow: hidden;

    width: 100%;
    height: 100%;
  }

  .toolbox {
    border-top: var(--mainBorder);
    grid-area: toolbox;
    background-color: var(--secondaryBg);
  }

</style>
