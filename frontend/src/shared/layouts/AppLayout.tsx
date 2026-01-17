import { Outlet } from "react-router-dom";
import { AppSidebar } from "../components/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { Separator } from "@/shared/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui/sidebar";
import { useLocation } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isLast: boolean;
}

// Helper to get breadcrumb info from path
function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) {
    return [{ label: "Dashboard", isLast: true }];
  }

  const breadcrumbs = [{ label: "Home", href: "/", isLast: false }];

  let currentPath = "";
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const isLast = index === parts.length - 1;

    // Capitalize and format the label
    const label =
      part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");

    breadcrumbs.push({
      label,
      href: isLast ? "" : currentPath,
      isLast,
    });
  });

  return breadcrumbs;
}

export function AppLayout() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.label} className="flex items-center">
                    {index > 0 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                    <BreadcrumbItem
                      className={index === 0 ? "hidden md:block" : ""}
                    >
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb?.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
