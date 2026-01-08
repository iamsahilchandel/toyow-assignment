import { useQuery } from "@tanstack/react-query";
import { executionApi } from "@/lib/api/executions";
import { StatusBadge } from "@/components/status-badge";
import { Link } from "react-router-dom";

export function ExecutionsPage() {
  const { data: executions, isLoading } = useQuery({
    queryKey: ["executions"],
    queryFn: () => executionApi.getExecutions(),
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Executions
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Monitor workflow execution history
        </p>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4">
            {executions && executions.length > 0 ? (
              <div className="space-y-2">
                {executions.map((execution) => (
                  <Link
                    key={execution.id}
                    to={`/executions/${execution.id}`}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {execution.workflowName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Started:{" "}
                          {new Date(execution.startedAt).toLocaleString()}
                        </p>
                      </div>
                      <StatusBadge status={execution.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No executions found.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
