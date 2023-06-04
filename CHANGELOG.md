# Changelog

All notable changes to this project will be documented in this file. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.5.0

### Added

- Update the `check` and `process` function signature to `(value, tp, config) =>
  { ... }`. The `value` argument is the value of the configuration element, the
  `tp` argument is the `Templater` object, and the `config` argument is the
  configuration object. This change allows the `check` and `process` functions
  to access the `Templater` object and the configuration object. This is useful
  for performing custom checks and processing that depend on the configuration
  object (e.g., disabling the configuration prompt after a processing step).

## 2.4.0

### Changed

- Add workaround to ensure the text prompt input is focused by default on
  mobile. This will likely be removed when
  https://github.com/SilentVoid13/Templater/issues/1120 is resolved.
- Update value processing functionality to only show the subsequent modal with
  the processed value only if the prompt was requested in the first place.

## 2.3.0

### Added

- Add user script [`makeNote`](docs/makeNote.md) that creates a new note from a
  template without prompting the user for input. This user script is useful when
  the template variables are known in advance and can be specified in the
  configuration object. The script correctly handles the file placement in the
  vault based on the `path` and `filename` configuration elements.

## 2.2.0

### Added

- Add support for setting the `value` to a function that returns a string or an
  array of strings. The function must be specified with two arguments that are
  automatically passed at the prompting stage. The first argument is the
  `Templater` and the second argument represents the configuration object.
- Add functionality to handle multiple references in the `value` property of a
  configuration element. This is useful when the `value` of a configuration
  element is composed of multiple references (e.g., `{{title}} {{date}}`).
- Add documentation for the [`prompt`](docs/prompt.md) user script.
- Add standalone [`prompt`](docs/prompt.md) user script to perform automatic
  prompting based on a configuration object.

### Changed

- Update [`makeNoteWithPrompting`](docs/makeNoteWithPrompting.md) user script to
  use the new [`prompt`](docs/prompt.md) user script.
- Simplify documentation for
  [`makeNoteWithPrompting`](docs/makeNoteWithPrompting.md) user script.

## 2.1.0

### Added

- Update the value processing functionality to display a user modal indicating
  that the value is being processed. This is useful for long running value
  processing functions (e.g., fetching data from an external API). The modal is
  closed once the value processing function completes. After the model is
  closed, the user is presented with a prompt where the processed valued can be
  further edited before being inserted into the template.

### Fixed

- Revert previous change and wrapped documentation of `makeNoteWithPrompting`
  with `<!--  {% raw %} -->` and `<!--  {% endraw %} -->` tags. This allows the
  documentation to be rendered properly on the GitHub Pages website, and on
  GitHub.
- Fixed the `{{ ... }}` not being escaped on the GitHub Pages website. This
  caused the `{{ ... }}` to be interpreted as a `Jekyll` tag and not rendered
  properly. Unfortunately, references of `{{ ... }}` on GitHub now include a `\`
  as `\{{ ... }}`.

## 2.0.0

### Added

- Add support for both inserting the template in the currently open note and
  creating a new note from the template for the `makeNoteWithPrompting` user
  script. This behavior is controlled via the the `Templater` invocation (i.e.,
  the commands `Templater: Create new note from template` and `Templater: Open
  insert Template modal`).
- Add functionality for running arbitrary functions on the `value` property of
  the configuration elements. This can be useful for performing [custom
  processing](docs/makeNoteWithPrompting.md) on the user input before it is
  inserted into the template. The function is specified via the `process`
  property of the configuration element. The function is passed the `value`
  property of the configuration element and should return a string

### Changed

- Rename [`createNoteWithPrompting`](docs/makeNoteWithPrompting.md) to
  [`makeNoteWithPrompting`](docs/makeNoteWithPrompting.md). This is a breaking
  change for users of the `createNoteWithPrompting` user script.
- Improve documentation for
  [`makeNoteWithPrompting`](docs/makeNoteWithPrompting.md) user script.
- Refactor code for [`makeNoteWithPrompting`](docs/makeNoteWithPrompting.md) to
  improve readability and maintainability.

## 1.4.0

### Added

- Added support for custom checks via the `check` property in config elements.
  This property allows specifying a function that is executed after the prompt
  is submitted to validate the user's input (i.e., the contents of the `value`
  property). An error is thrown if the function returns `false`. This can be
  useful for enforcing constraints on the prompt input, such as requiring a
  certain format or disallowing certain values.

## 1.3.0

### Added

- Update [`createNoteWithPrompting`](docs/makeNoteWithPrompting.md) user
  script to return the
  [`TFile`](https://github.com/obsidianmd/obsidian-api/blob/583ba39e3f6c0546de5e5e8742256a60e2d78ebc/obsidian.d.ts#L3616)
  object of the newly created note. This can be handy for further processing of
  the note in the script.

## 1.2.0

### Added

- Update `_config.yml` to remove default repository name `<h1/>` heading in
  favor of custom heading.
- Enable `GitHub` pages and add `Jeykll` configuration file.

## 1.1.0

### Added

- Extend referencing functionality to allow mixing the `{{` and `}}` syntax with
  regular text. For example, in the configuration `before {{ filename }} after`,
  the `{{ filename }}` part will be replaced in place and the `before` and
  `after` strings will be maintained.

## 1.0.0

### Added

- Add [`createNoteWithPrompting`](docs/makeNoteWithPrompting.md) user script
  to create a new note from template and automate prompting based on the
  template configuration variables. The script also supports referencing
  semantics for the template configuration variables via the `{{` and `}}`
  syntax. Check out the [documentation](docs/makeNoteWithPrompting.md) for
  examples.
- Add documentation for
  [`createNoteWithPrompting`](docs/makeNoteWithPrompting.md) user script.
- Add general repository documentation in the `README.md` file.
