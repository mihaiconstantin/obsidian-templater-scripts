# `Templater` User Scripts for `Obsidian`

## ℹ️ Description

This repository contains opinionated, but convenient, [user scripts] built
around the [`Templater`] plugin for [`Obsidian`].

## ⬇️ Installation

The steps below assume a couple of things:

1. You have an [`Obsidian`] vault.
2. You have already installed and enabled the [`Templater`] community plugin.

Depending on how you handle your vault, you can either use [`git`] to make these
scripts available to your vault, or you can manually download and place them in
your vault.

### The [`git`] way 😎

Add this repository as a [submodule] to your vault in a location of your choice.
Suppose you want to add the submodule to the `Scripts` directory in the root of
your vault. In a terminal, you need to do the following:

```bash
# Change directory to the root of your vault.
cd /path/to/your/vault

# Add this repository as a submodule to your vault.
git submodule add https://github.com/mihaiconstantin/obsidian-templater-scripts.git Scripts
```

At this point, you should have a `Scripts` directory in the root of your vault
that contains the contents of this repository.

*Note.* In most cases, after executing the last command above [`git`] will
automatically download the contents of the repository in the `Scripts`
directory. However, if your [`git`] version is seriously outdated, you may need
to manually initialize the submodule by executing the following command:

```bash
# Download the submodule contents.
git submodule update --init --recursive
```

### The manual way 👀

Download a `.zip` archive of this repository, unpack it, and copy the contents
of the unpacked folder to a location of your choice in the [`Obsidian`] vault
(e.g., in the `Scripts` folder in the root of your vault).

### Registering the scripts

The final step in the installation process is informing [`Templater`] about the
location of our `Scripts` folder. You may want to check [this
resource][templater-user-scripts] for more information. In a nutshell, you
indicate in the [`Templater`] settings where the `Scripts` folder is located, as
shown below:

<p align="center">
    <img width="95%" src="assets/register-scripts-folder.png" alt="register scripts folder"/>
</p>

Additionally, you may also want to exclude this folder in your vault from the
search results. To do this, you need to add the `Scripts` folder to the list of
excluded folders in the [`Obsidian`] settings, as shown below:

<p align="center">
    <img width="95%" src="assets/exclude-scripts-folder.png" alt="exclude scripts folder"/>
</p>

At this point, you are ready to start using the scripts in this repository in
your templates.

## 🚀 Usage

This repository exposes the following scripts to the [`Templater`] `tp` object
in the context of a template:

| Script                            | Description                                                                       |
| :-------------------------------- | :-------------------------------------------------------------------------------- |
| `tp.user.createNoteWithPrompting` | Create a new note from template in a specified location with automated prompting. |


### `tp.user.createNoteWithPrompting(tp, config, fileToMove, ext)`

This script creates a new note from a given template in a specified location and
prompts the user for the relevant note creation and template variable. It also
handles incorrect template configuration and cancellation of the note creation.

#### Arguments

The following arguments, in the presented order, are required:

##### `tp`

The [`Templater`] object. This argument is *required*.

##### `config`

The *required* configuration object that holds relevant note creation and
template variables. This object contains objects that follow the following
structure:

```js
{
    prompt: boolean,
    display: string,
    value: string | string[],
}
```

Each property of the three properties above are *required* and used as follows:

- `prompt`: indicates whether the user should be prompted for the `value` of the
  variable. If `true`, the user will be prompted for the value of the variable.
  If `false`, the `value` of the variable will be used as is.
- `display`: the text that will be displayed to the user when prompted for the
  `value` of the variable.
- `value`: the value of the variable. If `prompt` is `true`, this value will be
  used as the default value for the prompt. If `prompt` is `false`, this value
  will be used as is.
  - If the `value` is set to a string, the [`tp.system.prompt`] will be used for
    the prompt.
  - If the `value` is set to an array of elements, the [`tp.system.suggester`]
    will be used for the prompt.

For example, the bare minimum `config` object needs to contain two objects as
indicated above named `path` and `filename`:

