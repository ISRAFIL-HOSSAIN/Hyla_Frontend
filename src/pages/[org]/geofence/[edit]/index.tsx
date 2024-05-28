import React, { useContext, useEffect, useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardHeader,
  Divider,
  CardContent,
  Grid,
  CardActions,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import Autocomplete from "@mui/material/Autocomplete";

import NextLink from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "src/contexts/firebase-auth-context";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { useSelector } from "react-redux";
import { RootState } from "src/store";

const EditGeoFenceInfo = () => {
  const router = useRouter();
  const { authToken } = useContext(AuthContext);
  const [geofenceDetails, setGeofenceDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeForAll, setActiveForAll] = useState(false);
  const [alertOnEmail, setAlertOnEmail] = useState(false);
  const [alertOnNotification, setAlertOnNotification] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [availableAlerts, setAvailableAlerts] = useState([]);
  const { edit } = router.query;
  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );
  const dynamicPath = `/${isOrganizationName}/geofence`;

  useEffect(() => {
    const fetchGeofenceDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}geofences/geo/${edit}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setGeofenceDetail(data);
          setActiveForAll(data.activeForAll);
          setAlertOnEmail(data.alertOnEmail);
          setAlertOnNotification(data.alertOnNotification);
          setSelectedAlerts(data.alerts || []);
        } else {
          throw new Error(
            `Failed to fetch geofence details: ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("Error fetching geofence details:", error.message);
        toast.error("Failed to fetch geofence details");
      } finally {
        setLoading(false);
      }
    };

    const fetchAvailableAlerts = async () => {
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
        setAvailableAlerts(data);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (edit) {
      fetchGeofenceDetails();
      fetchAvailableAlerts();
    }
  }, [edit, authToken]);

  const formik = useFormik({
    initialValues: {
      name: geofenceDetails?.name || "",
      activeForAll: activeForAll || false,
      alertOnEmail: alertOnEmail || false,
      alertOnNotification: alertOnNotification || false,
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required("Name is required"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const { name, activeForAll, alertOnEmail, alertOnNotification } =
          values;
        await handleEditGeofence(
          name,
          activeForAll,
          selectedAlerts,
          alertOnEmail,
          alertOnNotification
        );
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const handleEditGeofence = async (
    name,
    activeForAll,
    alerts,
    alertOnEmail,
    alertOnNotification
  ) => {
    const payload = {
      name: name,
      activeForAll: activeForAll,
      alerts: alerts,
      alertOnEmail: alertOnEmail,
      alertOnNotification: alertOnNotification,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}geofences/${edit}`,
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
          router.push(dynamicPath);
          formik.resetForm();
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

  useEffect(() => {
    formik.setFieldValue(
      "name",
      geofenceDetails ? geofenceDetails.name || "" : ""
    );
    formik.setFieldValue("activeForAll", activeForAll);
    formik.setFieldValue("alertOnEmail", alertOnEmail);
    formik.setFieldValue("alertOnNotification", alertOnNotification);
  }, [geofenceDetails, activeForAll, alertOnEmail, alertOnNotification, formik.setFieldValue]);

  // const handleAlertsChange = (newValues) => {
  //   setSelectedAlerts(newValues);
  // };

  return (
    <>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
          }}
        >
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        <Box
          component="main"
          sx={{
            backgroundColor: "background.default",
            flexGrow: 1,
            py: 8,
          }}
        >
          <Container maxWidth="md">
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
            <Box
              sx={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <form onSubmit={formik.handleSubmit}>
                <Card>
                  <CardHeader title="Edit Geofence" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={12} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.name && formik.errors.name
                          )}
                          fullWidth
                          helperText={formik.touched.name && formik.errors.name}
                          label="Geofence Name"
                          name="name"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.name}
                        />
                      </Grid>
                      <Grid item md={12} xs={12}>
                        <Autocomplete
                          multiple
                          id="alert-select"
                          options={availableAlerts.filter(
                            (data) =>
                              !selectedAlerts.some(
                                (selectedAlerts) =>
                                  selectedAlerts._id === data._id
                              )
                          )}
                          getOptionLabel={(option) => option.name}
                          isOptionEqualToValue={(option, value) =>
                            option._id === value._id
                          }
                          value={selectedAlerts}
                          onChange={(_, newValue) =>
                            setSelectedAlerts(newValue)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Alerts"
                              variant="outlined"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item md={12} xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={activeForAll}
                              onChange={(e) =>
                                setActiveForAll(e.target.checked)
                              }
                            />
                          }
                          label="Active For All"
                        />
                      </Grid>

                      <Grid item md={12} xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={alertOnEmail}
                              onChange={(e) =>
                                setAlertOnEmail(e.target.checked)
                              }
                            />
                          }
                          label="Send an email"
                        />
                      </Grid>
                      <Grid item md={12} xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={alertOnNotification}
                              onChange={(e) =>
                                setAlertOnNotification(e.target.checked)
                              }
                            />
                          }
                          label="Send in app notification"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-start" }}>
                    <Button
                      disabled={formik.isSubmitting}
                      type="submit"
                      variant="contained"
                    >
                      Submit
                    </Button>
                    <NextLink href={dynamicPath} passHref>
                      <Button
                        component="a"
                        disabled={formik.isSubmitting}
                        variant="outlined"
                      >
                        Cancel
                      </Button>
                    </NextLink>
                  </CardActions>
                </Card>
              </form>
            </Box>
          </Container>
        </Box>
      )}
    </>
  );
};

EditGeoFenceInfo.getLayout = (page: any) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default EditGeoFenceInfo;
