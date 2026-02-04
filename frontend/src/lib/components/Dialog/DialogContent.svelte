<script>
  import Button from "$lib/components/Button.svelte";
  import {fly} from "svelte/transition";
  import {getContext} from "svelte";

  let {confirmText, onConfirm, title, subtitle} = $props();
  let dialog = getContext("dialog");
</script>

{#if dialog.open}
  <div class="dialog-backdrop" role="dialog" tabindex="0" onclick={() => dialog.setOpen(false)}>
    <div transition:fly={{y: -100}} class="dialog-card" role="dialog" tabindex="1"
         onclick={(event) => event.stopPropagation()}>
      <div class="dialog-title">{title}</div>
      <div class="dialog-message">
        {subtitle}
      </div>
      <div class="dialog-actions">
        <Button type="ghost" onclick={() => dialog.setOpen(false)}>Cancel</Button>
        <Button type="danger" onclick={onConfirm}>{confirmText}</Button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(6, 8, 12, 0.7);
    display: grid;
    place-items: center;
    z-index: 20;
  }

  .dialog-card {
    width: min(420px, 90vw);
    background: var(--tertiaryBg);
    border: 1px solid rgba(210, 71, 71, 0.6);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }

  .dialog-title {
    font-size: 1.1em;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .dialog-message {
    color: rgba(225, 232, 235, 0.7);
    font-size: 0.92em;
    margin-bottom: 18px;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
</style>