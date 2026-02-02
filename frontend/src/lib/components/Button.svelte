<script>
  let {onclick, type, children, ...buttonProps} = $props();
</script>

<button class={`${type}-button`} {onclick} {...buttonProps}>{@render children()}</button>

<style>
   .primary-button {
    background: #1f6a3b;
    border: none;
    color: white;
    padding: 8px 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .primary-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(31, 106, 59, 0.25);
  }

   .danger-button {
    background: rgba(210, 71, 71, 0.15);
    border: 1px solid rgba(210, 71, 71, 0.6);
    color: #ffb3b3;
    padding: 8px 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .danger-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(150, 42, 42, 0.25);
  }

  .ghost-button {
    background: transparent;
    border: 1px solid rgba(65, 71, 92, 0.7);
    color: white;
    padding: 6px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  .ghost-button:hover {
    border-color: rgba(65, 71, 92, 0.95);
    background: rgba(22, 28, 36, 0.8);
  }
</style>