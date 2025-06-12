import { pascalCase } from "change-case";
import { PrismaModel } from "../prisma-parser";

export function generateSidebar(models: PrismaModel[]): string {
  // generate menu items for the sidebar
  const menuItems = models
    .map((model) => {
      // This function generates the menu item code for each model.
      const modelName = pascalCase(model.name);
      return `{ path: '/${model.name}', icon: 'lucide:file-text', label: '${modelName}' }`;
    })
    .join(",\n  ");

  // This function generates the main application code for a React app with a collapsible sidebar.
  const code = `import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Tooltip } from '@heroui/react';
import { Icon } from '@iconify/react';

const menuItems =[
 ${menuItems}
];

export const CollapsibleSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();

  return (
    <aside
      className={\`bg-content1 transition-all duration-300 ease-in-out \${
        collapsed ? 'w-16' : 'w-64'
      } flex flex-col\`}
    >
      <div className="p-4 flex justify-between items-center">
        {!collapsed && <h1 className="text-xl font-bold">Menu</h1>}
        <Button
          isIconOnly
          variant="light"
          onPress={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon
            icon={collapsed ? 'lucide:chevron-right' : 'lucide:chevron-left'}
            className="w-5 h-5"
          />
        </Button>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2 p-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Tooltip
                content={collapsed ? item.label : ''}
                placement="right"
              >
                <Button
                  as={Link}
                  to={item.path}
                  variant={location.pathname === item.path ? 'solid' : 'light'}
                  color={location.pathname === item.path ? 'primary' : 'default'}
                  className={\`w-full justify-start \${
                    collapsed ? 'px-2' : 'px-4'
                  }\`}
                >
                  <Icon icon={item.icon} className="w-5 h-5" />
                  {!collapsed && <span className="ml-2">{item.label}</span>}
                </Button>
              </Tooltip>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};`;
  return code;
}
