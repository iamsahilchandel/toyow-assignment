import { useParams } from "react-router-dom";
import { useGetPluginQuery, useGetPluginVersionsQuery } from "../plugins.api";
import { PageHeader } from "../../../shared/components/PageHeader";
import { LoadingState } from "../../../shared/components/LoadingState";
import { ErrorState } from "../../../shared/components/ErrorState";
import { PluginVersionTable } from "../components/PluginVersionTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function PluginDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: plugin, isLoading: pluginLoading, error: pluginError, refetch: refetchPlugin } = useGetPluginQuery(id!, {
    skip: !id,
  });
  const { data: versions, isLoading: versionsLoading } = useGetPluginVersionsQuery(id!, {
    skip: !id,
  });

  if (pluginLoading) {
    return <LoadingState message="Loading plugin details..." />;
  }

  if (pluginError || !plugin) {
    return <ErrorState message="Failed to load plugin" onRetry={refetchPlugin} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={plugin.name}
        description={plugin.description || "Plugin details"}
        actions={
          <Link to="/plugins">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plugins
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plugin Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium">ID:</span> <code className="text-xs">{plugin.id}</code>
            </div>
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(plugin.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Updated:</span>{" "}
              {new Date(plugin.updatedAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Created by:</span> {plugin.createdBy}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{plugin.description || "No description"}</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Versions</CardTitle>
        </CardHeader>
        <CardContent>
          {versionsLoading ? (
            <LoadingState message="Loading versions..." skeletonCount={3} />
          ) : (
            <PluginVersionTable versions={versions || []} pluginId={id!} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
