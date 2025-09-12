import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bell, Gauge, Layers, Settings, UserPlus, CalendarDays, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";

function NavLink({ to, label, icon: Icon }: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <SidebarMenuItem>
      <Link to={to} className="contents">
        <SidebarMenuButton isActive={active}>
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme.dark", dark ? "1" : "0");
  }, [dark]);
  useEffect(() => {
    const saved = localStorage.getItem("theme.dark");
    if (saved) document.documentElement.classList.toggle("dark", saved === "1");
  }, []);

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="h-6 w-6 rounded bg-primary/90" />
            <span className="font-semibold">EduFace</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavLink to="/" label="Dashboard" icon={Gauge} />
                <NavLink to="/enrollment" label="Student Enrollment" icon={UserPlus} />
                <NavLink to="/alerts" label="Parent Alerts" icon={Bell} />
                <NavLink to="/status" label="System Status" icon={Layers} />
                <NavLink to="/annual" label="Annual Attendance" icon={CalendarDays} />
                <NavLink to="/manual" label="Manual Attendance" icon={CheckSquare} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="text-xs text-muted-foreground px-2">
            Secure and efficient attendance.
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 border-b bg-primary text-primary-foreground">
          <div className="flex h-12 items-center px-3 w-full">
            <SidebarTrigger className={cn("text-primary-foreground hover:bg-white/10")}/>
            <div className="ml-2 font-semibold tracking-tight">Automated Attendance for Rural Schools</div>
            <div className="ml-auto flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Dark Mode</div>
                        <div className="text-sm text-muted-foreground">Toggle site theme</div>
                      </div>
                      <Switch checked={dark} onCheckedChange={setDark} />
                    </div>
                    <Button variant="destructive" onClick={logout}>Logout</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Avatar className="h-7 w-7 border border-white/30">
                <AvatarFallback className="bg-white/20 text-white">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6 bg-muted/30 min-h-[calc(100svh-3rem)]">{children}</main>
        <footer className="border-t text-xs text-muted-foreground bg-background">
          <div className="container mx-auto px-4 py-3 flex items-center gap-6">
            <span>Support</span>
            <span>Legal</span>
            <span>Follow Us</span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
