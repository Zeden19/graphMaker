<script>
  import trash from "$lib/assets/trash.png";
  import Style from "./Style.svelte";
  import Text from "./Text.svelte";

  let {shapes = $bindable()} = $props();
  const getProperty = (shape, property) => property.split(".").reduce((a, b) => {
    return typeof a[b] === "function" ? a[b]() : a[b]
  }, shape);

  const setProperty = (shape, property, value) => {
    const path = property.split(".");
    const lastKey = path.pop();

    // Navigate to the parent object
    const parent = path.reduce((obj, key) => {
      return typeof obj[key] === "function" ? obj[key]() : obj[key];
    }, shape);

    // Set the final property -- not used as nothing calls function; keeping in case it is needed
    if (lastKey.endsWith("()")) {
      // Handle method calls - call the method with the value
      const methodName = lastKey.slice(0, -2);
      if (typeof parent[methodName] === "function") {
        parent[methodName](value);
      }
    } else {
      // Handle regular property assignment
      parent[lastKey] = value;
    }
  };

  // These fnc names gotta be changed
  const allHasProperty = (property, val, everyOrSome) => {
    return everyOrSome === "every" ?
      shapes.every(shape => getProperty(shape, property) === val) :
      shapes.some(shape => getProperty(shape, property) === val);
  }

  const getValue = (value, returnValue = value) => {
    return () => allHasProperty(value, getProperty(shapes[0], value), "every") ?
      getProperty(shapes[0], returnValue) : undefined
  }

  const setValue = (value) => {
    return (newValue) => shapes.forEach(shape => setProperty(shape, value, newValue))
  }

  let ActiveTab = $state(Style);
  let activeTabProps = $state({ getValue, allHasProperty, setValue, shapes });
</script>
<div class="title">{shapes[0]}</div>

<div class="tab-container">
  <button class="tab {ActiveTab === Style && 'selected'}" onclick={() => ActiveTab = Style}>Style</button>
  <button class="tab {ActiveTab === Text && 'selected'}" onclick={() => ActiveTab = Text}>Text</button>
</div>

<div class="container">
  <ActiveTab {...activeTabProps}/>
</div>

<!--Must be arrow function: https://svelte.dev/docs/svelte/$state#Classes-->
<button class="trash" onclick={() => shapes.forEach(shape => shape.delete())}>
  <img draggable="false" width="50" alt="trash" src="{trash}"/>
</button>

<style>
  .title {
    align-self: center;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .tab-container {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }

  .tab {
    color: white;
    width: 100%;
    border-top: var(--mainBorder);
    border-bottom: var(--mainBorder);
    padding: 8px;
    margin-bottom: 10px;
  }

  .tab:first-child {
    border-right: var(--mainBorder);
  }

  .tab:hover {
    cursor: pointer;
    filter: brightness(0.8);
  }

  .tab:active {
     filter: brightness(1.1);
  }

  .selected {
    background-color: #B13BFF;
  }

  .container {
    padding: 0 1em 4em 1em;
  }

  .trash {
    position: absolute;
    right: 12px;
    bottom: 12px;
    padding: 5px;
  }

</style>
