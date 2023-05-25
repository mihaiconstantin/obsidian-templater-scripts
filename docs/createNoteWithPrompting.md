# `createNoteWithPrompting`

This script creates a new note from a given template in a specified location and
prompts the user for the relevant note creation and template variable. It also
handles incorrect template configuration, cancellation events, and more error
prone scenarios.

## Usage

```js
tp.user.createNoteWithPrompting(tp, config, ext)
```

## Arguments

The following arguments, in the presented order, are *required*:

### `tp`

The [`Templater`] object passed from the context of a template.

### `config`

The configuration object that holds relevant note creation and template
variables. Each template variable holds a single *configuration object*, that is
composed of an arbitrary number of *configuration elements* objects, with the
following required properties:

```js
{
    prompt: boolean,
    display: string,
    value: string | string[],
    multiple: boolean,
    limit: number,
    text: string[] | (item: any) => string
}
```

Each `config` object needs to contain at least two elements named `path` and
`filename`. Only the `prompt`, `display`, and `value` properties are required.
The other properties are optional. For example, a configuration object with the
elements `path` and `filename` might look like this:

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
        value: "A new note",
    }
}
```

The properties of the configuration elements are as follows:

- **`prompt`**: indicates whether the user should be prompted for the `value` of
  the element object. If `true`, the user will be prompted, and the prompt modal
  will be populated with the current contents of the `value` property. Upon
  submission, the `value` will be updated with the prompt input. If `false`, the
  `value` of the property will be used as declared. The type of prompt shown
  depends on the type of the `value` property:
  - If the `value` is set to a string, the [`tp.system.prompt`] will be used for
    the prompt (i.e., a single-line input).
  - If the `value` is set to an array of elements, the [`tp.system.suggester`]
    will be used for the prompt (i.e., selection from a drop-down menu).
- **`display`**: the text that will be displayed to the user when prompted for
  setting the `value` property.
- **`value`**: the value of the configuration element that is intended to be
  used in the template. The type of the `value` property determines the type of
  prompt used and can be either a string or an array of elements. Referencing
  other elements is possible using the `{{` and `}}` delimiters. For example, if
  the `value` of the `filename` element is set to `{{ path }}`, the `value` of
  the `filename` element will be set to the `value` of the `path` element. The
  script adjusts the prompting order to ensure all reference dependencies are
  correctly resolved.

Aside from the `prompt`, `display`, and `value` above, the following optional
properties can also be used:

- **`multiple`**: used when the `value` property is set to a string to indicate
  whether the user should be allowed to enter a multi-line input in the prompt
  modal (i.e., a text area). If `true`, multi-line input is allowed. If `false`,
  only single-line input is allowed. This property is ignored when the `value`
  is set to an array. Defaults to `false`.
- **`limit`**: used when the `value` property is set to an array to indicate the
  maximum number of suggestions that should be displayed by the
  [`tp.system.suggester`]. If this property is not set, the default behavior of
  the [`tp.system.suggester`] will be used.

- **`text`**: used when the `value` property is set to an array to indicate the
  corresponding text that should be displayed in the user interface for each
  suggestion (i.e., array element in `value`). This property can be set to an
  array of strings or a function.
    - If this property is set to an array of strings, the text will be displayed
      as is (i.e., element `i` in `text` will be displayed for element `i` in
      `value`).
    - If this property is set to a function, the function will be called for
      each suggestion and the returned value will be displayed. The function
      will be called with a single argument, which is the corresponding element
      in `value`. The function should return a string. See the examples on the
      [`tp.system.suggester`] documentation page for more information.

### `ext`

The extension of the resulting note file. This argument is *optional* and set to
`.md` by default.

## Examples

The following example shows how to use the `tp.user.createNoteWithPrompting`.
Suppose that you have a template called `Movie Template` with the following
content:

```txt
<%-*
//The configuration object containing several elements.
let config = {
    // The note location.
    path: {
        prompt: true,
        display: "Where to store the movie note?",
        value: "Movies"
    },

    // The note file name.
    filename: {
        prompt: true,
        display: "How to name the movie note?",
        value: "New Movie",
    },

    // The movie title.
    title: {
        prompt: true,
        display: "What is the tile of the movie?",
        value: "🎥 {{ filename }}",
    },

    // The genre of the movie.
    genre: {
        prompt: true,
        display: "What is the movie genre?",
        value: ["comedy", "thriller", "other"]
    },

    // Whether the movie is re-watchable.
    rewatch: {
        prompt: true,
        display: "Would I rewatch this movie?",
        value: ["yes", "no"],
        text: ["Without a doubt, yes!", "I mean... it was okay, but..."]
    },

    // A general impression about the movie.
    impression: {
        prompt: true,
        display: "What is my impression about this movie?",
        value: "Impression...",
        multiline: true
    }
}

// Create the note.
await tp.user.createNoteWithPrompting(tp, config)
_%>

# <% config.title.value %>

## Description

- Genre: #<% config.genre.value %>
- Re-watchable: <% config.rewatch.value %>

## Impression

<% config.impression.value %>

```

Then, running the `Templater: Create new note from template` command and
selecting the `Movie Template` template will prompt the user for all the
`config` objects that have `prompt: true` and, depending on the input, will
produce something similar to:

```md
# 🎥 A cool movie title

## Description

- Genre: #other
- Re-watchable: no

## Impression

Line one
Line two

```

The following video shows the above example in action:

https://github.com/mihaiconstantin/obsidian-templater-scripts/assets/20051042/765d864f-7d94-4d73-ab6a-9db5beb49d6c


It is advisable that you consider replacing the lines

```js
// Create the note.
await tp.user.createNoteWithPrompting(tp, config)
```

with

```js
// Proceed with the note creation gracefully.
try {
    // Create the note.
    await tp.user.createNoteWithPrompting(tp, config)

    // Let the user know if the creation succeeded.
    new Notice(`Created note '${config.filename.value}'.`)
} catch(error) {
    // Inform the user.
    new Notice(error.message)

    // Stop the execution.
    return
}
```

This will result in any errors (e.g., failure if the note already exists or if
the user cancels the prompt) being caught and displayed in the [`Obsidian`]
interface as [gentle notices][notice].

[`Templater`]: https://silentvoid13.github.io/Templater/introduction.html
[`Obsidian`]: https://obsidian.md/
[`tp.system.prompt`]: https://silentvoid13.github.io/Templater/internal-functions/internal-modules/system-module.html
[`tp.system.suggester`]: https://silentvoid13.github.io/Templater/internal-functions/internal-modules/system-module.html
[notice]: https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts#L2547
