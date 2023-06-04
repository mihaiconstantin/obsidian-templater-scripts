<!--  {% raw %} -->

<h1 align="center" style="line-height: 2">
    <code>Templater</code> User Scripts <br>
    for <code>Obsidian</code>
    <br/>
    <a href="https://obsidian-scripts.mihaiconstantin.com/">
        🏠 Page
    </a>
</h1>

## 🚀 [`prompt`]

This script, prompts the user for the relevant template variables based on a
configuration object. It also handles incorrect template configuration,
cancellation events, and other errors. The script is intended to be used as a
user script for the [`Templater`] plugin.

The following provides an overview of the topics covered on this page:

- [Usage](#usage)
- [Arguments](#arguments)
  - [`tp`](#tp)
  - [`config`](#config)
- [Value](#value)
- [Examples](#examples)
  - [Inserting template](#inserting-template)
  - [Creating note from template](#creating-note-from-template)
  - [Value referencing](#value-referencing)
  - [Value Checking](#value-checking)
  - [Value Processing](#value-processing)
  - [Error handling](#error-handling)
  - [The complete template](#the-complete-template)

## Usage

```js
tp.user.prompt(tp, config)
```

## Arguments

The following arguments, in the presented order, are *required*:

### `tp`

The [`Templater`] object passed from the context of a template.

### `config`

The configuration object that holds relevant template variables. Each template
variable holds a single *configuration object*, that is composed of an arbitrary
number of *configuration elements* objects. In turn, each configuration element
can have some of the following properties:

```js
{
    prompt: boolean,
    display: string,
    value: string | string[] | (tp, config) => string | (tp, config) => string[],
    multiple: boolean,
    limit: number,
    text: string[] | (item: any) => string,
    check: (value: string, tp: Templater, config: object) => boolean,
    process: (value: string, tp: Templater, config: object) => string
}
```

Regardless of how `Templater` is invoked, the `prompt` and `value` are required
configuration element properties. If the `prompt` value is set to `true`, the
`display` property is also required. All other properties mentioned above are
optional. For example, a configuration object with the elements `path` and
`filename` might look like this:

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

The three properties presented below represent required configuration element
properties.

**`prompt`**

- Indicates whether the user should be prompted for the `value` property of the
  configuration element. If `true`, the user will be prompted, and the prompt
  modal will be populated with the current contents of the `value` property.
  Upon submission, the `value` will be updated with the prompt input. If
  `false`, the `value` of the property will be used as declared in the template.
  The type of prompt shown depends on the type of the `value` property:
  - If the `value` is set to a string, the [`tp.system.prompt`] will be used for
    the prompt (i.e., a single-line input, or textarea when the `multiple`
    property is set to `true`).
  - If the `value` is set to an array of elements, the [`tp.system.suggester`]
    will be used for the prompt (i.e., selection from a drop-down menu).

**`display`**

- Specifies text that will be displayed to the user when prompted for setting
  the `value` property. This property is required if `prompt` is set to `true`.

**`value`**

- Holds the value of the configuration element that is intended for the
  template. The type of the `value` property determines the type of prompt used
  and can be either a string or an array of elements.
- For advanced use cases, it is also possible to set the `value` to a function
  that returns a string or an array of elements. If set to a function, the
  function will be evaluated immediately, right before the prompt, if a prompt
  is requested. The function can be asynchronous and must be declared with two
  arguments, `tp` and `config`. The `tp` argument represents the [`Templater`]
  object, and the `config` argument represents the configuration object. The
  `config` argument is useful for accessing other configuration elements and its
  state depends on the order of the configuration elements.
- Referencing other elements is possible using the `{{` and `}}` delimiters. For
  example, if the `value` of the `filename` element is set to `{{ path }}`, the
  `value` of the `filename` element will be set to the `value` of the `path`
  element. The script adjusts the prompting order to ensure all references are
  correctly resolved. Also, multiple references are supported (e.g., `Composite
  value from {{ filename }} and some {{ date }} element`).

Aside from the `prompt`, `display`, and `value` properties above, the following
optional properties can also be used.

**`multiple`**

- Used when the `value` property is set to a string to indicate whether the user
  should be allowed to enter a multi-line input in the prompt modal (i.e., a
  text area). If `true`, multi-line input is allowed. If `false`, only
  single-line input is allowed. This property is ignored when the `value` is set
  to an array. Defaults to `false`.


**`limit`**

- Used when the `value` property is set to an array to indicate the maximum
  number of suggestions that should be displayed by the [`tp.system.suggester`].
  If this property is not set, the default behavior of the
  [`tp.system.suggester`] will be used.

**`text`**

- Used when the `value` property is set to an array to indicate the
  corresponding text that should be displayed in the user interface for each
  suggestion (i.e., array element in `value`). This property can be set to an
  array of strings or a function.
  - If this property is set to an array of strings, the text will be displayed
    as is (i.e., element `i` in `text` will be displayed for element `i` in
    `value`).
  - If this property is set to a function, the function will be called for each
    suggestion and the returned value will be displayed. The function will be
    called with a single argument, which is the corresponding element in
    `value`. The function should return a string. See the examples on the
    [`tp.system.suggester`] documentation page for more information.

**`check`**

- Used for checking whether the `value` property is valid according to some
  custom criteria.
- This property must be a function that takes three arguments, namely, `value`,
  `tp`, and `config`. The `value` argument represents the `value` of the
  configuration element. The `tp` argument represents the [`Templater`] object.
  The `config` argument represents the configuration object. The `tp` and
  `config` arguments are useful, e.g., for accessing other configuration
  elements and their `value` properties at the time of the check. The function
  must return a boolean, which gets interpreted as follows:
  - If the function returns `true`, the `value` property is considered valid.
  - If the function returns `false`, the `value` property is considered invalid
    and an error is thrown.
- If the `check` property is used in conjunction with `prompt: true`, the check
  is performed after the prompt modal is submitted. As a rule, the check if
  always performed last, even if the configuration element has a `process`
  property for post-processing (i.e., see below).
- This function may also be asynchronous. See the [Examples](#examples) section
  for more information.

**`process`**

- Used for further processing the `value` property.
- This property must be a function that takes three arguments, namely, `value`,
  `tp`, and `config`. The `value` argument represents the `value` of the
  configuration element. The `tp` argument represents the [`Templater`] object.
  The `config` argument represents the configuration object. The `tp` and
  `config` arguments are useful for accessing other configuration elements and
  at the time of the processing.
- The function must return a string which will be set used as the new `value` of
  the configuration element. If the property `prompt` is set to `true`, then new
  prompt modal will be shown with the updated `value` allowing the user to
  further modify the `value`. If this behavior is not desired, you can set the
  `prompt` property to `false` in the `process` function, which will prevent the
  prompt modal from being shown.
- This function may also be asynchronous (e.g., useful for fetching data based
  on the `value` property). See the [Examples](#examples) section for more
  information.

As a rule, the following order is followed when evaluating the configuration
elements:
- If the `value` property is set to a function, the function is evaluated first.
- Then, if a prompt is requested (i.e., `prompt: true`), the prompt is shown and
  the user can enter a new `value`.
- Then, if the `process` property is set, the `value` is processed.
- Finally, if the `check` property is set, the `value` is checked.

## Value

The `prompt` function call returns `undefined`. The configuration
object is passed by reference and modified in-place.

## Examples

In this section, we succinctly review some of the capabilities of the `prompt`
user script in the context of another user script called
[`makeNoteWithPrompting`](makeNoteWithPrompting.md), which uses `prompt` behind
the scenes to create a note file, or insert a template into an existing note.
Please refer back to the [Usage](#usage) section for more information on the
configuration elements and their properties. We will gradually build up towards
a fully-fledged fictive template for creating questionably helpful movie notes.

### Inserting template

Suppose we have a movie template creatively called `Movie Template` with the
following content:

```txt
<%-*
// The configuration object containing several elements.
let config = {
    // The movie title.
    title: {
        prompt: true,
        display: "What is the tile of the movie?",
        value: "The Movie Title"
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

    // A general summary of the movie.
    summary: {
        prompt: true,
        display: "What is the summary of the movie?",
        value: "Summary...",
        multiline: true
    }
}

// Create the note.
await tp.user.makeNoteWithPrompting(tp, config)
_%>

# 🎥 <% config.title.value %>

## Description

- Genre: #<% config.genre.value %>
- Re-watchable: <% config.rewatch.value %>

## Summary

<% config.summary.value %>

```

Running the `Templater: Open insert Template modal` command from within an open
note and selecting the `Movie Template` template will prompt the user for all
the `config` object elements that have `prompt` set to `true`. Then, depending
on the input provided, the following will be inserted in the open note:

```md
# 🎥 A cool movie title

## Description

- Genre: #other
- Re-watchable: no

## Summary

Line one
Line two

```

### Creating note from template

Continuing with the template above, suppose we want to be able to use the sample
template to also create new notes from it. We can easily adjust our
configuration object to support this use case by specifying the `path` and
`filename` properties. After this change, our configuration object might look
like this:

```js
// The configuration object containing several elements.
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
        value: "New Movie"
    },

    // The movie title.
    title: {
        prompt: true,
        display: "What is the tile of the movie?",
        value: "The Movie Title"
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

    // A general summary of the movie.
    summary: {
        prompt: true,
        display: "What is the summary of the movie?",
        value: "Summary...",
        multiline: true
    }
}
```

*Note.* The rest of the template remains unchanged, we only adjusted the
`config` object by adding the `path` and `filename` elements.

Running the `Templater: Create new note from template` command after the
adjustments, we will also be prompted for the `path` and `filename` elements.
Based on the input provided for these two elements, a new note will be created
with the specified name, in the location indicated. The contents of the new note
will be the same as the one shown in the previous example.

### Value referencing

Let's continue building on the template from the previous example and see how we
can use *referencing* to make our template more dynamic. Suppose we want the
title of the movie to set as the file name of the note. We can easily do this by
using the `{{ ... }}` syntax to reference the `title` element in the `filename`.
To achieve this, we need to change our `config` object as follows:

```js
// The configuration object containing several elements.
let config = {
    // ...

    // The note file name.
    filename: {
        prompt: true,
        display: "How to name the movie note?",
        value: "{{ title }}"
    },

    // The movie title.
    title: {
        prompt: true,
        display: "What is the tile of the movie?",
        value: "The Movie Title"
    },

    // ...
}
```

Invoking `Templater` after this change will result in setting the value of
`filename` to whatever the value of `title` is set to. Since our example also
uses prompting, the prompt modal for `filename` will be populated with the value
of `title` as the default value.

*Note.* The `title` element appears after `filename` in the `config` object.
This is not issue because the the script will first handle elements that do not
relay on referencing, then, it will sort the elements that use referencing and
handle them in the correct order.

### Value Checking

Building on the example above, let's continue by adding a *validation check* to
ensure that that the `thriller` option is not a valid choice of movie genre. We
can easily accomplish this by adding a `check` property to the `genre`
configuration element.

The `check` property must be a function that takes the `value` property as input
and returns `true` if the `value` is considered valid, and `false` otherwise. In
our example, the `check` property might look like this:

```js
// The configuration object containing several elements.
let config = {
    // ...

    // The genre of the movie.
    genre: {
        prompt: true,
        display: "What is the movie genre?",
        value: ["comedy", "thriller", "other"],
        check: (value) => value === "thriller" ? false : true
    },


    // ...
}
```

Now, running `Templater` and selecting `thriller` as the genre will result in an
error message saying that the value is not valid, and the script will stop
executing.

*Note.* The `check` property can also specify a function with the `tp` and
`config` parameters should more complex validation be required, e.g.:

```js
// ...

check: (value, tp, config) => {
    // Do something with the `config` or `tp` objects here.

    // Return `true` or `false` based on the validation.
}

// ...
```

### Value Processing

Finally, let's see how to use *value processing* to modify the `value` property
of a config element and re-prompt the user with the modified `value`. To achieve
this, we need to add a `process` property. The `process` property must be a
function that takes the `value` property as input and returns a string
representing the modified `value`.

Suppose we want the `summary` element to reference the movie title, which in
turn will be processed by a custom function to obtain the movie summary from an
external API. In a nutshell, the following will happen:

- The `summary` configuration element will be set to the value of the `title`
  config element.
- The value of the `summary` element will be processed using a custom function
  and will be updated with the actual summary of the movie.
- The user will be prompted again with the chance to edit the summary (i.e.,
  once the summary is fetched).

Our custom processing function is called `getMovieSummary` and takes as input
the title of a movie and returns its summary, e.g., using the `OpenAI` API, as
seen below.

```js
// Get a movie summary based on its title.
async function getMovieSummary(prompt, systemPrompt = "Your role is to identify a movie by its title and provide a succinct summary.") {
    // The OpenAI API endpoint.
    const openaiURL = "https://api.openai.com/v1/chat/completions";

    // The OpenAI API request headers.
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    };

    // The OpenAI API request body.
    const body = JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
        ]
    });

    // Send the request to the OpenAI API.
    const response = await fetch(openaiURL, {
        method: "POST",
        headers: headers,
        body: body
    });

    // Parse the response object.
    const data = await response.json();

    // Get the assistant response.
    const assistantResponse = data.choices[0].message.content;

    // Return the response.
    return assistantResponse;
}
```

*Note.* The function `getMovieSummary` assumes that your `OpenAI` API key is
stored in the `OPENAI_API_KEY` environment variable and is available system-wide
(e.g., via `launchctl setenv` for `macOS`). If you do not know how to achieve
this, just replace `${process.env.OPENAI_API_KEY}` in the function with your
actual API key.

Now that we have our custom processing function, we can place it at the top of
our template file and then add it to the `process` property on the `summary`
configuration element. The `config` object might look like this:

```js
// The configuration object containing several elements.
let config = {
    // ...

    // A general summary of the movie.
    summary: {
        prompt: true,
        display: "What is the summary of the movie?",
        value: "{{ title }}",
        multiline: true,
        process: getMovieSummary
    }

    // ...
}
```

*Note.* It might take a few seconds for the API call to complete. Once the
summary is available, the user will be prompted again with the chance to edit
it. If you would like to avoid the confirmation prompt, you can leverage the
additional arguments, by updating the `process` property to the following:

```js
// ...

process: async (value, tp, config) => {
    // Disable the confirmation prompt.
    config.summary.prompt = false

    // Process the processed value (i.e., the summary).
    return await getMovieSummary(value)
}

// ...
```

### Error handling

It is advisable that you wrap the `makeNoteWithPrompting` script in a `try ...
catch` block to gracefully handle errors. For example, you may consider
replacing the lines

```js
// Create the note.
await tp.user.makeNoteWithPrompting(tp, config)
```

with

```js
// Proceed with the note creation gracefully.
try {
    // Create the note or insert the template.
    await tp.user.makeNoteWithPrompting(tp, config)

    // Let the user know if the operation succeeded.
    new Notice(`Created note '${config.filename.value}'.`)
} catch(error) {
    // Inform the user.
    new Notice(error.message)

    // Stop the execution.
    return
}
```

This will allow errors (e.g., failures if the note already exists, prompt
cancellations, failed checks etc.) to be caught and displayed in the
[`Obsidian`] interface as [gentle notices][notice].

### The complete template

Let's put everything together and see how the complete template looks like:

```txt
<%-*
// Get a movie summary based on its title.
async function getMovieSummary(prompt, systemPrompt = "Your role is to identify a movie by its title and provide a succinct summary.") {
    // The OpenAI API endpoint.
    const openAiURL = "https://api.openai.com/v1/chat/completions";

    // The OpenAI API request headers.
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    };

    // The OpenAI API request body.
    const body = JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
        ]
    });

    // Send the request to the OpenAI API.
    const response = await fetch(openAiURL, {
        method: "POST",
        headers: headers,
        body: body
    });

    // Parse the response object.
    const data = await response.json();

    // Get the assistant response.
    const assistantResponse = data.choices[0].message.content;

    // Return the response.
    return assistantResponse;
}

// The configuration object containing several elements.
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
        value: "{{ title }}"
    },

    // The movie title.
    title: {
        prompt: true,
        display: "What is the tile of the movie?",
        value: "The Movie Title"
    },

    // The genre of the movie.
    genre: {
        prompt: true,
        display: "What is the movie genre?",
        value: ["comedy", "thriller", "other"],
        check: (value) => value === "thriller" ? false : true
    },

    // Whether the movie is re-watchable.
    rewatch: {
        prompt: true,
        display: "Would I rewatch this movie?",
        value: ["yes", "no"],
        text: ["Without a doubt, yes!", "I mean... it was okay, but..."]
    },

    // A general summary of the movie.
    summary: {
        prompt: true,
        display: "What is the summary of the movie?",
        value: "{{ title }}",
        multiline: true,
        process: getMovieSummary
    }
}

// Proceed with the note creation gracefully.
try {
    // Create the note or insert the template.
    await tp.user.makeNoteWithPrompting(tp, config)

    // Let the user know if the operation succeeded.
    new Notice(`Created note '${config.filename.value}'.`)
} catch(error) {
    // Inform the user.
    new Notice(error.message)

    // Stop the execution.
    return
}
_%>

# 🎥 <% config.title.value %>

## Description

- Genre: #<% config.genre.value %>
- Re-watchable: <% config.rewatch.value %>

## Summary

<% config.summary.value %>

```

The following video shows the template above in action:

<video src="https://user-images.githubusercontent.com/20051042/241931701-59e876a9-865a-4aa7-b71f-562c5a846f3c.mp4" data-canonical-src="https://user-images.githubusercontent.com/20051042/241931701-59e876a9-865a-4aa7-b71f-562c5a846f3c.mp4" controls="controls" muted="muted" style="max-width:100%">
</video>

[`Templater`]: https://silentvoid13.github.io/Templater/introduction.html
[`Obsidian`]: https://obsidian.md/
[`tp.system.prompt`]: https://silentvoid13.github.io/Templater/internal-functions/internal-modules/system-module.html
[`tp.system.suggester`]: https://silentvoid13.github.io/Templater/internal-functions/internal-modules/system-module.html
[`TFile`]: https://github.com/obsidianmd/obsidian-api/blob/583ba39e3f6c0546de5e5e8742256a60e2d78ebc/obsidian.d.ts#L3616
[notice]: https://github.com/obsidianmd/obsidian-api/blob/583ba39e3f6c0546de5e5e8742256a60e2d78ebc/obsidian.d.ts#L2547
[`prompt`]: https://github.com/mihaiconstantin/obsidian-templater-scripts/blob/main/prompt.js

<!-- {% endraw %} -->
