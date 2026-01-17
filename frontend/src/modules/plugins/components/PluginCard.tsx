import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useNavigate, Link } from "react-router-dom";
import type { Plugin } from "../../../shared/types/plugins";

interface PluginCardProps {
  plugin: Plugin;
}

export function PluginCard({ plugin }: PluginCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>
              <Link
                to={`/plugins/${plugin.id}`}
                className="hover:underline"
              >
                {plugin.name}
              </Link>
            </CardTitle>
            <CardDescription>
              {plugin.description || "No description"}
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
                onClick={() => navigate(`/plugins/${plugin.id}`)}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/plugins/${plugin.id}`)}
              >
                Versions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Created: {new Date(plugin.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
