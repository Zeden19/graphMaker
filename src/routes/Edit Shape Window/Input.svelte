<script>
  import DraggableObject from "../Shapes/DraggableObject.svelte.js";

  let {shapes, value = $bindable(), checked = $bindable(), fallback, type = "text", ...inputProps} = $props();

  let multipleDifferentValues = $derived(value === undefined);
  let displayedValue = $derived(multipleDifferentValues && type === "number" ? fallback : value)

  let checkboxRef = $state();

  $effect(() => {
    if (type === "checkbox") {
      checkboxRef.indeterminate = checked === undefined;
    }
  });

  let knobCenter = {x: 0, y: 0};
  let angleOffset = 0;

  const draggableKnob = new DraggableObject(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      knobCenter = {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
      const baseAngle = (Math.atan2(event.clientY - knobCenter.y, event.clientX - knobCenter.x) * (180 / Math.PI)) - 90;
      angleOffset = value - baseAngle;
    },
    (_dx, _dy, event) => {
      const baseAngle = (Math.atan2(event.clientY - knobCenter.y, event.clientX - knobCenter.x) * (180 / Math.PI)) - 90;
      value = Math.floor(baseAngle + angleOffset);
    });
</script>

{#if type === "checkbox"}
  <input bind:this={checkboxRef} type="checkbox" bind:checked {...inputProps}/>
{:else if type === "number" || type === "text"}
  <input {type} {...inputProps} style={multipleDifferentValues && "color: #888"}
         bind:value={() => displayedValue,
         (newValue) => {
            if (newValue === fallback && multipleDifferentValues) return;
            value = displayedValue = newValue
          }}/>
{:else if type === "rotation"}
  <div class="circle" onmousedown={draggableKnob.setDrag} role="presentation"
       style="rotate: {value}deg; {multipleDifferentValues && 'background-color: #777'}">
    <div class="innerCircle"></div>
  </div>
{:else if type === "displayOnly"}
  <input {...inputProps}/>
{/if}

<style>
  input[type=number], input[readonly], input[type=text] {
    width: 4em;
  }

  input[type=text] {
    width: 8em;
  }

  .circle {
    align-self: center;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background-color: var(--secondaryBg);
    position: relative;
    border: var(--darkBorder);
  }

  .innerCircle {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: white;

    position: absolute;
    top: 15%;
    left: 37%;
  }

  input[type=checkbox] {
    transform: scale(1.5);
    width: 1em;
    align-self: center;
  }
</style>
