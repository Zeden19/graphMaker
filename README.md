Simple Graph maker made with Svelte

# bugs:
- When a shape is rotated, the changeSizeFnc breaks since it does not account for rotation
- text rotation inside a circle is completely fucked lol
- When you are focusing on an Input when editing a shape, and you unselect the shape, onblur does not fire since the
the element was deleted and not onfocused. Fix by making the edit a component