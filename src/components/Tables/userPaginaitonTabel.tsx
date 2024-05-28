import { useContext, useEffect, useState } from "react";
import type { ChangeEvent, FC, MouseEvent } from "react";
import NextLink from "next/link";
import numeral from "numeral";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import PropTypes from "prop-types";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
} from "@mui/material";
import TablePagination from "@mui/material/TablePagination";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { ArrowRight as ArrowRightIcon } from "../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../icons/pencil-alt";
import type { Customer } from "../../types/customer";
import { getInitials } from "../../utils/get-initials";
import { Scrollbar } from "../scrollbar";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { AuthContext } from "src/contexts/firebase-auth-context";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "src/store";
interface ListTableProps {
  data?: any;
  dataCount: number;
  onPageChange?: (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  page: number;
  rowsPerPage: number;
  isLoading: boolean;
  onDeleteSuccess?: any;
}

export const UserPagination: FC<ListTableProps> = (props) => {
  const {
    data,
    dataCount,
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    isLoading,
    onDeleteSuccess,
    ...other
  } = props;

  const { authToken } = useContext(AuthContext);

  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );
  useEffect(() => {
    if (selectedCustomers.length) {
      setSelectedCustomers([]);
    }
  }, [data]);

  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  let dynamicPath = `/${isOrganizationName}/users`;


