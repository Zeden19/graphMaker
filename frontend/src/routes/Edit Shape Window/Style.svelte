<script>
  import Input from "./Input.svelte";
  import ChangeColorPopup from "./ChangeColorPopup.svelte";
  import Select from "./Select.svelte";
  import {arrowEndpointLabels} from "$lib/arrowEndpoints.js";
  import {strokeStyleOptions} from "./strokeStyles.js";

  const {allHasProperty, getValue, setValue, shapes} = $props()
</script>

<div class="basics-container">
  <div class="type-title">Basic</div>
  <div class="basics">

    {#if !allHasProperty("color", undefined, "some") && !allHasProperty("toString", "GraphText", "every")}
      <div class="basics-holder basics-holder--single">
        <div class="label">Color</div>
        <div class="control">
          <ChangeColorPopup
            bind:colorToChange={getValue("color"), setValue("color")}/>
        </div>
      </div>
    {/if}

    {#if !allHasProperty("x", undefined, "some")}
      <div class="basics-holder basics-holder--multi">
        <div class="label">position</div>
        <div class="multi-inputs">
          <div class="input-with-label">
            <Input {shapes} fallback={shapes[0].x} max={50000} min={-50000} type="number"
                   bind:value={getValue("x"), setValue("x")}/>
            <div class="input-label">x</div>
          </div>
          <div class="input-with-label">
            <Input {shapes} fallback={shapes[0].y} max={50000} min={-50000} type="number"
                   bind:value={getValue("y"), setValue("y")}/>
            <div class="input-label">y</div>
          </div>
        </div>
      </div>
    {/if}

    {#if !(allHasProperty("x1", undefined, "some"))}
      <div class="basics-holder basics-holder--multi">
        <div class="label">start</div>
        <div class="multi-inputs">
          <div class="input-with-label">
            <Input {shapes} fallback={shapes[0].x1} max={50000} min={-50000} type="number"
                   bind:value={getValue("x1"), setValue("x1")}/>
            <div class="input-label">x1</div>
          </div>
          <div class="input-with-label">
            <Input {shapes} fallback={shapes[0].y1} max={50000} min={-50000} type="number"
                   bind:value={getValue("y1"), setValue("y1")}/>
            <div class="input-label">y1</div>
          </div>
        </div>
      </div>

      <div class="basics-holder basics-holder--multi">
        <div class="label">end</div>
        <div class="multi-inputs">
          <div class="input-with-label">
            <Input {shapes} fallback={shapes[0].x2} max={50000} min={-50000} type="number"
                   bind:value={getValue("x2"), setValue("x2")}/>
            <div class="input-label">x2</div>
          </div>
          <div class="input-with-label">
            <Input {shapes} fallback={shapes[0].y2} max={50000} min={-50000} type="number"
                   bind:value={getValue("y2"), setValue("y2")}/>
            <div class="input-label">y2</div>
          </div>
        </div>
      </div>
    {/if}

    {#if (!allHasProperty("width", undefined, "some")) || (!allHasProperty("height", undefined, "some"))}
      <div class="basics-holder basics-holder--multi">
        <div class="label">size</div>
        <div class="multi-inputs">
          {#if (!allHasProperty("width", undefined, "some"))}
            <div class="input-with-label">
              <Input {shapes} fallback={shapes[0].width} max={500} min={1} type="number"
                     bind:value={getValue("width"), setValue("width")}/>
              <div class="input-label">width</div>
            </div>
          {/if}
          {#if (!allHasProperty("height", undefined, "some"))}
            <div class="input-with-label">
              <Input {shapes} fallback={shapes[0].height} max={500} min={1} type="number"
                     bind:value={getValue("height"), setValue("height")}/>
              <div class="input-label">height</div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    {#if !allHasProperty("rotation", undefined, "some")}
      <div class="basics-holder basics-holder--single">
        <div class="label">Rotation</div>
        <div class="control">
          <Input {shapes} fallback={shapes[0].rotation} type="rotation" max={359} min={0}
                 bind:value={getValue("rotation"), setValue("rotation")}/>
        </div>
      </div>
    {/if}
  </div>
</div>


<div class="basics-container">
  <div class="type-title">Stroke</div>
  <div class="basics">
    <div class="basics-holder basics-holder--single">
      <div class="label">Color</div>
      <div class="control">
        <ChangeColorPopup
          bind:colorToChange={getValue("strokeColor"), setValue("strokeColor")}/>
      </div>
    </div>

    <div class="basics-holder basics-holder--single">
      <div class="label">Width</div>
      <div class="control">
        <Input {shapes} fallback={shapes[0].strokeWidth} min={0} max={30} type="number"
               bind:value={getValue("strokeWidth"), setValue("strokeWidth")}/>
      </div>
    </div>

    <div class="basics-holder basics-holder--single">
      <div class="label">Stroke Style</div>
      <div class="control">
        <Select
          {shapes} fallback={shapes[0].strokeStyle}
          bind:value={getValue("strokeStyle"), setValue("strokeStyle")} options={strokeStyleOptions}/>
      </div>
    </div>
  </div>
</div>


{#if (!allHasProperty("start", undefined, "some"))}
  <div class="basics-container">
    <div class="type-title">End-Points</div>
    <div class="basics">
      <div class="basics-holder basics-holder--multi">
        <div class="label">endpoints</div>
        <div class="multi-inputs">
          <div class="input-with-label">
            <Select
              {shapes} fallback={shapes[0].start}
              bind:value={getValue("start"), setValue("start")}
              options={arrowEndpointLabels}
              size="sm"
            />
            <div class="input-label">start</div>
          </div>
          <div class="input-with-label">
            <Select
              {shapes} fallback={shapes[0].end}
              bind:value={getValue("end"), setValue("end")}
              options={arrowEndpointLabels}
              size="sm"
            />
            <div class="input-label">end</div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}


<style>
  .type-title {
    display: flex;
    align-items: center;
    justify-content: start;

    font-size: 0.85em;
    color: rgba(115, 149, 177, 0.65);
    font-weight: bold;
    width: 100%;
    text-wrap: nowrap;
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
    flex-direction: column;
    flex-wrap: wrap;
    gap: 15px;
  }

  .basics-holder {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 16px;
  }

  .basics-holder--single .control {
    justify-self: end;
  }

  .basics-holder--multi .multi-inputs {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    justify-content: flex-start;
  }

  .input-with-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .label,
  .input-label {
    font-size: 0.9em;
    font-style: italic;
    color: rgba(200, 210, 222, 0.75);
    text-transform: capitalize;
  }
</style>
