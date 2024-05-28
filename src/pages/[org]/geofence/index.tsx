import {
  useState,
  useEffect,
  useCallback,
  FormEvent,
  useRef,
  useContext,
} from "react";
import type { ChangeEvent, MouseEvent } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import {
  Box,
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { useMounted } from "../../../hooks/use-mounted";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Search as SearchIcon } from "../../../icons/search";
import { gtm } from "../../../lib/gtm";
import { AuthContext } from "../../../contexts/firebase-auth-context";
import { AnyIfEmpty, useSelector } from "react-redux";
import ClearIcon from "@mui/icons-material/Clear";
import { RootState } from "src/store";
import { Toaster, toast } from "react-hot-toast";
import { GeoListTable } from "src/components/Tables/geofenceTable";
let shipIcon;

let L: {
  Polygon: any;
  Polyline: any;
  polygon: any;
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
import dynamic from "next/dynamic";
interface Filters {
  query?: string;
  hasAcceptedMarketing?: boolean;
  isProspect?: boolean;
  isReturning?: boolean;
}

const GeofenceList: NextPage = () => {
  const isMounted = useMounted();
  const queryRef = useRef<HTMLInputElement | null>(null);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState<number>(1);
  const [l, setL] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const { authToken } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [openAlertRemove, setOpenAlertRemove] = useState(false);
  const [removeId, setRemoveId] = useState("");
  const [geoId, setGeoId] = useState("");
  const [polygon, setPolygon] = useState({});
  const mapRef = useRef<any>();
  const [map, setMap] = useState();
  const [mapGeo, setMapGeo] = useState({});
  const [openPolygonDialog, setOpenPolygonDialog] = useState(false);
  const ref = useRef<typeof FeatureGroup>(null);

  const [filters, setFilters] = useState<Filters>({
    query: "",
    hasAcceptedMarketing: null,
    isProspect: null,
    isReturning: null,
  });

  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );

  useEffect(() => {
    gtm.push({ event: "page_view" });
    if (mapRef.current && !map) {
      setMap(mapRef.current);
    }
  }, [mapRef, map]);

  const getData = useCallback(async () => {
    try {
      if (!authToken) {
        console.error("Authorization token is missing.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}geofences/getAllPagination`;

      const queryParams = new URLSearchParams();
      queryParams.append("name", filters.query);
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
        setData(data.data);
        setL(data.totalCount);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, authToken, filters.query, page, rowsPerPage]);

  useEffect(() => {
    getData();
  }, [getData]);

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

  //--------------------- Remove Geofence ------------------//

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
    setOpenAlertRemove(true);
    setRemoveId(id);
  };

  const closeRemoveDialog = () => {
    setOpenAlertRemove(false);
  };

  const handleRemove = async () => {
    try {
      setIsLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}geofences/delete`;

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
          getData();
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
  //--------------------------- END --------------------------//

  const ConfirmDialog = ({ open, handleClose, handleEdit }) => {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="remove-dialog-title"
      >
        <DialogTitle id="remove-dialog-title">Edit GeoFence</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to edit this geofence?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEdit} color="primary" autoFocus>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const closeEditGeoDialog = () => {
    setOpenPolygonDialog(false);
  };

  const handleEdit = async () => {
    const payload = {
      geometry: polygon,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}geofences/geometry/${geoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const responseData = await response.json();

        if (responseData.success === true) {
          toast.success(responseData.message);
          getData();
          setPolygon({});
          setOpenPolygonDialog(false);
          setMapGeo({});
          displayGeoFences({});
        } else {
          toast.error(responseData.message);
        }
      } else {
        toast.error(`Oops!! Something went wrong. Please retry`);
      }
    } catch (error) {
      console.error("Error editing geofence:", error.message);
      toast.error(`Oops!! Something went wrong. Please retry`);
    }
  };

  const worldBounds = [
    [-90, -180],
    [90, 180],
  ];

  const getGeoFenceAllShow = async (id: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}geofences/geo/${id}`,
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

      if (ref.current) {
        ref.current.clearLayers();

        setMapGeo(data.geometry);
        displayGeoFences(data.geometry);
      } else {
        console.error("FeatureGroup ref is not available.");
      }

      setGeoId(id);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const displayGeoFences = (geofencesData: any) => {
    if (ref.current?.getLayers().length > 0) {
      return ref.current.clearLayers();
    }
    if (ref.current?.getLayers().length === 0 && geofencesData) {
      const geoJSONLayer = L.geoJSON(geofencesData) as any;
      geoJSONLayer.eachLayer((layer: any) => {
        if (layer?.feature?.properties.radius && ref.current) {
          new L.Polygon(layer.feature.geometry.coordinates.slice().reverse(), {
            radius: layer.feature?.properties.radius,
          }).addTo(ref.current);
        } else {
          ref.current?.addLayer(layer);
        }
      });
    }
  };

  const handlePolygonEdited = (e) => {
    try {
      if (e.layers && e.layers.getLayers) {
        const drawnPolygonsArray = e.layers
          .getLayers()
          .map((layer) => layer.toGeoJSON());
        if (drawnPolygonsArray.length > 0) {
          setPolygon(drawnPolygonsArray[0].geometry);
          setOpenPolygonDialog(true);
        }
      } else {
        throw new Error("Invalid layers or missing getLayers method");
      }
    } catch (error) {
      console.error("Error editing polygons:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Geofence</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
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

                    {/* {drawingEnabled && ( */}
                    <FeatureGroup position="topright" ref={ref}>
                      <EditControl
                        position="topright"
                        edit={{remove:false, edit:true}}
                        draw={{
                          rectangle: false,
                          circle: false,
                          circlemarker: false,
                          marker: false,
                          polyline: false,
                          polygon: false,
                        }}
                        
                        onEdited={handlePolygonEdited}
                      />
                    </FeatureGroup>
                    {/* )} */}
                    {/* {showGeofences && mapGeo && displayGeoFences(mapGeo)} */}
                  </MapContainer>
                </ReactLeafletEditable>
              )}
            </Card>
            <Divider sx={{ my: 3 }} />
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">Geofence Details</Typography>
              </Grid>
            </Grid>
            <Box
              sx={{
                m: -1,
                mt: 3,
              }}
            ></Box>
          </Box>
          <Card>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                flexWrap: "wrap",
                m: -1.5,
                p: 3,
              }}
            >
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
                          <IconButton onClick={handleClearSearch}>
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Search geofence"
                />
              </Box>
            </Box>
            <GeoListTable
              data={data}
              dataCount={l}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPage={rowsPerPage}
              page={page - 1}
              isLoading={isLoading}
              openRemoveDialog={openRemoveDialog}
              getGeoFenceAllShow={getGeoFenceAllShow}
            />
          </Card>
        </Container>
      </Box>
      <RemoveDialog
        open={openAlertRemove}
        handleClose={closeRemoveDialog}
        handleRemove={handleRemove}
      />

      <ConfirmDialog
        open={openPolygonDialog}
        handleClose={closeEditGeoDialog}
        handleEdit={handleEdit}
      />
    </>
  );
};

GeofenceList.getLayout = function (page) {
  return (
    <AuthGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
  );
};

export default GeofenceList;
