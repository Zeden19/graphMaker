<script>
  import Input from "./Input.svelte";
  import ChangeColorPopup from "./ChangeColorPopup.svelte";

  const {getValue, setValue, shapes} = $props()
</script>

<div class="basics-container">
  <div class="type-title">Text</div>
  <div class="basics">
    <div class="basics-holder basics-holder--single">
      <div class="label">Color</div>
      <div class="control">
        <ChangeColorPopup bind:colorToChange={getValue("text.color"), setValue("text.color")}/>
      </div>
    </div>

    <div class="basics-holder basics-holder--single">
      <div class="label">Font Size</div>
      <div class="control">
        <Input {shapes} fallback={shapes[0].text.fontSize} type="number" min="1" max="100"
               bind:value={getValue("text.fontSize"), setValue("text.fontSize")}/>
      </div>
    </div>

    <div class="basics-holder basics-holder--multi">
      <div class="label">style</div>
      <div class="multi-inputs">
        <div class="input-with-label">
          <Input {shapes} type="checkbox" bind:checked={getValue("text.bold"), setValue("text.bold")}/>
          <div class="input-label">bold</div>
        </div>

        <div class="input-with-label">
          <Input {shapes} type="checkbox" bind:checked={getValue("text.italic"), setValue("text.italic")}/>
          <div class="input-label">italic</div>
        </div>

        <div class="input-with-label">
          <Input {shapes} type="checkbox" bind:checked={getValue("text.underline"), setValue("text.underline")}/>
          <div class="input-label">underline</div>
        </div>
      </div>
    </div>

    <div class="basics-holder basics-holder--single">
      <div class="label">Value</div>
      <div class="control">
        <Input {shapes} type="text" bind:value={getValue("text.value"), setValue("text.value")}/>
      </div>
    </div>
  </div>
</div>

<style>
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
