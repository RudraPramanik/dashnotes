"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getCurrentWorkspace, updateWorkspace } from "@/lib/api/workspaces";
import { queryKeys } from "@/lib/query-keys";
import { RoleGate } from "@/components/auth/RoleGate";
import { InviteMemberDialog } from "@/components/settings/InviteMemberDialog";
import { MembersTable } from "@/components/settings/MembersTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const nameSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
});

type NameValues = z.infer<typeof nameSchema>;

export default function WorkspaceSettingsPage() {
  return (
    <RoleGate
      roles={["owner", "admin"]}
      fallback={<div>Not authorised</div>}
    >
      <WorkspaceSettingsContent />
    </RoleGate>
  );
}

function WorkspaceSettingsContent() {
  const queryClient = useQueryClient();
  const workspaceQuery = useQuery({
    queryKey: queryKeys.workspaceMe(),
    queryFn: getCurrentWorkspace,
  });
  const form = useForm<NameValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (workspaceQuery.data) {
      form.reset({ name: workspaceQuery.data.name });
    }
  }, [form, workspaceQuery.data]);

  const mutation = useMutation({
    mutationFn: (values: NameValues) => updateWorkspace(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaceMe() });
      toast.success("Workspace updated");
    },
  });

  if (workspaceQuery.isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (workspaceQuery.isError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">Could not load workspace.</p>
        <Button variant="outline" onClick={() => void workspaceQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Workspace</h1>
      <form
        className="flex max-w-md flex-col gap-3"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <Label htmlFor="workspace-name">Workspace name</Label>
        <Input id="workspace-name" {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save"}
        </Button>
      </form>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Members</h2>
        <InviteMemberDialog />
      </div>
      <MembersTable />
    </div>
  );
}
