// Get the 'multiline' property of the config element if set or the default.
function getMultiLine(configElement) {
    // Check if the element has the 'multiline' property.
    if (configElement.hasOwnProperty("multiline")) {
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
        // Return the value of the property.
        return configElement.text
    } else {
        // Return default.
        return configElement.value
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


// Elicit answers from the user for the prompts.
async function elicitPromptAnswers(tp, config) {
    // Attempt to adjust the reference template config values.
    try {
        // For each config object in the template config.
        for (const key in config) {
            // If the config element requires a prompt.
            if (config[key].prompt) {
                // If the config element is an array.
                if (Array.isArray(config[key].value)) {
                    // Show the user a list of options to choose from.
                    config[key].value = await tp.system.suggester(
                        // The text representation of the items.
                        getValueText(config[key]),

                        // The actual item values.
                        config[key].value,

                        // Throw on cancel.
                        true,

                        // The placeholder text.
                        config[key].display,

                        // Whether or not there is a limit.
                        getLimit(config[key])
                    )
                } else {
                    // Prompt the user for the value in text form.
                    config[key].value = await tp.system.prompt(
                        // The prompt message.
                        config[key].display,

                        // The default, prefilled value.
                        config[key].value,

                        // Throw on cancel.
                        true,

                        // Whether or not the prompt is multiline.
                        getMultiLine(config[key])
                    )
                }
            }
        }
    } catch (error) {
        // Throw on canceling the prompt.
        throw new Error('Note creation canceled.')
    }
}


// Create a note if it doesn't exist.
async function createNoteWithPrompting(tp, config, fileToMove, ext = ".md") {
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
    const file = await tp.file.find_tfile(fileToMove)

    // Move the note to the desired location.
    await tp.file.move(`${config.path.value}/${config.filename.value}`, file)
}


// Export the function.
module.exports = createNoteWithPrompting
