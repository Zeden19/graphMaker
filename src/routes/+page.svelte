<script>
  import Circle from "./Shapes/Circle/Circle.svelte";
  import {Circle as CircleClass} from "./Shapes/Circle/circle.svelte.js";
  import {Arrow as ArrowClass} from "./Shapes/Arrow/arrow.svelte.js";
  import {GraphText as GraphTextClass} from "./Shapes/Text/Text.svelte.js";
  import {Square as SquareClass} from "./Shapes/Square/square.svelte.js";
  import Square from "./Shapes/Square/Square.svelte";
  import {extend} from "colord";
  import namesPlugin from "colord/plugins/names";
  import Arrow from "./Shapes/Arrow/Arrow.svelte";
  import DraggableObject from "./Shapes/DraggableObject.svelte.js";
  import Shape from "./Shapes/Shape.svelte";
  import EditShape from "./Edit Shape Window/EditShape.svelte";
  import GraphText from "./Shapes/Text/GraphText.svelte";

  extend([namesPlugin]);

  const DEFAULT_PRIMARY_SEP = 40;
  const DEFAULT_SECONDARY_SEP = 20;

  let offset = $state({x: 0, y: 0});
  let canvasScale = $state(1);

  let offsetBefore = {x: 0, y: 0};
  const moveGrid = new DraggableObject(
    () => {
      offsetBefore.x = offset.x;
      offsetBefore.y = offset.y;
    },
    (dx, dy) => {
      if (selectedShape !== undefined) return;
      offset.x = offsetBefore.x + dx
      offset.y = offsetBefore.y + dy
    })

  // use a object with lists instead of separate lists?
  let circles = $state([]);
  let arrows = $state([]);
  let squares = $state([]);
  let texts = $state([]);
  let selectedShape = $derived([...circles, ...arrows, ...texts, ...squares].find(shape => shape.selected));
  let editShapeContainerRef = $state();


  const addShape = (array, ShapeClassRef) => {
    array.push(new ShapeClassRef(offset, () => canvasScale, () => array));
  }

  export const removeObject = (array, index) => {
    // need selected to be false so popup transition out plays
    array[index].selected = false;
    setTimeout(() => { // idk why but we also need timemeout
      array.splice(index, 1);
    });
  }

  const clear = () => {
    circles = [];
    arrows = [];
  }

  const changeScale = (event) => {
    canvasScale = event.target?.value ?? 1;
  }

</script>

<div class="container">

  <div class="materials">
    <div style="height: 30%">
      <button class="button" onclick={() => addShape(circles, CircleClass)}>Add Circle</button>
      <button class="button" onclick={() => addShape(arrows, ArrowClass)}>Add Arrow</button>
      <button class="button" onclick={() => addShape(texts, GraphTextClass)}>Add Text</button>
      <button class="button" onclick={() => addShape(squares, SquareClass)}>Add Square</button>
      <button class="button" onclick="{clear}">Clear</button>
      <button class="button" onclick="{() => changeScale(1)}">Reset scale</button>
      <button class="button" onclick="{() => {offset.x = 0; offset.y = 0;}}">Reset Position</button>
      <input type="range" min="0.3" max="2" step="0.1" oninput="{changeScale}">
    </div>

    <EditShape bind:container={editShapeContainerRef} bind:shape={selectedShape}/>
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
    {#each circles as circle, index (circle)}
      <Shape bind:shape={circles[index]} {editShapeContainerRef}>
        <Circle bind:circle={circles[index]} removeCircle={() => removeObject(circles,index)}/>
      </Shape>
    {/each}

    {#each arrows as arrow, index (arrow)}
      <Shape bind:shape={arrows[index]} {editShapeContainerRef}>
        <Arrow bind:arrow={arrows[index]} {offset} {index}
               removeArrow={() => removeObject(arrows,index)}/>
      </Shape>
    {/each}

    {#each texts as text, index (text)}
      <Shape bind:shape={texts[index]} {editShapeContainerRef}>
        <GraphText bind:text={texts[index]}
                   removeText={() => removeObject(texts,index)}/>
      </Shape>
    {/each}

    {#each squares as square, index (square)}
      <Shape bind:shape={squares[index]} {editShapeContainerRef}>
        <Square bind:square={squares[index]} removeSquare={() => removeObject(squares,index)}/>
      </Shape>
    {/each}

    <circle cx="{offset.x}" cy="{offset.y}" r="2" fill="red"></circle>
  </svg>

  <div class="toolbox">
    <p>CanMoveGrid: {selectedShape === undefined}</p>
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
