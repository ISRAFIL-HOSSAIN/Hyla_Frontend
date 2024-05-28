import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FC } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import type { TFunction } from "react-i18next";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Typography,
  useMediaQuery,
} from "@mui/material";
import type { Theme } from "@mui/material";

import { Users as UsersIcon } from "../../icons/users";
import { XCircle as XCircleIcon } from "../../icons/x-circle";
import { Logo } from "../logo";
import { Scrollbar } from "../scrollbar";
import { DashboardSidebarSection } from "./dashboard-sidebar-section";
import { OrganizationPopover } from "./organization-popover";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import { AuthContext } from "../../contexts/firebase-auth-context";
import { boolean } from "yup";
import { useMounted } from "src/hooks/use-mounted";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import ArchitectureIcon from "@mui/icons-material/Architecture";
import AirlineStopsIcon from "@mui/icons-material/AirlineStops";
import { isOrganizationActions } from "src/slices/isOrganizationSlice";

import { useDispatch } from "react-redux";
import { isUserPermissionActions } from "src/slices/userPermissionSlice";
import LabelImportantIcon from "@mui/icons-material/LabelImportant";
import DataObjectIcon from "@mui/icons-material/DataObject";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import MyLocationIcon from "@mui/icons-material/MyLocation";
interface DashboardSidebarProps {
  onClose: () => void;
  open: boolean;
}

interface Item {
  title: string;
  t2: string;
  children?: Item[];
  chip?: ReactNode;
  icon?: ReactNode;
  path?: string;
}

interface Section {
  title: string;
  items: Item[];
}

const getSections = (
  t: TFunction,
  isSuperUser: boolean,
  isOrganization: string
): Section[] => [
  // {
  //   title: t("General"),
  //   items: [
  //     {
  //       title: t("Dashboard"),
  //       t2: 'dashboard',
  //       path: "/dashboard",
  //       icon: <HomeIcon fontSize="small" />,
  //     },
  //   ],
  // },

  ...(isSuperUser
    ? [
        {
          title: t("Administrations"),
          items: [
            {
              title: t("Organizations"),
              t2: "organization",
              path: "/administration/organization",
              icon: <CorporateFareIcon fontSize="small" />,
            },
            {
              title: t("Transports"),
              t2: "transports",
              path: "/administration/transports",
              icon: <AirlineStopsIcon fontSize="small" />,
            },
            {
              title: t("Data Field"),
              t2: "dataField",
              path: "/administration/dataField",
              icon: <DataObjectIcon fontSize="small" />,
            },
            {
              title: t("Port"),
              t2: "port",
              path: "/administration/port",
              icon: <LabelImportantIcon fontSize="small" />,
            },
          ],
        },
      ]
    : [
        {
          title: t("Organization"),
          items: [
            {
              title: t("Ships of Interest"),
              t2: "ship_of_interest",
              path: `/${isOrganization}/shipOfInterest`,
              icon: <ShareLocationIcon fontSize="small" />,
            },
            {
              title: t("Alert"),
              t2: "alerts",
              path: `/${isOrganization}/alert`,
              icon: <AddAlertIcon fontSize="small" />,
            },
            {
              title: t("Voyage"),
              t2: "voyage",
              path: `/${isOrganization}/voyage`,
              icon: <AllInboxIcon fontSize="small" />,
            },
            {
              title: t("Geofence"),
              t2: "geofence",
              path: `/${isOrganization}/geofence`,
              icon: <MyLocationIcon fontSize="small" />,
            },
          ],
        },
        {
          title: t("Administration"),
          items: [
            {
              title: t("Users"),
              t2: "user_management",
              path: `/${isOrganization}/users`,
              icon: <UsersIcon fontSize="small" />,
            },
            {
              title: t("Roles"),
              t2: "role_management",
              path: `/${isOrganization}/roles`,
              icon: <AccessibilityIcon fontSize="small" />,
            },
          ],
        },
      ]),
];

