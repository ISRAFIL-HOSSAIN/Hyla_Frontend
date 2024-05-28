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
  ListItemButton,
  ListItemText,
  TableContainer,
  ListItem,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Paper,
  TablePagination,
} from "@mui/material";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";

import { Lock as LockIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import { RootState } from "src/store";
import { AuthContext } from "src/contexts/firebase-auth-context";
import { useMounted } from "src/hooks/use-mounted";
import router from "next/router";
import NextLink from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const TransportDetails: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { authToken } = useContext(AuthContext);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  const [openFull, setOpenFull] = useState(false);
  const [transportD, setTransportD] = useState<any>();
  const [transportCustomData, setTransportCustomData] = useState([]);

  const [aisData, setAisData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { details } = router.query;

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

  const isOrganizationData = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationData
  );

  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );
  const dynamicPath = `/${isOrganizationName}/shipOfInterest`;

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

  const fetchAISDataOfTransport = async (transportId: any) => {
    try {
      const headers = {
        Authorization: `Bearer ${authToken}`,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}buckets/AIS/${transportId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch data for transport ID ${transportId}`);
        return;
      }
      const transportData = await response.json();
      setAisData(transportData.data?.AISDataObjects);
      setTransportD(transportData.data?.transport_id);
      setTransportCustomData(transportData.data?.customData);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (details) {
      fetchAISDataOfTransport(details);
    }
  }, [authToken]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        <title>Transport Detail</title>
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
                      <NextLink href={dynamicPath} passHref>
                        <Typography
                          variant="subtitle2"
                          color="textPrimary"
                          component="a"
                          sx={{
                            alignItems: "center",
                            display: "flex",
                          }}
                        >
                          <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
                          Back
                        </Typography>
                      </NextLink>
                    </Box>
                    <Box sx={{ mb: 4 }}>
                      <Grid
                        container
                        justifyContent="space-between"
                        spacing={3}
                      >
                        <Grid item xs={12} md={6}>
                          <Typography variant="h4">Transport Detail</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <List>
                            <ListItem>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    AIS Data
                                  </Typography>
                                }
                              />
                            </ListItem>
                            {aisData && aisData.length > 0 ? (
                              <>
                                <TableContainer component={Paper}>
                                  <Table>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>IMO</TableCell>
                                        <TableCell>MMSI</TableCell>
                                        <TableCell>LATITUDE</TableCell>
                                        <TableCell>LONGITUDE</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {(rowsPerPage > 0
                                        ? aisData.slice(
                                            page * rowsPerPage,
                                            page * rowsPerPage + rowsPerPage
                                          )
                                        : aisData
                                      ).map((dataItem, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{dataItem.NAME}</TableCell>
                                          <TableCell>{dataItem.IMO}</TableCell>
                                          <TableCell>{dataItem.MMSI}</TableCell>
                                          <TableCell>
                                            {dataItem.LATITUDE}
                                          </TableCell>
                                          <TableCell>
                                            {dataItem.LONGITUDE}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                                <TablePagination
                                  rowsPerPageOptions={[5, 10, 25]}
                                  component="div"
                                  count={aisData.length}
                                  rowsPerPage={rowsPerPage}
                                  page={page}
                                  onPageChange={handleChangePage}
                                  onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                                <Divider sx={{ my: 3 }} />
                              </>
                            ) : (
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: "bold", textAlign: "center" }}
                              >
                                No AIS data found
                              </Typography>
                            )}

                            <ListItem>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    Transport Details
                                  </Typography>
                                }
                              />
                            </ListItem>

                            {Object.keys(transportD).length === 0 ? (
                              <Typography>No data found</Typography>
                            ) : (
                              <>
                                <ListItem>
                                  <ListItemText
                                    primary={
                                      <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: "bold" }}
                                      >
                                        Basic Details
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                                <Grid container>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Name"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD &&
                                            transportD?.transportName
                                              ? transportD?.transportName
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Imo Number"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD && transportD?.imoNumber
                                              ? transportD?.imoNumber
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="MMSI"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD && transportD?.MMSI
                                              ? transportD?.MMSI
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Transport Category"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {" "}
                                            {transportD &&
                                            transportD?.transportCategory
                                              ? transportD?.transportCategory
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Transport SubCategory"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    transportSubCategory?: string;
                                                  }
                                                )?.transportSubCategory
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Spire Type"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    SpireTransportType?: string;
                                                  }
                                                )?.SpireTransportType
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Build Year"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    buildYear?: string;
                                                  }
                                                )?.buildYear
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Engine Tier"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    Engine_tier?: string;
                                                  }
                                                )?.Engine_tier
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                </Grid>

                                <ListItem>
                                  <ListItemText
                                    primary={
                                      <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: "bold" }}
                                      >
                                        Owner Detail
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                                <Grid container>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="OWNER"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD && transportD?.OWNER
                                              ? transportD?.OWNER
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>

                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="BUILDER"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD && transportD?.BUILDER
                                              ? transportD?.BUILDER
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="MANAGER"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD && transportD?.MANAGER
                                              ? transportD?.MANAGER
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>

                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="CLASS"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD && transportD?.CLASS
                                              ? transportD?.CLASS
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                </Grid>

                                <ListItem>
                                  <ListItemText
                                    primary={
                                      <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: "bold" }}
                                      >
                                        Additional Transport Data
                                      </Typography>
                                    }
                                  />
                                </ListItem>

                                <Grid container>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="GAS"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD && transportD?.GAS
                                              ? transportD?.GAS
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Gross Tonnage"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD &&
                                            transportD?.GrossTonnage
                                              ? transportD?.GrossTonnage
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Dead Weight"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD &&
                                            transportD?.deadWeight
                                              ? transportD?.deadWeight
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="LOA"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD && transportD?.LOA
                                              ? transportD?.LOA
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Beam"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD && transportD?.Beam
                                              ? transportD?.Beam
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Max Draft"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    MaxDraft?: string;
                                                  }
                                                )?.MaxDraft
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="ME_kW_Used"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    ME_kW_used?: string;
                                                  }
                                                )?.ME_kW_used
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="AE_kW_Used"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    AE_kW_used?: string;
                                                  }
                                                )?.AE_kW_used
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="RPM_ME_Used"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    RPM_ME_used?: string;
                                                  }
                                                )?.RPM_ME_used
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Enginetype_Code"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    Enginetype_code?: string;
                                                  }
                                                )?.Enginetype_code
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Subst_NR_ME"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    subst_nr_ME?: string;
                                                  }
                                                )?.subst_nr_ME
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Subst_NR_AE"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    subst_nr_AE?: string;
                                                  }
                                                )?.subst_nr_AE
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Stofnaam_ME"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    Stofnaam_ME?: string;
                                                  }
                                                )?.Stofnaam_ME
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Stofnaam_AE"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    Stofnaam_AE?: string;
                                                  }
                                                )?.Stofnaam_AE
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Fuel_ME_Code_Sec"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    Fuel_ME_code_sec?: string;
                                                  }
                                                )?.Fuel_ME_code_sec
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Fuel_Code_Aux"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    Fuel_code_aux?: string;
                                                  }
                                                )?.Fuel_code_aux
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="EF_ME"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    EF_ME?: string;
                                                  }
                                                )?.EF_ME
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>

                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="EF_AE"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    EF_AE?: string;
                                                  }
                                                )?.EF_AE
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="EF_Gr_Prs_ME"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    EF_gr_prs_ME?: string;
                                                  }
                                                )?.EF_gr_prs_ME
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="EF_gr_prs_AE_SEA"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    EF_gr_prs_AE_SEA?: string;
                                                  }
                                                )?.EF_gr_prs_AE_SEA
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>

                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="EF_gr_prs_AE_BERTH"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    EF_gr_prs_AE_BERTH?: string;
                                                  }
                                                )?.EF_gr_prs_AE_BERTH
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>

                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="EF_gr_prs_AE_MAN"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    EF_gr_prs_AE_MAN?: string;
                                                  }
                                                )?.EF_gr_prs_AE_MAN
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>

                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="EF_gr_prs_AE_ANCHOR"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    EF_gr_prs_AE_ANCHOR?: string;
                                                  }
                                                )?.EF_gr_prs_AE_ANCHOR
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>

                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="NO_OF_ENGINE_Active"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    NO_OF_ENGINE_active?: string;
                                                  }
                                                )?.NO_OF_ENGINE_active
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="LoadFactor_ds"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    Loadfactor_ds?: string;
                                                  }
                                                )?.Loadfactor_ds
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Speed Used"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    Speed_used?: string;
                                                  }
                                                )?.Speed_used
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="CRS_Min"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    CRS_min?: string;
                                                  }
                                                )?.CRS_min
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>

                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="CRS_Max"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    CRS_max?: string;
                                                  }
                                                )?.CRS_max
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Funnel Heigth"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    Funnel_heigth?: string;
                                                  }
                                                )?.Funnel_heigth
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="FO Consumption Factor"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    FO_consumption_factor?: string;
                                                  }
                                                )?.FO_consumption_factor
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Cox Emission Factor"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    coxemissionFactor?: string;
                                                  }
                                                )?.coxemissionFactor
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Sox Emission Factor"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    soxEmissionFactor?: string;
                                                  }
                                                )?.soxEmissionFactor
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="TEU"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (transportD as { TEU?: string })
                                                  ?.TEU
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="CRUDE"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    CRUDE?: string;
                                                  }
                                                )?.CRUDE
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>

                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="NOx_g_kwh"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    NOx_g_kwh?: string;
                                                  }
                                                )?.NOx_g_kwh
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <ListItem>
                                      <ListItemText
                                        primary="Summer_dwt"
                                        secondary={
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {transportD
                                              ? (
                                                  transportD as {
                                                    summer_dwt?: string;
                                                  }
                                                )?.summer_dwt
                                              : "--"}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </Grid>
                                </Grid>

                                <ListItem>
                                  <ListItemText
                                    primary={
                                      <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: "bold" }}
                                      >
                                        SOFC
                                      </Typography>
                                    }
                                  />
                                </ListItem>

                                {transportD &&
                                transportD.SOFC_map_array.length > 0 ? (
                                  <>
                                    <ListItem>
                                      <TableContainer component={Paper}>
                                        <Table>
                                          <TableHead>
                                            <TableRow>
                                              <TableCell>Speed</TableCell>
                                              <TableCell>Load Factor</TableCell>
                                              <TableCell>SOFC</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {transportD.SOFC_map_array.map(
                                              (data, index) => (
                                                <TableRow key={index}>
                                                  <TableCell>
                                                    {data.speed}
                                                  </TableCell>
                                                  <TableCell>
                                                    {data.loadFactor}
                                                  </TableCell>
                                                  <TableCell>
                                                    {data.sofc}
                                                  </TableCell>
                                                </TableRow>
                                              )
                                            )}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    </ListItem>
                                  </>
                                ) : (
                                  <ListItem>
                                    <ListItemText
                                      primary={
                                        <Typography
                                          variant="subtitle1"
                                          sx={{
                                            fontWeight: "bold",
                                            textAlign: "center",
                                          }}
                                        >
                                          No sofc data found
                                        </Typography>
                                      }
                                    />
                                  </ListItem>
                                )}

                                <Divider sx={{ my: 3 }} />
                              </>
                            )}

                            <ListItem>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    Custom Data
                                  </Typography>
                                }
                              />
                            </ListItem>

                            {transportCustomData &&
                            transportCustomData.length > 0 ? (
                              <>
                                <ListItem>
                                  <TableContainer component={Paper}>
                                    <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Field Name</TableCell>
                                          <TableCell>Value</TableCell>
                                          <TableCell>Date</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {(rowsPerPage > 0
                                          ? transportCustomData.slice(
                                              page * rowsPerPage,
                                              page * rowsPerPage + rowsPerPage
                                            )
                                          : transportCustomData
                                        ).map((data, index) => (
                                          <TableRow key={index}>
                                            <TableCell>
                                              {data.fieldName}
                                            </TableCell>
                                            <TableCell>{data.value}</TableCell>
                                            <TableCell>
                                              {new Date(
                                                data.timestamp
                                              ).toLocaleString("en-GB")}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </ListItem>
                                {transportCustomData.length > rowsPerPage && (
                                  <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={transportCustomData.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={
                                      handleChangeRowsPerPage
                                    }
                                  />
                                )}
                              </>
                            ) : (
                              <ListItem>
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="subtitle1"
                                      sx={{
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      No custom data found
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            )}
                          </List>
                        </Grid>
                      </Grid>
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
    </>
  );
};

TransportDetails.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default TransportDetails;
