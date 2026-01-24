<script>
  import {
    magnifyingPlus,
    magnifyingMinus,
    magnifyingReset,
    selectAll,
    deleteAll,
    resetPosition,
    account,
  } from "$lib/assets";
  import {
    Arrow,
    ArrowClass,
    Circle,
    CircleClass,
    CurvedArrow,
    CurvedArrowClass,
    DraggableObject,
    GraphText,
    GraphTextClass,
    HandleSnap,
    ResizeFromEdges,
    Shape,
    Square,
    SquareClass,
    Triangle,
    TriangleClass,
  } from "./Shapes";
  import EditShape from "./Edit Shape Window/EditShape.svelte";
  import Clipboard from "./Clipboard.svelte";
  import {fade} from "svelte/transition";
  import Share from "./Share.svelte";

  const DEFAULT_PRIMARY_SEP = 40;
  const DEFAULT_SECONDARY_SEP = 20;

  let offset = $state({x: 0, y: 0});
  let canvasScale = $state(1);

  let offsetBefore = {x: 0, y: 0};
  let speed = {x: 0, y: 0};
  let previousChange = {x: 0, y: 0};
  let useMomentum = $state(false);
  let highlightSelection = $state(false);
  let highlightDimensions = $state({x1: 0, y1: 0, x2: 0, y2: 0});
  let canvasRef = $state();

  const moveGrid = new DraggableObject(
    (event) => {
      speed.x = 0;
      speed.y = 0;

      previousChange.x = 0;
      previousChange.y = 0;

      highlightSelection = event.ctrlKey || event.metaKey;

      offsetBefore.x = offset.x;
      offsetBefore.y = offset.y;

      const canvasRect = canvasRef?.getBoundingClientRect?.();
      const startX = event.clientX - (canvasRect?.left ?? 0);
      const startY = event.clientY - (canvasRect?.top ?? 0);
      highlightDimensions.x1 = highlightDimensions.x2 = startX;
      highlightDimensions.y1 = highlightDimensions.y2 = startY;
    },
    (dx, dy) => {
      speed.x = dx - previousChange.x;
      speed.y = dy - previousChange.y;

      previousChange.x = dx;
      previousChange.y = dy;

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
      let friction = 0.95;
      let minSpeed = 3;

      const applyMomentum = () => {
        if (Math.abs(speed.x) < minSpeed && Math.abs(speed.y) < minSpeed) return;

        offset.x += speed.x;
        offset.y += speed.y;

        speed.x *= friction;
        speed.y *= friction;

        requestAnimationFrame(applyMomentum);
      };

      if (useMomentum) requestAnimationFrame(applyMomentum);
    });

  let shapes = $state({
    circles: [],
    arrows: [],
    curvedarrows: [],
    squares: [],
    graphtexts: [],
    triangles: [],
  });

  let shapeButtons = [
    {label: "circle", class: CircleClass, svg: `<circle cx="24" cy="24" r="16"/>`},
    {label: "square", class: SquareClass, svg: `<rect x="10" y="10" width="28" height="28" rx="2" ry="2"/>`},
    {label: "triangle", class: TriangleClass, svg: `<path d="M24 8 L40 36 H8 Z"/>`},
    {label: "arrow", class: ArrowClass, svg: `<path d="M8 24 H34"/><path d="M28 18 L40 24 L28 30"/>`},
    {
      label: "curved arrow",
      class: CurvedArrowClass,
      svg: `<path d="M10 36 Q24 12 38 20"/><path d="M34 14 L40 20 L32 22"/>`
    },
    {label: "graph text", class: GraphTextClass, svg: `<text x="24" y="30" text-anchor="middle">Text</text>`},
  ]

  const shapeClasses = {
    Circle: CircleClass,
    Arrow: ArrowClass,
    CurvedArrow: CurvedArrowClass,
    GraphText: GraphTextClass,
    Square: SquareClass,
    Triangle: TriangleClass
  };


  let selectedShapes = $derived(Object.values(shapes).flat().filter(shape => shape.selected))
  let editShapeContainerRef = $state();

  let shapeProps = $derived({
    editShapeContainerRef,
    highlightSelection,
    highlightDimensions,
    selectedShapes,
  });

  const addShape = (ShapeClassRef, shapeProperties) => {
    const array = getShapeArray(ShapeClassRef.name);
    if (!array) return;
    array.push(new ShapeClassRef(offset, shapeProperties, removeShape));
  }

  const removeShape = (shape) => {
    // need selected to be false so popup transition out plays
    shape.selected = false;
    shape.isDeleting = true;

    [...shapes.arrows, ...shapes.curvedarrows].forEach(arrow => {
      if (arrow.startSnappedShape?.() === shape) {
        arrow.x1 = arrow.startSnapped().x - offset.x;
        arrow.y1 = arrow.startSnapped().y - offset.y;
        arrow.startSnapped = undefined;
        arrow.startSnappedShape = undefined;
      }
      if (arrow.endSnappedShape?.() === shape) {
        arrow.x2 = arrow.endSnapped().x - offset.x;
        arrow.y2 = arrow.endSnapped().y - offset.y;
        arrow.endSnapped = undefined;
        arrow.endSnappedShape = undefined;
      }
    });

    setTimeout(() => { // idk why but we also need timemeout
      const index = getShapeArray(shape).indexOf(shape);
      getShapeArray(shape).splice(index, 1);
    });
  }

  const selectAllShapes = () => {
    Object.keys(shapes).forEach(shapeArray => {
      shapes[shapeArray].forEach((shape) => {
        shape.selected = true;
      });
    });
  }

  const clear = () => {
    Object.keys(shapes).forEach(shapeArray => {
      shapes[shapeArray] = [];
    });
  }

  const changeScale = (val) => {
    canvasScale = Math.min(Math.max(val, 0.1), 5);
  }

  const getShapeArray = (shape) => {
    return typeof shape.toString === "function" ? shapes[shape.toString().toLowerCase() + "s"] :
      shapes[shape.toString.toLowerCase() + "s"];
  }
