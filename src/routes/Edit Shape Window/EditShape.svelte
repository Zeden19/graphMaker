<script>
  import trash from "$lib/assets/trash.png";
  import Input from "./Input.svelte";
  import ChangeColor from "./ChangeColor.svelte";
  import {onMount} from "svelte";

  let {shape = $bindable()} = $props();

  let shown = $state(false);
  let popupWindow = $state();

  onMount(() =>
    window.addEventListener("click", (event) => {
      if (popupWindow && !(popupWindow.contains(event.target)))
        shown = false;
    }));
</script>

{#if shape !== undefined}
  <div class="title color-title"><span>Color</span></div>
  <ChangeColor bind:colorToChange={shape.color}/>

  <!--  we should probably want this to be organized by type, so position is togther, size adjustment is togeher
  etc. add labels and borders for each type-->
  <div class="basics-container">
    <div class="title">Position & Size</div>
    <div class="basics">
      {#if shape.x}
        <div>x <Input max={50000} type="number" bind:value={shape.x}/></div>
        <div>y <Input max={50000} type="number" bind:value={shape.y}/></div>
        <div>Radius <Input max={50000} type="number" bind:value={shape.r}/></div>
      {:else}
        <div>x1 <Input max={50000} type="number" bind:value={shape.x1}/></div>
        <div>y1 <Input max={50000} type="number" bind:value={shape.y1}/></div>

        <div>x2 <Input max={50000} type="number" bind:value={shape.x2}/></div>
        <div>y2 <Input max={50000} type="number" bind:value={shape.y2}/></div>

        <div>Width <Input min={1} type="number" bind:value={shape.width}/></div>
      {/if}
    </div>
  </div>

  {#if shape.strokeColor}
    <div class="basics-container">
      <div class="title">Stroke</div>
      <div class="basics">
        <div style="position: relative;" bind:this={popupWindow}>Color
          <Input style="background-color: {shape.strokeColor.toHex()};"
                 onclick={() => shown = true} readonly={true}
                 aria-label="Change stroke color"/>
          {#if shown}
            <div class="show-stroke-popup">
              <ChangeColor bind:colorToChange={shape.strokeColor}/>
            </div>
          {/if}
        </div>
        <div>Width <Input min={1} max={30} type="number" bind:value={shape.strokeWidth}/></div>
      </div>
    </div>
  {/if}

  <button class="trash" onclick={shape.delete}>
    <img draggable="false" width="50" alt="trash" src="{trash}"/>
  </button>
{:else}
  Select a shape to edit
{/if}

<style>
  .title {
    display: flex;
    align-items: center;
    justify-content: start;

    font-size: 0.85em;
    color: rgba(115, 149, 177, 0.65);
    font-weight: bold;
    width: 100%;

    padding-top: 1em;
  }

  .title::before,
  .title::after {
    display: inline-block;
    content: '';
    border-top: .3rem solid rgb(47, 61, 73);
    width: 25%;
    margin: 0 0.5em 0 0.5em;
  }

  .color-title {
    padding-top: 0;
    padding-bottom: 10px;
  }

  .basics-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 10px;
    align-self: start;
  }

  /*maybe align this with the color container start?*/
  .basics {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    gap: 5px 5px;
  }

  .basics > div {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 0.8em;
    font-style: italic;
  }

  .show-stroke-popup {
    position: absolute;
    top: -35px; /*From 30px height size of circles from ChangeColor + 5px */
  }

  .trash {
    padding: 5px;
    align-self: end;
    margin-top: auto;
  }

</style>