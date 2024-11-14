/**
 * Generates a constants file for endpoint definitions.
 *
 * @param endpoints - An array of endpoint objects containing label, value, and optional group key.
 * @param fileName - Optional parameter to specify the file name. Defaults to "endpoints.ts".
 * @returns {Object} An object containing the generated file content and file name.
 */
export const generateConstants = (
  endpoints: Array<{ label: string; value: string; group?: string }>,
  fileName: string = 'constants.ts',
): { fileContent: string; fileName: string } => {
  let fileContent = '';

  let currentGroup = '';

  endpoints.forEach(({ label, value, group }) => {
    // Add a group comment if it has changed
    if (group && group !== currentGroup) {
      fileContent += `\n// ${group}\n`;
      currentGroup = group;
    }

    // Generate the constant definition
    const constantName = `${label.toUpperCase()}`;
    fileContent += `export const ${constantName} = "${value}";\n`;
  });

  return { fileContent, fileName };
};
