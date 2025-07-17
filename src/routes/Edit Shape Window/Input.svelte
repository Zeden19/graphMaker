<script>
  let {value = $bindable(), checked = $bindable(), type, ...inputProps} = $props();
</script>

{#if type === "checkbox"}
  <input type="checkbox" bind:checked {...inputProps}/>
{:else if type === "number"}
  <input {type} bind:value {...inputProps}/>
{:else if type === "color"}
  <input {...inputProps}/>
{/if}

<style>
  input[type=number], input[readonly] {
    border-radius: 8px;
    background: var(--secondaryBg);
    border: var(--darkBorder);
    padding: 7px 10px;
    color: white;
    width: 4em;
  }

  input[type=checkbox] {
    transform: scale(1.5);
    width: 1em;
    align-self: center;
  }
</style>