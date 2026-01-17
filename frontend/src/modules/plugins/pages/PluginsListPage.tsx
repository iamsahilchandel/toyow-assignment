import { useGetPluginsQuery } from "../plugins.api";
import { PageHeader } from "../../../shared/components/PageHeader";
import { LoadingState } from "../../../shared/components/LoadingState";
import { ErrorState } from "../../../shared/components/ErrorState";
import { PluginCard } from "../components/PluginCard";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";

export function PluginsListPage() {
  const { data: plugins, isLoading, error, refetch } = useGetPluginsQuery();

  if (isLoading) {
    return <LoadingState message="Loading plugins..." />;
  }

  if (error) {
    return <ErrorState message="Failed to load plugins" onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plugins"
        description="Manage workflow plugins"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Plugin
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plugins && plugins.length > 0 ? (
          plugins.map((plugin) => (
            <PluginCard key={plugin.id} plugin={plugin} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No plugins yet. Create your first plugin to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
