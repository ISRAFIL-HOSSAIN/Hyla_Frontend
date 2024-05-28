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
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import TablePagination from "@mui/material/TablePagination";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { ArrowRight as ArrowRightIcon } from "../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../icons/pencil-alt";
import type { Customer } from "../../types/customer";
import { getInitials } from "../../utils/get-initials";
import { Scrollbar } from "../scrollbar";
import React from "react";

interface OrganizationListTableProps {
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
}

export const OrganizationListTable: FC<OrganizationListTableProps> = (
  props
) => {
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

  useEffect(() => {
    if (selectedCustomers.length) {
      setSelectedCustomers([]);
    }
  }, [data]);

  const handleSelectAllCustomers = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedCustomers(
      event.target.checked ? data.map((data) => data.id) : []
    );
  };

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

  const enableBulkActions = selectedCustomers.length > 0;


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
              No data added of organizations yet.
            </Typography>
          ) : (
            <React.Fragment>
              {dataCount === 0 ? (
                <Typography
                  variant="h6"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "10vh",
                  }}
                >
                  No data found.
                </Typography>
              ) : (
                <React.Fragment>
                  <Scrollbar>
                    <Table sx={{ minWidth: 700 }}>
                      <TableHead
                        sx={{
                          visibility: enableBulkActions ? "collapse" : "visible",
                        }}
                      >
                        <TableRow>
                          <TableCell>Organization Name</TableCell>
                          <TableCell>Owner Name</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.map((data) => {
                          const isCustomerSelected = selectedCustomers.includes(
                            data.id
                          );

                          return (
                            <TableRow
                              hover
                              key={data._id}
                              selected={isCustomerSelected}
                            >
                              <TableCell>
                                <Box
                                  sx={{
                                    alignItems: "center",
                                    display: "flex",
                                  }}
                                >
                                  <Box sx={{ ml: 1 }}>{data.name}</Box>
                                </Box>
                              </TableCell>
                              <TableCell>{data.ownerName}</TableCell>
                              <TableCell align="right">
                                <NextLink
                                  href={`/administration/organization/edit/${data._id}`}
                                  passHref
                                >
                                  <IconButton component="a">
                                    <PencilAltIcon fontSize="small" />
                                  </IconButton>
                                </NextLink>
                                <NextLink
                                  href={`/administration/organization/${data._id}`}
                                  passHref
                                >
                                  <IconButton component="a">
                                    <ArrowRightIcon fontSize="small" />
                                  </IconButton>
                                </NextLink>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Scrollbar>
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
        </React.Fragment>
      )}
    </div>
  );
};

OrganizationListTable.propTypes = {
  data: PropTypes.array.isRequired,
  dataCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
};
