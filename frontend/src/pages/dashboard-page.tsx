import { Activity, GitBranch, Play, TrendingUp } from "lucide-react";

const stats = [
  {
    name: "Total Workflows",
    value: "12",
    icon: GitBranch,
    trend: "+2 this week",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    name: "Active Executions",
    value: "8",
    icon: Play,
    trend: "Running now",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  {
    name: "Success Rate",
    value: "94.2%",
    icon: TrendingUp,
    trend: "+5.1% from last week",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
  {
    name: "Total Runs Today",
    value: "127",
    icon: Activity,
    trend: "24 hours",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
];

export function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your Workflow Automation Platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-foreground mb-2">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workflows */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Recent Workflows
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GitBranch className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Workflow {i}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last run: 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  Active
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Executions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Recent Executions
          </h2>
          <div className="space-y-4">
            {[
              { status: "success", color: "green" },
              { status: "running", color: "blue" },
              { status: "success", color: "green" },
            ].map((exec, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 bg-${exec.color}-50 dark:bg-${exec.color}-950 rounded-lg`}
                  >
                    <Play
                      className={`h-4 w-4 text-${exec.color}-600 dark:text-${exec.color}-400`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Execution #{1000 + i}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {i === 1 ? "Running..." : "Completed"}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 ${
                    exec.status === "success"
                      ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
                      : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                  } text-xs font-medium rounded-full`}
                >
                  {exec.status === "success" ? "Success" : "Running"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
