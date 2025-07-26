<script>
  import trash from "$lib/assets/trash.png";
  import Input from "./Input.svelte";
  import ChangeColorPopup from "./ChangeColorPopup.svelte";
  import {onMount} from "svelte";
  import ArrowEndpointSelect from "./ArrowEndpointSelect.svelte";

  let {shape = $bindable(), container = $bindable()} = $props();

  let shown = $state(false);
  let popupWindow = $state();

  onMount(() =>
    window.addEventListener("click", (event) => {
      if (popupWindow && !(popupWindow.contains(event.target)))
        shown = false;
    }));
</script>

<div class="container" bind:this={container}>
  {#if shape !== undefined}
    <div class="title">{shape}</div>
    <div class="basics-container">
      <div class="type-title">Basic</div>
      <div class="basics">

        {#if shape.color !== undefined && shape.bold === undefined}
          <div>Color
            <ChangeColorPopup bind:colorToChange={shape.color}/>
          </div>
        {/if}

        {#if shape.r !== undefined}
          <div>Radius <Input max={200} type="number" bind:value={shape.r}/></div>
        {/if}

        {#if shape.x !== undefined}
          <div>x <Input max={50000} type="number" bind:value={shape.x}/></div>
          <div>y <Input max={50000} type="number" bind:value={shape.y}/></div>
        {/if}

        {#if shape.x1 !== undefined}
          <div>x1 <Input max={50000} type="number" bind:value={shape.x1}/></div>
          <div>y1 <Input max={50000} type="number" bind:value={shape.y1}/></div>

          <div>x2 <Input max={50000} type="number" bind:value={shape.x2}/></div>
          <div>y2 <Input max={50000} type="number" bind:value={shape.y2}/></div>
        {/if}

        {#if shape.width !== undefined}
          <div>Width: <Input max={500} type="number" bind:value={shape.width}/></div>
        {/if}
      </div>
    </div>

    {#if shape.strokeColor}
      <div class="basics-container">
        <div class="type-title">Stroke</div>
        <div class="basics">
          <div>Color
            <ChangeColorPopup bind:colorToChange={shape.strokeColor}/>
          </div>
          <div>Width <Input min={1} max={30} type="number" bind:value={shape.strokeWidth}/></div>
        </div>
      </div>
    {/if}

    {#if shape.italic !== undefined || shape.text }
      <div class="basics-container">
        <div class="type-title">Text</div>
        <div class="basics">
          {#if shape.text}
            <div>Color
              <ChangeColorPopup bind:colorToChange={shape.text.color}/>
            </div>
            <div>Font Size: <Input type="number" min="1" bind:value={shape.text.fontSize}/></div>
            <div>Bold: <Input type="checkbox" bind:checked={shape.text.bold}/></div>
            <div>Italic: <Input type="checkbox" bind:checked={shape.text.italic}/></div>
            <div>Underline: <Input type="checkbox" bind:checked={shape.text.underline}/></div>
          {:else}
            <div>Color
              <ChangeColorPopup bind:colorToChange={shape.color}/>
            </div>
            <div>Font Size:<Input type="number" min="1" bind:value={shape.fontSize}/></div>
            <div>Bold: <Input type="checkbox" bind:checked={shape.bold}/></div>
            <div>Italic: <Input type="checkbox" bind:checked={shape.italic}/></div>
            <div>Underline: <Input type="checkbox" bind:checked={shape.underline}/></div>
          {/if}
        </div>
      </div>
    {/if}

    {#if shape.start !== undefined}
      <div class="basics-container">
        <div class="type-title">End Points</div>
        <div class="basics">
          <div>Start:
            <ArrowEndpointSelect endpointString="start" bind:arrow={shape}/>
          </div>
          <div>End:
            <ArrowEndpointSelect endpointString="end" bind:arrow={shape}/>
          </div>
        </div>
      </div>
    {/if}

    <!--Must be arrow function: https://svelte.dev/docs/svelte/$state#Classes-->
    <button class="trash" onclick={() => shape.delete()}>
      <img draggable="false" width="50" alt="trash" src="{trash}"/>
    </button>
  {:else}
    Select a shape to edit
  {/if}
</div>

<style>
  .container {
    height: 70%;
    border-top: var(--mainBorder);
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    padding-top: 15px;
    padding-left: 15px;
    padding-right: 15px;
  }

  .title {
    align-self: center;
  }

  .type-title {
    display: flex;
    align-items: center;
    justify-content: start;

    font-size: 0.85em;
    color: rgba(115, 149, 177, 0.65);
    font-weight: bold;
    width: 100%;
  }

  .type-title::before,
  .type-title::after {
    display: inline-block;
    content: '';
    border-top: .3rem solid rgb(47, 61, 73);
    width: 50%;
    margin: 0 0.5em 0 0.5em;
  }

  .basics-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 10px;
    align-self: start;
  }

  .basics {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }

  .basics > div {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 0.8em;
    font-style: italic;
  }


  .trash {
    padding: 5px;
    align-self: end;
    margin-top: auto;
  }

</style>