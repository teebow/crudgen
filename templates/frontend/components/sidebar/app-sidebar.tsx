import * as React from 'react';
import { Command } from 'lucide-react';

import { NavSecondary } from '@/components/sidebar/nav-secondary';
import { NavUser } from '@/components/sidebar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavEntities } from './nav-entity';

export type SideBarDataProps = {
  entities: any; // Replace 'any' with the actual type of entities
  navsecondary: any; // Replace 'any' with the actual type of navSecondary
  user: any; // Replace 'any' with the actual type of user
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & SideBarDataProps;

export function AppSidebar({ ...props }: AppSidebarProps) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Tibal APP</span>
                  <span className="truncate text-xs">FD - BCNUM</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavEntities entities={props.entities} />
        <NavSecondary items={props.navsecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={props.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
