import { request } from "./client";
import type { Group } from "../../../shared/types";

interface GroupResponse {
  success: true;
  group: Group;
}

interface GroupsListResponse {
  success: true;
  groups: Group[];
}

export const groupsService = {
  list: () => request<GroupsListResponse>("/groups"),

  create: (name: string) =>
    request<GroupResponse>("/groups", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  update: (id: string, patch: { name?: string }) =>
    request<GroupResponse>(`/groups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  remove: (id: string) =>
    request<{ success: true }>(`/groups/${id}`, { method: "DELETE" }),
};
