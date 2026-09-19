import { request } from "./client.js";

export const analyticsService = {
  get: () => request<any>("/analytics"),
};
