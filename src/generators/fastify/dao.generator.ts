interface Field {
  name: string;
  type: string;
}

interface DaoOptions {
  modelName: string;
  fields: Field[];
  customMethods?: string[];
}

export default function generateDao(options: DaoOptions) {
  const { modelName, fields, customMethods = [] } = options;
  const className = `${modelName}DAO`;
  const modelImport = `${modelName}Model`;
  const modelInterface = `I${modelName}`;
  const idField = fields.some((f) => f.name === 'id') ? 'id' : '_id';

  // Generate methods for common CRUD operations
  const methods = [
    `async getById(${idField}: string) {
        return this.model.findById(${idField});
      }`,
    `async findOne(filter: Partial<${modelInterface}>) {
        return this.model.findOne(filter);
      }`,
    `async create(data: ${modelInterface}) {
        return this.model.create(data);
      }`,
    `async update(${idField}: string, updateData: Partial<${modelInterface}>) {
        return this.model.findByIdAndUpdate(${idField}, updateData, { new: true });
      }`,
    `async delete(${idField}: string) {
        return this.model.findByIdAndDelete(${idField});
      }`,
  ];

  // Add custom methods, if any
  customMethods.forEach((method) => methods.push(method));

  // Generate fields as properties
  const properties = fields
    .map((field) => `${field.name}: ${field.type};`)
    .join('\n  ');

  // Template for DAO class
  const daoFileContent = `
  import { Service } from "fastify-decorators";
  import { Model } from "mongoose";
  import { BaseDAO } from "../common/base.dao";
  import { ${modelInterface}, ${modelImport} } from "../models/${modelName.toLowerCase()}.entity";
  
  @Service()
  export class ${className} extends BaseDAO {
    model: Model<${modelInterface}>;
  
    constructor() {
      super();
      this.model = ${modelImport};
    }
  
    ${methods.join('\n\n  ')}
  }
  `;

  // File name based on model name
  const fileName = `${modelName.toLowerCase()}.dao.ts`;

  return { fileName, fileContent: daoFileContent };
}
