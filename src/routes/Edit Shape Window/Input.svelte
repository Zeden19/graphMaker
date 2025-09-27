<script>
  let {value = $bindable(), checked = $bindable(), fallback, type = "text", ...inputProps} = $props();

  let displayedValue = $derived(value === undefined && type === "number" ? fallback : value)
</script>

{#if type === "checkbox"}
  <input type="checkbox" bind:checked {...inputProps}/>
{:else if type === "number" || type === "text"}
  <input {type} {...inputProps} style={value === undefined && "color: #888"}
  bind:value={() => displayedValue,
  (newValue) => {
    if (newValue === fallback && value === undefined) return
    value = displayedValue = newValue
  }}/>
{:else if type === "color"}
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