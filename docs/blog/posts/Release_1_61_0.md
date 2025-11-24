---
title: Release notes for 1.61.0
date: 2025-04-25
tags: [ "release-notes" ]
---

# Release 1.61.0: Form Commands

I'm excited to announce **Release 1.61.0** of Modal Forms, focused on making triggering forms easier and more seamless to use. You can now create Obsidian commands for your forms, making them instantly accessible from the command palette, and eliminating the need to maintain external templates just to use a form.

## ✨ New: Form Commands

You can now register dedicated commands for any form you create as long as you provide a template for it. When you trigger these commands, the form will open as usual, and after submission the template you’ve defined will be processed and either:

- Inserted at your current cursor position in the active note, **or**
- Used to create a brand new note, with a name and location of your choice

This makes it easier than ever to:

- Standardize note creation workflows
- Quickly insert structured content
- Reduce friction for simpler forms as you don't need an external template for using them

You’ll find the new options in the Template tab when editing a form. Just check the boxes for the command(s) you want, save, and your commands will appear in the palette as:

- `Modal Forms: Insert template: [Form Name]`
- `Modal Forms: Create note from template: [Form Name]`

## 🧩 Templater Support, now Easier to Use Than Ever

Just a reminder: Modal Forms templates have [Templater](https://github.com/SilentVoid13/Templater) syntax support! This allows powerful workflows (dynamic dates, user scripts, and more) directly in your form templates. With this release, triggering those Templater-powered workflows is easier than ever: simply run your form command, fill out the fields, and let Modal Forms and Templater handle the rest.

## 📝 QuickAdd: Still Useful, But Often Not Needed

If you previously used QuickAdd just to trigger forms more conveniently, Modal Forms’ new command feature can now handle those scenarios natively. For more complex QuickAdd workflows, you may still want to keep it, but for simple form-triggered templates, Modal Forms is now a complete solution.

## 🚦 How to Use

1. Edit a form and go to the Template tab
2. Create or edit your template
3. Check one or both command options (Insert/Note)
4. Save the form
5. Use your new commands from the command palette!

For more details—including advanced template syntax, variable transformations, and examples—see the [Templates documentation](../templates.md).

---

We hope this makes your workflow smoother and more powerful! As always, your feedback is welcome. Happy form-building!
