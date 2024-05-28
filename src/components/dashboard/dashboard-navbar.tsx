import { useContext, useEffect, useRef, useState } from "react";
import type { FC } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  ButtonBase,
  IconButton,
  Toolbar,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { AppBarProps } from "@mui/material";
import { Menu as MenuIcon } from "../../icons/menu";
import { AccountPopover } from "./account-popover";
import { ContactsPopover } from "./contacts-popover";
import { ContentSearchDialog } from "./content-search-dialog";
import { NotificationsPopover } from "./notifications-popover";
import { LanguagePopover } from "./language-popover";
import { Bell as BellIcon } from "../../icons/bell";
import { UserCircle as UserCircleIcon } from "../../icons/user-circle";
import { Search as SearchIcon } from "../../icons/search";
import { Users as UsersIcon } from "../../icons/users";
import { useSelector } from "react-redux";
import { RootState } from "src/store";
import axios from "axios";
import { AuthContext } from "src/contexts/firebase-auth-context";
interface DashboardNavbarProps extends AppBarProps {
  onOpenSidebar?: () => void;
}

const languages = {
  en: "/static/icons/uk_flag.svg",
  de: "/static/icons/de_flag.svg",
  es: "/static/icons/es_flag.svg",
};

const DashboardNavbarRoot = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  ...(theme.palette.mode === "light"
    ? {
        boxShadow: theme.shadows[3],
      }
    : {
        backgroundColor: theme.palette.background.paper,
        borderBottomColor: theme.palette.divider,
        borderBottomStyle: "solid",
        borderBottomWidth: 1,
        boxShadow: "none",
      }),
}));

const NotificationsButton: FC = () => {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const { authToken } = useContext(AuthContext);
  const [unread, setUnread] = useState<number>(0);
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  const isOrganizationData = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationData
  );

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}notification/getunread`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch unread notifications");
      }
      const unreadNotifications = await response.json();
      // handleUpdateUnread(unreadNotifications.length);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  };

  const handleOpenPopover = (): void => {
    setOpenPopover(true);
  };

  const handleClosePopover = (): void => {
    setOpenPopover(false);
    fetchUnreadNotifications();
  };

  const handleUpdateUnread = (value: number): void => {
    setUnread(value);
  };

  if (isOrganizationData.isSuperUser) {
    return null;
  }

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton ref={anchorRef} sx={{ ml: 1 }} onClick={handleOpenPopover}>
          <Badge color="error" badgeContent={unread}>
            <BellIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>
      <NotificationsPopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        onUpdateUnread={handleUpdateUnread}
        open={openPopover}
      />
    </>
  );
};

const AccountButton = () => {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  const isOrganizationData = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationData
  );

  const userName = isOrganizationData?.name || "";

  const handleOpenPopover = (): void => {
    setOpenPopover(true);
  };

  const handleClosePopover = (): void => {
    setOpenPopover(false);
  };

  return (
    <>
      <Box
        component={ButtonBase}
        onClick={handleOpenPopover}
        ref={anchorRef}
        sx={{
          alignItems: "center",
          display: "flex",
          ml: 2,
        }}
      >
        {/* <Avatar
          sx={{
            height: 40,
            width: 40
          }}
          src={user.avatar}
        >
          <UserCircleIcon fontSize="small" />
        </Avatar> */}

        {userName && <Avatar>{userName[0].toUpperCase()}</Avatar>}
      </Box>
      <AccountPopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        open={openPopover}
      />
    </>
  );
};

export const DashboardNavbar: FC<DashboardNavbarProps> = (props) => {
  const { onOpenSidebar, ...other } = props;

  return (
    <>
      <DashboardNavbarRoot
        sx={{
          // left: {
          //   lg: 280
          // },
          width: "100%",
          // width: {
          //   lg: 'calc(100% - 280px)'
          // }
        }}
        {...other}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: 64,
            left: 0,
            px: 2,
          }}
        >
          <IconButton
            onClick={onOpenSidebar}
            sx={{
              display: {
                xs: "inline-flex",
                // lg: 'none'
                lg: "block",
              },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <NotificationsButton />
          <AccountButton />
        </Toolbar>
      </DashboardNavbarRoot>
    </>
  );
};

DashboardNavbar.propTypes = {
  onOpenSidebar: PropTypes.func,
};
