<script>
  import {colord} from "colord";
  import ColorPicker from "svelte-awesome-color-picker";
  import trash from "$lib/assets/trash.png";
  import Input from "./Input.svelte";


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
      <div>x: <Input max={50000} type="number" bind:value={shape.x}/></div>
      <div>y: <Input max={50000} type="number" bind:value={shape.y}/></div>
      <div>Radius: <Input max={50000} type="number" bind:value={shape.r}/></div>
    {:else}
      <div>x1: <Input max={50000} type="number" bind:value={shape.x1}/></div>
      <div>y1: <Input max={50000} type="number" bind:value={shape.y1}/></div>

      <div>x2: <Input max={50000} type="number" bind:value={shape.x2}/></div>
      <div>y1: <Input max={50000} type="number" bind:value={shape.y2}/></div>

      <div>Width: <Input min={1} type="number" bind:value={shape.width}/></div>
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
    border: var(--darkBorder);
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

  /*mayve align this with the color container start?*/
  .basics {
    padding-top: 10px;
    align-self: start;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    justify-items: end;
  }

  .trash {
    padding: 5px;
    align-self: end;
    margin-top: auto;
  }

</style>