
// Get the reference from the config element value if it exists.
function getReference(configElementValue) {
    // If not string.
    if (typeof configElementValue !== "string") {
        // Return undefined.
        return undefined
    }

    // Define the pattern.
    const referencePattern = /{{\s*(.*?)\s*}}/

    // Perform the match.
    const match = configElementValue.match(referencePattern)

    // Check if the match is not null.
    if (match != null) {
        // Return the first capturing group.
        return match[1]
    }

    // Otherwise return undefined.
    return undefined
}


// Get the 'multiline' property of the config element if set or the default.
function getMultiLine(configElement) {
    // Check if the element has the 'multiline' property.
    if (configElement.hasOwnProperty("multiline")) {
        // If the `multiline` property is not a boolean.
        if (typeof configElement.multiline !== "boolean") {
            // Throw.
            throw new Error("The 'multiline' property must be a boolean.")
        }

        // Return the value of the property.
        return configElement.multiline
    } else {
        // Return default.
        return false
    }
}


// Get the 'limit' property of the config element if set or the default.
function getLimit(configElement) {
    // Check if the element has the 'limit' property.
    if (configElement.hasOwnProperty("limit")) {
        // If the `limit` property is not a number.
        if (typeof configElement.limit !== "number") {
            // Throw.
            throw new Error("The 'limit' property must be a number.")
        }

        // Return the value of the property.
        return configElement.limit
    } else {
        // Return default.
        return undefined
    }
}


// Get the 'text' property of the config element if set or the default.
function getValueText(configElement) {
    // Check if the element has the 'text' property.
    if (configElement.hasOwnProperty("text")) {
        // If the `text` property is not an array and not a function.
        if (!Array.isArray(configElement.text) && typeof configElement.text !== "function") {
            // Throw.
            throw new Error("The 'text' property must be an array or function.")
        }

        // Return the value of the property.
        return configElement.text
    } else {
        // Return default.
        return configElement.value
    }
}


// Perform custom user checks on the config element values.
function checkConfigElementValue(config, key) {
    // If the value has a custom user check.
    if (config[key].hasOwnProperty("check")) {
        // If the check is not a function.
        if (typeof config[key].check !== "function") {
            // Throw.
            throw new Error("The 'check' property must be a function.")
        }

        // Check the value.
        const checkResult = config[key].check(config[key].value)

        // If the check failed.
        if (!checkResult) {
            // Throw.
            throw new Error(`Invalid value '${config[key].value}' for '${key}' config.`)
        }
    }
}


// Validate the config object since we can not use types.
function validateConfig(config) {
    // Ensure the config has the required properties.
    if (!config.hasOwnProperty("path")) {
        // Throw.
        throw new Error("Missing required 'path' config.")
    }

    // Ensure the config has the required properties.
    if (!config.hasOwnProperty("filename")) {
        // Throw.
        throw new Error("Missing required 'filename' config.")

    }

    // Ensure that each object on the config has the three required properties.
    for (const key in config) {
        // Ensure the config has the required properties.
        if (!config[key].hasOwnProperty("prompt")) {
            // Throw.
            throw new Error(`Missing required 'prompt' property for '${key}' config.`)
        }

        // Ensure the config has the required properties.
        if (!config[key].hasOwnProperty("display")) {
            // Throw.
            throw new Error(`Missing required 'display' property for '${key}' config.`)
        }

        // Ensure the config has the required properties.
        if (!config[key].hasOwnProperty("value")) {
            // Throw.
            throw new Error(`Missing required 'value' property for '${key}' config.`)
        }
    }
}


// Issue the correct prompt baaed on value type.
async function issuePrompt(tp, configElement) {
    // Define the value.
    let value;

    // If the config element is an array.
    if (Array.isArray(configElement.value)) {
        // Show the user a list of options to choose from.
        value = await tp.system.suggester(
            // The text representation of the items.
            getValueText(configElement),

            // The actual item values.
            configElement.value,

            // Throw on cancel.
            true,

            // The placeholder text.
            configElement.display,

            // Whether or not there is a limit.
            getLimit(configElement)
        )
    } else {
        // Prompt the user for the value in text form.
        value = await tp.system.prompt(
            // The prompt message.
            configElement.display,

            // The default, prefilled value.
            configElement.value,

            // Throw on cancel.
            true,

            // Whether or not the prompt is multiline.
            getMultiLine(configElement)
        )
    }

    // Return the value.
    return value
}


// Sort references array to ensure logical ordering of the prompts.
function sortReferences(references) {
    // Sort and return.
    return references.sort((a, b) => {
        if (a.reference == b.key) {
            return 1
        } else if (b.reference == a.key) {
            return -1
        } else {
            return 0
        }
    })
}


// Elicit answers from the user for the prompts.
async function elicitPromptAnswers(tp, config) {
    // Configs that have references.
    let references = []

    // Attempt to adjust the reference template config values.
    try {
        // For each config object in the template config.
        for (const key in config) {
            // Attempt to get the reference.
            const reference = getReference(config[key].value)

            // If the config element value has a reference.
            if (reference != null) {
                // Add the config key and reference the references array.
                references.push({ key, reference })

                // For now continue with the prompts.
                continue
            }

            // If the config element requires a prompt.
            if (config[key].prompt) {
                // Update the config element value based on the prompt.
                config[key].value = await issuePrompt(tp, config[key])

                // Check the value if the config has a custom user check.
                checkConfigElementValue(config, key)
            }
        }

        // Sort the references to respect reference dependency.
        references = sortReferences(references)

        // For each object that had a reference.
        for (let i = 0; i < references.length; i++) {
            // Replace the config element reference placeholder with the reference value.
            config[references[i].key].value = config[references[i].key].value.replace(
                /{{.*}}/g,
                config[references[i].reference].value
            )

            // If the value that referenced also requires prompting.
            if (config[references[i].key].prompt) {
                // Prompt the user to modify the referenced value.
                config[references[i].key].value = await issuePrompt(tp, config[references[i].key])
            }

            // Check the value if the config has a custom user check.
            checkConfigElementValue(config, references[i].key)
        }
    } catch (error) {
        // Set the default message to note creation cancelation.
        let message = "Note creation canceled."

        // Decide on the error message.
        if (error != null) {
            // Set the error message.
            message = error.message
        }

        // Throw.
        throw new Error(message)
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
    validateConfig(config)

    // Adjust the passed by reference config object based on the user's input.
    await elicitPromptAnswers(tp, config)

    // Check if the file exists.
    const fileExists = await tp.file.exists(
        `${config.path.value}/${config.filename.value}${ext}`
    )

    // If the file exists.
    if (fileExists) {
        // Throw.
        throw new Error(`Note '${config.filename.value}' already exists.`)
    }

    // Get a file object for the temporary note created.
    const file = await tp.file.find_tfile(tp.file.path(true))

    // Move the note to the desired location.
    await tp.file.move(`${config.path.value}/${config.filename.value}`, file)

    // Return the file object.
    return(file)
}


// Export the function.
module.exports = createNoteWithPrompting
