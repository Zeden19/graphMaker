<script>
  import trash from "$lib/assets/trash.png";
  import Input from "./Input.svelte";
  import ChangeColorPopup from "./ChangeColorPopup.svelte";
  import ArrowEndpointSelect from "./ArrowEndpointSelect.svelte";

  let {shapes = $bindable(), container = $bindable()} = $props();
  const getProperty = (shape, property) => property.split(".").reduce((a, b) => {
    return typeof a[b] === "function" ? a[b]() : a[b]
  }, shape);

  const setProperty = (shape, property, value) => {
    const path = property.split(".");
    const lastKey = path.pop();

    // Navigate to the parent object
    const parent = path.reduce((obj, key) => {
      return typeof obj[key] === "function" ? obj[key]() : obj[key];
    }, shape);

    // Set the final property
    if (lastKey.endsWith("()")) {
      // Handle method calls - call the method with the value
      const methodName = lastKey.slice(0, -2);
      if (typeof parent[methodName] === "function") {
        parent[methodName](value);
      }
    } else {
      // Handle regular property assignment
      parent[lastKey] = value;
    }
  };

  const allHasProperty = (property, val, everyOrSome) => {
    return everyOrSome === "every" ?
      shapes.every(shape => getProperty(shape, property) === val) :
      shapes.some(shape => getProperty(shape, property) === val);
  }

  const getValue = (value, returnValue = value) => {
    return () => allHasProperty(value, getProperty(shapes[0], value), "every") ? getProperty(shapes[0], returnValue) : undefined
  }

  const setValue = (value) => {
    return (newValue) => shapes.forEach(shape => setProperty(shape, value, newValue))
  }

</script>
<div class="container" bind:this={container}>
  {#if shapes.length !== 0}
    <div class="title">{shapes[0]}</div>
    <div class="basics-container">
      <div class="type-title">Basic</div>
      <div class="basics">

        {#if !allHasProperty("color.toHex", undefined, "some") && !allHasProperty("toString", "GraphText", "every")}
          <div>Color
            <ChangeColorPopup
              bind:colorToChange={getValue("color.toHex", "color"), setValue("color")}/>
          </div>
        {/if}

        {#if !allHasProperty("x", undefined, "some")}
          <div>x <Input {shapes} fallback={shapes[0].x} max={50000} min={-50000} type="number"
                        bind:value={getValue("x"), setValue("x")}/></div>
          <div>y <Input {shapes} fallback={shapes[0].y} max={50000} min={-50000} type="number"
                        bind:value={getValue("y"), setValue("y")}/></div>
        {/if}

        {#if !(allHasProperty("x1", undefined, "some"))}
          <div>x1 <Input {shapes} fallback={shapes[0].x1} max={50000} min={-50000} type="number"
                         bind:value={getValue("x1"), setValue("x1")}/></div>
          <div>y1 <Input {shapes} fallback={shapes[0].y1} max={50000} min={-50000} type="number"
                         bind:value={getValue("y1"), setValue("y1")}/></div>

          <div>x2 <Input {shapes} fallback={shapes[0].x2} max={50000} min={-50000} type="number"
                         bind:value={getValue("x2"), setValue("x2")}/></div>
          <div>y2 <Input {shapes} fallback={shapes[0].y2} max={50000} min={-50000} type="number"
                         bind:value={getValue("y2"), setValue("y2")}/></div>
        {/if}

        {#if (!allHasProperty("width", undefined, "some"))}
          <div>Width:
            <Input {shapes} fallback={shapes[0].width} max={500} min={1} type="number"
                   bind:value={getValue("width"), setValue("width")}/>
          </div>
        {/if}

        {#if (!allHasProperty("height", undefined, "some"))}
          <div>Height:
            <Input {shapes} fallback={shapes[0].height} max={500} min={1} type="number"
                   bind:value={getValue("height"), setValue("height")}/>
          </div>
        {/if}

        {#if !allHasProperty("rotation", undefined, "some")}
          <div>Rotation
            <Input {shapes} fallback={shapes[0].rotation} type="number" max={359} min={0}
                   bind:value={getValue("rotation"), setValue("rotation")}/>
          </div>
        {/if}
      </div>
    </div>


    {#if (!allHasProperty("strokeWidth", undefined, "some"))}
      <div class="basics-container">
        <div class="type-title">Stroke</div>
        <div class="basics">
          <div>Color
            <ChangeColorPopup
              bind:colorToChange={getValue("strokeColor.toHex", "strokeColor"), setValue("strokeColor")}/>
          </div>
          <div>Width
            <Input {shapes} fallback={shapes[0].strokeWidth} min={0} max={30} type="number"
                   bind:value={getValue("strokeWidth"), setValue("strokeWidth")}/>
          </div>
        </div>
      </div>
    {/if}

    {#if (!allHasProperty("text", undefined, "some"))}
      <div class="basics-container">
        <div class="type-title">Text</div>
        <div class="basics">
          <div>Color
            <ChangeColorPopup bind:colorToChange={getValue("text.color.toHex", "text.color"), setValue("text.color")}/>
          </div>

          <div>Font Size:
            <Input {shapes} fallback={shapes[0].text.fontSize} type="number" min="1" max="100"
                   bind:value={getValue("text.fontSize"), setValue("text.fontSize")}/>
          </div>

          <div>Bold:
            <Input {shapes} type="checkbox" bind:checked={getValue("text.bold"), setValue("text.bold")}/>
          </div>

          <div>Italic:
            <Input {shapes} type="checkbox" bind:checked={getValue("text.italic"), setValue("text.italic")}/>
          </div>
          <div>Underline:
            <Input {shapes} type="checkbox" bind:checked={getValue("text.underline"), setValue("text.underline")}/>
          </div>
          <div>Value:
            <Input {shapes} type="text" bind:value={getValue("text.value"), setValue("text.value")}/></div>
        </div>
      </div>
    {/if}

    {#if (!allHasProperty("start", undefined, "some"))}
      <div class="basics-container">
        <div class="type-title">End Points</div>
        <div class="basics">
          <div>Start:
            <ArrowEndpointSelect bind:endpoint={getValue("start"), setValue("start")}/>
          </div>
          <div>End:
            <ArrowEndpointSelect bind:endpoint={getValue("end"), setValue("end")}/>
          </div>
        </div>
      </div>
    {/if}

    <!--Must be arrow function: https://svelte.dev/docs/svelte/$state#Classes-->
    <button class="trash" onclick={() => shapes.forEach(shape => shape.delete())}>
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