import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Plus, GitBranch, Play } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common workflow actions</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2 flex-wrap">
        <Link to="/workflows/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Workflow
          </Button>
        </Link>
        <Link to="/workflows">
          <Button variant="outline">
            <GitBranch className="mr-2 h-4 w-4" />
            View Workflows
          </Button>
        </Link>
        <Link to="/runs">
          <Button variant="outline">
            <Play className="mr-2 h-4 w-4" />
            View Runs
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
