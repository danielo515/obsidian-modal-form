
/**
 * Utility function to remove an element from an array in-place.
 * I'm not a fan of this kind of practices, but Obsidian is higly OOP
 * and relies in mutation heavily, as as Svelte (the used UI library).
 * This is the simplest way to make sure the data in the UI represents
 * the data in the app.
**/
export function remove_inplace<T>(arr: Array<T>, value: T): void {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
}
