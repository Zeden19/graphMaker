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

  const draggableKnob = new DraggableObject(
    () => {
    },
    (dx, dy) => {
      value = Math.floor((Math.atan2(dx, dy) * (180 / Math.PI)) - 90) * -1;
    });
</script>

{#if type === "checkbox"}
  <input bind:this={checkboxRef} type="checkbox" bind:checked {...inputProps}/>
{:else if type === "number" || type === "text"}
  <input {type} {...inputProps} style={multipleDifferentValues && "color: #888"}
         onfocus={() => shapes.forEach(shape => shape.isEditing = true)}
         onblur={() => shapes.forEach(shape => shape.isEditing = false)}
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
    border-radius: 8px;
    background: var(--secondaryBg);
    border: var(--darkBorder);
    padding: 7px 10px;
    color: white;
    width: 4em;
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

  input[type=text] {
    width: 8em;
  }

  input[type=checkbox] {
    transform: scale(1.5);
    width: 1em;
    align-self: center;
  }
</style>