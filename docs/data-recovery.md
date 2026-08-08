# Never lose what you typed

Filling a long form and then losing everything because a template had a typo,
because Templater choked on a command, or because the modal was dismissed by
accident, is the most annoying way this plugin can fail you. Modal Form keeps a
copy of what you type so that never costs you more than a couple of clicks.

## What is kept, and where

While a form is open, the values you enter are written to Obsidian's vault
scoped local storage. That is the storage Obsidian itself uses for things that
are disposable, machine local, and not worth syncing:

- It never touches your vault, so nothing shows up in your files or in git.
- It is per vault, so two vaults never see each other's data.
- It is per machine, so it is not synced to your other devices.

Only values that can be safely stored and read back are kept: text, numbers,
booleans and lists of them. Selected files and images are not, because a file
handle is not something we can restore later.

Saved data is discarded automatically after a week, and we never keep more than
the 25 most recent forms. You can also turn the whole thing off in
**Settings → Modal Form → Preserve form data**, which deletes everything kept
so far.

Data is tracked per form *and* per shape — the set of fields it has and their
input types. Two consequences:

- A form opened through
  [`limitedForm`](../README.md#call-the-form-from-javascript) with `pick` or
  `omit` is a different shape than the full form, so it gets its own saved data
  and can never truncate or delete what the full form had.
- Editing a form invalidates data saved for the old version of it, so a value
  you typed into a text field is never poured into the number field that
  replaced it. Nothing is deleted: that data is still there under
  **Recover form data**, it just stops coming back on its own.

## When it comes back

### You closed the form by accident

If you close a form with the `X`, by clicking outside of it, or Obsidian goes
away underneath you, the data is kept. The next time you open the same form it
comes back, and a notice tells you what was restored and when.

Pressing `Cancel` or `Escape` is treated as a deliberate "I don't want this":
the saved data is discarded and the next open starts from scratch.

### A template failed

When a template cannot be rendered, or the note cannot be created because
Templater reported an error, you get a dialog that shows **the actual error**
and lets you choose what to do:

- **Reopen form** — the form opens again with everything you had typed, so you
  can fix the offending value and submit again.
- **Fix the template** — opens the rendered template in an editor so you can
  correct it by hand and retry. Useful when the problem is in the template
  itself rather than in your input.
- **Discard** — closes the dialog. Nothing is lost: the data stays recoverable.

For the "Insert template" flows the text is already in your note by the time
Templater runs, so there is nothing to retry. You still get a clear error
explaining that the text was inserted but its Templater commands were not
executed.

### Anything else

Run the **Modal Forms: Recover form data** command from the command palette. It
lists the forms we have data for, newest first, with how many fields each one
has and when it was saved. Picking one reopens that form with the data filled
in.

This is the escape hatch for the cases the plugin cannot see, such as a
Templater or QuickAdd script of your own that throws after the form was
submitted.

## Opting out for a single form

If you open forms from your own scripts and you would rather not have a
particular one remembered, pass `preserveData: false`:

```js
const result = await MF.openForm("my-form", { preserveData: false });
```

Nothing is stored for that open, and any data already saved for that form is
left untouched. Form previews inside the form editor already do this, so trying
out a form you are editing never interferes with the real thing.
