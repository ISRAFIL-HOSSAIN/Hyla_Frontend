import React, {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NextPage } from "next";
import Head from "next/head";
import DeleteIcon from "@mui/icons-material/Delete";
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
  DialogContentText,
  CircularProgress,
  InputLabel,
  MenuItem,
  Select,
  Toolbar,
  List,
  AppBar,

} from "@mui/material";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { gtm } from "../../../lib/gtm";
import dynamic from "next/dynamic";
import { CloseFullscreen, Lock as LockIcon } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { Toaster, toast } from "react-hot-toast";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import Autocomplete from "@mui/material/Autocomplete";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import BrushIcon from "@mui/icons-material/Brush";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ClearIcon from "@mui/icons-material/Clear";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControl from "@mui/material/FormControl";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import DateTimePicker from "react-datetime-picker";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
import TransportInterestTable from "src/components/Tables/tranportOfInterestTabel";
import DataField from "src/components/data";
import NextLink from "next/link";

const TransportOfInterst: NextPage = () => {
  const isMounted = useMounted();
  // const mapRef = useRef();
  const mapRef = useRef<any>();
  const [map, setMap] = useState();
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [drawnPolygons, setDrawnPolygons] = useState([]);
  const [openPolygonDialog, setOpenPolygonDialog] = useState(false);
  const [trasnports, setTrasnports] = useState([]);
  const [selectTranports, setSelectTranports] = useState([]);
  const [ids, setIds] = useState([]);
  const [aisData, setAisData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [availableAlerts, setAvailableAlerts] = useState([]);
  const [selectedGEO, setSelectedGEO] = useState([]);
  const [availableGeo, setAvailableGEO] = useState([]);
  const [mapGeo, setMapGeo] = useState([]);
  const [openGeoDialog, setOpenGeoDialog] = useState(false);
  const { authToken } = useContext(AuthContext);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [openDialogRemove, setOpenDialogRemove] = useState(false);
  const [openAlertRemove, setOpenAlertRemove] = useState(false);
  const [openGeoRemove, setOpenGeoRemove] = useState(false);
  const [removeId, setRemoveId] = useState("");
  const [removeAlertId, setRemoveAlertId] = useState("");
  const [removeGeoId, setRemoveGeoId] = useState("");

  const [customeOpen, setCustomOpen] = useState(false);
  const [customeId, setCustomId] = useState("");
  const [customField, setCustomField] = useState([]);
  const [customDataField, setCustomDataField] = useState([]);

  const [openFull, setOpenFull] = useState(false);
  const [transportD, setTransportD] = useState({});
  const [transportAIS, setTransportAIS] = useState({});
  const [transportCustomData, setTransportCustomData] = useState([]);

  const [openTransportDataFull, setOpenTransportData] = useState(false);

  const userPermissions = useSelector(
    (state: RootState) => state.isUserPermissionReducer.permissions
  );

  const hasReadPermission =
    userPermissions &&
    (userPermissions.ship_of_interest === "rw" ||
      userPermissions.ship_of_interest === "wr" ||
      userPermissions.ship_of_interest === "r");

  const hasWritePermission =
    userPermissions &&
    (userPermissions.ship_of_interest === "rw" ||
      userPermissions.ship_of_interest === "wr" ||
      userPermissions.ship_of_interest === "w");

  const [geofence, setGeofence] = useState({
    name: "",
    activeForAll: false,
    alertOnEmail: false,
    alertOnNotification: false,
  });

  const [nameError, setNameError] = useState("");

  const isOrganizationData = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationData
  );

  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );

  let dynamicPath = `/${isOrganizationName}/shipOfInterest`;

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

  const handleSearch = () => {
    setIsLoading(true);
    const filteredTransports = trasnports.filter((transport) => {
      const { transportName, imoNumber } = transport;
      const searchTerm = searchInput.toLowerCase();

      const imoNumberString = String(imoNumber);

      return (
        transportName.toLowerCase().includes(searchTerm) ||
        imoNumberString.toLowerCase().includes(searchTerm)
      );
    });

    setSearchResults(filteredTransports);
    setIsLoading(false);

    if (filteredTransports.length === 0) {
      toast.error("Transport not found in this organization");
    }
  };

  const getToi = async () => {
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
        setSelectTranports(data.toi);
        const selected_Transports = data.toi.filter(
          (transport) => transport.isSelected
        );

        const fetchAISData = async () => {
          const updatedAisData = [];

          await Promise.all(
            selected_Transports.map(async (transport) => {
              try {
                const headers = {
                  Authorization: `Bearer ${authToken}`,
                };

                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}buckets/${transport.transportId._id}`,
                  {
                    method: "GET",
                    headers,
                  }
                );

                if (!response.ok) {
                  console.error(
                    `Failed to fetch data for transport ID ${transport.transportId}`
                  );
                  return;
                }

                const transportData = await response.json();
                if (transportData) {
                  updatedAisData.push({ ...transportData.data });
                }
              } catch (error) {
                console.error(error.message);
              }
            })
          );

          setAisData(updatedAisData);
        };

        await fetchAISData();
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };


  const getToi2 = async () => {
    try {
      setIsLoading(true);
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
        setSelectTranports(data.toi);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (mapRef.current && !map) {
      setMap(mapRef.current);
    }
    getToi();
  }, [authToken, mapRef, map]);

  const isValidLatLng = (data) => {
    return (
      data.latitude !== undefined &&
      data.longitude !== undefined &&
      !isNaN(data.latitude) &&
      !isNaN(data.longitude)
    );
  };

  const handleSelectTransport = async (selectedTransportIds: any) => {
    let updatedAisData = [...aisData];

    updatedAisData = updatedAisData.filter((item) =>
      selectedTransportIds.includes(item.transportId)
    );

    for (const transportId of selectedTransportIds) {
      try {
        const existingIndex = updatedAisData.findIndex(
          (item) => item.transportId === transportId
        );

        if (existingIndex === -1) {
          const headers = {
            Authorization: `Bearer ${authToken}`,
          };

          await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}users/selectToi`,
            {
              method: "POST",
              headers: {
                ...headers,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ids: [transportId],
                isSelected: true,
              }),
            }
          );

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}buckets/${transportId}`,
            {
              method: "GET",
              headers,
            }
          );

          if (!response.ok) {
            console.error(
              `Failed to fetch data for transport ID ${transportId}`
            );
            updatedAisData.push([]);
            continue;
          }

          const transportData = await response.json();
          if (transportData && isValidLatLng) {
            updatedAisData = [...updatedAisData, { ...transportData.data }];
          } else {
            updatedAisData.push([]);
          }
        }
      } catch (error) {
        console.error(error.message);
      }
    }

    setAisData(updatedAisData);
  };

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

  useEffect(() => {
    gtm.push({ event: "page_view" });

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
  }, [authToken, isOrganizationData?.organization?._id, isMounted]);

  const handleAddToTable = async (transport: any) => {
    setIsLoading(true);
    const isTransportAlreadyAdded = selectTranports.some(
      (t) => t?.transportId?._id === transport._id
    );
    const isTransportInSearchResults = searchResults.some(
      (t) => t._id === transport._id
    );

    if (!isTransportAlreadyAdded && isTransportInSearchResults) {
      setSelectTranports((prevTransports) => [...prevTransports, transport]);
      setIds((prevIds) => [...prevIds, transport._id]);
      setIsLoading(false);
    } else {
      toast.error("Transport is already mapped.");
      setSearchInput("");
      setSearchResults([]);
      setIsLoading(false);
    }
  };

  const updateToi = async () => {
    try {
      const updateToiApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/updateToi`;
      const response = await fetch(updateToiApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ ids }),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success === true) {
          toast.success(responseData.message);
          getToi2();
          setSearchInput("");
          setSearchResults([]);
          setIds([]);
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
    if (ids.length > 0) {
      updateToi();
    }
  }, [ids]);

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

  const openRemoveDialog = async (transport: any) => {
    setOpenDialogRemove(true);
    setRemoveId(transport._id);
  };
  const closeRemoveDialog = () => {
    setOpenDialogRemove(false);
  };

  const handleRemove = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/removeFromToi`;

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
          closeRemoveDialog();
          getToi2();
        } else {
          toast.error(responseData.message);
          closeRemoveDialog();
        }
      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong. Please retry`);
    }
  };

  //----------------- END ---------------------//

  //---------------- Remove Alert -------------//

  const RemoveAlertDialog = ({ open, handleClose, handleRemove }) => {
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

  const openAlertRemoveDialog = async (transport: any, alertId: any) => {
    setOpenAlertRemove(true);
    setRemoveId(transport._id);
    setRemoveAlertId(alertId);
  };

  const closeAlertRemoveDialog = () => {
    setOpenAlertRemove(false);
    setRemoveId("");
    setRemoveAlertId("");
  };

  const handleAlertRemove = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/removeAlertFromToi`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ removeId, removeAlertId }),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success === true) {
          toast.success(responseData.message);
          closeAlertRemoveDialog();
          handleCloseTransportDataFullDialog();
          getToi();
          // getToi2();
        } else {
          toast.error(responseData.message);
          closeAlertRemoveDialog();
        }
      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong. Please retry`);
    }
  };

  //------------------- END -------------------//

  //---------------- Remove Geofence -------------//

  const RemoveGeoDialog = ({ open, handleClose, handleRemove }) => {
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

  const openGeoRemoveDialog = async (transport: any, geoId: any) => {
    setOpenGeoRemove(true);
    setRemoveId(transport._id);
    setRemoveGeoId(geoId);
  };

  const closeGeoRemoveDialog = () => {
    setOpenGeoRemove(false);
    setRemoveId("");
    setRemoveGeoId("");
  };

  const handleGeoRemove = async () => {
    try {
      setIsLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/removeGeofenceFromToi`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ removeId, removeGeoId }),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success === true) {
          toast.success(responseData.message);
          closeGeoRemoveDialog();
          getToi();
          // getToi2();
          handleCloseTransportDataFullDialog();
        } else {
          toast.error(responseData.message);
          closeGeoRemoveDialog();
        }
      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong. Please retry`);
    }
  };

  //------------------- END -------------------//

  const worldBounds = [
    [-90, -180],
    [90, 180],
  ];

  //----------------- END -------------//

  //----------- ALERT Assign --------------//

  const fetchAvailableAlerts = async (transportId: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}alerts`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();

      if (transportId) {
        const filteredTransport = selectTranports.find(
          (transport) => transport.transportId._id === transportId
        );

        if (filteredTransport) {
          const existingAlertIds = filteredTransport.alerts.map(
            (alert: any) => alert.alertId._id
          );
          const filteredAlerts = data.filter(
            (alert: any) => !existingAlertIds.includes(alert._id)
          );

          setAvailableAlerts(filteredAlerts);
        }
      } else {
        setAvailableAlerts(data);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleMarkerClick = (transport: any) => {
    setSelectedTransport(transport);
    setOpenDialog(true);
    fetchAvailableAlerts(transport?.transport_id?._id);
  };

  const handleCloseDialog = () => {
    setSelectedAlerts([]);
    setAvailableAlerts([]);
    setOpenDialog(false);
  };

  const handleAlertsChange = (newValues) => {
    setSelectedAlerts(newValues);
  };

  const handleAssignAlert = async () => {
    try {
      const transportId = selectedTransport?.transport_id?._id;
      const alertIds = selectedAlerts.map((alert) => alert._id);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/assignAlert`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          transportId,
          alertIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to assign alerts: ${response.statusText}`);
      }

      const data = await response.json();
      toast.success(data.message);
      handleCloseDialog();
      // setIsLoading(true)
      getToi();
    } catch (error) {
      console.error("Error assigning alerts:", error);
      toast.error("Failed to assign alerts");
    }
  };

  //------------- END ----------------------//

  //------------- Assign Geofence ----------//

  const fetchAvailableGeo = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}geofences/getAll`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();

      setAvailableGEO(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleMarkerGEOClick = (transport) => {
    setSelectedTransport(transport);
    setSelectedGEO([]);
    setOpenGeoDialog(true);
    fetchAvailableGeo();
  };

  const handleCloseGEODialog = () => {
    setSelectedGEO([]);
    setOpenGeoDialog(false);
  };

  const handleGEOChange = (newValues) => {
    setSelectedGEO(newValues);
  };

  const handleAssignGEO = async () => {
    try {
      const transportId = selectedTransport?.transport_id?._id;
      const Ids = selectedGEO.map((data) => data._id);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/assignGeo`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          transportId,
          Ids,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success === true) {
          toast.success(responseData.message);
          handleCloseGEODialog();
          getToi();
        } else {
          toast.error(responseData.message);
        }
      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong. Please retry`);
    }
  };

  //------------- END ----------------------//

  useEffect(() => {
    getGeoFenceAllShow();
  }, []);

  const toggleDrawing = () => {
    setDrawingEnabled(!drawingEnabled);
  };

  const handlePolygonEdited = (e) => {
    if (e.layers && e.layers.getLayers) {
      const drawnPolygonsArray = e.layers
        .getLayers()
        .map((layer) => layer.toGeoJSON());
      if (drawnPolygonsArray.length > 0) {
        setDrawnPolygons([drawnPolygonsArray[0].geometry]);
        setOpenPolygonDialog(true);
      }
    } else {
      console.error(
        "Redraw the polygon with at least six sides (Hexagon and above) and save again"
      );
    }
  };

  const capitalizeAnnotationType = (shapeType) => {
    const word = shapeType;
    const firstLetter = word.charAt(0);
    const firstLetterCap = firstLetter.toUpperCase();
    const remainingLetters = word.slice(1);
    const capitalizedWord = firstLetterCap + remainingLetters;
    return capitalizedWord;
  };

  const handlePolygonDrawn = (event: any) => {
    // console.log(event, "")
    let shapeType = capitalizeAnnotationType(event.layerType);
    let latLngs: any[];
    let coordinates: any[];
    let newJson = event.layer.toGeoJSON();

    if (event.layerType == "polygon" || event.layerType == "rectangle") {
      latLngs = event.layer.getLatLngs()[0];
      shapeType = "Polygon";
    } else if (event.layerType == "polyline") {
      latLngs = event.layer.getLatLngs()[0];
    } else if (event.layerType != "circle") {
      latLngs = [event.layer.getLatLng()];
    }
    if (event.layerType == "circle") {
      coordinates = [event.layer._latlng.lng, event.layer._latlng.lat];
    } else {
      coordinates = latLngs.map((latLng) => [latLng.lng, latLng.lat]);
      coordinates.push(coordinates[0]);
    }

    // setshowForm(true)
    const polygonGeoJSON = {
      type: `${shapeType}`,
      coordinates: [coordinates],
    };

    setDrawnPolygons([polygonGeoJSON]);
    fetchAvailableAlerts("");
    setOpenPolygonDialog(true);
  };

  const handleSave = async () => {
    try {
      if (geofence.name.trim() === "") {
        setNameError("Name is required");
        return;
      }
      if (!geofence.alertOnEmail && !geofence.alertOnNotification) {
        toast.error(
          "Please select at least one option (email or notification)."
        );
        return;
      }
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}geofences`;

      if (drawnPolygons.length === 0) {
        toast.error("Please draw at least one polygon.");
        return;
      }
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };

      const firstPolygon = drawnPolygons[0];
      const { type, coordinates } = firstPolygon;

      const body = JSON.stringify({
        name: geofence.name,
        geometry: {
          type,
          coordinates,
        },
        alerts: selectedAlerts.map((alert) => alert._id),
        activeForAll: geofence.activeForAll,
        alertOnEmail: geofence.alertOnEmail,
        alertOnNotification: geofence.alertOnNotification,
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
          setOpenPolygonDialog(false);
          setDrawingEnabled(false);
          setSelectedAlerts([]);
          setDrawnPolygons([]);
          setGeofence({
            name: "",
            activeForAll: false,
            alertOnEmail: false,
            alertOnNotification: false,
          });
          getGeoFenceAllShow();
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

  const closeGeoDialog = async () => {
    setOpenPolygonDialog(false);
    setDrawingEnabled(false);
    setSelectedAlerts([]);
    setDrawnPolygons([]);
    setGeofence({
      name: "",
      activeForAll: false,
      alertOnEmail: false,
      alertOnNotification: false,
    });
  };

  const getGeoFenceAllShow = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}geofences`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();
      setMapGeo(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const displayGeoFences = (geofencesData) => {
    if (mapRef.current && geofencesData.length > 0) {
      geofencesData.forEach((geofence: any) => {
        const { type, coordinates } = geofence.geometry;

        if (type === "Polygon") {
          (
            L.geoJSON({
              type: "Polygon",
              coordinates: coordinates,
            }) as any
          ).addTo(mapRef.current);
        } else {
          console.error("Unsupported geometry type:", type);
        }
      });
    }
  };

  const [showGeofences, setShowGeofences] = useState(false);

  const toggleGeofences = () => {
    setShowGeofences((prevShowGeofences) => !prevShowGeofences);
  };

  useEffect(() => {
    if (showGeofences && mapRef.current) {
      displayGeoFences(mapGeo);
    } else if (!showGeofences && mapRef.current) {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.GeoJSON) {
          mapRef.current?.removeLayer(layer);
        }
      });
    }
  }, [showGeofences, mapGeo]);

  // ----------------- Custom Data ---------------//

  const fetchCustomFields = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}aisDataFiled/custom`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();

      const mergedData = [...data, ...DataField].filter(
        (obj, index, self) =>
          index === self.findIndex((t) => t.fieldName === obj.fieldName)
      );

      setCustomField(mergedData);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleAddField = () => {
    setCustomDataField((prevFields) => [
      ...prevFields,
      { fieldName: "", value: "", timestamp: new Date().toISOString() },
    ]);
  };

  const handleOpenCustomDialog = (row: any) => {
    setCustomOpen(true);
    setCustomId(row.transportId);
    fetchCustomFields();
    handleAddField();
  };

  const handleCloseCustomeDialog = () => {
    setCustomOpen(false);
    setCustomDataField([]);
    setCustomField([]);
    setCustomId("");
  };

  const handleCustomeDataSave = async () => {
    try {
      const isEmptyField = customDataField.some(
        (field) => field.fieldName === "" || field.value === ""
      );

      if (isEmptyField) {
        toast.error("Please fill in all fields before saving.");
        return;
      }

      const updateCustomDataURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}buckets/createCustom`;
      const response = await fetch(updateCustomDataURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          transportId: customeId,
          customData: customDataField,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success === true) {
          toast.success(responseData.message);
          getToi();
          handleCloseCustomeDialog();
        } else {
          toast.error(responseData.message);
          handleCloseCustomeDialog();
        }
      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong. Please retry`);
    }
  };

  const handleCustomDeleteField = (index) => {
    const updatedFields = [...customDataField];
    updatedFields.splice(index, 1);
    setCustomDataField(updatedFields);
  };

  const handleCustomChange = (index, key, value) => {
    const updatedFields = [...customDataField];
    updatedFields[index][key] = value;
    setCustomDataField(updatedFields);
  };

  //---------------------- Custome Data End -------------//

  //------------- show transport full details ------------//

  const fetchAISDataOfTransport = async (transportId: any) => {
    try {
      const headers = {
        Authorization: `Bearer ${authToken}`,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}buckets/AIS/${transportId._id}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch data for transport ID ${transportId._id}`
        );
        return;
      }
      const transportData = await response.json();
      setTransportAIS(transportData.data?.latestAISData);
      setTransportCustomData(transportData.data?.customData);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleOpenFullDialog = (row: any) => {
    setOpenFull(true);
    setTransportD(row.transportId);
    fetchAISDataOfTransport(row.transportId);
  };

  //---------------------------END--------------//

  const handleOpenTransportDataFullDialog = () => {
    setOpenTransportData(true);
    getToi2();
  };

  const handleCloseTransportDataFullDialog = () => {
    setOpenTransportData(false);
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
        <title>Transports</title>
      </Head>
      {isLoading ? (
        <Typography variant="h6" align="center">
          <CircularProgress />
        </Typography>
      ) : (
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
          }}
        >
          {isLoading ? (
            <Typography variant="h6" align="center" sx={{ mt: 4 }}>
              <CircularProgress />
            </Typography>
          ) : (
            <>
              <Container maxWidth="xl">
                {hasReadPermission ? (
                  <>
                    <Box sx={{ mb: 4 }}>
                      <Grid
                        container
                        justifyContent="space-between"
                        spacing={3}
                      >
                        <Grid item xs={12} md={6}>
                          <Typography variant="h4">Map</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              flexWrap: "wrap",
                              gap: 1,
                            }}
                          >
                            <TextField
                              label="Search"
                              variant="outlined"
                              value={searchInput}
                              onChange={(e) => setSearchInput(e.target.value)}
                              sx={{ flexGrow: 1, minWidth: 150 }}
                            />
                            <Tooltip title="Search" arrow>
                              <Button
                                variant="contained"
                                onClick={handleSearch}
                                sx={{ flexShrink: 0, ml: 1 }}
                              >
                                <SearchIcon />
                              </Button>
                            </Tooltip>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mt: 2 }}>
                            {searchResults.length > 0 ? (
                              searchResults.map((result, index) => (
                                <Card key={index} sx={{ mb: 2 }}>
                                  <Box sx={{ p: 2 }}>
                                    <Typography variant="h6">
                                      {result.transportName}
                                    </Typography>
                                    <Typography variant="body2">
                                      {result.imoNumber}
                                    </Typography>
                                    <Button
                                      variant="contained"
                                      onClick={() => handleAddToTable(result)}
                                      sx={{ mt: 1 }}
                                    >
                                      Add to Table
                                    </Button>
                                  </Box>
                                </Card>
                              ))
                            ) : (
                              <></>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    <Grid container spacing={4}>
                      <Grid item xs={12} md={4} sx={{ textAlign: "start" }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Show/Hide Geofences
                        </Typography>
                        <Tooltip
                          title={
                            showGeofences ? "Hide Geofences" : "Show Geofences"
                          }
                          arrow
                        >
                          <Switch
                            checked={showGeofences}
                            onChange={toggleGeofences}
                            color="primary"
                            inputProps={{
                              "aria-label": "toggle geofences",
                            }}
                          />
                        </Tooltip>
                      </Grid>

                      <Grid item xs={12} md={4} sx={{ textAlign: "start" }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Show/Hide Drawing
                        </Typography>
                        <ToggleButtonGroup
                          value={drawingEnabled}
                          exclusive
                          onChange={toggleDrawing}
                        >
                          <ToggleButton value={true} aria-label="draw">
                            <Tooltip title="Turn On Geofence Drawing" arrow>
                              <span style={{ color: "primary.main" }}>On</span>
                            </Tooltip>
                          </ToggleButton>
                          <ToggleButton
                            value={false}
                            aria-label="turn-off-drawing"
                          >
                            <Tooltip title="Turn Off Geofence Drawing" arrow>
                              <span style={{ color: "primary.main" }}>Off</span>
                            </Tooltip>
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Grid>

                      <Grid item xs={12} md={4} sx={{ textAlign: "end" }}>
                        <Button
                          onClick={handleOpenTransportDataFullDialog}
                          variant="contained"
                        >
                          Show Transport Details
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
                                style={{ height: "80vh", width: "100%" }}
                                scrollWheelZoom={false}
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
                                      eventHandlers={{
                                        mouseover: (event) =>
                                          event.target.openPopup(),
                                        // mouseout: (event) =>
                                        //   event.target.closePopup(),
                                      }}
                                    >
                                      <Popup>
                                        <div>
                                          <strong>
                                            {
                                              transport?.transport_id
                                                ?.transportName
                                            }
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
                                          <strong>ETA : </strong>{" "}
                                          {transport.ETA}
                                        </div>

                                        <Grid container spacing={2} mt={1}>
                                          <Grid item>
                                            <Tooltip
                                              title="Assign Alerts"
                                              arrow
                                            >
                                              <AddAlertIcon
                                                color="primary"
                                                onClick={() =>
                                                  handleMarkerClick(transport)
                                                }
                                              />
                                            </Tooltip>
                                          </Grid>
                                          <Grid item>
                                            <Tooltip
                                              title="Assign Geofences"
                                              arrow
                                            >
                                              <MyLocationIcon
                                                color="primary"
                                                onClick={() =>
                                                  handleMarkerGEOClick(
                                                    transport
                                                  )
                                                }
                                              />
                                            </Tooltip>
                                          </Grid>
                                          <Grid item>
                                            <NextLink
                                              href={`${dynamicPath}/${transport?.transport_id?._id}`}
                                            >
                                              <Tooltip
                                                title="View Transport Details"
                                                arrow
                                              >
                                                <VisibilityIcon
                                                  color="primary"
                                                  // fontSize="small"
                                                  // style={{ marginRight: "8px" }}
                                                />
                                              </Tooltip>
                                            </NextLink>
                                          </Grid>
                                        </Grid>
                                      </Popup>
                                    </Marker>
                                  ) : (
                                    <></>
                                  )
                                )}
                                {drawingEnabled && (
                                  <FeatureGroup position="topright">
                                    <EditControl
                                      edit={{ edit: false }}
                                      position="topright"
                                      onCreated={handlePolygonDrawn}
                                      draw={{
                                        rectangle: {
                                          shapeOptions: {
                                            color: "orange",
                                            weight: 2,
                                            opacity: 0.8,
                                          },
                                        },

                                        circle: false,
                                        circlemarker: false,
                                        marker: false,
                                        polyline: false,
                                        polygon: {
                                          shapeOptions: {
                                            color: "red",
                                            weight: 2,
                                            opacity: 0.8,
                                          },
                                        },
                                      }}
                                      // onCreated={handlePolygonCreated}
                                      onEdited={handlePolygonEdited}
                                    />
                                  </FeatureGroup>
                                )}
                                {showGeofences &&
                                  mapGeo &&
                                  displayGeoFences(mapGeo)}
                              </MapContainer>
                            </ReactLeafletEditable>
                          )}
                        </Card>
                        <Divider sx={{ my: 3 }} />
                      </Grid>
                    </Grid>
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
                          <LockIcon
                            sx={{ fontSize: "5rem", color: "error.main" }}
                          />
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
                            You do not have permission to access this page.
                            Please contact the administrator for assistance.
                          </Typography>
                        </Box>
                      </Container>
                    </Box>
                  </>
                )}
              </Container>
            </>
          )}
        </Box>
      )}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Assign Alerts</DialogTitle>
        <DialogContent>
          {selectedTransport && (
            <div style={{ marginBottom: "16px" }}>
              <strong>Transport Name:</strong>{" "}
              {selectedTransport.transport_id.transportName}
            </div>
          )}
          {selectedTransport && (
            <div style={{ marginBottom: "16px" }}>
              <strong>IMO Number:</strong>{" "}
              {selectedTransport.transport_id.imoNumber}
            </div>
          )}
          <FormControl fullWidth style={{ marginBottom: "16px" }}>
            <Autocomplete
              multiple
              id="alert-select"
              options={availableAlerts}
              getOptionLabel={(option) => option.name}
              value={selectedAlerts}
              onChange={(event, newValue) => handleAlertsChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Alerts"
                  variant="outlined"
                />
              )}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAssignAlert}>Assign Alert</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openGeoDialog}
        onClose={handleCloseGEODialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Assign Geofences</DialogTitle>
        <DialogContent>
          {selectedTransport && (
            <div style={{ marginBottom: "16px" }}>
              <strong>Transport Name:</strong>{" "}
              {selectedTransport.transport_id.transportName}
            </div>
          )}
          {selectedTransport && (
            <div style={{ marginBottom: "16px" }}>
              <strong>IMO Number:</strong>{" "}
              {selectedTransport.transport_id.imoNumber}
            </div>
          )}
          <FormControl fullWidth style={{ marginBottom: "16px" }}>
            <Autocomplete
              multiple
              id="alert-select"
              options={availableGeo}
              getOptionLabel={(option) => option.name}
              value={selectedGEO}
              onChange={(event, newValue) => handleGEOChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Geofence"
                  variant="outlined"
                />
              )}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGEODialog}>Cancel</Button>
          <Button onClick={handleAssignGEO}>Assign Geofence</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPolygonDialog}
        onClose={closeGeoDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Geofence Information</DialogTitle>
        <DialogContent
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gridGap: "16px",
          }}
        >
          {drawnPolygons.map((polygon, index) => (
            <div key={index} style={{ marginBottom: "16px" }}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={geofence.name}
                onChange={(e) => {
                  setGeofence({ ...geofence, name: e.target.value });
                  setNameError("");
                }}
                style={{ marginBottom: "16px", marginTop: "10px" }}
                error={!!nameError}
                helperText={nameError}
              />

              <FormControl fullWidth style={{ marginBottom: "16px" }}>
                <Autocomplete
                  multiple
                  id="alert-select"
                  options={availableAlerts}
                  getOptionLabel={(option) => option.name}
                  value={selectedAlerts}
                  onChange={(event, newValue) => handleAlertsChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Alerts"
                      variant="outlined"
                    />
                  )}
                />
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={geofence.activeForAll}
                    onChange={(e) =>
                      setGeofence({
                        ...geofence,
                        activeForAll: e.target.checked,
                      })
                    }
                  />
                }
                label="Active For All"
              />
              <div style={{ display: "flex", alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={geofence.alertOnEmail}
                      onChange={(e) =>
                        setGeofence({
                          ...geofence,
                          alertOnEmail: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Send an email"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={geofence.alertOnNotification}
                      onChange={(e) =>
                        setGeofence({
                          ...geofence,
                          alertOnNotification: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Send in app notification"
                />
              </div>
            </div>
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
          <Button onClick={closeGeoDialog} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <RemoveDialog
        open={openDialogRemove}
        handleClose={closeRemoveDialog}
        handleRemove={handleRemove}
      />

      <RemoveAlertDialog
        open={openAlertRemove}
        handleClose={closeAlertRemoveDialog}
        handleRemove={handleAlertRemove}
      />
      <RemoveGeoDialog
        open={openGeoRemove}
        handleClose={closeGeoRemoveDialog}
        handleRemove={handleGeoRemove}
      />

      <Dialog
        open={customeOpen}
        onClose={handleCloseCustomeDialog}
        fullWidth={true}
        maxWidth="md"
      >
        <DialogTitle>Add Custom Data</DialogTitle>
        <DialogContent>
          {customDataField.map((field, index) => (
            <Grid
              container
              spacing={3}
              alignItems="center"
              key={index}
              sx={{ mt: index !== 0 ? 1 : 0 }}
            >
              <Grid item md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Field Name</InputLabel>
                  <Select
                    value={field.fieldName}
                    onChange={(e) =>
                      handleCustomChange(index, "fieldName", e.target.value)
                    }
                  >
                    {customField.map((customFieldItem) => (
                      <MenuItem
                        key={customFieldItem.fieldName}
                        value={customFieldItem.fieldName}
                      >
                        {customFieldItem.fieldName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item md={4} xs={12}>
                {customField.find((f) => f.fieldName === field.fieldName)
                  ?.type === "datetime" ? (
                  <DateTimePicker
                    onChange={(date) =>
                      handleCustomChange(index, "value", date)
                    }
                    value={field.value}
                    clearIcon={<ClearIcon />}
                    calendarIcon={<EventIcon />}
                    format="dd-MM-y hh:mm a"
                    disableClock={true}
                  />
                ) : customField.find((f) => f.fieldName === field.fieldName)
                    ?.type === "bool" ? (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Value</InputLabel>
                    <Select
                      value={field.value}
                      onChange={(e) =>
                        handleCustomChange(index, "value", e.target.value)
                      }
                      label="Value"
                    >
                      <MenuItem value="true">True</MenuItem>
                      <MenuItem value="false">False</MenuItem>
                    </Select>
                  </FormControl>
                ) : customField.find((f) => f.fieldName === field.fieldName)
                    ?.type === "number" ? (
                  <TextField
                    fullWidth
                    label="Value"
                    type="number"
                    value={field.value}
                    onChange={(e) =>
                      handleCustomChange(index, "value", e.target.value)
                    }
                    variant="outlined"
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="Value"
                    value={field.value}
                    onChange={(e) =>
                      handleCustomChange(index, "value", e.target.value)
                    }
                    variant="outlined"
                  />
                )}
              </Grid>

              <Grid item md={2} xs={12}>
                <Tooltip title="Delete">
                  <IconButton onClick={() => handleCustomDeleteField(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          ))}

          {/* <Divider sx={{ my: 3 }} /> */}
          <Tooltip title="Add More Field">
            <IconButton onClick={handleAddField}>
              <AddCircleOutlineIcon color="primary" />
            </IconButton>
          </Tooltip>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCustomeDialog}>Cancel</Button>
          <Button onClick={handleCustomeDataSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen
        open={openTransportDataFull}
        onClose={handleCloseTransportDataFullDialog}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseTransportDataFullDialog}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent dividers>
          <Grid container justifyContent="space-between" spacing={3}>
            <Grid item>
              <Typography variant="h4" sx={{ padding: "3px" }}>
                Transport Details
              </Typography>
            </Grid>
          </Grid>
          <Card>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                flexWrap: "wrap",
                m: -1.5,
                p: 1,
              }}
            >
              <Box
                component="form"
                sx={{
                  flexGrow: 1,
                  m: 1.5,
                }}
              >
                <TransportInterestTable
                  transports={selectTranports}
                  handleSelectTransport={handleSelectTransport}
                  openRemoveDialog={openRemoveDialog}
                  openAlertRemoveDialog={openAlertRemoveDialog}
                  openGeoRemoveDialog={openGeoRemoveDialog}
                  handleOpenCustomDialog={handleOpenCustomDialog}
                  handleOpenFullDialog={handleOpenFullDialog}
                  isLoading={isLoading}
                />
              </Box>
            </Box>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};

TransportOfInterst.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default TransportOfInterst;
