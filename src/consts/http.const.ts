export const HTTP_CODES = {
  OK: 200,
  CREATED: 201,
  CONFLICT: 409,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  GENERIC_ERROR: "Something went wrong. Please try again later.",
  INTERNAL_SERVER_ERROR: "An internal server error occurred.",
  NOT_FOUND: "The requested resource was not found.",
  UNAUTHORIZED: "You are not authorized to access this resource.",
  FORBIDDEN: "Access to this resource is forbidden.",
  BAD_REQUEST: "The request was invalid or cannot be served.",
  CONFLICT:
    "The request could not be completed due to a conflict with the current state of the resource.",
  TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
};

export const SUCCESS_MESSAGES = {
  RESOURCE_CREATED: "The resource was created successfully.",
  RESOURCE_FETCHED: "Resource fetched successfully",
  RESOURCES_FETCHED: "Resources fetched successfully",
  RESOURCE_UPDATED: "The resource was updated successfully.",
  RESOURCE_DELETED: "The resource was deleted successfully.",
  OPERATION_SUCCESSFUL: "The operation was completed successfully.",
};
