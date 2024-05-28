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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";

import NextLink from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "src/contexts/firebase-auth-context";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { RootState, useSelector } from "src/store";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import DateTimePicker from "react-datetime-picker";
import EventIcon from "@mui/icons-material/Event";
import ClearIcon from "@mui/icons-material/Clear";
const EditAlert = () => {
  const router = useRouter();
  const { authToken } = useContext(AuthContext);

  const [alertDetails, setAlertDetails] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [alertOnEmail, setAlertOnEmail] = useState(false);
  const [alertOnNotification, setAlertOnNotification] = useState(false);
  const [loading, setLoading] = useState(true);

  const { edit } = router.query;
  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );
  const dynamicPath = `/${isOrganizationName}/alert`;

  const [fieldNames, setFieldNames] = useState([]);

  useEffect(() => {
    const fetchAlertDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}alerts/${edit}`,
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
          setAlertDetails(data);
          setCriteria(data.criteria);
          setAlertOnEmail(data.alertOnEmail);
          setAlertOnNotification(data.alertOnNotification);
        } else {
          console.error("Failed to fetch alert details:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching alert details:", error.message);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    if (edit) {
      fetchAlertDetails();
    }
  }, [edit, authToken]);

  const handleEditAlert = async (
    name,
    criteria,
    alertOnEmail,
    alertOnNotification
  ) => {
    if (!alertOnEmail && !alertOnNotification) {
      toast.error("Please select at least one option (email or notification).");
      return;
    }
    const payload = {
      name: name,
      criteria: criteria,
      alertOnEmail: alertOnEmail,
      alertOnNotification: alertOnNotification,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}alerts/${edit}`,
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
          formik.resetForm();
          router.push(dynamicPath);
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

  const formik = useFormik({
    initialValues: {
      name: alertDetails?.name || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required("Name is required"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const { name } = values;
        await handleEditAlert(
          name,
          criteria,
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

  useEffect(() => {
    formik.setFieldValue("name", alertDetails ? alertDetails.name || "" : "");
    formik.setFieldValue(
      "criteria",
      alertDetails ? alertDetails.criteria || [] : []
    );
    formik.setFieldValue(
      "alertOnEmail",
      alertDetails ? alertDetails.alertOnEmail || false : false
    );
    formik.setFieldValue(
      "alertOnNotification",
      alertDetails ? alertDetails.alertOnNotification || false : false
    );
  }, [alertDetails, formik.setFieldValue]);

  const handleCriteriaChange = (index: any, field: any, value: any) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[index][field] = value;

    if (field === "fieldName") {
      updatedCriteria[index]["condition"] = "";
      updatedCriteria[index]["value"] = "";
    }

    setCriteria(updatedCriteria);
  };

  useEffect(() => {
    const fetchFieldNames = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}aisDataFiled`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setFieldNames(data);
        } else {
          console.error("Failed to fetch field names:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching field names:", error.message);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchFieldNames();
  }, []);

  return (
    <>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh", // Adjust as needed
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
              <Box mt={3}>
                <form onSubmit={formik.handleSubmit}>
                  <Card>
                    <CardHeader title="Edit Alert" />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item md={12} xs={12}>
                          <TextField
                            error={Boolean(
                              formik.touched.name && formik.errors.name
                            )}
                            fullWidth
                            helperText={
                              formik.touched.name && formik.errors.name
                            }
                            label="Alert Name"
                            name="name"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            required
                            value={formik.values.name}
                          />
                        </Grid>
                        <Grid item md={12} xs={12}>
                          <Typography variant="h6">Criteria</Typography>
                          {criteria.map((criterion, index) => (
                            <Box key={index} sx={{ mt: 2 }}>
                              <Grid container spacing={2}>
                                <Grid item md={4} xs={12}>
                                  <FormControl fullWidth variant="outlined">
                                    <InputLabel>Field Name</InputLabel>
                                    <Select
                                      value={criterion.fieldName}
                                      onChange={(e) =>
                                        handleCriteriaChange(
                                          index,
                                          "fieldName",
                                          e.target.value
                                        )
                                      }
                                      label="Field Name"
                                    >
                                      {fieldNames.map((fieldName) => (
                                        <MenuItem
                                          key={fieldName.fieldName}
                                          value={fieldName.fieldName}
                                        >
                                          {fieldName.fieldName}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item md={4} xs={12}>
                                  <FormControl fullWidth variant="outlined">
                                    <InputLabel>Condition</InputLabel>
                                    <Select
                                      value={criterion.condition}
                                      onChange={(e) =>
                                        handleCriteriaChange(
                                          index,
                                          "condition",
                                          e.target.value
                                        )
                                      }
                                      label="Condition"
                                    >
                                      {(() => {
                                        const commonItems = [];

                                        if (
                                          fieldNames.find(
                                            (f) =>
                                              f.fieldName ===
                                              criterion.fieldName
                                          )?.type === "number" ||
                                          fieldNames.find(
                                            (f) =>
                                              f.fieldName ===
                                              criterion.fieldName
                                          )?.type === "datetime"
                                        ) {
                                          return [
                                            <MenuItem key="equal" value="equal">
                                              Equal
                                            </MenuItem>,
                                            <MenuItem
                                              key="notEqual"
                                              value="notEqual"
                                            >
                                              Not Equal
                                            </MenuItem>,
                                            <MenuItem
                                              key="greaterThan"
                                              value="greaterThan"
                                            >
                                              Greater Than
                                            </MenuItem>,
                                            <MenuItem
                                              key="greaterThanOrEqual"
                                              value="greaterThanOrEqual"
                                            >
                                              Greater Than or Equal To
                                            </MenuItem>,
                                            <MenuItem
                                              key="lessThan"
                                              value="lessThan"
                                            >
                                              Less Than
                                            </MenuItem>,
                                            <MenuItem
                                              key="lessThanOrEqual"
                                              value="lessThanOrEqual"
                                            >
                                              Less Than or Equal To
                                            </MenuItem>,
                                            // <MenuItem
                                            //   key="hasChanged"
                                            //   value="hasChanged"
                                            // >
                                            //   Has Changed
                                            // </MenuItem>,
                                            // <MenuItem
                                            //   key="hasNotchanged"
                                            //   value="hasNotchanged"
                                            // >
                                            //   Has Not Changed
                                            // </MenuItem>
                                          ];
                                        }

                                        if (
                                          fieldNames.find(
                                            (f) =>
                                              f.fieldName ===
                                              criterion.fieldName
                                          )?.type === "text" ||
                                          fieldNames.find(
                                            (f) =>
                                              f.fieldName ===
                                              criterion.fieldName
                                          )?.type === "bool"
                                        ) {
                                          return [
                                            <MenuItem key="equal" value="equal">
                                              Equal
                                            </MenuItem>,
                                            <MenuItem
                                              key="notEqual"
                                              value="notEqual"
                                            >
                                              Not Equal
                                            </MenuItem>,
                                          ];
                                        }

                                        return commonItems;
                                      })()}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item md={4} xs={12}>
                                  {criterion.fieldName &&
                                    criterion.condition !== "hasChanged" &&
                                    criterion.condition !== "hasNotchanged" && (
                                      <>
                                        {fieldNames.find(
                                          (f) =>
                                            f.fieldName === criterion.fieldName
                                        )?.type === "bool" ? (
                                          <FormControl
                                            fullWidth
                                            variant="outlined"
                                          >
                                            <InputLabel>Value</InputLabel>
                                            <Select
                                              value={criterion.value}
                                              onChange={(e) =>
                                                handleCriteriaChange(
                                                  index,
                                                  "value",
                                                  e.target.value
                                                )
                                              }
                                              label="Value"
                                            >
                                              <MenuItem value="true">
                                                True
                                              </MenuItem>
                                              <MenuItem value="false">
                                                False
                                              </MenuItem>
                                            </Select>
                                          </FormControl>
                                        ) : fieldNames.find(
                                            (f) =>
                                              f.fieldName ===
                                              criterion.fieldName
                                          )?.type === "number" ? (
                                          <TextField
                                            fullWidth
                                            label="Value"
                                            type="number"
                                            value={criterion.value}
                                            onChange={(e) =>
                                              handleCriteriaChange(
                                                index,
                                                "value",
                                                e.target.value
                                              )
                                            }
                                            variant="outlined"
                                          />
                                        ) : fieldNames.find(
                                            (f) =>
                                              f.fieldName ===
                                              criterion.fieldName
                                          )?.type === "datetime" ? (
                                          <DateTimePicker
                                            onChange={(date) =>
                                              handleCriteriaChange(
                                                index,
                                                "value",
                                                date
                                              )
                                            }
                                            value={criterion.value}
                                            clearIcon={<ClearIcon />}
                                            calendarIcon={<EventIcon />}
                                            format="dd-MM-y hh:mm a"
                                            disableClock={true}
                                          />
                                        ) : (
                                          <TextField
                                            fullWidth
                                            label="Value"
                                            value={criterion.value}
                                            onChange={(e) =>
                                              handleCriteriaChange(
                                                index,
                                                "value",
                                                e.target.value
                                              )
                                            }
                                            variant="outlined"
                                          />
                                        )}
                                      </>
                                    )}
                                </Grid>

                                <Divider sx={{ my: 3 }} />

                                <Grid item md={12} xs={12}>
                                  {/* Checkbox for alertOnEmail */}
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={alertOnEmail}
                                        onChange={(e) =>
                                          setAlertOnEmail(e.target.checked)
                                        }
                                        name="alertOnEmail"
                                      />
                                    }
                                    label="Alert on Email"
                                  />
                                </Grid>
                                <Grid item md={12} xs={12}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={alertOnNotification}
                                        onChange={(e) =>
                                          setAlertOnNotification(
                                            e.target.checked
                                          )
                                        }
                                        name="alertOnNotification"
                                      />
                                    }
                                    label="Alert on Notification"
                                  />
                                </Grid>
                              </Grid>
                            </Box>
                          ))}
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions
                      sx={{
                        flexWrap: "wrap",
                        m: -1,
                      }}
                    >
                      <Button
                        disabled={formik.isSubmitting}
                        type="submit"
                        sx={{ m: 1 }}
                        variant="contained"
                      >
                        Submit
                      </Button>
                      <NextLink href={dynamicPath} passHref>
                        <Button
                          component="a"
                          disabled={formik.isSubmitting}
                          sx={{
                            m: 1,
                            mr: "auto",
                          }}
                          variant="outlined"
                        >
                          Cancel
                        </Button>
                      </NextLink>
                    </CardActions>
                  </Card>
                </form>
              </Box>
            </Box>
          </Container>
        </Box>
      )}
    </>
  );
};

EditAlert.getLayout = (page: any) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default EditAlert;
