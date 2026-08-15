export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "SimplLife API Spec",
    version: "1.0.0",
    description: "Enterprise SaaS documentation of task management and AI workspace APIs.",
  },
  servers: [
    {
      url: "/api",
      description: "Local development server",
    },
  ],
  paths: {
    "/auth/login": {
      post: {
        summary: "Login user",
        responses: {
          200: { description: "Successful authorization" },
        },
      },
    },
    "/workspaces": {
      get: {
        summary: "List all user workspaces",
        responses: {
          200: { description: "Workspaces list returned successfully" },
        },
      },
      post: {
        summary: "Create a new workspace",
        responses: {
          201: { description: "Workspace created successfully" },
        },
      },
    },
    "/comments": {
      get: {
        summary: "List entity comments",
        responses: {
          200: { description: "List of comments" },
        },
      },
      post: {
        summary: "Create a comment",
        responses: {
          201: { description: "Comment created successfully" },
        },
      },
    },
  },
};
export function getSpec() {
  return openApiSpec;
}
export default openApiSpec;
