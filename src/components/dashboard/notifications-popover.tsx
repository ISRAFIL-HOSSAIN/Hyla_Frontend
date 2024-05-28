import { useContext, useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import PropTypes from "prop-types";
import { format, subDays, subHours } from "date-fns";
import { Toaster, toast } from "react-hot-toast";
import {
  Avatar,
  Box,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import { ChatAlt as ChatAltIcon } from "../../icons/chat-alt";
import { MailOpen as MailOpenIcon } from "../../icons/mail-open";
import { X as XIcon } from "../../icons/x";
import { UserCircle as UserCircleIcon } from "../../icons/user-circle";
import { Notification } from "../../types/notification";
import { Scrollbar } from "../scrollbar";
import { useSelector } from "react-redux";
import { RootState } from "src/store";
import { AuthContext } from "src/contexts/firebase-auth-context";

interface NotificationsPopoverProps {
  anchorEl: null | Element;
  onClose?: () => void;
  onUpdateUnread?: (value: number) => void;
  open?: boolean;
}

const getNotificationContent = (notification: any): JSX.Element => {

  // const backgroundColor = notification.isRead ? "white" : "#f0f0f0";

  switch (notification.type) {
    case "Alert Notification":
    case "Geofence Alert Notification":
      return (
        <ListItem
          // style={{ backgroundColor }}
        >
          <ListItemAvatar sx={{ mt: 0.5 }}>
            <Avatar src={notification.avatar}>
              <UserCircleIcon fontSize="small" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                <Typography sx={{ mr: 0.5 }} variant="subtitle2">
                  {notification.title}
                </Typography>
                <Typography sx={{ mr: 0.5 }} variant="subtitle2">
                  Transport Name: {notification.transportName}
                </Typography>
                <Typography sx={{ mr: 0.5 }} variant="subtitle2">
                  Imo Number: {notification.imoNumber}
                </Typography>
                <Typography sx={{ mr: 0.5 }} variant="body2">
                  {notification.message}
                </Typography>
              </Box>
            }
            secondary={
              <Typography color="textSecondary" variant="caption">
                {format(notification.createdAt, "MMM dd, h:mm a")}
              </Typography>
            }
            sx={{ my: 0 }}
          />
        </ListItem>
      );

    default:
      return null;
  }
};


export const NotificationsPopover: FC<NotificationsPopoverProps> = (props) => {
  const { anchorEl, onClose, onUpdateUnread, open, ...other } = props;

  const { authToken } = useContext(AuthContext);
  const [getData, setGetData] = useState([]);
  const unread = useMemo(
    () =>
      getData.reduce(
        (acc, notification) => acc + (notification.isRead ? 0 : 1),
        0
      ),
    [getData]
  );

  useEffect(() => {
    if (open) {
      fetchAllNotifications();
    }
  }, [open]);

  const fetchAllNotifications = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}notification`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }
      const Data = await response.json();
      setGetData(Data);
    } catch (error) {
      console.log("Error marking all notifications as read:", error.message);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllNotifications();
      onUpdateUnread?.(unread);
    },1000);

    return () => clearInterval(interval);
  }, [onUpdateUnread, unread]);

  const handleRemoveOne = async (notificationId) => {
    try {
      setGetData((prevState) =>
        prevState.filter((notification) => notification._id !== notificationId)
      );
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}notification/delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ removeId: notificationId }),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success === true) {
          toast.success(responseData.message);
          fetchAllNotifications();
        } else {
          toast.error(responseData.message);
        }
      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong. Please retry`);
    }
  };

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: "left",
        vertical: "bottom",
      }}
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 380 } }}
      transitionDuration={0}
      {...other}
    >
      <Box
        sx={{
          alignItems: "center",
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          justifyContent: "space-between",
          px: 3,
          py: 2,
        }}
      >
        <Typography color="inherit" variant="h6">
          Notifications
        </Typography>
        <Tooltip title="Mark all as read">
          <IconButton
            // onClick={handleMarkAllAsRead}
            size="small"
            sx={{ color: "inherit" }}
          >
            <MailOpenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {getData.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2">
            There are no notifications
          </Typography>
        </Box>
      ) : (
        <Scrollbar sx={{ maxHeight: 400 }}>
          <List disablePadding>
            {getData.map((notification) => (
              <ListItem
                divider
                key={notification.id}
                sx={{
                  backgroundColor: notification.isRead ? "white" : "#f0f0f0",
                  alignItems: "flex-start",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  "& .MuiListItemSecondaryAction-root": {
                    top: "24%",
                  },
                }}
                secondaryAction={
                  <Tooltip title="Remove">
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveOne(notification._id)}
                      size="small"
                    >
                      <XIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                }
              >
                {getNotificationContent(notification)}
              </ListItem>
            ))}
          </List>
        </Scrollbar>
      )}
    </Popover>
  );
};

NotificationsPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  onUpdateUnread: PropTypes.func,
  open: PropTypes.bool,
};
