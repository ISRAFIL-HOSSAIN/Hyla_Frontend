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
  Tooltip,
} from "@mui/material";
import TablePagination from "@mui/material/TablePagination";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { ArrowRight as ArrowRightIcon } from "../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../icons/pencil-alt";
import type { Customer } from "../../types/customer";
import { getInitials } from "../../utils/get-initials";
import { Scrollbar } from "../scrollbar";
import React from "react";

interface TransportListTableProps {
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

export const TransportListTable: FC<TransportListTableProps> = (props) => {
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
              No data added of transport yet.
            </Typography>
          ) : (
            <React.Fragment>
              {!data ? (
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
                      <TableHead>
                        <TableRow>
                          <TableCell>IMO</TableCell>
                          <TableCell>Transport Name</TableCell>
                          <TableCell>Transport Type</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>SubCategory</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.map((data) => {
                          return (
                            <TableRow hover key={data._id}>
                              <TableCell>
                                <Box
                                  sx={{
                                    alignItems: "center",
                                    display: "flex",
                                  }}
                                >
                                  <Box sx={{ ml: 1 }}>{data.imoNumber}</Box>
                                </Box>
                              </TableCell>
                              <TableCell>{data.transportName ? data.transportName : "--"}</TableCell>
                              <TableCell>{data.transportType ? data.transportType : '--'}</TableCell>
                              <TableCell>{data.transportCategory ? data.transportCategory : "--"}</TableCell>
                              <TableCell>{data.transportSubCategory ? data.transportSubCategory : "--"}</TableCell>
                              <TableCell align="right">
                                <NextLink
                                  href={`/administration/transports/edit/${data._id}`}
                                  passHref
                                >
                                  <Tooltip title="Edit" arrow>
                                    <IconButton component="a">
                                      <PencilAltIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </NextLink>

                                {/* <NextLink
                                  href={`/administration/organization/${data._id}`}
                                  passHref
                                >
                                  <IconButton component="a">
                                    <ArrowRightIcon fontSize="small" />
                                  </IconButton>
                                </NextLink> */}
{/* 
                                <IconButton component="a">
                                  <ArrowRightIcon fontSize="small" />
                                </IconButton> */}
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

TransportListTable.propTypes = {
  data: PropTypes.array.isRequired,
  dataCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
};
