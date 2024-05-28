import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Container,
  Grid,
  Card,
  Typography,
  Divider,
  TextField,
  Button,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
  Switch,
  CardHeader,
  CardContent,
  CardActions,
  MenuItem,
  InputAdornment,
  CircularProgress,
  DialogContentText,
} from "@mui/material";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";

import dynamic from "next/dynamic";
import { Lock as LockIcon } from "@mui/icons-material";
import { Search as SearchIcon } from "../../../icons/search";
import { gtm } from "../../../lib/gtm";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { Toaster, toast } from "react-hot-toast";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import Autocomplete from "@mui/material/Autocomplete";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import BrushIcon from "@mui/icons-material/Brush";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControl from "@mui/material/FormControl";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import DateTimePicker from "react-datetime-picker";
import ClearIcon from "@mui/icons-material/Clear";
let shipIcon;

let L: {
  GeoJSON: any;
  geoJSON(arg0: { type: string; coordinates: any }): unknown;
  icon: any;
  divIcon: new (arg0: {
    html: string;
    iconAnchor: number[];
    popupAnchor: number[];
  }) => any;
};
let MapContainer: any;
let TileLayer: any;
let FeatureGroup: any;
let Marker: any;
let Popup: any;
let EditControl: any;
let ReactLeafletEditable: any;
let GeoJSON: any;

if (typeof window !== "undefined") {
  L = require("leaflet");
  MapContainer = require("react-leaflet").MapContainer;
  TileLayer = require("react-leaflet").TileLayer;
  FeatureGroup = require("react-leaflet").FeatureGroup;
  Marker = require("react-leaflet").Marker;
  GeoJSON = require("react-leaflet").GeoJSON;
  Popup = require("react-leaflet").Popup;
  EditControl = require("react-leaflet-draw").EditControl;
  ReactLeafletEditable = dynamic(() => import("react-leaflet-editable"), {
    ssr: false,
  });

  shipIcon = new L.icon({
    iconUrl: "/dot.png",
    iconSize: [20, 20],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });
}
import "leaflet-draw/dist/leaflet.draw-src.css";
import "leaflet/dist/leaflet.css";

import { RootState } from "src/store";
import { AuthContext } from "src/contexts/firebase-auth-context";
import { useMounted } from "src/hooks/use-mounted";
import { useFormik } from "formik";
import NextLink from "next/link";
import * as Yup from "yup";

import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { VoyageTabel } from "src/components/Tables/voyageTabel";
interface Filters {
  query?: string;
  hasAcceptedMarketing?: boolean;
  isProspect?: boolean;
  isReturning?: boolean;
}

