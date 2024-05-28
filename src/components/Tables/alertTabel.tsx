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
  Tooltip,
} from "@mui/material";
import { ArrowRight as ArrowRightIcon } from "../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../icons/pencil-alt";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { useSelector } from "react-redux";
import { RootState } from "src/store";
import NextLink from "next/link";
import { Delete } from "@mui/icons-material";
export const AlertListTable = (props: any) => {
  const {
    data,
    dataCount,
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    isLoading,
    openRemoveDialog,
    ...other
  } = props;
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSelectAllCustomers = (event) => {
    setSelectedCustomers(
      event.target.checked ? data.map((data) => data.id) : []
    );
  };
  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );

  let dynamicPath = `/${isOrganizationName}/alert`;

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
              No data added of alert yet.
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
                    <TableCell>Name</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((data) => {
                    return (
                      <React.Fragment key={data._id}>
                        <TableRow>
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
                          <TableCell>{data.isActive ? "Yes" : "No"}</TableCell>
                          <TableCell align="right">
                            <NextLink
                              href={`${dynamicPath}/${data._id}`}
                              passHref
                            >
                              <Tooltip title="Edit Alert">
                              <IconButton component="a">
                                <PencilAltIcon fontSize="small" />
                              </IconButton>
                              </Tooltip>
                            </NextLink>

                            <Tooltip title="Delete Alert">
                              <IconButton
                                size="small"
                                onClick={() => openRemoveDialog(data._id)}
                                role="button"
                                tabIndex={0}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
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

AlertListTable.propTypes = {
  data: PropTypes.array.isRequired,
  dataCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  openRemoveDialog: PropTypes.func,
};
