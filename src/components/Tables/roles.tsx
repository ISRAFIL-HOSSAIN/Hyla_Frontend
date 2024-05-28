import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  CircularProgress,
} from "@mui/material";
import { ArrowRight as ArrowRightIcon } from "../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../icons/pencil-alt";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
export const RolesListTable = (props: any) => {
  const {
    data,
    dataCount,
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    isLoading,
    ...other
  } = props;
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSelectAllCustomers = (event) => {
    setSelectedCustomers(
      event.target.checked ? data.map((data) => data.id) : []
    );
  };

  const handleSelectOneCustomer = (event, customerId) => {
    if (!selectedCustomers.includes(customerId)) {
      setSelectedCustomers((prevSelected) => [...prevSelected, customerId]);
    } else {
      setSelectedCustomers((prevSelected) =>
        prevSelected.filter((id) => id !== customerId)
      );
    }
  };

  const handleToggleExpansion = (rowId) => {
    setExpandedRow((prevExpanded) => (prevExpanded === rowId ? null : rowId));
  };

  const enableBulkActions = selectedCustomers.length > 0;
  const selectedSomeCustomers =
    selectedCustomers.length > 0 && selectedCustomers.length < data.length;
  const selectedAllCustomers = selectedCustomers.length === data.length;

  const formatString = (inputString) => {
    const formattedString =
      inputString.charAt(0).toUpperCase() + inputString.slice(1);
    const finalString = formattedString.replace(/[_-]/g, " ");

    return finalString;
  };

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
              No data added of roles yet.
            </Typography>
          ) : (
            <React.Fragment>
              <Box
                sx={{
                  backgroundColor: "neutral.100",
                  display: !enableBulkActions && "none",
                  px: 2,
                  py: 0.5,
                }}
              >
                <Checkbox
                  checked={selectedAllCustomers}
                  indeterminate={selectedSomeCustomers}
                  onChange={handleSelectAllCustomers}
                />
                <Button size="small" sx={{ ml: 2 }}>
                  Delete
                </Button>
                <Button size="small" sx={{ ml: 2 }}>
                  Edit
                </Button>
              </Box>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Role Name</TableCell>
                    <TableCell>Permissions</TableCell>
                    {/* <TableCell align="right">Actions</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((data) => {
                    const isCustomerSelected = selectedCustomers.includes(
                      data._id
                    );

                    return (
                      <React.Fragment key={data._id}>
                        <TableRow hover selected={isCustomerSelected}>
                          <TableCell>
                            <Box
                              sx={{
                                alignItems: "center",
                                display: "flex",
                              }}
                            >
                              <Box sx={{ ml: 1 }}>
                                {formatString(data.name)}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              component="a"
                              onClick={() => handleToggleExpansion(data._id)}
                            >
                              <KeyboardDoubleArrowDownIcon color="primary"></KeyboardDoubleArrowDownIcon>
                            </IconButton>
                          </TableCell>
                          {/* <TableCell align="right">
                            <IconButton component="a">
                              <PencilAltIcon fontSize="small" />
                            </IconButton>
                            <IconButton component="a">
                              <ArrowRightIcon fontSize="small" />
                            </IconButton>
                          </TableCell> */}
                        </TableRow>
                        {expandedRow === data._id && (
                          <TableRow>
                            <TableCell colSpan={2}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Permission Name</TableCell>
                                    <TableCell>Read</TableCell>
                                    <TableCell>Write</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {data.permissions &&
                                    data.permissions.map(
                                      (permission, index) => (
                                        <TableRow key={index}>
                                          <TableCell>
                                            {formatString(permission.category)}
                                          </TableCell>
                                          <TableCell>
                                            <span
                                              style={{
                                                backgroundColor: permission.read
                                                  ? "#addfad"
                                                  : "#efa4a4",
                                                color: permission.read
                                                  ? "#029a02"
                                                  : "#dc0d0d",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                              }}
                                            >
                                              {permission.read ? "Y" : "N"}
                                            </span>
                                          </TableCell>
                                          <TableCell>
                                            <span
                                              style={{
                                                backgroundColor:
                                                  permission.write
                                                    ? "#addfad"
                                                    : "#efa4a4",
                                                color: permission.write
                                                  ? "#029a02"
                                                  : "#dc0d0d",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                              }}
                                            >
                                              {permission.write ? "Y" : "N"}
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
    </div>
  );
};

RolesListTable.propTypes = {
  data: PropTypes.array.isRequired,
  dataCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
};
