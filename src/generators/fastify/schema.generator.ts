interface SchemaProperty {
  type: string;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
}

interface ApiSchemaOptions {
  description: string;
  tags: string[];
  body: {
    type: string;
    properties: Record<string, SchemaProperty>;
    required: string[];
  };
  response: Record<
    string,
    { type: string; properties: Record<string, SchemaProperty> }
  >;
}

export function generateSchema(options: ApiSchemaOptions) {
  const { description, tags, body, response } = options;

  // Generate the body schema string
  const bodySchema = `
      body: {
        type: "${body.type}",
        properties: {
          ${Object.keys(body.properties)
            .map((key) => `${key}: { type: "${body.properties[key].type}" }`)
            .join(',\n        ')}
        },
        required: [${body.required.map((r) => `"${r}"`).join(', ')}],
      }`;

  // Generate the response schema string
  const responseSchema = `
      response: {
        ${Object.keys(response)
          .map((statusCode) => {
            const responseData = response[statusCode];
            return `
          ${statusCode}: {
            type: "${responseData.type}",
            properties: {
              ${Object.keys(responseData.properties)
                .map(
                  (key) =>
                    `${key}: { type: "${responseData.properties[key].type}" }`,
                )
                .join(',\n            ')}
            }
          }`;
          })
          .join(',')}
      }`;

  // Template for Fastify schema
  const schema = `
  export const ${options.description.replace(/\s+/g, '')}Schema: FastifySchema = {
    description: "${description}",
    tags: ${JSON.stringify(tags)},
    ${bodySchema},
    ${responseSchema},
  };
  `;

  return schema;
}
