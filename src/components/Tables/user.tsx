import { useEffect, useState } from "react";
import type { ChangeEvent, FC, MouseEvent } from "react";
import NextLink from "next/link";
import numeral from "numeral";
import PropTypes from "prop-types";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { ArrowRight as ArrowRightIcon } from "../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../icons/pencil-alt";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { useSelector } from "react-redux";
import { RootState } from "src/store";
import React from "react";
import { Customer } from "src/types/customer";
type Permission = "r" | "w" | "rw";

// Add a new property to the Customer type for permissions
interface CustomerWithPermissions extends Customer {
  permissions: { [key: string]: Permission };
}

interface CustomerListTableProps {
  customers: Customer[];
  customersCount: number;
  onPageChange?: (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  page: number;
  rowsPerPage: number;
  isLoading: boolean;
}

export const UserListTable: FC<CustomerListTableProps> = (props) => {
  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );
  const {
    customers,
    customersCount,
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    isLoading,
    ...other
  } = props;
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  let dynamicPath = `/${isOrganizationName}/users`;

  useEffect(() => {}, [customers]);

  const handleSelectOneCustomer = (
    event: ChangeEvent<HTMLInputElement>,
    customerId: string
  ): void => {
    if (!selectedCustomers.includes(customerId)) {
      setSelectedCustomers((prevSelected) => [...prevSelected, customerId]);
    } else {
      setSelectedCustomers((prevSelected) =>
        prevSelected.filter((id) => id !== customerId)
      );
    }
  };

  const handleToggleExpansion = (customerId: string) => {
    setExpandedCustomer((prevExpanded) =>
      prevExpanded === customerId ? null : customerId
    );
  };

  const enableBulkActions = selectedCustomers.length > 0;
  const selectedSomeCustomers =
    selectedCustomers.length > 0 && selectedCustomers.length < customers.length;
  const selectedAllCustomers = selectedCustomers.length === customers.length;

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
          {customers.length === 0 ? (
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
                  display: !enableBulkActions && "none",
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
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((customer) => {
                    const isCustomerSelected = selectedCustomers.includes(
                      customer.id
                    );

                    return (
                      <React.Fragment key={customer._id}>
                        <TableRow hover selected={isCustomerSelected}>
                          <TableCell>
                            <Box
                              sx={{
                                alignItems: "center",
                                display: "flex",
                              }}
                            >
                              <Box sx={{ ml: 1 }}>{customer.email}</Box>
                            </Box>
                          </TableCell>
                          <TableCell>{formatString(customer.name)}</TableCell>
                          <TableCell>
                            {customer.roles.map((role, index) => (
                              <span key={index}>
                                {role.name}
                                {index < customer.roles.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              component="a"
                              onClick={() =>
                                handleToggleExpansion(customer._id)
                              }
                            >
                              <KeyboardDoubleArrowDownIcon color="primary" />
                            </IconButton>
                          </TableCell>
                          <TableCell align="right">
                            <NextLink
                              href={`${dynamicPath}/edit/${customer._id}`}
                              passHref
                            >
                              <IconButton component="a">
                                <PencilAltIcon fontSize="small" />
                              </IconButton>
                            </NextLink>
                            <NextLink
                              href={`${dynamicPath}/${customer._id}`}
                              passHref
                            >
                              <IconButton component="a">
                                <ArrowRightIcon fontSize="small" />
                              </IconButton>
                            </NextLink>
                          </TableCell>
                        </TableRow>
                        {expandedCustomer === customer._id && (
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
                                  {customer?.permissions &&
                                    Object.entries(customer.permissions).map(
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
                count={customersCount}
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

UserListTable.propTypes = {
  customers: PropTypes.array.isRequired,
  customersCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
};
