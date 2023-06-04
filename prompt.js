// Validate configuration object size.
function validateConfigFormat(config) {
    // If the config is empty.
    if (Object.keys(config).length === 0) {
        // Throw.
        throw new Error("The configuration object is empty.");
    }
}


// Validate the required config element properties.
function validateRequiredConfigElementProperties(config) {
    // Ensure that each object on the config has the three required properties.
    for (const key in config) {
        // Ensure the config has the required `prompt`.
        if (!config[key].hasOwnProperty("prompt")) {
            // Throw.
            throw new Error(`Missing required '${key}.prompt' property.`);
        }

        // If a prompt is required.
        if (config[key].prompt && !config[key].hasOwnProperty("display")) {
            // Ensure the config has the required `display`.
            throw new Error(`Missing required '${key}.display' property.`);
        }

        // Ensure the config has the required `value`.
        if (!config[key].hasOwnProperty("value")) {
            // Throw.
            throw new Error(`Missing required '${key}.value' property.`);
        }
    }
}


// Sort references array to ensure logical ordering of the prompts.
function sortReferences(references) {
    // Sort.
    references.sort((a, b) => {
        // `a` should be prompted before `b`.
        if (b.references.includes(a.key)) {
            return -1;

        // `a` should be prompted after `b`.
        } else if (a.references.includes(b.key)) {
            return 1;

        // `a` and `b` are independent.
        } else {
            return 0;
        }
    })
}


// Get the reference from the config element value if it exists.
function getReferences(config, key) {
    // Create the references array.
    const references = [];

    // If not string.
    if (typeof config[key].value !== "string") {
        // Return undefined.
        return references;
    }

    // Perform the match.
    const match = config[key].value.match(/{{\s*(.*?)\s*}}/g);

    // Check if the match is not null.
    if (match != null) {
        // For each match.
        for (const reference of match) {
            // Remove the curly braces and spaces.
            const referenceKey = reference.replace(/[{}]/g, "").trim();

            // Add the reference to the array.
            references.push(referenceKey);
        }
    }

    // Otherwise return an empty array.
    return references;
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
        return config[key].value;
    }
}


// Perform custom user checks on the config element values.
async function checkConfigElementValue(tp, config, key) {
    // If the value has a custom user check.
    if (config[key].hasOwnProperty("check")) {
        // If the check is not a function.
        if (typeof config[key].check !== "function") {
            // Throw.
            throw new Error("The 'check' property must be a function.");
        }

        // Assume the check fails.
        let checkResult = false;

        // Try to check the value.
        try {
            // Check the value.
            checkResult = await Promise.resolve(config[key].check(config[key].value, tp, config));
        } catch (error) {
            // Throw if the checking failed.
            throw new Error(`Failed checking '${key}' configuration value.`);
        }

        // If the check failed.
        if (!checkResult) {
            // Throw.
            throw new Error(`Invalid value '${config[key].value}' for '${key}' config.`);
        }
    }
}


