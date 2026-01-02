Simple Graph maker made with Svelte

# bugs:
- arrow rotation does not work

## Fixed Bugs

- When you are focusing on an Input when editing a shape, and you unselect the shape, onblur does not fire since the
  the element was deleted and not onfocused, thus isEditing is not disabled, thus you cannot move/delete shape
    - Fixed by making the edit a component Fixed by setting isEditing to false
      at deselect in [Shape.svelte](src/routes/Shapes/Shape.svelte). This simulates "source of truth" model which I
      should follow more

# Code adjustments

- Make a generic class for shapes that don't have one set of x and y coordinates. Used for arrow and triangle (and any
  other shapes that are more complex)
- When adding new shapes, make it so that I don't have to manually insert the button to insert the shape
- ~~every shape should have a rotation property, apply it in Shape~~
- consider including rotation in shape.svelte, on the g-element. this would require all shapes to have a center/middle
- ~~standardize shapetext styles (and maybe even include in Shape.svelte given some variables)~~
- typescript in .svelte.js files

# Features
