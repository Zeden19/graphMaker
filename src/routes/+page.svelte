<script>
  import Circle from "./Shapes/Circle.svelte";
  import {Circle as CircleClass} from "./Shapes/circle.svelte.js";
  import {Arrow as ArrowClass} from "./Shapes/arrow.svelte.js";
  import {extend} from "colord";
  import namesPlugin from "colord/plugins/names";
  import Arrow from "./Shapes/Arrow.svelte";
  import DraggableObject from "./Shapes/DraggableObject.svelte.js";
  import Shape from "./Shapes/Shape.svelte";
  import EditShape from "./Edit Shape Window/EditShape.svelte";
  import {onMount} from "svelte";
  import {GraphText as GraphTextClass} from "./Shapes/Text/Text.svelte.js";
  import GraphText from "./Shapes/Text/GraphText.svelte";

  extend([namesPlugin]);

  const DEFAULT_PRIMARY_SEP = 40;
  const DEFAULT_SECONDARY_SEP = 20;

  let offsetBefore = {x: 0, y: 0};
  let offset = $state({x: 0, y: 0});
  let canvasScale = $state(1);

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
  let texts = $state([]);
  let selectedShape = $derived([...circles, ...arrows, ...texts].find(shape => shape.selected));
  let editShapeContainerRef = $state();


  const addCircle = () => {
    circles.push(new CircleClass(offset, () => canvasScale) // need to function so it captures variable
    );
  }

  const addArrow = () => {
    arrows.push(new ArrowClass(offset, () => canvasScale))
  }

  const addText = () => {
    texts.push(new GraphTextClass(offset, () => canvasScale))
  }

  const removeObject = (array, index) => {
    // need selected to be false so popup transition out plays
    array[index].selected = false;
    setTimeout(() => { // idk why but we also need timemeout
      array.splice(index, 1);
    });
  }

  onMount(() => {
    // indexes in classes will change when deleting shapes
    window.addEventListener("deleteShape", ({detail: {type, shape}}) => {
      if (type === "arrow") removeObject(arrows, arrows.findIndex((arrow) => arrow === shape));
      else if (type === "text") removeObject(texts, texts.findIndex((text) => text === text));
      else if (type === "circle") {
        const circleIndex = circles.findIndex((circle) => circle === shape);
        // Goku code
        circles[circleIndex].arrowsSnappedIndexes.forEach(({index, pos}) => {
                dispatchEvent(new CustomEvent(`circleDelete${index}`, {detail: {pos}}));
              });

        removeObject(circles, circleIndex);
      }
    })
  })

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
      <button class="button" onclick={addCircle}>Add Circle</button>
      <button class="button" onclick={addArrow}>Add Arrow</button>
      <button class="button" onclick={addText}>Add Text</button>
      <button class="button" onclick="{clear}">Clear</button>
      <button class="button" onclick="{() => changeScale(1)}">Reset scale</button>
      <button class="button" onclick="{() => {offset.x = 0; offset.y = 0;}}">Reset Position</button>
      <input type="range" min="0.3" max="2" step="0.1" oninput="{changeScale}">
    </div>

    <div bind:this={editShapeContainerRef} class="edit-shape">
      <EditShape bind:shape={selectedShape}/>
    </div>
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
        <GraphText bind:text={texts[index]} {offset}
               removeText={() => removeObject(texts,index)}/>
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

  .edit-shape {
    height: 70%;
    border-top: var(--mainBorder);
    display: flex;
    flex-direction: column;
    padding-top: 15px;
    padding-left: 15px;
    padding-right: 15px;
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