```js
// The configuration object.
let config = {
    // The path where to create the note.
    path: {
        prompt: true,
        display: "Please indicate the path.",
        value: "Folder"
    },

    // The note note (i.e., the title).
    filename: {
        prompt: true,
        display: "Please indicate the file name.",
        value: "A new note",
    }
}
```

Aside from the `prompt`, `display`, and `value` above, the following optional
properties can also be used:

```js
{
    multiple: boolean,
    limit: number,
    text: string[] | (item: string) => string
}
```

- The `multiple` property can be used when the `value` property is set to a string
to indicate whether the user should be allowed to enter a multi-line input in
the prompt modal.
- The `limit` property can be used when the `value` property is set to an array
  to indicate the maximum number of suggestions that should be displayed by the
  [`tp.system.suggester`].
- The `text` property can be used when the `value` property is set to an array
  to indicate the text that should be displayed for each suggestion. If this
  property is set to an array, the text will be displayed as is. If this
  property is set to a function, the function will be called for each suggestion
  and the returned value will be displayed. See the examples on the
  [`tp.system.suggester`] documentation page for more information.

##### `fileToMove`

The filed created by the invocation of the `Templater: Create new note from
template` command. This argument is *required* and must be set from the context
of the template to the following:

```js
tp.file.path(true)
```

This way, the `tp.user.createNoteWithPrompting` script is aware of the new note
created by the `Templater: Create new note from template` command and can move
it to the specified location regardless of where it was created.

##### `ext`

The extension of the template file. This argument is *optional* and set to `.md`
by default.

#### Example

The following example shows how to use the `tp.user.createNoteWithPrompting`.
Suppose that you have a template called `Movie Template` with the following
content:

```md
<%-*
// Define the configuration object.
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
        display: "What is the tile of the movie?",
        value: "New Movie",
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
await tp.user.createNoteWithPrompting(tp, config, tp.file.path(true))
-%>
# <% config.filename.value %>

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
# A cool movie title

## Description

- Genre: #other
- Re-watchable: no

## Impression

Line one
Line two

```

The following video shows the above example in action:

https://github.com/mihaiconstantin/obsidian-templater-scripts/assets/20051042/765d864f-7d94-4d73-ab6a-9db5beb49d6c

*Note.* The location where the `Movie Template` template note is stored must be
registered in the [`Templater`] settings. Please check the [`Templater`]
documentation for how to do this.

You may also consider replacing the lines

```js
// Create the note.
await tp.user.createNoteWithPrompting(tp, config, tp.file.path(true))
```

with

```js
// Proceed with the note creation gracefully.
try {
    // Create the note.
    await tp.user.createNoteWithPrompting(tp, config, tp.file.path(true))

    // Let the user know if the creation succeeded.
    new Notice(`Created note '${config.filename.value}'.`)
} catch(error) {
    // Inform the user.
    new Notice(error.message)

    // Stop the execution.
    return
}
```

This will result in any errors (e.g., failure if the note already exists or the
user cancels the prompt) being caught and displayed in the `Obsidian` interface 
as [gentle notices].

## Contributing

Any contributions, suggestions, or bug reports are welcome and greatly
appreciated. Please open an [issue] or submit a [pull request].

## ⚖️ License

This repository is licensed under the [MIT license](LICENSE).

[user scripts]: https://silentvoid13.github.io/Templater/user-functions/overview.html
[`Templater`]: https://silentvoid13.github.io/Templater/introduction.html
[`Obsidian`]: https://obsidian.md/
[`git`]: https://git-scm.com/
[submodule]: https://github.blog/2016-02-01-working-with-submodules/
[templater-user-scripts]: https://silentvoid13.github.io/Templater/user-functions/script-user-functions.html
[`tp.system.prompt`]: https://silentvoid13.github.io/Templater/internal-functions/internal-modules/system-module.html
[`tp.system.suggester`]: https://silentvoid13.github.io/Templater/internal-functions/internal-modules/system-module.html
[gentle notice]: https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts#L2547
[issue]: https://github.com/mihaiconstantin/obsidian-templater-scripts/issues
[pull request]: https://github.com/mihaiconstantin/obsidian-templater-scripts/pulls
