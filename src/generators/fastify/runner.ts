import fs from 'fs';
import path from 'path';

import { generateModel } from './model';

// Example usage of the generateModel function
const fields = {
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: false },
};

const modelName = 'User';

// Generate the model file content
const { fileContent, fileName } = generateModel(modelName, fields);

// Create the directory if it doesn't exist
fs.mkdirSync(path.dirname(fileName), { recursive: true });

// Write the model file to disk
fs.writeFileSync(fileName, fileContent);

console.log(
  `Model ${modelName} has been generated successfully at ${fileName}`,
);
