import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import type { WorkflowDefinition } from "../../../shared/types/workflow";

interface WorkflowCardProps {
  workflow: WorkflowDefinition;
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>
              <Link
                to={`/workflows/${workflow.id}`}
                className="hover:underline"
              >
                {workflow.name}
              </Link>
            </CardTitle>
            <CardDescription>
              {workflow.description || "No description"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate(`/workflows/${workflow.id}/builder`)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/workflows/${workflow.id}/versions`)}
              >
                Versions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">v{workflow.version}</Badge>
          <span className="text-sm text-muted-foreground">
            {workflow.nodes.length} nodes
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
