<script>
  import {getContext} from "svelte";
  import Button from "$lib/components/Button.svelte";

  let {children, ...buttonProps} = $props();

  let dialog = getContext("dialog");
</script>

<Button type={buttonProps.type ?? `ghost`}
        {...buttonProps}
        onclick={() => {
          dialog.setOpen(true);
          buttonProps?.onclick?.()
        }}>
  {@render children()}
</Button>