// we are going to use snake case with all capitals
// to use this import the object like here=>
//  import {Admin_Schema_Prompt_Messages} from "...path/common/enum"
// if (!user.firstName) {
//     errors.push(Admin_Schema_Prompt_Messages.FIRST_NAME_REQUIRED);
// }

export enum Api_Methods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export const Messages = {
  UPDATE_SUCCESS: (resource: string) =>
    `The ${resource} has been updated successfully.`,
  DELETE_SUCCESS: (resource: string) =>
    `The ${resource} has been deleted successfully.`,
  CREATE_SUCCESS: (resource: string) =>
    `The ${resource} has been created successfully.`,
  FETCH_ERROR: (resource: string) =>
    `Failed to fetch  ${resource} data. Please try again.`,
  DELETE_ERROR: (resource: string) =>
    `Failed to delete the ${resource}. Please try again.`,
  UPDATE_ERROR: (resource: string) =>
    `Failed to update the ${resource}. Please try again.`,
  ADD_ERROR: (resource: string) =>
    `Failed to add the ${resource}. Please try again.`,
  FILE_TYPE_ERROR: (resource: string) => `Unsupported ${resource} type`,
};
