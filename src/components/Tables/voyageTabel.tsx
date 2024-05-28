import React, { useContext, useState } from "react";
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
  TableContainer,
  Grid,
  Collapse,
  ListItemText,
  ListItem,
  List,
  TextField,
  Paper,
} from "@mui/material";
// import { format } from "date-fns";
import { format, isValid } from "date-fns";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

import DateTimePicker from "react-datetime-picker";
import { ArrowRight as ArrowRightIcon } from "../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../icons/pencil-alt";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import DoneIcon from "@mui/icons-material/Done";
import { useSelector } from "react-redux";
import { RootState } from "src/store";
import NextLink from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SummarizeIcon from "@mui/icons-material/Summarize";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { Scrollbar } from "../scrollbar";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ClearIcon from "@mui/icons-material/Clear";
import SendIcon from "@mui/icons-material/Send";
import { toast } from "react-hot-toast";
import { CSVLink } from "react-csv";
import { AuthContext } from "src/contexts/firebase-auth-context";
import zIndex from "@mui/material/styles/zIndex";
import { Delete } from "@mui/icons-material";

export const VoyageTabel = (props: any) => {
  const {
    data,
    dataCount,
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    isLoading,
    openDialog,
    openETB,
    openRemoveDialog,
    ...other
  } = props;

  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );

  let dynamicPath = `/${isOrganizationName}/alert`;

  const [selectedTransportId, setSelectedTransportId] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [EReport, setEReport] = useState([]);
  const { authToken } = useContext(AuthContext);
  const [emissionForm, setEmissionForm] = useState({
    virtualNORTenderedDate: null,
    timeTenderedAt: null,
  });

  const [isEmissionFormOpen, setIsEmissionFormOpen] = useState(false);

  const formatString = (inputString) => {
    const formattedString =
      inputString.charAt(0).toUpperCase() + inputString.slice(1);
    const finalString = formattedString.replace(/[_-]/g, " ");

    return finalString;
  };

  const handleOpen = (Id: any) => {
    openDialog(Id);
  };
  const handleETBOpen = (Id: any) => {
    openETB(Id);
  };

  const handleReset = () => {
    setSubmittedData(null);
    setIsEmissionFormOpen(false);
    setEmissionForm({
      virtualNORTenderedDate: null,
      timeTenderedAt: null,
    });
    setEReport([]);
  };

  const handleSubmitEmissionForm = async (row) => {
    let latestAISData: any;
    let transportData: any;
    let portData: any;
    let distance: any;
    let APIDis: any;
    let timeDiffrence: any;
    let extraTime: any;
    let totalHour: any;
    let totalExtraDays: any;
    let extraDistance: any;

    if (!emissionForm.virtualNORTenderedDate || !emissionForm.timeTenderedAt) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (emissionForm.timeTenderedAt > emissionForm.virtualNORTenderedDate) {
      toast.error(
        "Time Tendered At Date should be less than to virtual NOR Tendered Date."
      );
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}buckets/${row.transport._id}/${emissionForm.timeTenderedAt}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        toast.error(`Oops!! Something went wrong. Please retry`);
      }

      const responseData = await response.json();

      if (responseData.data) {
        latestAISData = responseData.data.latestAISData;
        transportData = row.transport;
        portData = row.port;
      } else {
        latestAISData = {};
      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong`);
    }

    try {
      const res_2 = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}buckets/dis/${latestAISData.LONGITUDE}/${latestAISData.LATITUDE}/${portData.long}/${portData.lat}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!res_2.ok) {
      } else {
        const data = await res_2.json();
        const distanceInMeters = data?.data?.properties?.Distance || 0;
        distance = Math.round(distanceInMeters / 1852);
      }
    } catch (error) {
      console.error("Error during API request:", error.message);
    }

    // time diffrence TIMESTAMP-timeTenderedAt
    const timeTenderedAt = new Date(emissionForm.timeTenderedAt);

    const aisTimestamp = new Date(latestAISData?.TIMESTAMP);

    const ETB = new Date(row.ETB);

    const timeDifferenceInMilliseconds_CurrentVsTimeTenderAt =
      aisTimestamp.getTime() - timeTenderedAt.getTime();

    const timeDifferenceInHours_CurrentVsTimeTenderAt =
    timeDifferenceInMilliseconds_CurrentVsTimeTenderAt / (1000 * 60 * 60);

    const roundedTimeDifferenceInHours_CurrentVsTimeTenderAt = Math.round(timeDifferenceInHours_CurrentVsTimeTenderAt);

    // extra time
    const speed: number = parseFloat(latestAISData?.SPEED);
    extraDistance = roundedTimeDifferenceInHours_CurrentVsTimeTenderAt * speed;



    const timeDifferenceInMilliseconds_CurrentVsETB =
      ETB.getTime() - aisTimestamp.getTime();

    const timeDifferenceInHours_CurrentVsETB =
    timeDifferenceInMilliseconds_CurrentVsETB / (1000 * 60 * 60);

    let totalTimeRemaining;

    totalTimeRemaining = Math.round(timeDifferenceInHours_CurrentVsETB);


    const additionalData = {
      dtgAtVirtualNOR: distance + extraDistance,
      speedToMaintainETB: Number((distance / totalTimeRemaining).toFixed(1)),
      currentDTG: distance,
      positionReportedAt: latestAISData?.TIMESTAMP,
      currentETA: latestAISData?.ETA,
      currentSpeed: latestAISData?.SPEED,
      ETB: row?.ETB,
    };

    const updatedEmissionForm = {
      ...emissionForm,
      ...additionalData,
    };
    setSubmittedData(updatedEmissionForm);

    let obj = {};
    let report = [];
    if (transportData) {
      transportData?.SOFC_map_array.map((data: any, index: any) => {
        let totalH = distance / data.speed;
        let totalD = totalH / 24;
        let timestampInMillis = new Date(latestAISData?.TIMESTAMP).getTime();
        let newTimestampInMillis =
          timestampInMillis + totalD * 24 * 60 * 60 * 1000;
        let newTimestampDate = new Date(newTimestampInMillis);
        let formattedDate = newTimestampDate.toLocaleString();

        let rowETBDate: Date = new Date(row.ETB);
        let timeDifferenceInMilliseconds: number =
          rowETBDate.getTime() - newTimestampDate.getTime();
        let timeDifferenceInHours: number =
          timeDifferenceInMilliseconds / (1000 * 60 * 60);
        timeDifferenceInHours = parseFloat(timeDifferenceInHours.toFixed(1));

        let MTD =
          ((data.loadFactor * transportData?.ME_kW_used * data.sofc) /
            10 ** 6) *
          24;
        MTD = parseFloat(MTD.toFixed(2));
        let actualCons = MTD * (totalH / 24);
        actualCons = parseFloat(actualCons.toFixed(2));

        let obj: {
          speed: any;
          totalH: any;
          ETA: any;
          EWT: number;
          MTD: number;
          actualCons: number;
          FOconsatanchorage: number;
          totalConsumption: number;
          CO2: number;
          SOx: number;
          NOx: number;
          loadFactor: any;
        } = {
          speed: data.speed,
          totalH: totalH,
          ETA: formattedDate,
          EWT: timeDifferenceInHours,
          MTD: MTD,
          actualCons: actualCons,
          FOconsatanchorage: 0,
          totalConsumption: 0,
          CO2: 0,
          SOx: 0,
          NOx: 0,
          loadFactor: data.loadFactor,
        };

        report.push({ ...obj });
      });
    }

    if (report.length > 0) {
      const lastTotalH = report[report.length - 1].totalH;
      report.forEach((data) => {
        const currentTotalH = data.totalH;
        const anchorageTime = lastTotalH - currentTotalH;
        const formattedAnchorageTime = parseFloat(anchorageTime.toFixed(2));

        data.anchorageTime = formattedAnchorageTime;
        let fo: any;
        fo = (4 * 24) / data.anchorageTime;

        if (fo == "Infinity") {
          fo = 0;
        }
        data.FOconsatanchorage = fo;

        let tCon = data.actualCons + data.FOconsatanchorage;
        tCon = parseFloat(tCon.toFixed(1));
        data.totalConsumption = tCon;
        let co2: any;
        co2 = data.totalConsumption * 3.14;
        data.CO2 = parseFloat(co2.toFixed(2));

        let sox: any;
        sox = 2 * 0.97753 * 0.005 * data.totalConsumption;
        data.SOx = parseFloat(sox.toFixed(2));

        let nox: any;
        nox =
          (transportData?.ME_kW_used *
            transportData?.NOx_g_kwh *
            lastTotalH *
            data.loadFactor) /
          1000000;
        data.NOx = parseFloat(nox.toFixed(2));
      });
      setEReport(report);
    }
  };

  const handleEmissionIconClick = (rowId) => {
    setIsEmissionFormOpen((prevIsOpen) => {
      const newState = !prevIsOpen;
      setEReport([]);
      setSubmittedData([]);
      setEmissionForm({
        virtualNORTenderedDate: null,
        timeTenderedAt: null,
      });
      return newState;
    });
    setSelectedTransportId(rowId);
  };

  // const [csvData, setCSVData] = useState([]);

  // const exportableColumns_2 = [
  //   { label: "Speed", key: "speed" },
  //   { label: "ETA", key: "ETA" },
  //   { label: "EWT", key: "EWT" },
  //   { label: "CO2", key: "CO2" },
  //   { label: "SOx", key: "SOx" },
  //   { label: "NOx", key: "NOx" },
  //   {
  //     label: "totalConsumption",
  //     key: "totalConsumption",
  //   },
  // ];

  // Helper function to render list items
  const renderListItem = (label, value) => (
    <Grid item xs={12} sm={4}>
      <List>
        <ListItem>
          <ListItemText>
            <Typography
              variant="subtitle2"
              style={{ fontWeight: "bold", color: "dark" }}
            >
              {label} :{" "}
            </Typography>
            <Typography variant="body1">
              {isDateField(label)
                ? isValid(new Date(value))
                  ? format(new Date(value), "dd-MM-yyyy hh:mm a")
                  : "--"
                : value !== undefined && value !== null
                ? String(value)
                : "--"}
            </Typography>
          </ListItemText>
        </ListItem>
      </List>
    </Grid>
  );

  const isDateField = (fieldName) => {
    const dateFields = [
      "Virtual NOR Tendered Date",
      "Time Tendered At",
      "ETB",
      "Position Reported At",
    ];
    return dateFields.includes(fieldName);
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
              No data added of voyage yet.
            </Typography>
          ) : (
            <Scrollbar>
              <React.Fragment>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>PortName</TableCell>
                      <TableCell>TransportName</TableCell>
                      <TableCell>ETB</TableCell>
                      <TableCell>BerthName</TableCell>
                      <TableCell>ATB</TableCell>
                      <TableCell>ActualBerth</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Emission</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((data) => {
                      return (
                        <React.Fragment key={data._id}>
                          <TableRow>
                            <TableCell>{data?.name}</TableCell>
                            <TableCell>
                              {data?.port?.name}
                            </TableCell>
                            <TableCell>
                              {data?.transport?.transportName}
                            </TableCell>
                            <TableCell>
                              {isValid(new Date(data?.ETB))
                                ? format(
                                    new Date(data?.ETB),
                                    "dd-MM-yyyy hh:mm a"
                                  )
                                : "--"}
                            </TableCell>

                            <TableCell>{data?.BerthName}</TableCell>
                            <TableCell>
                              {isValid(new Date(data?.ATB))
                                ? format(
                                    new Date(data?.ATB),
                                    "dd-MM-yyyy hh:mm a"
                                  )
                                : "--"}
                            </TableCell>

                            <TableCell>
                              {data && data.A_Berth ? data.A_Berth : "--"}
                            </TableCell>
                            <TableCell>
                              <Box
                                style={{
                                  color:
                                    data.status === "complete"
                                      ? "darkgreen"
                                      : "darkorange",
                                }}
                              >
                                {formatString(data.status)}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Emission Report">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleEmissionIconClick(data._id)
                                  }
                                >
                                  <SummarizeIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <CSVLink
                                data={EReport}
                                headers={[
                                  { label: "Speed", key: "speed" },
                                  { label: "ETA", key: "ETA" },
                                  { label: "EWT", key: "EWT" },
                                  { label: "CO2", key: "CO2" },
                                  { label: "SOx", key: "SOx" },
                                  { label: "NOx", key: "NOx" },
                                  {
                                    label: "totalConsumption",
                                    key: "totalConsumption",
                                  },
                                ]}
                                filename={`emission_report_${data._id}.csv`}
                                style={{ textDecoration: "none" }}
                              >
                                <Tooltip title="Download Emission Report">
                                  <IconButton size="small">
                                    <CloudDownloadIcon />
                                  </IconButton>
                                </Tooltip>
                              </CSVLink>
                            </TableCell>
                            <TableCell align="right">
                              {data.status === "complete" ? (
                                <>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleETBOpen(data._id)}
                                    >
                                      <PencilAltIcon
                                        fontSize="small"
                                        style={{ color: "darkgreen" }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Voyage Complated">
                                    <IconButton size="small">
                                      <DoneAllIcon
                                        fontSize="small"
                                        style={{ color: "darkgreen" }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : (
                                <>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleETBOpen(data._id)}
                                    >
                                      <PencilAltIcon
                                        fontSize="small"
                                        style={{ color: "darkgreen" }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Complete Voyage">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpen(data._id)}
                                      role="button"
                                      tabIndex={0}
                                    >
                                      <DoneIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Voyage">
                                    <IconButton
                                      size="small"
                                      onClick={() => openRemoveDialog(data._id)}
                                      role="button"
                                      tabIndex={0}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                          {isEmissionFormOpen &&
                            selectedTransportId === data._id && (
                              <TableRow>
                                <TableCell colSpan={9}>
                                  <Collapse
                                    in={
                                      isEmissionFormOpen &&
                                      selectedTransportId === data._id
                                    }
                                  >
                                    <Grid
                                      container
                                      spacing={2}
                                      alignItems="center"
                                      p={3}
                                    >
                                      <Grid item xs={12} md={4}>
                                        <Typography
                                          variant="subtitle1"
                                          style={{ fontSize: "12px" }}
                                        >
                                          Virtual NOR Tendered Date
                                        </Typography>

                                        <DateTimePicker
                                          onChange={(date) =>
                                            setEmissionForm({
                                              ...emissionForm,
                                              virtualNORTenderedDate: date,
                                            })
                                          }
                                          value={
                                            emissionForm.virtualNORTenderedDate
                                          }
                                          clearIcon={<ClearIcon />}
                                          calendarIcon={<EventIcon />}
                                          format="dd-MM-y hh:mm a"
                                          disableClock={true}
                                        />
                                      </Grid>

                                      <Grid item xs={12} md={4}>
                                        <Typography
                                          variant="subtitle2"
                                          style={{ fontSize: "12px" }}
                                        >
                                          Time Tendered At
                                        </Typography>
                                        <DateTimePicker
                                          onChange={(date) =>
                                            setEmissionForm({
                                              ...emissionForm,
                                              timeTenderedAt: date,
                                            })
                                          }
                                          value={emissionForm.timeTenderedAt}
                                          clearIcon={<ClearIcon />}
                                          calendarIcon={<EventIcon />}
                                          format="dd-MM-y hh:mm a"
                                          disableClock={true}
                                        />
                                      </Grid>
                                      <Grid item xs={12} md={4}>
                                        <Tooltip title="Submit">
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => {
                                              handleSubmitEmissionForm(data);
                                            }}
                                          >
                                            <SendIcon />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Reset">
                                          <IconButton
                                            size="small"
                                            onClick={handleReset}
                                          >
                                            <ClearIcon />
                                          </IconButton>
                                        </Tooltip>
                                      </Grid>
                                    </Grid>
                                    {Object.keys(submittedData).length > 0 && (
                                      <Box p={2}>
                                        <Typography variant="subtitle1">
                                          Calculated Data
                                        </Typography>
                                        <Grid container>
                                          {renderListItem(
                                            "Virtual NOR Tendered Date",
                                            submittedData.virtualNORTenderedDate
                                          )}
                                          {renderListItem(
                                            "Time Tendered At",
                                            submittedData.timeTenderedAt
                                          )}
                                          {renderListItem(
                                            "ETB",
                                            submittedData.ETB
                                          )}
                                          {renderListItem(
                                            "Current DTG",
                                            submittedData.currentDTG
                                          )}

                                          {renderListItem(
                                            "Position Reported At",
                                            submittedData.positionReportedAt
                                          )}
                                          {renderListItem(
                                            "Current ETA",
                                            submittedData.currentETA
                                          )}
                                          {renderListItem(
                                            "Current Speed",
                                            submittedData.currentSpeed
                                          )}

                                          {renderListItem(
                                            "DTG At Virtual NOR",
                                            submittedData.dtgAtVirtualNOR
                                          )}
                                          {renderListItem(
                                            "Speed To Maintain ETB",
                                            submittedData.speedToMaintainETB
                                          )}
                                        </Grid>

                                        <Typography variant="subtitle1">
                                          Emission Data Tabel
                                        </Typography>
                                        {EReport.length > 0 ? (
                                          <>
                                            <TableContainer
                                              component={Paper}
                                              style={{
                                                border: "1px solid lightgray",
                                                marginTop: "10px",
                                                overflowX: "auto",
                                              }}
                                            >
                                              <Table style={{ minWidth: 650 }}>
                                                <TableHead>
                                                  <TableRow>
                                                    <TableCell
                                                      align="center"
                                                      style={{
                                                        border:
                                                          "1px solid lightgray",
                                                      }}
                                                    >
                                                      Speed <sub>(knots)</sub>
                                                    </TableCell>
                                                    <TableCell
                                                      align="center"
                                                      style={{
                                                        border:
                                                          "1px solid lightgray",
                                                      }}
                                                    >
                                                      ETA
                                                    </TableCell>
                                                    <TableCell
                                                      align="center"
                                                      style={{
                                                        border:
                                                          "1px solid lightgray",
                                                      }}
                                                    >
                                                      Estimated Waiting time (in
                                                      hours)
                                                    </TableCell>

                                                    <TableCell
                                                      align="center"
                                                      style={{
                                                        border:
                                                          "1px solid lightgray",
                                                      }}
                                                    >
                                                      CO<sub>2</sub> (in MT)
                                                    </TableCell>
                                                    <TableCell
                                                      align="center"
                                                      style={{
                                                        border:
                                                          "1px solid lightgray",
                                                      }}
                                                    >
                                                      SO<sub>x</sub> (in MT)
                                                    </TableCell>
                                                    <TableCell
                                                      align="center"
                                                      style={{
                                                        border:
                                                          "1px solid lightgray",
                                                      }}
                                                    >
                                                      NO<sub>x</sub> (in MT)
                                                    </TableCell>
                                                    <TableCell
                                                      align="center"
                                                      style={{
                                                        border:
                                                          "1px solid lightgray",
                                                      }}
                                                    >
                                                      Estimated Fuel Consumption
                                                      (in MT)
                                                    </TableCell>
                                                  </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                  {EReport.map(
                                                    (data, index) => (
                                                      <TableRow
                                                        key={index}
                                                        style={{
                                                          borderBottom:
                                                            "1px solid lightgray",
                                                        }}
                                                      >
                                                        <TableCell
                                                          align="center"
                                                          style={{
                                                            borderRight:
                                                              "1px solid lightgray",
                                                          }}
                                                        >
                                                          {data.speed}
                                                        </TableCell>
                                                        <TableCell
                                                          align="center"
                                                          style={{
                                                            borderRight:
                                                              "1px solid lightgray",
                                                          }}
                                                        >
                                                          {isValid(
                                                            new Date(data?.ETA)
                                                          )
                                                            ? format(
                                                                new Date(
                                                                  data?.ETA
                                                                ),
                                                                "dd-MM-yyyy hh:mm a"
                                                              )
                                                            : "--"}
                                                        </TableCell>
                                                        <TableCell
                                                          align="center"
                                                          style={{
                                                            borderRight:
                                                              "1px solid lightgray",
                                                          }}
                                                        >
                                                          {data?.EWT || "--"}
                                                        </TableCell>
                                                        <TableCell
                                                          align="center"
                                                          style={{
                                                            borderRight:
                                                              "1px solid lightgray",
                                                          }}
                                                        >
                                                          {data?.CO2 || "--"}
                                                        </TableCell>
                                                        <TableCell
                                                          align="center"
                                                          style={{
                                                            borderRight:
                                                              "1px solid lightgray",
                                                          }}
                                                        >
                                                          {data?.SOx || "--"}
                                                        </TableCell>
                                                        <TableCell
                                                          align="center"
                                                          style={{
                                                            borderRight:
                                                              "1px solid lightgray",
                                                          }}
                                                        >
                                                          {data?.NOx || "--"}
                                                        </TableCell>
                                                        <TableCell
                                                          align="center"
                                                          style={{
                                                            borderRight:
                                                              "1px solid lightgray",
                                                          }}
                                                        >
                                                          {data?.totalConsumption ||
                                                            "--"}
                                                        </TableCell>
                                                      </TableRow>
                                                    )
                                                  )}
                                                </TableBody>
                                              </Table>
                                            </TableContainer>
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </Box>
                                    )}
                                  </Collapse>
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
            </Scrollbar>
          )}
        </React.Fragment>
      )}
    </div>
  );
};

VoyageTabel.propTypes = {
  data: PropTypes.array.isRequired,
  dataCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  openDialog: PropTypes.func,
  openETB: PropTypes.func,
  openRemoveDialog: PropTypes.func
};
