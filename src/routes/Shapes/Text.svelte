<script>
  import {scale} from "svelte/transition";
  import {onMount} from "svelte";
  import ChangeColor from "../Edit Shape Window/ChangeColor.svelte";
  import {colord} from "colord";

  let {selected, onmousedown} = $props();

  let contenteditable = $state(false);
  let showPopup = $state(false);
  let textRef = $state();

  let fontSize = $state(12);
  let color = $state(colord("white"));
  let bold = $state(false);
  let italic = $state(false);
  let underline = $state(false);


  onMount(() => {
    window.addEventListener('click', (event) => {
      if (textRef && !(textRef.contains(event.target))) {
        showPopup = false;
      }
    })
  })
</script>

<div class="text-container" transition:scale={{duration: 120}}>
  <div class="no-select text" draggable="false" {contenteditable} bind:this={textRef}
       onfocus={() => contenteditable = true}
       onmouseover={() => contenteditable = true}
       onmouseleave={() => {
         if (!(document.activeElement === textRef)) contenteditable = false
       }}
       onmousedown={onmousedown ? (event) => {
         onmousedown(event);
         showPopup = true;
       } : null}
       style="
       font-size:{fontSize}px;
       pointer-events:{selected ? 'auto' : ''};
       color: {color.toHex()};
       font-weight: {bold ? 'bold' : ''};
       text-decoration: {underline ? 'underline' : ''};
       font-style: {italic ? 'italic' : ''};"
       role="presentation">
    Text here

    {#if showPopup}
      <div class="popup-wrapper">
        <div class="popup-content">
          <div class="edit-basics">
            <div>Font Size: <input type="number" bind:value={fontSize} min="1"/></div>
            <div>Bold: <input bind:checked={bold} type="checkbox"/> </div>
            <div>Italic: <input bind:checked={italic} type="checkbox"/> </div>
            <div>Underline: <input bind:checked={underline} type="checkbox"/> </div>
          </div>
          <div>Color:
            <ChangeColor bind:colorToChange={color}/>
          </div>

        </div>
        <div class="popup-arrow"></div>
      </div>
    {/if}
  </div>
</div>

<style>
  .text-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .text {
    min-width: 0;
    text-align: center;
    position: relative;
  }

  .popup-wrapper {
    position: absolute;
    bottom: 13px;
    right: -50px;

    color: black;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: auto;
    transition: opacity 120ms;

  }

  .popup-content {
    background: white;
    border: 1px solid black;
    border-radius: 8px;
    font-size: 14px;
    position: relative;
    z-index: 1;
    align-items: center;
  }

  .edit-basics {
    display: flex;
    gap: 10px;
  }

  .popup-arrow {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid white;
    margin-top: -1px;
    position: relative;
    z-index: 0;
  }

  .popup-arrow::before {
    content: "";
    position: absolute;
    top: -7px;
    left: -7px;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
  }
</style>