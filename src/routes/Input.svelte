<script>
  let {value = $bindable(), ...inputProps} = $props();

</script>

<input bind:value {...inputProps}/>

<style>
  input {
    border-radius: 8px;
    background: var(--secondaryBg);
    border: var(--darkBorder);
    padding: 7px 10px;
    color: white;
    width: 4em;
  }
</style>