import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import type { PluginVersion } from "../../../shared/types/plugins";
import { useState } from "react";
import { CreatePluginVersionDialog } from "./CreatePluginVersionDialog";

interface PluginVersionTableProps {
  versions: PluginVersion[];
  pluginId: string;
}

export function PluginVersionTable({ versions, pluginId }: PluginVersionTableProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Version
        </Button>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No versions yet. Create the first version to get started.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell>
                    <Badge variant="secondary">{version.version}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(version.createdAt), "PPpp")}
                  </TableCell>
                  <TableCell>{version.createdBy}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View Schema
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreatePluginVersionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        pluginId={pluginId}
      />
    </div>
  );
}
