<!--  {% raw %} -->

<h1 align="center" style="line-height: 2">
    <code>Templater</code> User Scripts <br>
    for <code>Obsidian</code>
    <br/>
    <a href="https://obsidian-scripts.mihaiconstantin.com/">
        🏠 Page
    </a>
</h1>

## 🚀 [`makeNote`]

This script, inserts or creates a new note from a given template in a specified
location without prompting the user for input. It also handles incorrect
template configuration, cancellation events, and other errors. The script is
intended to be used as a user script for the [`Templater`] plugin and can be
used useful when the template variables are known in advance and can be
specified in the configuration object as plain strings. The following provides
an overview of the topics covered on this page:

- [Usage](#usage)
- [Arguments](#arguments)
  - [`tp`](#tp)
  - [`config`](#config)
  - [`ext`](#ext)
- [Value](#value)
- [Examples](#examples)

## Usage

```js
tp.user.makeNote(tp, config, ext)
```

## Arguments

The following arguments, in the presented order, are *required*:

### `tp`

The [`Templater`] object passed from the context of a template.

### `config`

The configuration object that holds relevant note creation and template
variables. Each template variable holds a single *configuration object*, that is
composed of an arbitrary number of *configuration elements* objects. See the
documentation for the [`prompt`](prompt.md) user script for how the
configuration object should be structured.

If `Templater` is invoked via the command `Templater: Create new note from
template`, the configuration object must contain at least two elements named
exactly `path` and `filename` as indicated below.

```js
// The configuration object.
let config = {
    // The `path` element indicating where to create the note.
    path: {
        prompt: true,
        display: "Please indicate the path.",
        value: "Folder"
    },

    // The `filename` element indicating how to name the note.
    filename: {
        prompt: true,
        display: "Please indicate the file name.",
        value: "A new note"
    }
}
```

There are no restrictions for the number and name of configuration elements when
the invocation occurs via `Templater: Open insert Template modal`.

*Note.* The configuration object is not processed (e.g., `check`, and `process`
properties have no effect). Such functionality requires [prompting](prompt.md).
This script is mostly intended for chases when additional steps need to be
performed between the prompting process and the actual note creation. To this
end, in most of the cases this scrip will be used after the
[`prompt`](prompt.md) user script has been executed. When no additional steps
are required, the [`makeNoteWithPrompting`](makeNoteWithPrompting.md) user
script should be used instead.

### `ext`

The extension of the resulting note file. This argument is *optional* and set to
`.md` by default.

## Value

The `makeNote` function call returns a promise that fulfills to the [`TFile`]
representation of the newly created note when `Templater` is invoked via the
command `Templater: Create new note from template`, or `undefined` when
`Templater` is invoked via the command `Templater: Open insert Template modal`.
In case of checking and processing errors, or user cancelling the prompting
process, the promise will fulfill to `undefined`.

## Examples

This script functions similarly to
[`makeNoteWithPrompting`](makeNoteWithPrompting.md), but it does not prompt the
user for input. Please check the documentation for the
[`makeNoteWithPrompting`](makeNoteWithPrompting.md) user script for more
detailed examples.


[`Templater`]: https://silentvoid13.github.io/Templater/introduction.html
[`TFile`]: https://github.com/obsidianmd/obsidian-api/blob/583ba39e3f6c0546de5e5e8742256a60e2d78ebc/obsidian.d.ts#L3616
[`makeNote`]: https://github.com/mihaiconstantin/obsidian-templater-scripts/blob/main/makeNote.js

<!-- {% endraw %} -->
