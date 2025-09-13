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
import { Bell, Gauge, Layers, Settings, UserPlus, CalendarDays, CheckSquare, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";

function NavLink({ to, label, icon: Icon, hidden }: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; hidden?: boolean; }) {
  const location = useLocation();
  const active = location.pathname === to;
  if (hidden) return null;
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
  const { logout, role, profile, saveProfile } = useAuth();
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
                <NavLink to="/enrollment" label="Student Enrollment" icon={UserPlus} hidden={role === 'do'} />
                <NavLink to="/alerts" label="Parent Alerts" icon={Bell} hidden={role==='do'} />
                <NavLink to="/status" label="System Status" icon={Layers} />
                <NavLink to="/annual" label="Annual Attendance" icon={CalendarDays} />
                <NavLink to="/students" label="Students" icon={Users} hidden={role==='do'} />
                <NavLink to="/manual" label="Manual Attendance" icon={CheckSquare} hidden={role === 'do'} />
                <NavLink to="/do-office" label="DO Office" icon={Building2} hidden={role !== 'do'} />
                <NavLink to="/auto-windows" label="Auto Windows" icon={Layers} hidden={role !== 'do'} />
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

                    {role === 'school' && (
                      <div className="space-y-2">
                        <div className="font-medium">School Details</div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          <label className="text-sm">School Name<input className="input-like" value={profile?.name || ''} onChange={(e)=>saveProfile({ ...(profile||{name:'',schoolId:'',district:'',address:'',doId:''}), name:e.target.value })} /></label>
                          <label className="text-sm">School ID<input className="input-like" value={profile?.schoolId || ''} onChange={(e)=>saveProfile({ ...(profile||{name:'',schoolId:'',district:'',address:'',doId:''}), schoolId:e.target.value })} /></label>
                          <label className="text-sm">District<input className="input-like" value={profile?.district || ''} onChange={(e)=>saveProfile({ ...(profile||{name:'',schoolId:'',district:'',address:'',doId:''}), district:e.target.value })} /></label>
                          <label className="text-sm">Address<input className="input-like" value={profile?.address || ''} onChange={(e)=>saveProfile({ ...(profile||{name:'',schoolId:'',district:'',address:'',doId:''}), address:e.target.value })} /></label>
                          <label className="text-sm sm:col-span-2">DO Office ID<input className="input-like" value={profile?.doId || ''} onChange={(e)=>saveProfile({ ...(profile||{name:'',schoolId:'',district:'',address:'',doId:''}), doId:e.target.value })} /></label>
                        </div>
                      </div>
                    )}

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
        <style>{`.input-like{ @apply w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring; }`}</style>
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
