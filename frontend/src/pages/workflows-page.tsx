import { useQuery } from "@tanstack/react-query";
import { workflowApi } from "@/lib/api/workflows";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function WorkflowsPage() {
  const { data: workflows, isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: workflowApi.getWorkflows,
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Workflows
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage your workflow definitions
          </p>
        </div>
        <Link to="/workflows/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4">
            {workflows && workflows.length > 0 ? (
              <div className="space-y-2">
                {workflows.map((workflow) => (
                  <Link
                    key={workflow.id}
                    to={`/workflows/${workflow.id}`}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <h3 className="font-semibold">{workflow.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {workflow.description || "No description"}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No workflows yet. Create your first workflow to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
