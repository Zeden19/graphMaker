<script>
  import {blur} from "svelte/transition";
  import Input from "./Input.svelte";
  import {onMount} from "svelte";

  let {colorToChange = $bindable()} = $props();
  let colors = ["white", "black", "red", "orange", "yellow", "lime", "green", "blue", "cyan", "pink", "purple"];

  let colorDisplayed = $derived(colorToChange ?? "");

  let showPopup = $state(false);
  let popupArea = $state(null);

  onMount(() => {
    window.addEventListener('click', (event) => {
      if (popupArea && !(popupArea.contains(event.target))) {
        showPopup = false;
      }
    });
  });

</script>

<div style="position: relative;" bind:this={popupArea}>
  <!--  for consistent transparent background, exclude bg-color-->
  <Input style={colorToChange !== undefined && `background-color: ${colorDisplayed}`}
         onclick={() => showPopup = true} readonly={true}
         aria-label="Change stroke color" type="displayOnly"/>
  {#if showPopup}
    <div class="show-stroke-popup">
      <div class="color-container" transition:blur={{duration: 130}}>
        {#each colors as color}
          <button class="{colorDisplayed === color && 'color-selected'}"
                  style="background-color: {color};"
                  onclick={() => colorToChange = color}
                  aria-label="Change color to {color}">
          </button>
        {/each}
        <input class="{colors.every((color) => colorDisplayed !== color) && 'color-selected'}" type="color"
               bind:value={() => colorDisplayed, (newColor) => {
                if (colorToChange === undefined && newColor === colorDisplayed) return;
                colorDisplayed = colorToChange = newColor
            }}/>
      </div>
    </div>
  {/if}
</div>

<style>
  .show-stroke-popup {
    position: absolute;
    bottom: 35px; /*From 30px height size of circles from ChangeColorPopup + 5px */
    z-index: 1;
  }

  .color-container {
    display: flex;
    align-self: start;
    background: var(--secondaryBg);
    padding: 8px;
    border-radius: 30px;
    border: var(--darkBorder);
  }

  .color-container > * {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin: 4px;
    border: 1px solid white;
    transition: transform 0.2s ease-out;
  }

  .color-container > *:hover, .color-selected {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
    transform: scale(1.1);
  }

  input[type=color] {
    border: none;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    padding: 0;
  }

  input[type=color]::-webkit-color-swatch-wrapper {
    padding: 0;
    border: 1px solid white;
  }

  input[type=color]::-webkit-color-swatch {
    background-image: var(--rainbowCircleGradient);
    border: none;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .color-selected::-webkit-color-swatch {
    background-image: none !important;
  }

</style>