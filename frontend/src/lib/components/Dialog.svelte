<script>
  import {fly} from "svelte/transition";

  let {confirmText, onConfirm, title, subtitle, showDialog = $bindable()} = $props();
</script>

{#if showDialog}
  <div class="dialog-backdrop" role="dialog" tabindex="0" onclick={() => showDialog = false}>
    <div transition:fly={{y: -100}} class="dialog-card" role="dialog" tabindex="1" onclick={(event) => event.stopPropagation()}>
      <div class="dialog-title">{title}</div>
      <div class="dialog-message">
        {subtitle}
      </div>
      <div class="dialog-actions">
        <button class="ghost-button" type="button" onclick={() => showDialog = false}>Cancel</button>
        <button class="danger-button" type="button" onclick={onConfirm}>{confirmText}</button>
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
    background: #0f141a;
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