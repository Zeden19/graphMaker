<script>
  let {shapes, value = $bindable(), checked = $bindable(), fallback, type = "text", ...inputProps} = $props();

  let multipleShapesSelected = $derived(value === undefined);
  let displayedValue = $derived(multipleShapesSelected && type === "number" ? fallback : value)
</script>

{#if type === "checkbox"}
  <input type="checkbox" bind:checked {...inputProps}/>
{:else if type === "number" || type === "text"}
  <input {type} {...inputProps} style={multipleShapesSelected && "color: #888"}
         onfocus={() => shapes.forEach(shape => shape.isEditing = true)}
         onblur={() => shapes.forEach(shape => shape.isEditing = false)}
         bind:value={() => displayedValue,
         (newValue) => {
            if (newValue === fallback && multipleShapesSelected) return;
            value = displayedValue = newValue
          }}/>
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

  input[type=text] {
    width: 8em;
  }

  input[type=checkbox] {
    transform: scale(1.5);
    width: 1em;
    align-self: center;
  }
</style>