<script>
  import {colord} from "colord";
  import ColorPicker from "svelte-awesome-color-picker";
  import trash from "$lib/assets/trash.png";


  let {shape = $bindable()} = $props();

  let colors = ["white", "black", "red", "orange", "yellow", "lime", "green", "blue", "cyan", "pink", "purple"].map((color) => colord(color));
  let hex = $derived(shape?.color.toHex());

</script>

{#if shape !== undefined}
  <div class="color-container">
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
        textInputModes={["hex"]}
        --cp-bg-color="black"
        --cp-border-color="white"
        --cp-input-color="#333"
        bind:color={shape.color}
        bind:hex
        label=""
        position="responsive"
      />
    </div>
  </div>

  <div class="basics">
    {#if shape.x}
      <span>x: {shape.x}</span><br>
      <span>y: {shape.y}</span><br>
      <span>Radius: {Math.round(shape.r)}</span>
    {:else}
      <span>x1: {shape.x1}</span>
      <span>y1: {shape.y1}</span>
      <br>

      <span>x2: {shape.x2}</span>
      <span>y1: {shape.y2}</span>
      <br>

      <span>width: {shape.width}</span>
    {/if}

  </div>

  <button class="trash" onclick={shape.delete}><img draggable="false" width="50" alt="trash" src="{trash}"/>
  </button>
{:else}
  Select a shape to edit
{/if}

<style>
  .color-container {
    display: flex;
    align-self: center;
    background: var(--secondaryBg);
    padding: 8px;
    border-radius: 30px;
    border: var(--mainBorder);
  }

  .color-pick {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin: 4px;
    border: 1px solid white;
    transition: transform 0.2s ease-out;
  }

  .color-pick:hover, .color-selected {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
    transform: scale(1.05);
  }

  .color-picker {
    margin: 2px;
    border-radius: 50%;
    background-image: var(--rainbowCircleGradient);
    z-index: 99;
  }

  .trash {
    padding: 5px;
    align-self: end;
    margin-top: auto;
  }

</style>