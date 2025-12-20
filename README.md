Simple Graph maker made with Svelte

# bugs:

- When a shape is rotated, the changeSizeFnc breaks since it does not account for rotation
- text rotation inside a circle is completely fucked lol. also arrow rotation does not work

# Fixed Bugs
- When you are focusing on an Input when editing a shape, and you unselect the shape, onblur does not fire since the
  the element was deleted and not onfocused, thus isEditing is not disabled, thus you cannot move/delete shape
  - Fixed by making the edit a component Fixed by setting isEditing to false
    at deselect in [Shape.svelte](src/routes/Shapes/Shape.svelte). This simulates "source of truth" model which I should
    follow more