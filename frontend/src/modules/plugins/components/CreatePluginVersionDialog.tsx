import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useCreatePluginVersionMutation } from "../plugins.api";
import { toast } from "sonner";

const versionSchema = z.object({
  version: z.string().min(1, "Version is required"),
  configSchema: z.string().min(1, "Config schema is required"),
});

type VersionFormValues = z.infer<typeof versionSchema>;

interface CreatePluginVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pluginId: string;
}

export function CreatePluginVersionDialog({
  open,
  onOpenChange,
  pluginId,
}: CreatePluginVersionDialogProps) {
  const [createVersion, { isLoading }] = useCreatePluginVersionMutation();
  const form = useForm<VersionFormValues>({
    resolver: zodResolver(versionSchema),
    defaultValues: {
      version: "",
      configSchema: "{}",
    },
  });

  const onSubmit = async (values: VersionFormValues) => {
    try {
      let configSchema: Record<string, unknown>;
      try {
        configSchema = JSON.parse(values.configSchema);
      } catch (e) {
        form.setError("configSchema", { message: "Invalid JSON" });
        return;
      }

      await createVersion({
        pluginId,
        version: values.version,
        configSchema,
      }).unwrap();

      toast.success("Plugin version created successfully");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create plugin version");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Plugin Version</DialogTitle>
          <DialogDescription>
            Create a new version for this plugin
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                {...form.register("version")}
                placeholder="1.0.0"
              />
              {form.formState.errors.version && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.version.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="configSchema">Config Schema (JSON)</Label>
              <Textarea
                id="configSchema"
                {...form.register("configSchema")}
                rows={10}
                className="font-mono text-sm"
              />
              {form.formState.errors.configSchema && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.configSchema.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Version"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