const Voyage: NextPage = () => {
  const isMounted = useMounted();
  // const mapRef = useRef();
  const mapRef = useRef<any>();
  const [map, setMap] = useState();
  const [selectedPort, setSelectedPort] = useState("");

  const { authToken } = useContext(AuthContext);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [trasnports, setTrasnports] = useState([]);
  const [ports, setPorts] = useState([]);
  const [voyages, setVoyages] = useState<any>([]);
  const [getvoyage, setGetVoyage] = useState<any>({});
  const queryRef = useRef<HTMLInputElement | null>(null);
  const [page, setPage] = useState<number>(1);
  const [l, setL] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(true);
  const [aisData, setAisData] = useState<any>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openvoyage, setOpenvoyage] = useState(false);
  const [openETB, setETB] = useState(false);
  const [openVoyageRemove, setOpenVoyageRemove] = useState(false);
  const [removeId, setRemoveId] = useState("");
  const [updateData, setUpdateData] = useState({
    ATB: null,
    A_Berth: "",
    status: "complete",
  });
  const [updateETBData, setUpdateETBData] = useState({
    ETB: null,
  });
  const [filters, setFilters] = useState<Filters>({
    query: "",
    hasAcceptedMarketing: null,
    isProspect: null,
    isReturning: null,
  });
  const userPermissions = useSelector(
    (state: RootState) => state.isUserPermissionReducer.permissions
  );

  const hasReadPermission =
    userPermissions &&
    (userPermissions.voyage === "rw" ||
      userPermissions.voyage === "wr" ||
      userPermissions.voyage === "r");

  const hasWritePermission =
    userPermissions &&
    (userPermissions.voyage === "rw" ||
      userPermissions.voyage === "wr" ||
      userPermissions.voyage === "w");

  const [nameError, setNameError] = useState("");

  const isOrganizationData = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationData
  );

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getAisData = async (transports: any) => {
    let updatedAisData = [];
    try {
      for (const x of transports) {
        const headers = {
          Authorization: `Bearer ${authToken}`,
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}buckets/${x.transport._id}`,
          {
            method: "GET",
            headers,
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            console.error("Unauthorized. Please check your authentication.");
          } else {
            console.error(
              `Failed to fetch data for transport ID ${x.transport._id}`
            );
          }
        } else {
          const transportData = await response.json();
          if (transportData && isValidLatLng) {
            updatedAisData = [...updatedAisData, { ...transportData.data }];
          } else {
            updatedAisData.push([]);
          }
        }
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }

    setAisData(updatedAisData);
  };

  const getData = useCallback(async () => {
    try {
      if (!authToken) {
        console.error("Authorization token is missing.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}voyage/getAll`;

      const queryParams = new URLSearchParams();
      queryParams.append("name", filters.query);
      queryParams.append("portId", selectedPort);
      queryParams.append("page", page.toString());
      queryParams.append("pageSize", rowsPerPage.toString());

      const response = await fetch(`${apiUrl}?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch org data: ${response.statusText}`);
      }

      const data = await response.json();
      if (isMounted()) {
        setVoyages(data.data);
        setL(data.totalCount);
        getAisData(data.data);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, authToken, filters.query, page, rowsPerPage, selectedPort]);

  const isValidLatLng = (data) => {
    return (
      data.latitude !== undefined &&
      data.longitude !== undefined &&
      !isNaN(data.latitude) &&
      !isNaN(data.longitude)
    );
  };

  const handleQueryChange = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFilters((prevState) => ({
      ...prevState,
      query: queryRef.current?.value,
    }));
  };

  const handlePageChange = (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ): void => {
    setPage(newPage + 1);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleClearSearch = (): void => {
    setPage(page);
    setFilters({
      query: "",
      hasAcceptedMarketing: null,
      isProspect: null,
      isReturning: null,
    });
    if (queryRef.current) {
      queryRef.current.value = "";
    }
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setLoadingPermissions(false);
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        setLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, []);

  useEffect(() => {
    if (mapRef.current && !map) {
      setMap(mapRef.current);
    }
  }, [mapRef, map]);

  const fetchTransports = async (id: any) => {
    try {
      const organizationId = id ?? "";
      const transportApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}organizations/getOrg/${organizationId}`;
      const transportResponse = await fetch(transportApiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!transportResponse.ok) {
        throw new Error(
          `Failed to fetch transport data: ${transportResponse.statusText}`
        );
      }

      const transportData = await transportResponse.json();

      return transportData;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const getTransport = async () => {
    try {
      const profileApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/profile`;
      const profileResponse = await fetch(profileApiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error(`Failed to fetch transports of interest from profile`);
      }

      const data = await profileResponse.json();

      if (data) {
        setTrasnports(data?.toi);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getPorts = async () => {
    try {
      const URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}ports`;
      const Response = await fetch(URL, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!Response.ok) {
        throw new Error(`Failed to fetch ports`);
      }

      const data = await Response.json();

      if (data) {
        setPorts(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const RemoveDialog = ({ open, handleClose, handleRemove }) => {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="remove-dialog-title"
      >
        <DialogTitle id="remove-dialog-title">Confirm Removal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemove} color="primary" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const openRemoveDialog = async (id: any) => {
    setOpenVoyageRemove(true);
    setRemoveId(id);
  };
  const closeRemoveDialog = () => {
    setOpenVoyageRemove(false);
  };

  const handleRemove = async () => {
    try {
      setIsLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}voyage/delete`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ removeId }),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success === true) {
          toast.success(responseData.message);
          getData()
          closeRemoveDialog();
        } else {
          toast.error(responseData.message);
          closeRemoveDialog();
        }
      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong. Please retry`);
    }
  };

  useEffect(() => {
    // getTransport();

    const fetchTransportData = async () => {
      try {
        const transportData = await fetchTransports(
          isOrganizationData?.organization?._id
        );
        setTrasnports(transportData?.transports);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTransportData();
    getPorts();
    getData();
  }, [authToken,isOrganizationData?.organization?._id, isMounted]);

  useEffect(() => {
    getData();
  }, [getData, authToken]);

  const worldBounds = [
    [-90, -180],
    [90, 180],
  ];

  const handleCreateVoyage = async (
    name: any,
    port: any,
    transport: any,
    ETB: any,
    BerthName: any
  ) => {
    setLoading(true);
    try {
      const data = {
        name: name,
        port: port,
        transport: transport,
        ETB: ETB,
        BerthName: BerthName,
      };

      const apiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}voyage/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (apiResponse.ok) {
        const responseData = await apiResponse.json();

        if (responseData.success === true) {
          toast.success(responseData.message);
          formik.resetForm();
          getData();
          setOpenvoyage(false);
        } else {
          toast.error(responseData.message);
        }
      } else {
        toast.error(`Oops!! Something went wrong. Please retry`);
      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong. Please retry`);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      port: "",
      transport: "",
      ETB: "",
      BerthName: "",
      submit: null,
    },
    validationSchema: Yup.object({
      // name: Yup.string().required("Name is required"),
      port: Yup.string().required("Port is required"),
      transport: Yup.string().max(255).required("Tranport is required"),
      BerthName: Yup.string().required("berth name is required"),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        const { name, port, transport, ETB, BerthName } = values;
        await handleCreateVoyage(name, port, transport, ETB, BerthName);
      } catch (err) {
        toast.error("Something went wrong!");
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const handleDialog = async (VoyageId: any) => {
    setOpenDialog(true);
    try {
      const URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}voyage/${VoyageId}`;
      const Response = await fetch(URL, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!Response.ok) {
        throw new Error(`Failed to fetch ports`);
      }

      const data = await Response.json();

      if (data) {
        setGetVoyage(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUpdateData({
      ATB: null,
      A_Berth: "",
      status: "complete",
    });
  };

  // update ETB
  const handleETBDialog = async (VoyageId: any) => {
    setETB(true);
    try {
      const URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}voyage/${VoyageId}`;
      const Response = await fetch(URL, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!Response.ok) {
        throw new Error(`Failed to fetch ports`);
      }

      const data = await Response.json();

      if (data) {
        setGetVoyage(data);
        setUpdateETBData({
          ETB: data.ETB,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleETBCloseDialog = () => {
    setETB(false);
    setUpdateETBData({
      ETB: null,
    });
  };

  // END

  const openVoyageDialog = () => {
    setOpenvoyage(true);
  };

  const handleVoyageCloseDialog = () => {
    setOpenvoyage(false);
  };

  const updateStatus = async (voyageId: any) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}voyage/update/${voyageId}`;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };

      const body = JSON.stringify({
        ATB: updateData.ATB,
        A_Berth: updateData.A_Berth,
        status: updateData.status,
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: body,
      });

      if (response.ok) {
        const responseData = await response.json();

        if (responseData.success === true) {
          toast.success(responseData.message);
          getData();
          setOpenDialog(false);
          setUpdateData({
            ATB: null,
            A_Berth: "",
            status: "complete",
          });
        } else {
          toast.error(responseData.message);
        }
      } else {
        toast.error(`Oops!! Something went wrong. Please retry`);
      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong. Please retry`);
    }
  };

  const updateETB = async (voyageId: any) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}voyage/update/${voyageId}`;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };

      const body = JSON.stringify({
        ETB: updateETBData.ETB,
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: body,
      });

      if (response.ok) {
        const responseData = await response.json();

        if (responseData.success === true) {
          toast.success(responseData.message);
          getData();
          setETB(false);
          setUpdateETBData({
            ETB: null,
          });
        } else {
          toast.error(responseData.message);
        }
      } else {
        toast.error(`Oops!! Something went wrong. Please retry`);
      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong. Please retry`);
    }
  };

  if (loadingPermissions) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        <CircularProgress />
      </Typography>
    );
  }


  return (
    <>
      <Head>
        <title>Voyage</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          {hasReadPermission ? (
            <>
              <Box sx={{ mb: 4 }}>
                <Grid container justifyContent="space-between" spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h4">Voyage</Typography>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ textAlign: "end" }}>
                    <Button
                      onClick={() => {
                        openVoyageDialog();
                      }}
                      sx={{ m: 1, mt: 1 }}
                      variant="contained"
                    >
                      Create Voyage
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Card
                      sx={{
                        alignItems: "center",
                        display: "flex",
                        flexDirection: {
                          xs: "column",
                          md: "row",
                        },
                      }}
                    >
                      {typeof window !== "undefined" && L && (
                        <ReactLeafletEditable>
                          <MapContainer
                            center={[3.919305, -56.027783]}
                            zoom={3}
                            ref={mapRef}
                            editable={true}
                            maxBounds={worldBounds}
                            maxBoundsViscosity={1.0}
                            minZoom={3}
                            style={{ height: "60vh", width: "100%" }}
                          >
                            <TileLayer
                              url="https://api.mapbox.com/styles/v1/nairabhishek02/cln4dwsct038501pbfhj71gpw/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibmFpcmFiaGlzaGVrMDIiLCJhIjoiY2xuNGJtdWdzMDFmajJpcm83cWVqeWVteCJ9.rVvmWN6oFL-9hKYmtUGkaw"
                              attribution="Powered By Hyla"
                            />

                            {aisData.map((transport: any, i: any) =>
                              Number.isFinite(
                                parseFloat(transport?.LATITUDE)
                              ) &&
                              Number.isFinite(
                                parseFloat(transport?.LONGITUDE)
                              ) ? (
                                <Marker
                                  key={i}
                                  icon={shipIcon}
                                  position={[
                                    parseFloat(transport?.LATITUDE),
                                    parseFloat(transport?.LONGITUDE),
                                  ]}
                                >
                                  <Popup>
                                    <div>
                                      <strong>
                                        {transport?.transport_id?.transportName}
                                      </strong>{" "}
                                    </div>
                                    <div className="mb-1">
                                      <strong>Speed : </strong>{" "}
                                      {transport?.SPEED}
                                    </div>
                                    <div className="mb-1">
                                      <strong>Heading : </strong>{" "}
                                      {transport.HEADING}
                                    </div>
                                    <div className="mb-1">
                                      <strong>Destination : </strong>{" "}
                                      {transport.DESTINATION}
                                    </div>
                                    <div className="mb-1">
                                      <strong>ETA : </strong> {transport.ETA}
                                    </div>
                                  </Popup>
                                </Marker>
                              ) : (
                                <></>
                              )
                            )}
                          </MapContainer>
                        </ReactLeafletEditable>
                      )}
                    </Card>
                  </Grid>
                  <Grid item>
                    <Typography variant="h4">Voyage Details</Typography>
                  </Grid>
                </Grid>
                <Card>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      m: -1.5,
                      p: 2,
                    }}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box
                          component="form"
                          onSubmit={handleQueryChange}
                          sx={{
                            flexGrow: 1,
                            m: 1.5,
                          }}
                        >
                          <TextField
                            defaultValue=""
                            fullWidth
                            inputProps={{ ref: queryRef }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon fontSize="small" />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  {filters.query && (
                                    <ClearIcon
                                      onClick={handleClearSearch}
                                      fontSize="small"
                                    />
                                  )}
                                </InputAdornment>
                              ),
                            }}
                            placeholder="Search voyage"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ m: 1.5 }}>
                          <TextField
                            select
                            fullWidth
                            label="Select Port"
                            value={selectedPort}
                            onChange={(e) => setSelectedPort(e.target.value)}
                          >
                            <MenuItem value="">Select Port Name</MenuItem>
                            {ports.map((port) => (
                              <MenuItem key={port._id} value={port._id}>
                                {port.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <VoyageTabel
                    data={voyages}
                    dataCount={l}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPage={rowsPerPage}
                    page={page - 1}
                    isLoading={isLoading}
                    openDialog={handleDialog}
                    openETB={handleETBDialog}
                    openRemoveDialog={openRemoveDialog}
                  />
                </Card>
              </Box>
            </>
          ) : (
            <>
              <Box
                component="main"
                sx={{
                  alignItems: "center",
                  backgroundColor: "background.paper",
                  display: "flex",
                  flexGrow: 1,
                  py: "80px",
                }}
              >
                <Container maxWidth="md">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <LockIcon sx={{ fontSize: "5rem", color: "error.main" }} />
                    <Typography
                      align="center"
                      variant="h4"
                      color="error"
                      mt={2}
                    >
                      Access Denied
                    </Typography>
                    <Typography
                      align="center"
                      color="textSecondary"
                      variant="subtitle1"
                      mt={2}
                    >
                      You do not have permission to access this page. Please
                      contact the administrator for assistance.
                    </Typography>
                  </Box>
                </Container>
              </Box>
            </>
          )}
        </Container>
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Complete Voyage</DialogTitle>
        <DialogContent>
          {getvoyage ? (
            <>
              <Box sx={{ mb: 4 }}>
                <Grid
                  container
                  justifyContent="space-between"
                  spacing={3}
                  mt={2}
                >
                  <Grid item xs={12}>
                    <TextField
                      label="Actual Berth Name"
                      variant="outlined"
                      fullWidth
                      value={updateData.A_Berth}
                      onChange={(e) => {
                        setUpdateData({
                          ...updateData,
                          A_Berth: e.target.value,
                        });
                      }}
                      style={{ marginBottom: "16px", marginTop: "10px" }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      style={{ fontSize: "15px" }}
                    >
                      ATB
                    </Typography>
                    <DateTimePicker
                      value={updateData.ATB}
                      onChange={(newDate) => {
                        setUpdateData({ ...updateData, ATB: newDate });
                      }}
                      format="dd-MM-y HH:mm"
                      disableClock={true}
                    />
                  </Grid>
                  {/* <Grid item xs={12} mt={4}></Grid> */}
                </Grid>
              </Box>
            </>
          ) : (
            <>NO Data Found</>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ m: 1, mt: 6 }}
            variant="contained"
            onClick={handleCloseDialog}
          >
            Cancel
          </Button>
          <Button
            color="secondary"
            sx={{ m: 1, mt: 6 }}
            variant="contained"
            onClick={() => updateStatus(getvoyage._id)}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openvoyage}
        onClose={handleVoyageCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create Voyage</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 4 }}>
            <form onSubmit={formik.handleSubmit}>
              <Grid container justifyContent="space-between" spacing={3} mt={2}>
                <Grid item md={6} xs={12}>
                  <TextField
                    label="Voyage Name"
                    name="name"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    // required
                    value={formik.values.name}
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Select Port"
                    name="port"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.port}
                    error={Boolean(formik.touched.port && formik.errors.port)}
                    helperText={formik.touched.port && formik.errors.port}
                  >
                    {ports.map((option) => (
                      <MenuItem key={option._id} value={option._id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Select Transport"
                    name="transport"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.transport}
                    error={Boolean(
                      formik.touched.transport && formik.errors.transport
                    )}
                    helperText={
                      formik.touched.transport && formik.errors.transport
                    }
                  >
                    {trasnports.map((option) => (
                      <MenuItem
                        key={option._id}
                        value={option._id}
                      >
                        {option.transportName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.BerthName && formik.errors.BerthName
                    )}
                    fullWidth
                    helperText={
                      formik.touched.BerthName && formik.errors.BerthName
                    }
                    label="Berth Name"
                    name="BerthName"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.BerthName}
                  />
                </Grid>
                <Grid item md={12} xs={12}>
                  <Typography variant="subtitle2" style={{ fontSize: "15px" }}>
                    ETB
                  </Typography>
                  <DateTimePicker
                    onChange={(date) => formik.setFieldValue("ETB", date)}
                    value={formik.values.ETB}
                    format="dd-MM-y HH:mm"
                    disableClock={true}
                  />
                </Grid>
              </Grid>
              <Divider sx={{ m: 1, mt: 2 }} />
              <Button
                disabled={formik.isSubmitting}
                type="submit"
                sx={{ m: 1, mt: 6 }}
                variant="contained"
              >
                Submit
              </Button>
              <Button
                sx={{ m: 1, mt: 6 }}
                variant="contained"
                type="button"
                color="secondary"
                onClick={handleVoyageCloseDialog}
              >
                Cancel
              </Button>
            </form>
          </Box>
        </DialogContent>
        {/* <DialogActions>
        
        </DialogActions> */}
      </Dialog>

      <Dialog
        open={openETB}
        onClose={handleETBCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Update Voyage</DialogTitle>
        <DialogContent>
          {getvoyage ? (
            <>
              <Box sx={{ mb: 4 }}>
                <Grid
                  container
                  justifyContent="space-between"
                  spacing={3}
                  mt={2}
                >
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      style={{ fontSize: "15px" }}
                    >
                      ETB
                    </Typography>
                    <DateTimePicker
                      value={updateETBData.ETB}
                      onChange={(newDate) => {
                        setUpdateETBData({ ...updateETBData, ETB: newDate });
                      }}
                      format="dd-MM-y HH:mm"
                      disableClock={true}
                    />
                  </Grid>
                </Grid>
              </Box>
            </>
          ) : (
            <>NO Data Found</>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ m: 1, mt: 6 }}
            variant="contained"
            onClick={handleETBCloseDialog}
          >
            Cancel
          </Button>
          <Button
            color="secondary"
            sx={{ m: 1, mt: 6 }}
            variant="contained"
            onClick={() => updateETB(getvoyage._id)}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <RemoveDialog
        open={openVoyageRemove}
        handleClose={closeRemoveDialog}
        handleRemove={handleRemove}
      />
    </>
  );
};

Voyage.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default Voyage;
