import type { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { List, ListSubheader } from '@mui/material';
import type { ListProps } from '@mui/material';
import { DashboardSidebarItem } from './dashboard-sidebar-item';

interface Item {
  t2: string;
  path?: string;
  icon?: ReactNode;
  chip?: ReactNode;
  info?: ReactNode;
  children?: Item[];
  title: string;
}
interface DashboardSidebarSectionProps extends ListProps {
  items: Item[];
  path: string;
  title: string;
  userPermissions: Record<string, string>; 
}

const renderNavItems = ({
  depth = 0,
  items,
  path,
  userPermissions, 
}: {
  depth?: number;
  items: Item[];
  path: string;
  userPermissions: Record<string, string>; 
}): JSX.Element => (
  <List disablePadding>
    {items.reduce(
      (acc, item) =>
        reduceChildRoutes({
          acc,
          item,
          depth,
          path,
          userPermissions,
        }),
      []
    )}
  </List>
);

const reduceChildRoutes = ({
  acc,
  item,
  depth,
  path,
  userPermissions, 
}: {
  acc: JSX.Element[];
  depth: number;
  item: Item;
  path: string;
  userPermissions: Record<string, string>; 
}): Array<JSX.Element> => {
  const key = `${item.title}-${depth}`;
  const partialMatch = path.includes(item.path);
  const exactMatch = path === item.path;

  // New code to check permissions
  const allowedPermissions = ['organization','dataField','port','transports','user_management', 'role_management', 'ship_of_interest', 'geofence', 'alerts','voyage'];

  const hasPermission = item.t2 && allowedPermissions.includes(item.t2) && (userPermissions[item.t2] === 'rw' || userPermissions[item.t2] === 'wr' || userPermissions[item.t2] === 'r');

  if (hasPermission) {
    if (item.children) {
      acc.push(
        <DashboardSidebarItem
          active={partialMatch}
          chip={item.chip}
          depth={depth}
          icon={item.icon}
          info={item.info}
          key={key}
          open={partialMatch}
          path={item.path}
          title={item.title}
        >
          {renderNavItems({
            depth: depth + 1,
            items: item.children,
            path,
            userPermissions,
          })}
        </DashboardSidebarItem>
      );
    } else {
      acc.push(
        <DashboardSidebarItem
          active={exactMatch}
          chip={item.chip}
          depth={depth}
          icon={item.icon}
          info={item.info}
          key={key}
          path={item.path}
          title={item.title}
        />
      );
    }
  }

  return acc;
};

export const DashboardSidebarSection: FC<DashboardSidebarSectionProps> = (props) => {
  const { items, path, title, userPermissions, ...other } = props;

  return (
    <List
      subheader={
        <ListSubheader
          disableGutters
          disableSticky
          sx={{
            color: 'neutral.500',
            fontSize: '0.75rem',
            fontWeight: 700,
            lineHeight: 2.5,
            ml: 4,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </ListSubheader>
      }
      {...other}
    >
      {renderNavItems({
        items,
        path,
        userPermissions,
      })}
    </List>
  );
};

DashboardSidebarSection.propTypes = {
  items: PropTypes.array.isRequired,
  path: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  userPermissions: PropTypes.objectOf(PropTypes.string).isRequired,
};