export const DashboardSidebar: FC<DashboardSidebarProps> = (props) => {
  const isMounted = useMounted();
  const { onClose, open } = props;
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [isOrganization, setIsOrganization] = useState("");
  const [isOrganizationObject, setIsOrganizationObject] = useState({});
  const [isPermissionObject, setIsPermissionObject] = useState({});
  const router = useRouter();
  const { t } = useTranslation();
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"), {
    noSsr: true,
  });
  const sections = useMemo(
    () => getSections(t, isSuperUser, isOrganization),
    [t, isSuperUser, isOrganization]
  );
  const organizationsRef = useRef<HTMLButtonElement | null>(null);
  const [openOrganizationsPopover, setOpenOrganizationsPopover] =
    useState<boolean>(false);
  const { authToken } = useContext(AuthContext);
  const dispatch = useDispatch();
  const handlePathChange = () => {
    if (!router.isReady) {
      return;
    }

    if (open) {
      onClose?.();
    }
  };

  const getSuperUser = useCallback(async () => {
    try {
      if (!authToken) {
        console.error("Authorization token is missing.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/isSuperUser`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch customer data: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (isMounted()) {
        setIsSuperUser(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, authToken]);

  const getUser = useCallback(async () => {
    try {
      if (!authToken) {
        console.error("Authorization token is missing.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/profile`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch customer data: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (isMounted()) {
        setIsOrganizationObject(data);
        setIsPermissionObject(data?.permissions);
        setIsOrganization(data?.organization?.name);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, authToken]);

  useEffect(() => {
    getSuperUser();
    getUser();
    dispatch(isOrganizationActions.setOrganizationData(isOrganizationObject));
    dispatch(isUserPermissionActions.setPermissionsData(isPermissionObject));

    if (isOrganization) {
      dispatch(isOrganizationActions.setOrganizationName(isOrganization));
    }
  }, [getSuperUser, getUser, isOrganization]);

  useEffect(handlePathChange, [router.isReady, router.asPath]);

  const handleOpenOrganizationsPopover = (): void => {
    setOpenOrganizationsPopover(true);
  };

  const handleCloseOrganizationsPopover = (): void => {
    setOpenOrganizationsPopover(false);
  };

  const content = (
    <>
      <Scrollbar
        sx={{
          height: "100%",
          "& .simplebar-content": {
            height: "100%",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div>
            <Box sx={{ p: 3 }}>
              {/* <Logo
                sx={{
                  height: 42,
                  width: 42,
                }}
              /> */}
              <Typography>
                <img src="/logo-transparent-png.png" width={130}></img>
              </Typography>

              <Typography variant="body1" sx={{ mt: 1, ml: 1 }}>
                {isOrganization?.toUpperCase?.().replace(/[_-]/g, " ")}
              </Typography>
            </Box>
            <Box sx={{ px: 2 }}>{/* ... */}</Box>
          </div>
          <Divider
            sx={{
              borderColor: "#2D3748", // dark divider
              my: 3,
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            {sections.map((section) => (
              <DashboardSidebarSection
                key={section.title}
                path={router.asPath}
                sx={{
                  mt: 2,
                  "& + &": {
                    mt: 2,
                  },
                }}
                {...section}
                userPermissions={isPermissionObject}
              />
            ))}
          </Box>
          <Divider
            sx={{
              borderColor: "#2D3748",
            }}
          />
        </Box>
      </Scrollbar>
    </>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        onClose={onClose}
        open={open}
        PaperProps={{
          sx: {
            backgroundColor: "neutral.900",
            borderRightColor: "divider",
            borderRightStyle: "solid",
            borderRightWidth: (theme) =>
              theme.palette.mode === "dark" ? 1 : 0,
            color: "#FFFFFF",
            width: 280,
          },
        }}
        sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
        variant="temporary"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: "neutral.900",
          color: "#FFFFFF",
          width: 280,
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

DashboardSidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
