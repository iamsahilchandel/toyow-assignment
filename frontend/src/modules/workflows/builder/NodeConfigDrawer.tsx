/**
 * Node Configuration Drawer component.
 * Shows configuration form when a node is selected.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type {
  WorkflowNode,
  TextTransformConfig,
  ApiProxyConfig,
  DelayConfig,
  IfConfig,
  DataAggregatorConfig,
} from "./builder.types";
import { getPluginInfo } from "./builder.types";

// Zod schemas for each node type
const textTransformSchema = z.object({
  shift: z.coerce.number().int().min(-25).max(25),
});

const apiProxySchema = z.object({
  url: z.string().url("Must be a valid URL"),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]).optional(),
  cache: z.boolean().optional(),
});

const delaySchema = z.object({
  ms: z.coerce.number().int().min(0).max(300000),
  blocking: z.boolean().optional(),
});

const ifSchema = z.object({
  expression: z.string().min(1, "Expression is required"),
});

const dataAggregatorSchema = z.object({
  strategy: z.enum(["merge", "concat", "pick"]).optional(),
});

interface NodeConfigDrawerProps {
  node: WorkflowNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, config: Record<string, unknown>) => void;
}

export function NodeConfigDrawer({
  node,
  isOpen,
  onClose,
  onSave,
}: NodeConfigDrawerProps) {
  if (!node) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[450px]">
        <SheetHeader>
          <SheetTitle>Configure Node</SheetTitle>
          <SheetDescription>
            {getPluginInfo(node.data.pluginType)?.description}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <NodeConfigForm
            node={node}
            onSave={(config) => {
              onSave(node.id, config);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface NodeConfigFormProps {
  node: WorkflowNode;
  onSave: (config: Record<string, unknown>) => void;
  onCancel: () => void;
}

function NodeConfigForm({ node, onSave, onCancel }: NodeConfigFormProps) {
  const pluginType = node.data.pluginType;

  switch (pluginType) {
    case "TEXT_TRANSFORM":
      return (
        <TextTransformForm
          config={node.data.config as TextTransformConfig}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
    case "API_PROXY":
      return (
        <ApiProxyForm
          config={node.data.config as ApiProxyConfig}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
    case "DELAY":
      return (
        <DelayForm
          config={node.data.config as DelayConfig}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
    case "IF":
      return (
        <IfForm
          config={node.data.config as IfConfig}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
    case "DATA_AGGREGATOR":
      return (
        <DataAggregatorForm
          config={node.data.config as DataAggregatorConfig}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
    default:
      return <div>Unknown node type</div>;
  }
}

// Text Transform Form
function TextTransformForm({
  config,
  onSave,
  onCancel,
}: {
  config: TextTransformConfig;
  onSave: (config: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(textTransformSchema),
    defaultValues: { shift: config.shift || 3 },
  });

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="shift">Shift Amount</Label>
        <Input
          id="shift"
          type="number"
          {...form.register("shift")}
          placeholder="3"
        />
        {form.formState.errors.shift && (
          <p className="text-sm text-destructive">
            {form.formState.errors.shift.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Caesar cipher shift (-25 to 25)
        </p>
      </div>
      <FormButtons onCancel={onCancel} />
    </form>
  );
}

// API Proxy Form
function ApiProxyForm({
  config,
  onSave,
  onCancel,
}: {
  config: ApiProxyConfig;
  onSave: (config: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(apiProxySchema),
    defaultValues: {
      url: config.url || "",
      method: config.method || "GET",
      cache: config.cache || false,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          type="url"
          {...form.register("url")}
          placeholder="https://api.example.com/endpoint"
        />
        {form.formState.errors.url && (
          <p className="text-sm text-destructive">
            {form.formState.errors.url.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="method">Method</Label>
        <Select
          value={form.watch("method")}
          onValueChange={(v) =>
            form.setValue("method", v as "GET" | "POST" | "PUT" | "DELETE")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <FormButtons onCancel={onCancel} />
    </form>
  );
}

// Delay Form
function DelayForm({
  config,
  onSave,
  onCancel,
}: {
  config: DelayConfig;
  onSave: (config: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(delaySchema),
    defaultValues: {
      ms: config.ms || 1000,
      blocking: config.blocking ?? true,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ms">Duration (ms)</Label>
        <Input
          id="ms"
          type="number"
          {...form.register("ms")}
          placeholder="1000"
        />
        {form.formState.errors.ms && (
          <p className="text-sm text-destructive">
            {form.formState.errors.ms.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Delay in milliseconds (0 - 300000)
        </p>
      </div>
      <FormButtons onCancel={onCancel} />
    </form>
  );
}

// IF Form
function IfForm({
  config,
  onSave,
  onCancel,
}: {
  config: IfConfig;
  onSave: (config: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(ifSchema),
    defaultValues: { expression: config.expression || "" },
  });

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="expression">Condition Expression</Label>
        <Input
          id="expression"
          {...form.register("expression")}
          placeholder="data.value > 10"
        />
        {form.formState.errors.expression && (
          <p className="text-sm text-destructive">
            {form.formState.errors.expression.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          JavaScript-like expression that evaluates to true/false
        </p>
      </div>
      <FormButtons onCancel={onCancel} />
    </form>
  );
}

// Data Aggregator Form
function DataAggregatorForm({
  config,
  onSave,
  onCancel,
}: {
  config: DataAggregatorConfig;
  onSave: (config: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(dataAggregatorSchema),
    defaultValues: { strategy: config.strategy || "merge" },
  });

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="strategy">Aggregation Strategy</Label>
        <Select
          value={form.watch("strategy")}
          onValueChange={(v) =>
            form.setValue("strategy", v as "merge" | "concat" | "pick")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="merge">Merge (combine objects)</SelectItem>
            <SelectItem value="concat">Concat (combine arrays)</SelectItem>
            <SelectItem value="pick">Pick (select first)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <FormButtons onCancel={onCancel} />
    </form>
  );
}

// Shared form buttons
function FormButtons({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit">Save</Button>
    </div>
  );
}
