import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb as UiBreadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { RouteConfig } from '@/routes/route-config';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <UiBreadcrumb className="mb-8">
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={item.path || index}>
            <BreadcrumbItem>
              {item.path && Object.values(RouteConfig).some(route => 
                typeof route === 'string' ? route === item.path : Object.values(route).includes(item.path)
              ) ? (
                <BreadcrumbLink asChild>
                  <Link to={item.path}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </UiBreadcrumb>
  );
} 