import { useLocation, matchPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routes } from '../routes/route-config';

export function useBreadcrumbs() {
  const location = useLocation();
  const { t } = useTranslation();
  
  const breadcrumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .reduce<Array<{ label: string; path?: string }>>((acc, part, index, parts) => {
      const path = `/${parts.slice(0, index + 1).join('/')}`;
      
      // First try to find exact route match
      const matchingRoute = routes.find(route => 
        matchPath(route.path, path)
      );

      if (matchingRoute) {
        acc.push({
          label: t(`breadcrumbs.${matchingRoute.key}`, matchingRoute.key),
          path: index === parts.length - 1 ? undefined : path,
        });
      } else {
        // If no exact match found, add the path segment as a breadcrumb
        acc.push({
          label: t(`breadcrumbs.${part}`, part),
          path: index === parts.length - 1 ? undefined : path,
        });
      }

      return acc;
    }, []);

  return breadcrumbs;
}