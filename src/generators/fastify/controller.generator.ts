/**
 * Generates a controller file based on provided details.
 *
 * This function will take the controller name, services, DAOs (optional), and endpoints as arguments
 * and generate a controller file with the appropriate methods and imports.
 *
 * @param controllerName - The name of the controller to generate.
 * @param services - An array of service names to inject into the controller.
 * @param daos - An array of DAO names to be imported (optional).
 * @param endpoints - An array of endpoints (e.g., ['/admin', '/user']).
 * @returns {Object} An object containing the generated file content and file name.
 */
export const generateController = (
  controllerName: string,
  endpoints: string[], // Array of endpoints
  services?: string[], // Array of service names
  daos?: string[], // Array of DAO names (optional)
): { fileContent: string; fileName: string } => {
  // HTTP methods supported
  const methods = ['GET', 'POST', 'DELETE', 'PUT'];

  // Start generating the controller file content
  let fileContent = `/* eslint-disable @typescript-eslint/no-unused-vars */
  import { FastifyRequest, FastifyReply } from "fastify";
  import { Controller, ${methods.join(', ')} } from "fastify-decorators";
  import { STATUS_CODES, ERROR_CODES, RESPONSE_MESSAGE } from "../common/constants";
  `;

  // Import services dynamically
  if (services) {
    services.forEach((service) => {
      fileContent += `import { ${service} } from "../services"; // Import ${service}\n`;
    });
  }

  // Import DAOs dynamically if provided
  if (daos) {
    daos.forEach((dao) => {
      fileContent += `import { ${dao} } from "../dao"; // Import ${dao}\n`;
    });
  }

  fileContent += `
  /**
   * ${controllerName}Controller handles requests related to ${controllerName.toLowerCase()}.
   * This controller provides endpoints to manage ${controllerName.toLowerCase()} data.
   */
  @Controller({ route: "/${controllerName.toLowerCase()}" })
  export default class ${controllerName}Controller {
  `;

  // Inject services
  if (services) {
    services.forEach((service) => {
      fileContent += `  @Inject(${service})
    ${service.toLowerCase()}!: ${service};  // Inject ${service}\n`;
    });
  }

  // Inject DAOs
  if (daos) {
    daos.forEach((dao) => {
      fileContent += `  @Inject(${dao})
    ${dao.toLowerCase()}!: ${dao};  // Inject ${dao}\n`;
    });
  }

  // Generate methods for each endpoint and HTTP method
  endpoints.forEach((endpoint) => {
    methods.forEach((method) => {
      fileContent += `
    /**
     * Handles the ${method} request for the ${endpoint} endpoint.
     * 
     * This method processes the request to ${method.toLowerCase()} data at the ${endpoint} endpoint
     * and returns the result to the client.
     */
    @${method}("${endpoint}")
    async ${method.toLowerCase()}${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}(
      request: FastifyRequest,
      reply: FastifyReply,
    ) {
      try {
        this.logger.info("${controllerName}Controller -> ${method.toLowerCase()}${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} -> Handling ${method} request at ${endpoint}");
        
        // Example service method, replace with actual logic
        const data = await this.${controllerName.toLowerCase()}Service.${method.toLowerCase()}Data();  // Replace with actual service call
  
        reply.status(STATUS_CODES.SUCCESS).send({ data });
      } catch (error: any) {
        this.logger.error("Error in ${method.toLowerCase()}${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}: " + error.message);
        reply.status(STATUS_CODES.SERVER_ERROR).send({
          message: RESPONSE_MESSAGE.SERVER_ERROR,
          code: ERROR_CODES.SERVER_ERROR,
        });
      }
    }
  `;
    });
  });

  fileContent += '}'; // Close the class

  // Define the file name based on the controller name
  const fileName = `src/controllers/${controllerName}Controller.ts`;

  // Return the generated file content and file name
  return { fileContent, fileName };
};