  const [selectedDataForDeletion, setSelectedDataForDeletion] = useState(null);
  const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] =
    useState(false);

  const handleDeleteButtonClick = (data) => {
    setSelectedDataForDeletion(data);
    setDeleteConfirmationDialogOpen(true);
  };

  const handleDeleteConfirmation = async () => {
    try {
      if (!selectedDataForDeletion) {
        console.error("No data selected for deletion");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/delete/${selectedDataForDeletion._id}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete data: ${response.statusText}`);
      }

      // Show a success toast message
      toast.success("Data deleted successfully!");

      setDeleteConfirmationDialogOpen(false);
      setSelectedDataForDeletion(null);

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Error deleting data:", error);

      // Show an error toast message
      toast.error("Error deleting data. Please try again.");
    }
  };

  const [selectedDataForActivation, setSelectedDataForActivation] =
    useState(null);
  const [activateConfirmationDialogOpen, setActivateConfirmationDialogOpen] =
    useState(false);

  const handleActivateDeactivateClick = (data) => {
    setSelectedDataForActivation(data);
    setActivateConfirmationDialogOpen(true);
  };

  const handleActivate = async () => {
    try {
      if (!selectedDataForActivation) {
        console.error("No data selected for activation");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/active/${selectedDataForActivation._id}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to activate data: ${response.statusText}`);
      }

      // Show a success toast message
      toast.success("Data activated successfully!");

      setActivateConfirmationDialogOpen(false);
      setSelectedDataForActivation(null);

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Error activating data:", error);

      // Show an error toast message
      toast.error("Error activating data. Please try again.");
    }
  };

  const handleDeactivateConfirmation = async () => {
    try {
      if (!selectedDataForActivation) {
        console.error("No data selected for deactivation");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/deactivate/${selectedDataForActivation._id}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to deactivate data: ${response.statusText}`);
      }

      // Show a success toast message
      toast.success("Data deactivated successfully!");

      setActivateConfirmationDialogOpen(false);
      setSelectedDataForActivation(null);

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Error deactivating data:", error);

      // Show an error toast message
      toast.error("Error deactivating data. Please try again.");
    }
  };

  const formatString = (inputString) => {
    const formattedString =
      inputString.charAt(0).toUpperCase() + inputString.slice(1);
    const finalString = formattedString.replace(/[_-]/g, " ");

    return finalString;
  };

  const handleToggleExpansion = (customerId: string) => {
    setExpandedCustomer((prevExpanded) =>
      prevExpanded === customerId ? null : customerId
    );
  };

  const enableBulkActions = selectedCustomers.length > 0;
  const selectedSomeCustomers =
    selectedCustomers.length > 0 && selectedCustomers.length < data.length;
  const selectedAllCustomers = selectedCustomers.length === data.length;

  return (
    <div {...other}>
      {isLoading ? (
        <Typography variant="h6" align="center">
          <CircularProgress />
        </Typography>
      ) : (
        <React.Fragment>
          {data.length === 0 ? (
            <Typography
              variant="h6"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "10vh",
              }}
            >
              No data added of users yet.
            </Typography>
          ) : (
            <React.Fragment>
              <Box
                sx={{
                  backgroundColor: "neutral.100",
                  // display: !enableBulkActions && "none",
                  px: 2,
                  py: 0.5,
                }}
              ></Box>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Permissions</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((data:any) => {
                    return (
                      <React.Fragment key={data._id}>
                        <TableRow hover >
                          <TableCell>
                            <Box
                              sx={{
                                alignItems: "center",
                                display: "flex",
                              }}
                            >
                              <Box sx={{ ml: 1 }}>{data.email}</Box>
                            </Box>
                          </TableCell>
                          <TableCell>{formatString(data.name)}</TableCell>
                          <TableCell>
                            {data.roles.map((role, index) => (
                              <span key={index}>
                                {role.name}
                                {index < data.roles.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </TableCell>
                        
                          <TableCell>
                            <IconButton
                              component="a"
                              onClick={() =>
                                handleToggleExpansion(data._id)
                              }
                            >
                              <KeyboardDoubleArrowDownIcon color="primary" />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                                {data.isDeleted ? "Yes" : "No"}
                              </TableCell>
                          <TableCell align="right">
                            <NextLink
                              href={`${dynamicPath}/edit/${data._id}`}
                              passHref
                            >
                              <IconButton component="a">
                                <PencilAltIcon fontSize="small" />
                              </IconButton>
                            </NextLink>
                        
                            <Tooltip title="Delete" arrow>
                                  <IconButton
                                    onClick={() =>
                                      handleDeleteButtonClick(data)
                                    }
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                {/* {data.isDeleted ? (
                                  <Tooltip title="Deactivate" arrow>
                                    <IconButton
                                      onClick={() =>
                                        handleActivateDeactivateClick(data)
                                      }
                                    >
                                      <ClearIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Activate" arrow>
                                    <IconButton
                                      onClick={() =>
                                        handleActivateDeactivateClick(data)
                                      }
                                    >
                                      <CheckIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )} */}
                                    <NextLink
                              href={`${dynamicPath}/${data._id}`}
                              passHref
                            >
                              <IconButton component="a">
                                <ArrowRightIcon fontSize="small" />
                              </IconButton>
                            </NextLink>
                          </TableCell>
                        </TableRow>
                        {expandedCustomer === data._id && (
                          <TableRow>
                            <TableCell colSpan={3}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Permission Name</TableCell>
                                    <TableCell>Read</TableCell>
                                    <TableCell>Write</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {/* Check if customer.permissions is defined before using Object.entries */}
                                  {data?.permissions &&
                                    Object.entries(data.permissions).map(
                                      ([key, value], index) => (
                                        <TableRow key={index}>
                                          <TableCell>
                                            {formatString(key)}
                                          </TableCell>
                                          <TableCell>
                                            <span
                                              style={{
                                                backgroundColor:
                                                  value === "rw" ||
                                                  value === "r" ||
                                                  value === "wr"
                                                    ? "#addfad"
                                                    : "#efa4a4",
                                                color:
                                                  value === "rw" ||
                                                  value === "r" ||
                                                  value === "wr"
                                                    ? "#029a02"
                                                    : "#dc0d0d",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                              }}
                                            >
                                              {value === "rw" ||
                                              value === "r" ||
                                              value === "wr"
                                                ? "Y"
                                                : "N"}
                                            </span>
                                          </TableCell>
                                          <TableCell>
                                            <span
                                              style={{
                                                backgroundColor:
                                                  value === "rw" ||
                                                  value === "w" ||
                                                  value === "wr"
                                                    ? "#addfad"
                                                    : "#efa4a4",
                                                color:
                                                  value === "rw" ||
                                                  value === "w" ||
                                                  value === "wr"
                                                    ? "#029a02"
                                                    : "#dc0d0d",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                              }}
                                            >
                                              {value === "rw" ||
                                              value === "w" ||
                                              value === "wr"
                                                ? "Y"
                                                : "N"}
                                            </span>
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                </TableBody>
                              </Table>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={dataCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </React.Fragment>
          )}
        </React.Fragment>
      )}

      <Dialog
        open={deleteConfirmationDialogOpen}
        onClose={() => setDeleteConfirmationDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the selected data?
          </Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setDeleteConfirmationDialogOpen(false)}>
            Cancel
          </MuiButton>
          <MuiButton onClick={handleDeleteConfirmation} color="error">
            Delete
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={activateConfirmationDialogOpen}
        onClose={() => setActivateConfirmationDialogOpen(false)}
      >
        <DialogTitle>Confirm Activation/Deactivation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            {selectedDataForActivation?.isActive ? "deactivate" : "activate"}{" "}
            the selected data?
          </Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setActivateConfirmationDialogOpen(false)}>
            Cancel
          </MuiButton>
          <MuiButton
            onClick={() => {
              selectedDataForActivation?.isActive
                ? handleDeactivateConfirmation()
                : handleActivate();
            }}
            color="error"
          >
            {selectedDataForActivation?.isActive ? "Deactivate" : "Activate"}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

UserPagination.propTypes = {
  data: PropTypes.array.isRequired,
  dataCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onDeleteSuccess: PropTypes.func,
};
