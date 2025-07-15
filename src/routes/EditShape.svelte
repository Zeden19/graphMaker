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
  <ChangeColor bind:colorToChange={shape.color}/>

  <!--  we should probably want this to be organized by type, so position is togther, size adjustment is togeher
  etc. add labels and borders for each type-->
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

  <div class="basics">
    {#if shape.strokeColor}
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
    {/if}
  </div>

  <button class="trash" onclick={shape.delete}>
    <img draggable="false" width="50" alt="trash" src="{trash}"/>
  </button>
{:else}
  Select a shape to edit
{/if}

<style>
  .show-stroke-popup {
    position: absolute;
    top: -35px; /*From 30px height size of circles from ChangeColor + 5px */
  }

  /*maybe align this with the color container start?*/
  .basics {
    padding-top: 10px;
    align-self: start;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    width: 50%;
    gap: 5px 5px;
  }

  .basics > div {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 1em;
  }

  .trash {
    padding: 5px;
    align-self: end;
    margin-top: auto;
  }

</style>