// Create a modal for displaying informational messages.
function makeInformationalModal(tp) {
    // Define modal class.
    class InformationalModal extends tp.obsidian.Modal {
        // Modal text.
        #content = "";
        #title = "";

        // Setter for the content.
        set content(value) {
            this.#content = value;
        }

        // Setter for the title.
        set title(value) {
            this.#title = value;
        }

        // Constructor.
        constructor(app) {
            super(app);
        }

        // On open event handler.
        onOpen() {
            // Extract the content container.
            let { contentEl, titleEl } = this;

            // Set the title.
            titleEl.setText(this.#title);

            // Set the content.
            contentEl.setText(this.#content);
        }

        // On close event handler.
        onClose() {
            // Extract the content container.
            let { contentEl, titleEl } = this;

            // Clear the title.
            titleEl.empty();

            // Clear the content.
            contentEl.empty();
        }
    }

    // Return a modal instance.
    return new InformationalModal(app);
}


// Perform customer user processing on the config element values.
async function processConfigElementValue(tp, config, key) {
    // If the value has a custom user process.
    if (config[key].hasOwnProperty("process")) {
        // If the process is not a function.
        if (typeof config[key].process !== "function") {
            // Throw.
            throw new Error(`Property '${key}.process' must be a function.`);
        }

        // Store the current value.
        const originalValue = config[key].value;

        // Get a modal class instance.
        const modal = makeInformationalModal(tp);

        // Set the modal title and content.
        modal.title = `Processing '${key}' value.`;
        modal.content = `Please wait while the '${key}' value is being processed...`;

        // Try to process the value.
        try {
            // Open the modal.
            modal.open();

            // Process and update the value.
            config[key].value = await Promise.resolve(config[key].process(originalValue, tp, config));

            // Close the user modal.
            modal.close();

            // If a prompt is required.
            if (config[key].prompt) {
                // Give the user a chance to modify the result.
                config[key].value = await issuePrompt(tp, config, key);
            }
        }
        catch (error) {
            // Restore the original value.
            config[key].value = originalValue;

            // Throw if the processing failed.
            throw new Error(`Failed processing '${key}' configuration value.`);
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
        // Capture the prompt promise.
        const promptPromise = tp.system.prompt(
            // The prompt message.
            config[key].display,

            // The default, prefilled value.
            config[key].value,

            // Throw on cancel.
            true,

            // Whether or not the prompt is multiline.
            getMultiLine(config, key)
        );

        // Manually focus the input.
        // See: https://github.com/SilentVoid13/Templater/issues/1120
        document.getElementsByClassName("templater-prompt-input")[0].focus();

        // Settle the promise.
        value = await promptPromise;
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
            // If the value is expressed as a function.
            if (typeof config[key].value === "function") {
                // Evaluate the function.
                config[key].value = await Promise.resolve(config[key].value(tp, config));
            }

            // Attempt to get the reference.
            const elementReferences = getReferences(config, key);

            // If the config element value has a reference.
            if (elementReferences.length !== 0) {
                // Merge the element references with the references array.
                references.push(
                    { key: key, references: elementReferences }
                );

                // For now continue with the prompts.
                continue;
            }

            // If the config element requires a prompt.
            if (config[key].prompt) {
                // Update the config element value based on the prompt.
                config[key].value = await issuePrompt(tp, config, key);
            }

            // Process the value if the config has a custom user process.
            await processConfigElementValue(tp, config, key);

            // Check the value if the config has a custom user check.
            await checkConfigElementValue(tp, config, key);
        }

        // Sort the references to respect reference dependency.
        sortReferences(references);

        // For each configuration element that had a reference.
        for (const reference of references) {
            // For each reference in the configuration element.
            for (let i = 0; i < reference.references.length; i++) {
                // Update the element value with the reference value.
                config[reference.key].value = config[reference.key].value.replace(
                    // The reference placeholder.
                    new RegExp(`{{\\s*${reference.references[i]}\\s*}}`, "g"),

                    // The reference value.
                    config[reference.references[i]].value
                );
            }

            // If the value that referenced also requires prompting.
            if (config[reference.key].prompt) {
                // Prompt the user to modify the referenced value.
                config[reference.key].value = await issuePrompt(tp, config, reference.key);
            }

            // Process the value if the config has a custom user process.
            await processConfigElementValue(tp, config, reference.key);

            // Check the value if the config has a custom user check.
            await checkConfigElementValue(tp, config, reference.key);
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
 * Prompt the user based on a configuration object.
 *
 * @param {object} tp - The `Templater` object.
 * @param {object} config - A configuration object containing objects used in the template.
 *
 * @returns {undefined} - The function returns `undefined` because the `config` object is passed by reference and modified in place.
 *
 * @throws {Error} - Throws a errors for various reasons. Error handling in the template is recommended.
*/
// Make prompt function.
async function prompt(tp, config) {
    // Validate the config object format.
    validateConfigFormat(config);

    // Validate the properties of config elements.
    validateRequiredConfigElementProperties(config);

    // Adjust the passed by reference config object based on the user's input.
    await elicitPromptAnswers(tp, config);
}


// Export the function.
module.exports = prompt
