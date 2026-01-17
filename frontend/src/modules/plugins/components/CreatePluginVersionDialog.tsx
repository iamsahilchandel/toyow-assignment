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

import { useCreatePluginVersionMutation } from "../plugins.api";
import { toast } from "sonner";

const versionSchema = z.object({
  version: z.string().min(1, "Version is required"),
  code: z.string().min(1, "Code is required"),
  config: z.string().min(1, "Config is required"),
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
      code: "",
      config: "{}",
    },
  });

  const onSubmit = async (values: VersionFormValues) => {
    try {
      let config: Record<string, unknown>;
      try {
        config = JSON.parse(values.config);
      } catch (e) {
        form.setError("config", { message: "Invalid JSON" });
        return;
      }

      await createVersion({
        pluginId,
        version: values.version,
        code: values.code,
        config,
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
              <Label htmlFor="code">Plugin Code</Label>
              <Textarea
                id="code"
                {...form.register("code")}
                rows={6}
                className="font-mono text-sm"
                placeholder="// Plugin code here..."
              />
              {form.formState.errors.code && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="config">Config (JSON)</Label>
              <Textarea
                id="config"
                {...form.register("config")}
                rows={6}
                className="font-mono text-sm"
              />
              {form.formState.errors.config && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.config.message}
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
