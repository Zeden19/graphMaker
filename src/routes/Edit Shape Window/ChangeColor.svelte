<script>
  import {blur} from "svelte/transition";
  import ColorPicker from "svelte-awesome-color-picker";
  import {colord} from "colord";

  let {colorToChange = $bindable()} = $props();
  let colors = ["white", "black", "red", "orange", "yellow", "lime", "green", "blue", "cyan", "pink", "purple"]
    .map((color) => colord(color));
  let hex = $derived(colorToChange.toHex());
</script>

<div class="color-container" transition:blur={{duration: 200}}>
  {#each colors as color}
    <button class="color-pick {colorToChange.toHex() === color.toHex() ? 'color-selected' : ''}"
            style="background-color: {color.toHex()};"
            onclick={() => colorToChange = color}
            aria-label="Change color to {color.toName()}">
    </button>
  {/each}
  <div
    class="color-picker {colors.every((color) => colorToChange.toHex() !== color.toHex()) ? 'color-selected' : ''}">
    <ColorPicker
      textInputModes={["hex"]}
      --cp-bg-color="black"
      --cp-border-color="white"
      --cp-input-color="#333"
      bind:color={colorToChange}
      bind:hex
      label=""
      position="responsive"
    />
  </div>
</div>

<style>
  .color-container {
    display: flex;
    align-self: start;
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
</style>