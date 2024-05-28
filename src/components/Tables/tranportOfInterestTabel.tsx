import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Typography,
  Menu,
  MenuItem,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControlLabel,
  Grid,
  CircularProgress,
} from "@mui/material";
import NextLink from "next/link";
import FilterListIcon from "@mui/icons-material/FilterList";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SearchIcon from "@mui/icons-material/Search";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { CSVLink } from "react-csv";

import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

import ClearIcon from "@mui/icons-material/Clear";
import { Scrollbar } from "../scrollbar";

import { toast } from "react-hot-toast";
import { AuthContext } from "src/contexts/firebase-auth-context";
import RuleIcon from "@mui/icons-material/Rule";
import GetAppIcon from "@mui/icons-material/GetApp";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { RootState, useSelector } from "src/store";
const TransportTable = ({
  transports,
  handleSelectTransport,
  openRemoveDialog,
  openAlertRemoveDialog,
  openGeoRemoveDialog,
  handleOpenCustomDialog,
  handleOpenFullDialog,
  isLoading,
}) => {
  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );

  let dynamicPath = `/${isOrganizationName}/shipOfInterest`;
  const [columns, setColumns] = useState([
    { field: "transportName", headerName: "Transport Name" },
    { field: "imoNumber", headerName: "IMO Number" },
    { field: "MMSI", headerName: "MMSI" },
    { field: "transportCategory", headerName: "Category" },
    { field: "transportSubCategory", headerName: "SubCategory" },
    { field: "SpireTransportType", headerName: "SpireTransportType" },
    { field: "buildYear", headerName: "buildYear" },
    { field: "GrossTonnage", headerName: "GrossTonnage" },
    { field: "deadWeight", headerName: "deadWeight" },
    { field: "LOA", headerName: "LOA" },
    { field: "Beam", headerName: "Beam" },
    { field: "MaxDraft", headerName: "MaxDraft" },
    { field: "ME_kW_used", headerName: "ME_kW_used" },
    { field: "AE_kW_used", headerName: "AE_kW_used" },
    { field: "RPM_ME_used", headerName: "RPM_ME_used" },
    { field: "Enginetype_code", headerName: "Enginetype_code" },
    { field: "subst_nr_ME", headerName: "subst_nr_ME" },
    { field: "Stofnaam_ME", headerName: "Stofnaam_ME" },
    { field: "Stofnaam_AE", headerName: "Stofnaam_AE" },
    { field: "subst_nr_AE", headerName: "subst_nr_AE" },
    { field: "Fuel_ME_code_sec", headerName: "Fuel_ME_code_sec" },
    { field: "EF_ME", headerName: "EF_ME" },
    { field: "Fuel_code_aux", headerName: "Fuel_code_aux" },
    { field: "EF_AE", headerName: "EF_AE" },
    { field: "EF_gr_prs_ME", headerName: "EF_gr_prs_ME" },
    { field: "EF_gr_prs_AE_SEA", headerName: "EF_gr_prs_AE_SEA" },
    { field: "EF_gr_prs_AE_BERTH", headerName: "EF_gr_prs_AE_BERTH" },
    { field: "EF_gr_prs_BOILER_BERTH", headerName: "EF_gr_prs_BOILER_BERTH" },
    { field: "EF_gr_prs_AE_MAN", headerName: "EF_gr_prs_AE_MAN" },
    { field: "EF_gr_prs_AE_ANCHOR", headerName: "EF_gr_prs_AE_ANCHOR" },
    { field: "NO_OF_ENGINE_active", headerName: "NO_OF_ENGINE_active" },
    { field: "CEF_type", headerName: "CEF_type" },
    { field: "Loadfactor_ds", headerName: "Loadfactor_ds" },
    { field: "Speed_used", headerName: "Speed_used" },
    { field: "CRS_min", headerName: "CRS_min" },
    { field: "CRS_max", headerName: "CRS_max" },
    { field: "Funnel_heigth", headerName: "Funnel_heigth" },
    { field: "FO_consumption_factor", headerName: "FO_consumption_factor" },
    { field: "coxemissionFactor", headerName: "coxemissionFactor" },
    { field: "soxEmissionFactor", headerName: "soxEmissionFactor" },
    { field: "TEU", headerName: "TEU" },
    { field: "CRUDE", headerName: "CRUDE" },
    { field: "GAS", headerName: "GAS" },
    { field: "BUILDER", headerName: "BUILDER" },
    { field: "MANAGER", headerName: "MANAGER" },
    { field: "OWNER", headerName: "OWNER" },
    { field: "CLASS", headerName: "CLASS" },
    { field: "Engine_tier", headerName: "Engine_tier" },
    { field: "NOx_g_kwh", headerName: "NOx_g_kwh" },
    { field: "summer_dwt", headerName: "summer_dwt" },

    {
      field: "assign",
      headerName: "Assign",
      renderCell: (row) => (
        <>
          <Tooltip title="Show/Hide Alert List" arrow>
            <AddAlertIcon
              color="primary"
              fontSize="small"
              onClick={() => handleExpandRow(row)}
              style={{ marginRight: "8px" }}
            />
          </Tooltip>

          <Tooltip title="Show/Hide Geofence List" arrow>
            <MyLocationIcon
              color="primary"
              fontSize="small"
              onClick={() => handleExpandRow2(row)}
              style={{ marginRight: "8px" }}
            />
          </Tooltip>
        </>
      ),
    },

    {
      field: "actions",
      headerName: "Actions",
      renderCell: (row) => (
        <>
          <Tooltip title="Add Custom Data Fields" arrow>
            <AddCircleOutlineIcon
              color="primary"
              fontSize="small"
              onClick={() => handleOpenCustomDialog(row)}
              style={{ marginRight: "8px" }}
            />
          </Tooltip>

          <NextLink href={`${dynamicPath}/${row?.transportId?._id}`}>
            <Tooltip title="View Transport Details" arrow>
              <VisibilityIcon
                color="primary"
                fontSize="small"
                style={{ marginRight: "8px" }}
              />
            </Tooltip>
          </NextLink>

          <Tooltip title="Remove" arrow>
            <RemoveCircleIcon
              color="action"
              fontSize="small"
              onClick={() => openRemoveDialog(row)}
              style={{ marginRight: "8px" }}
            />
          </Tooltip>
        </>
      ),
    },
  ]);

  const [filteredAndSortedTransports, setFilteredAndSortedTransports] =
    useState([]);

  const [csvData, setCSVData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState({
    transportName: "asc",
    imoNumber: "asc",
    MMSI: "asc",
    transportCategory: "asc",
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const { authToken } = useContext(AuthContext);
  const [alertDetails, setAlertDetails] = useState([]);
  const [geofenceDetails, setGeofenceDetails] = useState([]);

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const exportableColumns = [
    { field: "transportName", headerName: "Transport Name" },
    { field: "imoNumber", headerName: "IMO Number" },
    { field: "MMSI", headerName: "MMSI Number" },
    { field: "transportCategory", headerName: "transportCategory" },
    { field: "transportSubCategory", headerName: "transportSubCategory" },
    { field: "SpireTransportType", headerName: "SpireTransportType" },
    { field: "buildYear", headerName: "buildYear" },
    { field: "GrossTonnage", headerName: "GrossTonnage" },
    { field: "deadWeight", headerName: "deadWeight" },
    { field: "LOA", headerName: "LOA" },
    { field: "Beam", headerName: "Beam" },
    { field: "MaxDraft", headerName: "MaxDraft" },
    { field: "ME_kW_used", headerName: "ME_kW_used" },
    { field: "AE_kW_used", headerName: "AE_kW_used" },
    { field: "RPM_ME_used", headerName: "RPM_ME_used" },
    { field: "Enginetype_code", headerName: "Enginetype_code" },
    { field: "subst_nr_ME", headerName: "subst_nr_ME" },
    { field: "Stofnaam_ME", headerName: "Stofnaam_ME" },
    { field: "Stofnaam_AE", headerName: "Stofnaam_AE" },
    { field: "subst_nr_AE", headerName: "subst_nr_AE" },
    { field: "Fuel_ME_code_sec", headerName: "Fuel_ME_code_sec" },
    { field: "EF_ME", headerName: "EF_ME" },
    { field: "Fuel_code_aux", headerName: "Fuel_code_aux" },
    { field: "EF_AE", headerName: "EF_AE" },
    { field: "EF_gr_prs_ME", headerName: "EF_gr_prs_ME" },
    { field: "EF_gr_prs_AE_SEA", headerName: "EF_gr_prs_AE_SEA" },
    { field: "EF_gr_prs_AE_BERTH", headerName: "EF_gr_prs_AE_BERTH" },
  ];

  const originalColumnsOrder = columns.map((col) => col.field);
  const initiallyHiddenColumns = [
    "transportSubCategory",
    "SpireTransportType",
    "buildYear",
    "Category",
    "GrossTonnage",
    "deadWeight",
    "LOA",
    "Beam",
    "MaxDraft",
    "ME_kW_used",
    "AE_kW_used",
    "RPM_ME_used",
    "Enginetype_code",
    "subst_nr_ME",
    "Stofnaam_ME",
    "Stofnaam_AE",
    "subst_nr_AE",
    "Fuel_ME_code_sec",
    "EF_ME",
    "Fuel_code_aux",
    "EF_AE",
    "EF_gr_prs_ME",
    "EF_gr_prs_AE_SEA",
    "EF_gr_prs_AE_BERTH",
    "EF_gr_prs_BOILER_BERTH",
    "EF_gr_prs_AE_MAN",
    "EF_gr_prs_AE_ANCHOR",
    "NO_OF_ENGINE_active",
    "CEF_type",
    "Loadfactor_ds",
    "Speed_used",
    "CRS_min",
    "CRS_max",
    "Funnel_heigth",
    "FO_consumption_factor",
    "coxemissionFactor",
    "soxEmissionFactor",
    "TEU",
    "CRUDE",
    "GAS",
    "BUILDER",
    "MANAGER",
    "OWNER",
    "CLASS",
    "Engine_tier",
    "NOx_g_kwh",
    "summer_dwt",
  ];

  const [hiddenColumns, setHiddenColumns] = useState<string[]>(
    initiallyHiddenColumns
  );
  const [visibleColumnsOrder, setVisibleColumnsOrder] =
    useState<string[]>(originalColumnsOrder);

  const updateColumnsInBackend = async (
    updatedHiddenColumns,
    updatedVisibleColumnsOrder
  ) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/filterField`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          hiddenColumns: updatedHiddenColumns,
          visibleColumnsOrder: updatedVisibleColumnsOrder,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();

        if (responseData.success === true) {
          getColumnsInBackend();
          toast.success(responseData.message);
        } else {
          toast.error(responseData.message);
        }
      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong. Please retry`);
    }
  };

  const handleColumnToggle = (field) => {
    if (field !== "actions") {
      const updatedHiddenColumns = [...hiddenColumns];
      const updatedVisibleColumnsOrder = [...visibleColumnsOrder];

      if (updatedHiddenColumns.includes(field)) {
        updatedHiddenColumns.splice(updatedHiddenColumns.indexOf(field), 1);
        if (!updatedVisibleColumnsOrder.includes(field)) {
          const originalIndex = originalColumnsOrder.indexOf(field);
          updatedVisibleColumnsOrder.splice(originalIndex, 0, field);
        }
      } else {
        updatedHiddenColumns.push(field);
        updatedVisibleColumnsOrder.splice(
          updatedVisibleColumnsOrder.indexOf(field),
          1
        );
      }

      setHiddenColumns(updatedHiddenColumns);
      setVisibleColumnsOrder(updatedVisibleColumnsOrder);
      // updateColumnsInBackend(updatedHiddenColumns,updatedVisibleColumnsOrder);
    }
  };

  const handleSaveButtonClick = () => {
    updateColumnsInBackend(hiddenColumns, visibleColumnsOrder);
    handleFilterClose()
  };

  const getColumnsInBackend = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}users/profile`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Data");
      }

      const data = await response.json();
      setHiddenColumns(data.hiddenColumns);
      setVisibleColumnsOrder(data.visibleColumnsOrder);
    } catch (error) {
      console.error("Error fetching user filter fields:", error);
    }
  };

  useEffect(() => {
    getColumnsInBackend();
  }, []);

  // useEffect(() => {
  //   // Get hiddenColumns from localStorage
  //   const storedHiddenColumns = localStorage.getItem("hiddenColumns");
  //   if (storedHiddenColumns !== null) {
  //     setHiddenColumns(JSON.parse(storedHiddenColumns));
  //   }
  // }, []);

  // useEffect(() => {
  //   const storedVisibleColumnsOrder = localStorage.getItem("visibleColumnsOrder");
  //   if (storedVisibleColumnsOrder !== null) {
  //     setVisibleColumnsOrder(JSON.parse(storedVisibleColumnsOrder));
  //   }
  // }, []);

  // useEffect(() => {
  //   // Store hiddenColumns in localStorage
  //   localStorage.setItem("hiddenColumns", JSON.stringify(hiddenColumns));
  // }, [hiddenColumns]);

  // useEffect(() => {
  //   // Store visibleColumnsOrder in localStorage
  //   localStorage.setItem("visibleColumnsOrder", JSON.stringify(visibleColumnsOrder));
  // }, [visibleColumnsOrder]);

  // useEffect(() => {
  //   localStorage.setItem("hiddenColumns", JSON.stringify(hiddenColumns));
  // }, [hiddenColumns]);

  // useEffect(() => {
  //   localStorage.setItem("visibleColumnsOrder", JSON.stringify(visibleColumnsOrder));
  // }, [visibleColumnsOrder]);

  const handleSortChange = (field) => {
    const newOrder = sortOrder[field] === "asc" ? "desc" : "asc";

    const sortedTransports = [...filteredAndSortedTransports].sort((a, b) => {
      if (newOrder === "asc") {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });

    setSortOrder({ ...sortOrder, [field]: newOrder });
    setFilteredAndSortedTransports(sortedTransports);
  };

  const handleSelectAllChange = () => {
    if (!selectAll) {
      const allTransportIds = transports.map((row) =>
        getRowId(row.transportId._id)
      );
      setSelectedRows(allTransportIds);
      setSelectedIds(allTransportIds);

      handleSelectTransport(allTransportIds);
    } else {
      setSelectedRows([]);
      setSelectedIds([]);
      handleSelectTransport([]);
    }

    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = async (rowId) => {
    const updatedSelectedRows = [...selectedRows];
    const index = updatedSelectedRows.indexOf(rowId);

    if (index === -1) {
      updatedSelectedRows.push(rowId);
    } else {
      updatedSelectedRows.splice(index, 1);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}users/selectToi`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              ids: [rowId],
              isSelected: false,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to update isSelected for transport ID ${rowId}`
          );
        }

        const responseData = await response.json();
      } catch (error) {
        console.error("Error updating isSelected:", error);
      }
    }

    setSelectedRows(updatedSelectedRows);
    setSelectedIds(updatedSelectedRows);
    handleSelectTransport(updatedSelectedRows);
  };

  const getRowId = (row) => row;

  const handleSearch = () => {
    const transportNames = searchTerm
      .split(",")
      .map((name) => name.trim().toLowerCase());

    const filteredTransports = transports.filter((row) => {
      const transportName =
        row?.transportId?.transportName?.toLowerCase() || "";
      const match = transportNames.some((name) =>
        transportName.includes(name.trim())
      );
      return match;
    });

    const sortedTransports = filteredTransports.sort((a, b) => {
      const field = "imoNumber";
      const aValue = Number(a[field]);
      const bValue = Number(b[field]);

      return sortOrder[field] === "asc" ? aValue - bValue : bValue - aValue;
    });

    setFilteredAndSortedTransports(sortedTransports);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
    setFilteredAndSortedTransports(transports);
  };

  const [expandedRows, setExpandedRows] = useState({});

  const [expandedRows2, setExpandedRows2] = useState({});

  const handleExpandRow = (row) => {
    try {
      setAlertDetails([]);

      setExpandedRows((prevExpandedRows) => ({
        [row.transportId._id]: !prevExpandedRows[row.transportId._id],
      }));

      const filteredTransport = transports.find(
        (transport) => transport.transportId._id === row.transportId._id
      );
      setAlertDetails(filteredTransport?.alerts || []);
    } catch (error) {
      console.error("Error handling expanded row:", error);
    }
  };

  const handleExpandRow2 = (row) => {
    try {
      setGeofenceDetails([]);

      setExpandedRows2((prevExpandedRows) => ({
        [row.transportId._id]: !prevExpandedRows[row.transportId._id],
      }));

      const filteredTransport = transports.find(
        (transport) => transport.transportId._id === row.transportId._id
      );
      setGeofenceDetails(filteredTransport?.geofences || []);
    } catch (error) {
      console.error("Error handling expanded row:", error);
    }
  };

  useEffect(() => {
    const initiallySelectedIds = transports
      .filter((row) => row?.isSelected)
      .map((row) => row?.transportId._id);

    setSelectedRows(initiallySelectedIds);
    setSelectedIds(initiallySelectedIds);
    setSelectAll(initiallySelectedIds.length === transports.length);
    setFilteredAndSortedTransports(transports);

    setCSVData(
      transports.map((row) => {
        const rowData = {};
        exportableColumns.forEach((column) => {
          rowData[column.field] = row?.transportId?.[column.field] || "";
        });
        return rowData;
      })
    );
  }, [transports]);

  const formatString = (inputString) => {
    const formattedString =
      inputString.charAt(0).toUpperCase() + inputString.slice(1);
    const finalString = formattedString.replace(/[_-]/g, " ");

    return finalString;
  };

  return (
    <div>
      {isLoading ? (
        <Typography variant="h6" align="center">
          <CircularProgress />
        </Typography>
      ) : (
        <>
          <div
            style={{ display: "flex", marginBottom: 16, alignItems: "center" }}
          >
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginRight: 16 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Enter transport names separated by commas"
            />
            <IconButton onClick={handleSearch} aria-label="search">
              <SearchIcon />
            </IconButton>
            <Tooltip title="Reset">
              <IconButton onClick={handleResetSearch} aria-label="reset">
                <ClearIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              aria-controls="column-filter-menu"
              aria-haspopup="true"
              onClick={handleFilterClick}
              style={{ marginLeft: "auto" }}
            >
              <FilterListIcon />
            </IconButton>

            <CSVLink
              data={csvData}
              headers={exportableColumns.map((column) => ({
                label: column.headerName,
                key: column.field,
              }))}
              filename={"transports.csv"}
            >
              <Tooltip title="Download file">
                <GetAppIcon />
              </Tooltip>
            </CSVLink>
          </div>

          {filteredAndSortedTransports.length > 0 && (
            <>
              <Menu
                id="column-filter-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleFilterClose}
              >
                {columns.map(
                  (column) =>
                    column.field !== "actions" &&
                    column.field !== "assign" && (
                      <MenuItem key={column.field}>
                        <Checkbox
                          checked={!hiddenColumns.includes(column.field)}
                          onChange={() => handleColumnToggle(column.field)}
                        />
                        <Typography variant="body2">
                          {column.headerName}
                        </Typography>
                      </MenuItem>
                    )
                )}
                <MenuItem onClick={() => handleSaveButtonClick()}>
                  <Button color="primary" variant="contained">
                    Save
                  </Button>
                </MenuItem>
              </Menu>
              <Scrollbar>
                <div>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectAll}
                                  onChange={handleSelectAllChange}
                                />
                              }
                              label={
                                <Typography
                                  variant="body1"
                                  style={{ fontSize: "11px" }}
                                >
                                  Show on Map
                                </Typography>
                              }
                            />
                          </TableCell>
                          {/* {columns.map((column) => (
                        <TableCell key={column.field}>
                          {!hiddenColumns.includes(column.field) && (
                            <>
                              {column.headerName}
                              {column.field !== "actions" &&
                                column.field !== "assign" && (
                                  <IconButton
                                    onClick={() =>
                                      handleSortChange(column.field)
                                    }
                                    
                                    style={{ marginLeft: 1 }}
                                  >
                                    {sortOrder[column.field] === "asc" ? (
                                      <ArrowUpwardIcon fontSize="small" />
                                    ) : (
                                      <ArrowDownwardIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                )}
                            </>
                          )}
                        </TableCell>
                      ))} */}
                          {columns.map(
                            (column) =>
                              // Check if the column is not hidden
                              !hiddenColumns.includes(column.field) && (
                                <TableCell key={column.field}>
                                  <>
                                    {column.headerName}
                                    {column.field !== "actions" &&
                                      column.field !== "assign" && (
                                        <IconButton
                                          onClick={() =>
                                            handleSortChange(column.field)
                                          }
                                          style={{ marginLeft: 1 }}
                                        >
                                          {sortOrder[column.field] === "asc" ? (
                                            <ArrowUpwardIcon fontSize="small" />
                                          ) : (
                                            <ArrowDownwardIcon fontSize="small" />
                                          )}
                                        </IconButton>
                                      )}
                                  </>
                                </TableCell>
                              )
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAndSortedTransports.map((row) => (
                          <React.Fragment key={row.transportId}>
                            <TableRow>
                              <TableCell>
                                <Checkbox
                                  checked={selectedRows.includes(
                                    getRowId(row?.transportId?._id)
                                  )}
                                  onChange={() =>
                                    handleCheckboxChange(
                                      getRowId(row?.transportId?._id)
                                    )
                                  }
                                />
                              </TableCell>
                              {columns.map(
                                (column) =>
                                  // Check if the column is not hidden
                                  !hiddenColumns.includes(column.field) && (
                                    <TableCell
                                      key={column.field}
                                      sx={{
                                        padding:
                                          column.field === "actions" ||
                                          column.field === "assign"
                                            ? "8px"
                                            : "12px",
                                      }}
                                    >
                                      {column.field === "actions" ||
                                      column.field === "assign"
                                        ? column.renderCell(row)
                                        : row?.transportId?.[column.field]
                                        ? row?.transportId?.[column.field]
                                        : "--"}
                                    </TableCell>
                                  )
                              )}
                            </TableRow>
                            {expandedRows[row.transportId._id] && (
                              <TableRow>
                                <TableCell colSpan={columns.length}>
                                  <Collapse
                                    in={expandedRows[row.transportId._id]}
                                  >
                                    <Grid container spacing={2}>
                                      <Grid item xs={12}>
                                        <Stack spacing={2}>
                                          <Typography variant="h6">
                                            Alerts List
                                          </Typography>
                                          <TableContainer component={Paper}>
                                            <Table>
                                              <TableHead>
                                                <TableRow>
                                                  <TableCell>Alert</TableCell>
                                                  {/* <TableCell>Active</TableCell> */}
                                                  <TableCell>Actions</TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {alertDetails.length > 0 ? (
                                                  <>
                                                    {alertDetails.map(
                                                      (alert, index) => (
                                                        <TableRow key={index}>
                                                          <TableCell>
                                                            {formatString(
                                                              alert?.alertId
                                                                ?.name || "--"
                                                            )}
                                                          </TableCell>
                                                          {/* <TableCell
                                                            style={{
                                                              color:
                                                                alert?.status ===
                                                                false
                                                                  ? "#006400"
                                                                  : "#cc0000",
                                                            }}
                                                          >
                                                            {alert?.status ===
                                                            false
                                                              ? "Active"
                                                              : "Deactivate"}
                                                          </TableCell> */}

                                                          <TableCell>
                                                            <Stack
                                                              direction="row"
                                                              spacing={2}
                                                            >
                                                              <Button
                                                                variant="outlined"
                                                                color="error"
                                                                size="small"
                                                                onClick={() =>
                                                                  openAlertRemoveDialog(
                                                                    row,
                                                                    alert
                                                                      ?.alertId
                                                                      ?._id
                                                                  )
                                                                }
                                                                startIcon={
                                                                  <RemoveCircleIcon />
                                                                }
                                                              >
                                                                Delete Alert
                                                              </Button>
                                                            </Stack>
                                                          </TableCell>
                                                        </TableRow>
                                                      )
                                                    )}
                                                  </>
                                                ) : (
                                                  <TableRow>
                                                    <TableCell colSpan={3}>
                                                      No data available
                                                    </TableCell>
                                                  </TableRow>
                                                )}
                                              </TableBody>
                                            </Table>
                                          </TableContainer>
                                        </Stack>
                                      </Grid>
                                    </Grid>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            )}
                            {expandedRows2[row.transportId._id] && (
                              <TableRow>
                                <TableCell colSpan={columns.length}>
                                  <Collapse
                                    in={expandedRows2[row.transportId._id]}
                                  >
                                    <Grid container spacing={2}>
                                      <Grid item xs={12}>
                                        <Stack spacing={2}>
                                          <Typography variant="h6">
                                            Geofences List
                                          </Typography>
                                          <TableContainer component={Paper}>
                                            <Table>
                                              <TableHead>
                                                <TableRow>
                                                  <TableCell>
                                                    Geofence
                                                  </TableCell>
                                                  {/* <TableCell>
                                                    Is Entered
                                                  </TableCell> */}
                                                  <TableCell>Actions</TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {geofenceDetails.length > 0 ? (
                                                  <>
                                                    {geofenceDetails.map(
                                                      (geofence, index) => (
                                                        <TableRow key={index}>
                                                          <TableCell>
                                                            {formatString(
                                                              geofence?.geoId
                                                                ?.name || "--"
                                                            )}
                                                          </TableCell>
                                                          {/* <TableCell
                                                            style={{
                                                              color:
                                                                geofence?.isEnter ===
                                                                false
                                                                  ? "#006400"
                                                                  : "#cc0000",
                                                            }}
                                                          >
                                                            {geofence?.isEnter ===
                                                            false
                                                              ? "Yes"
                                                              : "No"}
                                                          </TableCell> */}

                                                          <TableCell>
                                                            <Stack
                                                              direction="row"
                                                              spacing={2}
                                                            >
                                                              <Button
                                                                variant="outlined"
                                                                color="error"
                                                                size="small"
                                                                onClick={() =>
                                                                  openGeoRemoveDialog(
                                                                    row,
                                                                    geofence
                                                                      ?.geoId
                                                                      ?._id
                                                                  )
                                                                }
                                                                startIcon={
                                                                  <RemoveCircleIcon />
                                                                }
                                                              >
                                                                Delete Geofence
                                                              </Button>
                                                            </Stack>
                                                          </TableCell>
                                                        </TableRow>
                                                      )
                                                    )}
                                                  </>
                                                ) : (
                                                  <TableRow>
                                                    <TableCell colSpan={3}>
                                                      No data available
                                                    </TableCell>
                                                  </TableRow>
                                                )}
                                              </TableBody>
                                            </Table>
                                          </TableContainer>
                                        </Stack>
                                      </Grid>
                                    </Grid>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </Scrollbar>
            </>
          )}

          {filteredAndSortedTransports.length === 0 && (
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              No transports found.
            </Typography>
          )}
        </>
      )}
    </div>
  );
};

export default TransportTable;
