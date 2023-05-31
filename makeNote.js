// Validate the required config elements.
function validateNoteCreationConfigElements(config) {
    // Ensure the config has the required properties.
    if (!config.hasOwnProperty("path")) {
        // Throw.
        throw new Error("Missing required 'path' configuration element.");
    }

    // Ensure the config has the required properties.
    if (!config.hasOwnProperty("filename")) {
        // Throw.
        throw new Error("Missing required 'filename' configuration element.");

    }
}


/**
 * Create a new note from template based on a configuration object.
 *
 * @param {object} tp - The `Templater` object.
 * @param {object} config - A configuration object containing objects used in the template.
 * @param {string} ext - The file extension. Defaults to `.md`.
 *
 * @returns {Promise<TFile|undefined>} - A promise that resolves to the newly created note `TFile` object if `Templater` was invoked to create the note. Otherwise, `undefined`.
 *
 * @throws {Error} - Throws a errors for various reasons. Error handling in the template is recommended.
*/
async function makeNote(tp, config, ext = ".md") {
    // If the invocation mode is creating a new note.
    if (tp.config.run_mode === 0) {
        // Validate the config elements required for note creation.
        validateNoteCreationConfigElements(config);

        // Check if the file exists.
        const fileExists = await tp.file.exists(
            `${config.path.value}/${config.filename.value}${ext}`
        );

        // If the file exists.
        if (fileExists) {
            // Throw.
            throw new Error(`Note '${config.filename.value}' already exists.`);
        }

        // Get a file object for the temporary note created.
        const file = await tp.file.find_tfile(tp.file.path(true));

        // Move the note to the desired location.
        await tp.file.move(`${config.path.value}/${config.filename.value}`, file);

        // Return the file object.
        return file;
    }
}


// Export the function.
module.exports = makeNote
