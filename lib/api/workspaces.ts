import { apiClient } from "@/lib/api/client";
import type { Workspace, WorkspaceMember } from "@/lib/api/types";

export async function getCurrentWorkspace(): Promise<Workspace> {
  return apiClient.get<Workspace>("/workspaces/me");
}

export async function updateWorkspace(data: {
  name: string;
}): Promise<Workspace> {
  return apiClient.patch<Workspace>("/workspaces/me", data);
}

export async function getMembers(): Promise<WorkspaceMember[]> {
  return apiClient.get<WorkspaceMember[]>("/workspaces/members/");
}

export async function inviteMember(data: {
  email: string;
  role: string;
}): Promise<WorkspaceMember> {
  return apiClient.post<WorkspaceMember>("/workspaces/members/", data);
}

export async function updateMemberRole(
  userId: string,
  role: string,
): Promise<WorkspaceMember> {
  return apiClient.patch<WorkspaceMember>(`/workspaces/members/${userId}`, {
    role,
  });
}

export async function removeMember(userId: string): Promise<void> {
  await apiClient.delete<undefined>(`/workspaces/members/${userId}`);
}
