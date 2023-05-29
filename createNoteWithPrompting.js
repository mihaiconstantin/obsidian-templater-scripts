// Validate the required config elements.
function validateRequiredConfigElements(config) {
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


// Validate the required config element properties.
function validateRequiredConfigElementProperties(config) {
    // Ensure that each object on the config has the three required properties.
    for (const key in config) {
        // Ensure the config has the required properties.
        if (!config[key].hasOwnProperty("prompt")) {
            // Throw.
            throw new Error(`Missing required '${key}.prompt' property.`);
        }

        // Ensure the config has the required properties.
        if (!config[key].hasOwnProperty("display")) {
            // Throw.
            throw new Error(`Missing required '${key}.display' property.`);
        }

        // Ensure the config has the required properties.
        if (!config[key].hasOwnProperty("value")) {
            // Throw.
            throw new Error(`Missing required '${key}.value' property.`);
        }
    }
}

// Sort references array to ensure logical ordering of the prompts.
function sortReferences(references) {
    // Sort and return.
    return references.sort((a, b) => {
        if (a.reference == b.key) {
            return 1;
        } else if (b.reference == a.key) {
            return -1;
        } else {
            return 0;
        }
    });
}


// Get the reference from the config element value if it exists.
function getReference(config, key) {
    // If not string.
    if (typeof config[key].value !== "string") {
        // Return undefined.
        return undefined;
    }

    // Define the pattern.
    const referencePattern = /{{\s*(.*?)\s*}}/;

    // Perform the match.
    const match = config[key].value.match(referencePattern);

    // Check if the match is not null.
    if (match != null) {
        // Return the first capturing group.
        return match[1];
    }

    // Otherwise return undefined.
    return undefined;
}


// Get the 'multiline' property of the config element if set or the default.
function getMultiLine(config, key) {
    // Check if the element has the 'multiline' property.
    if (config[key].hasOwnProperty("multiline")) {
        // If the `multiline` property is not a boolean.
        if (typeof config[key].multiline !== "boolean") {
            // Throw.
            throw new Error(`Property '${key}.multiline' must be a boolean.`);
        }

        // Return the value of the property.
        return config[key].multiline;
    } else {
        // Return default.
        return false;
    }
}


// Get the 'limit' property of the config element if set or the default.
function getLimit(config, key) {
    // Check if the element has the 'limit' property.
    if (config[key].hasOwnProperty("limit")) {
        // If the `limit` property is not a number.
        if (typeof config[key].limit !== "number") {
            // Throw.
            throw new Error(`Property '${key}.limit' must be an integer.`);
        }

        // Return the value of the property.
        return config[key].limit;
    } else {
        // Return default.
        return undefined;
    }
}


// Get the 'text' property of the config element if set or the default.
function getValueText(config, key) {
    // Check if the element has the 'text' property.
    if (config[key].hasOwnProperty("text")) {
        // If the `text` property is not an array and not a function.
        if (!Array.isArray(config[key].text) && typeof config[key].text !== "function") {
            // Throw.
            throw new Error(`Property '${key}.text' property must be an array or a function.`);
        }

        // Return the value of the property.
        return config[key].text;
    } else {
        // Return default.
        return configElement.value;
    }
}


// Perform custom user checks on the config element values.
function checkConfigElementValue(config, key) {
    // If the value has a custom user check.
    if (config[key].hasOwnProperty("check")) {
        // If the check is not a function.
        if (typeof config[key].check !== "function") {
            // Throw.
            throw new Error("The 'check' property must be a function.");
        }

        // Check the value.
        const checkResult = config[key].check(config[key].value);

        // If the check failed.
        if (!checkResult) {
            // Throw.
            throw new Error(`Invalid value '${config[key].value}' for '${key}' config.`);
        }
    }
}


// Perform customer user processing on the config element values.
async function processConfigElementValue(config, key) {
    // If the value has a custom user process.
    if (config[key].hasOwnProperty("process")) {
        // If the process is not a function.
        if (typeof config[key].process !== "function") {
            // Reject `Promise` with error.
            return Promise.reject(new Error("The 'process' property must be a function."))
        }

        // Attempt to resolve a promise.
        try {
            // Return the processed value from the resolved promise.
            return await new Promise(resolve => {
                // Resolve the promise with the processed value.
                resolve(config[key].process(config[key].value))
            })
        } catch (error) {
            // Reject promise with error.
            return Promise.reject(error)
        }
    }
}


// Issue the correct prompt baaed on value type.
async function issuePrompt(tp, config, key) {
    // Define the value.
    let value;

    // If the config element is an array.
    if (Array.isArray(config[key].value)) {
        // Show the user a list of options to choose from.
        value = await tp.system.suggester(
            // The text representation of the items.
            getValueText(config, key),

            // The actual item values.
            config[key].value,

            // Throw on cancel.
            true,

            // The placeholder text.
            config[key].display,

            // Whether or not there is a limit.
            getLimit(config, key)
        );
    } else {
        // Prompt the user for the value in text form.
        value = await tp.system.prompt(
            // The prompt message.
            config[key].display,

            // The default, prefilled value.
            config[key].value,

            // Throw on cancel.
            true,

            // Whether or not the prompt is multiline.
            getMultiLine(config, key)
        );
    }

    // Return the value.
    return value;
}


// Elicit answers from the user for the prompts.
async function elicitPromptAnswers(tp, config) {
    // Configs that have references.
    let references = [];

    // Attempt to adjust the reference template config values.
    try {
        // For each config object in the template config.
        for (const key in config) {
            // Attempt to get the reference.
            const reference = getReference(config, key);

            // If the config element value has a reference.
            if (reference != null) {
                // Add the config key and reference the references array.
                references.push({ key, reference });

                // For now continue with the prompts.
                continue;
            }

            // If the config element requires a prompt.
            if (config[key].prompt) {
                // Update the config element value based on the prompt.
                config[key].value = await issuePrompt(tp, config, key);
            }

            // Process the value if the config has a custom user process.
            config[key].value = await processConfigElementValue(config, key)

            // Check the value if the config has a custom user check.
            checkConfigElementValue(config, key)
        }

        // Sort the references to respect reference dependency.
        references = sortReferences(references);

        // For each object that had a reference.
        for (let i = 0; i < references.length; i++) {
            // Replace the config element reference placeholder with the reference value.
            config[references[i].key].value = config[references[i].key].value.replace(
                /{{.*}}/g,
                config[references[i].reference].value
            );

            // If the value that referenced also requires prompting.
            if (config[references[i].key].prompt) {
                // Prompt the user to modify the referenced value.
                config[reference.key].value = await issuePrompt(tp, config, reference.key);
            }

            // Process the value if the config has a custom user process.
            config[key].value = await processConfigElementValue(config, references[i].key)

            // Check the value if the config has a custom user check.
            checkConfigElementValue(config, references[i].key)
        }
    } catch (error) {
        // Set the default message to note creation cancelation.
        let message = "Note creation canceled.";

        // Decide on the error message.
        if (error != null) {
            // Set the error message.
            message = error.message;
        }

        // Throw.
        throw new Error(message);
    }
}


/**
 * Create a new note from template with automatic prompting.
 *
 * @param {object} tp - The `Templater` object.
 * @param {object} config - A configuration object containing objects used in the template.
 * @param {string} fileToMove - The newly created file that needs to be renamed and moved accordingly.
 * @param {string} ext - The file extension. Defaults to `.md`.
 *
 * @returns {Promise<TFile>} - A promise that resolves to the newly created note `TFile` object.
 *
 * @throws {Error} - Throws an error for various reasons. Error handling in the template is recommended.
*/
async function createNoteWithPrompting(tp, config, ext = ".md") {
    // Validate the config object.
    validateRequiredConfigElements(config);

    // Validate the properties of config elements.
    validateRequiredConfigElementProperties(config);

    // Adjust the passed by reference config object based on the user's input.
    await elicitPromptAnswers(tp, config);

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


// Export the function.
module.exports = createNoteWithPrompting
