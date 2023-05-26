# Changelog

All notable changes to this project will be documented in this file. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.3.0

### Added

- Update [`createNoteWithPrompting`](docs/createNoteWithPrompting.md) user
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

- Add [`createNoteWithPrompting`](docs/createNoteWithPrompting.md) user script
  to create a new note from template and automate prompting based on the
  template configuration variables. The script also supports referencing
  semantics for the template configuration variables via the `{{` and `}}`
  syntax. Check out the [documentation](docs/createNoteWithPrompting.md) for
  examples.
- Add documentation for
  [`createNoteWithPrompting`](docs/createNoteWithPrompting.md) user script.
- Add general repository documentation in the `README.md` file.
