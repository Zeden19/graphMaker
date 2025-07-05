<script>
  import {fade} from "svelte/transition";
  import trash from "$lib/assets/trash.png";
  import ColorPicker from "svelte-awesome-color-picker";

  import {colord} from "colord";

  let {x, y, shape = $bindable(), removeShape, isDragging} = $props();

  let colors = ["white", "black", "red", "green", "blue", "yellow"].map((color) => colord(color));
  let hex = $derived(shape.color.toHex());
</script>


<foreignObject
  x={x} y={y}
  width="1"
  height="1">
  <div xmlns="http://www.w3.org/1999/xhtml" class="popup-wrapper no-select"
       transition:fade={{duration: 110}} style="{isDragging ? 'opacity: 0.4' : ''}">
    <div class="popup-content">
      {#each colors as color}
        <button class="color-pick {shape.color.toHex() === color.toHex() ? 'color-selected' : ''}"
                style="background-color: {color.toHex()};"
                onclick={() => shape.color = color}
                aria-label="Change color to {color.toName()}">
        </button>
      {/each}
      <div
        class="color-picker {colors.every((color) => color.toHex() !== shape.color.toHex()) ? 'color-selected' : ''}">
        <ColorPicker
          bind:color={shape.color}
          bind:hex
          label=""
          position="responsive"
        />
      </div>
      <button onclick="{removeShape}" class="popup-button"><img width="30" alt="trash" src="{trash}"/></button>
    </div>
    <div class="popup-arrow"></div>
  </div>
</foreignObject>


<style>
  foreignObject {
    overflow: visible;
  }

  .popup-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: auto;
    color: black;
    transition: opacity 120ms;
  }

  .popup-content {
    background: white;
    border: 1px solid black;
    border-radius: 8px;
    font-size: 14px;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
  }

  .popup-content > * {
    cursor: pointer;
  }

  .color-pick {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin: 4px;
    border: 1px solid black;
    transition: transform 0.2s ease-out;
  }

  .color-pick:hover, .color-selected {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
  }

  .color-picker {
    border-radius: 50%;
    background-image: var(--rainbowCircleGradient);
    margin-right: 5px;
  }

  .popup-button {
    border-left: black 1px solid;
    padding: 5px;
  }

  .popup-button:hover {
    background-color: #d1d0d0;
  }

  .popup-arrow {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid black;
    margin-top: -1px;
    position: relative;
    z-index: 0;
  }

  .popup-arrow::before {
    content: "";
    position: absolute;
    top: -7px;
    left: -7px;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 7px solid white;
  }

  button {
    cursor: nwse-resize;
  }
</style>