"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { removeMember, updateMemberRole } from "@/lib/api/workspaces";
import { useMembers } from "@/lib/hooks/use-members";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function MembersTable() {
  const { members, isLoading, isError, refetch } = useMembers();
  const queryClient = useQueryClient();
  const workspaceId = useAuthStore((state) => state.workspaceId);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateMemberRole(userId, role),
    onSuccess: async () => {
      if (workspaceId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.members(workspaceId),
        });
      }
      toast.success("Role updated");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeMember(userId),
    onSuccess: async () => {
      if (workspaceId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.members(workspaceId),
        });
      }
      toast.success("Member removed");
      setRemoveId(null);
    },
  });

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">Could not load members.</p>
        <Button variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">No members yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Email</th>
            <th className="px-3 py-2 font-medium">Role</th>
            <th className="px-3 py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.user_id} className="border-t">
              <td className="px-3 py-2">{member.email}</td>
              <td className="px-3 py-2">
                {member.role === "owner" ? (
                  member.role
                ) : (
                  <Select
                    value={member.role}
                    onValueChange={(role) =>
                      roleMutation.mutate({
                        userId: String(member.user_id),
                        role,
                      })
                    }
                  >
                    <SelectTrigger className="w-32" aria-label="Member role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">admin</SelectItem>
                      <SelectItem value="member">member</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </td>
              <td className="px-3 py-2">
                {member.role === "owner" ? null : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRemoveId(String(member.user_id))}
                  >
                    Remove
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AlertDialog
        open={removeId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRemoveId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              They will lose access to this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (removeId) {
                  removeMutation.mutate(removeId);
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
