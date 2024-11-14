/**
 * Generates a Mongoose model file based on provided details.
 *
 * @param modelName - The name of the model to generate (e.g., "Admin").
 * @param fields - An object representing the model fields and their properties.
 * @returns {Object} An object containing the generated file content and file name.
 */
export const generateModel = (
  modelName: string,
  fields: Record<string, any>,
): { fileContent: string; fileName: string } => {
  // Check if any field has "uuidv4" as the default value
  const requiresUuid = Object.values(fields).some(
    (field) => field.default === 'uuidv4',
  );

  // Generate the import statements
  let fileContent = `import mongoose, { Schema, Document, Model } from "mongoose";\n`;
  if (requiresUuid) {
    fileContent += `import { v4 as uuidv4 } from "uuid";\n`;
  }

  fileContent += `
  export interface I${modelName} extends Document {
  `;

  // Generate TypeScript interface for the model
  Object.keys(fields).forEach((field) => {
    fileContent += `  ${field}: ${getFieldType(fields[field].type)};\n`;
  });

  fileContent += `}
  
  const ${modelName}Schema: Schema = new Schema(
    {`;

  // Generate Mongoose schema based on provided fields and properties
  Object.keys(fields).forEach((field) => {
    fileContent += `
      ${field}: {`;

    // Iterate over each property within the field (e.g., type, required, unique)
    Object.keys(fields[field]).forEach((prop) => {
      const value = fields[field][prop];
      const formattedValue =
        prop === 'default' && value === 'uuidv4'
          ? 'uuidv4'
          : formatValue(value);
      fileContent += `
        ${prop}: ${formattedValue},`;
    });

    fileContent += `
      },`;
  });

  fileContent += `
    },
    {
      timestamps: true,
    },
  );
  
  export const ${modelName}Model: Model<I${modelName}> = mongoose.model<I${modelName}>(
    "${modelName}",
    ${modelName}Schema,
  );
  `;

  // Define the file name based on the model name
  const fileName = `src/models/${modelName}Model.ts`;

  // Return the generated file content and file name
  return { fileContent, fileName };
};

/**
 * Helper function to get the field type for TypeScript.
 *
 * @param type - The Mongoose field type.
 * @returns {string} The TypeScript type for the field.
 */
const getFieldType = (type: any): string => {
  if (type === String) return 'string';
  if (type === Number) return 'number';
  if (type === Boolean) return 'boolean';
  if (type === Date) return 'Date';
  if (type === Buffer) return 'Buffer';
  return 'any'; // Default case
};

/**
 * Helper function to format the value for Mongoose schema.
 *
 * @param value - The value to format.
 * @returns {string} The formatted value for the schema.
 */
const formatValue = (value: any): string => {
  // Handle Mongoose data types (String, Number, Boolean, Date, Buffer) directly
  if (value === String) return 'String';
  if (value === Number) return 'Number';
  if (value === Boolean) return 'Boolean';
  if (value === Date) return 'Date';
  if (value === Buffer) return 'Buffer';

  // Handle primitive types
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number' || typeof value === 'boolean')
    return `${value}`;

  // Use JSON.stringify for objects, arrays, and other cases
  return JSON.stringify(value);
};
