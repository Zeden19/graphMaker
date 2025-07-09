<script>
  import Circle from "./Circle.svelte";
  import {Circle as CircleClass} from "./circle.svelte.js";
  import {Arrow as ArrowClass} from "./arrow.svelte.js";
  import {colord, extend} from "colord";
  import namesPlugin from "colord/plugins/names";
  import Arrow from "./Arrow.svelte";
  import DraggableObject from "./DraggableObject.svelte.js";
  import Shape from "./Shape.svelte";

  const INSERT_POSITION = 300;
  const DEFAULT_PRIMARY_SEP = 40;
  const DEFAULT_SECONDARY_SEP = 20;
  const CIRCLE_BASE_RADIUS = 80;
  const ARROW_BASE_WIDTH = 5;

  extend([namesPlugin]);

  let offsetBefore = $state({x: 0, y: 0});
  let offset = $state({x: 0, y: 0});
  let canvasScale = $state(1);

  const moveGrid = new DraggableObject(
    () => {
      offsetBefore.x = offset.x;
      offsetBefore.y = offset.y;
    },
    (dx, dy) => {
      if (!canMoveGrid) return;
      offset.x = offsetBefore.x + dx
      offset.y = offsetBefore.y + dy
    })

  let circles = $state([]);
  let arrows = $state([]);
  let canMoveGrid = $derived(circles.every(circle => !circle.selected) && arrows.every(arrow => !arrow.selected));

  // negative 1 because offset is opposite of the canvas position
  const addCircle = () => {
    circles.push(new CircleClass(
      INSERT_POSITION,
      INSERT_POSITION,
      CIRCLE_BASE_RADIUS,
      colord("white"), offset, () => canvasScale) // need to function so it proxies
    );
  }

  const addArrow = () => {
    arrows.push(new ArrowClass(
      INSERT_POSITION,
      INSERT_POSITION,
      INSERT_POSITION + 100,
      INSERT_POSITION,
      ARROW_BASE_WIDTH,
      colord("white"), offset, () => canvasScale))
  }

  const removeObject = (array, index) => {
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
    <button class="button" onclick={addCircle}>Add Circle</button>
    <button class="button" onclick={addArrow}>Add Arrow</button>
    <button class="button" onclick="{clear}">Clear</button>
    <button class="button" onclick="{() => changeScale(1)}">Reset scale</button>
    <button class="button" onclick="{() => {offset.x = 0; offset.y = 0;}}">Reset Position</button>
    <input type="range" min="0.3" max="2" step="0.1"
           oninput="{changeScale}">
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
      <Shape bind:shape={circles[index]}>
        <Circle bind:circle={circles[index]} {index} removeCircle={() => removeObject(circles,index)}/>
      </Shape>
    {/each}

    {#each arrows as arrow, index (arrow)}
      <Shape bind:shape={arrows[index]}>
        <Arrow bind:arrow={arrows[index]} {offset} {index} {circles}
               removeArrow={() => removeObject(arrows,index)}/>
      </Shape>
    {/each}

    <circle cx="{offset.x}" cy="{offset.y}" r="2" fill="red"></circle>
  </svg>

  <div class="toolbox">
    <p>CanMoveGrid: {canMoveGrid}</p>
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
      'toolbox toolbox';
    height: 98vh;
  }

  .materials {
    grid-area: materials;
    border-right: var(--mainBorder);
    resize: horizontal;
    border-right: var(--mainBorder);
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