</script>

<Clipboard {selectedShapes} addShape={(shapeClass, shapeProperties) => {
  addShape(shapeClass, shapeProperties);
}}/>

<div class="container">
  <div class="paddingTop">
    <div class="top-actions">

      <div class="action-container">
        <button class="action-buttons" onclick={() => changeScale(canvasScale + 0.2)}>
          <img class="action-images" alt="Increase Scale" src={magnifyingPlus}/></button>
        <button class="action-buttons" onclick={() => changeScale(canvasScale - 0.2)}>
          <img class="action-images" alt="Decrease Scale" src={magnifyingMinus}/>
        </button>
        <button class="action-buttons" onclick={() => changeScale(1)}>
          <img class="action-images" alt="Reet Scale" src={magnifyingReset}/>
        </button>
      </div>

      <div class="action-container">
        <button class="action-buttons" onclick={selectAllShapes}>
          <img class="action-images" alt="Increase Scale" src={selectAll}/></button>
        <button class="action-buttons" onclick={clear}>
          <img class="action-images" alt="Decrease Scale" src={deleteAll}/>
        </button>
      </div>

      <div class="action-container">
        <button class="action-buttons" onclick={() => {offset.x = 0; offset.y = 0;}}>
          <img class="action-images" src={resetPosition} alt="Reset Position"></button>
      </div>

      <div class="action-container share">
        <Share {shapes} {clear} {offset} {removeShape} {getShapeArray} {shapeClasses}/>
        <button class="action-buttons"><img class="action-images" src={account} alt="Account Settings"></button>
      </div>
    </div>
  </div>

  <div class="materials">
    <div class="edit-shape-container" bind:this={editShapeContainerRef}>
      {#if selectedShapes.length > 0}
        <EditShape bind:shapes={selectedShapes}/>
      {:else}
        <label> Scale <input type="range" min="0.1" max="5" step="0.1" bind:value={canvasScale}></label>
        <label> Use Momentum <input type="checkbox" bind:checked={useMomentum}/></label>
      {/if}
    </div>
  </div>


  <svg
    style="background-position: {offset.x * canvasScale}px {offset.y * canvasScale}px;
    --big-line-sep: {DEFAULT_PRIMARY_SEP * canvasScale}px;
    --small-line-sep: {DEFAULT_SECONDARY_SEP * canvasScale}px;"
    onmousedown="{moveGrid.setDrag}"
    bind:this={canvasRef}
    class="canvas"
    role="presentation"
    aria-label="Interactive canvas"
    xmlns="http://www.w3.org/2000/svg"
  >

    <g transform="scale({canvasScale})">
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

            {:else if shapesName === "graphtexts"}
              <GraphText bind:text={shapes.graphtexts[index]}/>
              <ResizeFromEdges bind:shape={shapes.graphtexts[index]}/>

            {:else if shapesName === "triangles"}
              <Triangle bind:triangle={shapes.triangles[index]}/>
              <ResizeFromEdges bind:shape={shapes.triangles[index]}/>

            {:else if shapesName === "arrows"}
              <Arrow bind:arrow={shapes.arrows[index]}/>
              <HandleSnap arrow={shape} {shapes}/>

            {:else if shapesName === "curvedarrows"}
              <CurvedArrow bind:arrow={shapes.curvedarrows[index]}/>
              <HandleSnap arrow={shape} {shapes}/>
            {/if}
          </Shape>
        {/each}
      {/each}
    </g>

    <circle cx="{offset.x * canvasScale}" cy="{offset.y * canvasScale}" r="2" fill="red"></circle>

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
    <div class="shape-search-container">
      <input class="shape-search" type="text" placeholder="Search shapes" disabled/>
    </div>
    <div class="shape-grid">
      {#each shapeButtons as shape}
        <button class="shape-button" onclick={() => addShape(shape.class)} aria-label="Add {shape.label}">
          <svg viewBox="0 0 48 48" role="img" aria-hidden="true">
            {@html shape.svg}
          </svg>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 20% 60% 20%;
    grid-template-rows: 7% 93%;
    grid-template-areas:
      'paddingTop paddingTop paddingTop'
      'toolbox canvas materials';
    height: 100vh;
  }

  .materials {
    grid-area: materials;
    border-left: var(--mainBorder);
    border-top: var(--mainBorder);
    border-bottom: var(--mainBorder);
    resize: horizontal;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
  }

  .toolbox {
    border-right: var(--mainBorder);
    border-top: var(--mainBorder);
    border-bottom: var(--mainBorder);
    grid-area: toolbox;
    background-color: var(--secondaryBg);
    box-sizing: border-box;
    height: 100%;

    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    min-width: 0;
  }

  .paddingTop {
    grid-area: paddingTop;
    background-color: #030305;
    display: flex;
    align-items: center;
  }

  .top-actions {
    align-items: center;
    display: flex;
    gap: 30px;
    width: 100%;
  }

  .action-container {
    display: flex;
  }

  .action-container.share {
    margin-left: auto;
    margin-right: 5em;
  }

  .shape-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .shape-button {
    border: var(--darkBorder);
    border-radius: 12px;
    background-color: #11161c;
    padding: 8px;
    cursor: pointer;
    transition: transform 0.15s ease, background-color 0.15s ease;
  }

  .shape-button:hover {
    transform: translateY(-1px);
    background-color: #18202a;
  }

  .shape-search-container {
    display: flex;
  }

  .shape-search {
    width: 100%;
  }

  .shape-button svg {
    width: 100%;
    height: 40px;
    fill: none;
    stroke: #ffffff;
    stroke-width: 2.5;
  }

  .shape-button :global(text) {
    fill: #ffffff;
    font-size: 18px;
    font-weight: 400;
    stroke: none;
    font-family: inherit;
  }

  .edit-shape-container {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
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

    border-top: var(--mainBorder);
    border-bottom: var(--mainBorder);

    width: 100%;
    height: 100%;
    box-sizing: border-box;

  }


</style>
