import React, { useContext, useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Container,
  Typography,
  Box,
  Card,
  CardHeader,
  Divider,
  CardContent,
  Grid,
  CardActions,
  Autocomplete,
  MenuItem,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "src/contexts/firebase-auth-context";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useSelector } from "react-redux";
import { RootState } from "src/store";

const CreateAlert = () => {
  const router = useRouter();
  const { authToken } = useContext(AuthContext);

  const [criteria, setCriteria] = useState([
    {
      logicalOperator: "AND",
      conditions: [{ fieldName: "", value: "", condition: "" }],
    },
  ]);

  const [alertOnEmail, setAlertOnEmail] = useState(false);
  const [alertOnNotification, setAlertOnNotification] = useState(false);

  const [dataField, setDataField] = useState([]);

  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );

  const dynamicPath = `/${isOrganizationName}/alert`;

  const handleCriteriaChange = (groupIndex, conditionIndex, field, value) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[groupIndex].conditions[conditionIndex][field] = value;
    setCriteria(updatedCriteria);
  };


  const convertToNestedStructure = (inputArray) => {
    return inputArray.map((item) => {
      const result = {
        [item.logicalOperator]: item.conditions.map((condition) => {
          const { condition: conditionType, fieldName: field, value } = condition;
          const conditionObject = { field, value, condition: conditionType };
          return conditionObject;
        })
      };
      return result;
    });
  };
  
  const handleRegister = async (
    name,
    criteria,
    alertOnEmail,
    alertOnNotification
  ) => {

    const outputArray = convertToNestedStructure(criteria);
    const payload = {
      name: name,
      criteria: outputArray,
      alertOnEmail: alertOnEmail,
      alertOnNotification: alertOnNotification,
    };



    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}alerts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        toast.success("Alert created successfully!");
        console.log("Alert created successfully!", responseData);
      } else {
        console.error("Failed to create alert:", response.statusText);
        toast.error("Failed to create alert. Please try again.");
      }
    } catch (error) {
      console.error("Error creating alert:", error.message);
      toast.error("Error creating alert. Please try again.");
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required("Name is required"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const { name } = values;

        await handleRegister(name, criteria, alertOnEmail, alertOnNotification);
        formik.resetForm();
        router.push(`${dynamicPath}`);
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const handleAddCondition = (groupIndex) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[groupIndex].conditions.push({
      fieldName: "",
      value: "",
      condition: "",
    });
    setCriteria(updatedCriteria);
  };

  const handleRemoveCondition = (groupIndex, conditionIndex) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[groupIndex].conditions.splice(conditionIndex, 1);
    setCriteria(updatedCriteria);
  };

  const handleAddOperator = () => {
    setCriteria([...criteria, { logicalOperator: "AND", conditions: [] }]);
  };

  const handleRemoveOperator = (groupIndex) => {
    if (criteria.length > 1) {
      const updatedCriteria = [...criteria];
      updatedCriteria.splice(groupIndex, 1);
      setCriteria(updatedCriteria);
    }
  };

  const handleLogicalOperatorChange = (groupIndex, value) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[groupIndex].logicalOperator = value;
    setCriteria(updatedCriteria);
  };

  return (
    <>
      <Head>
        <title>Create Alert</title>
      </Head>
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
                  <CardHeader title="Create Alert" />
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
                        {criteria.map((group, groupIndex) => (
                          <Box key={groupIndex} sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                              <Grid item md={12} xs={12}>
                                <TextField
                                  fullWidth
                                  label="Logical Operator"
                                  select
                                  value={group.logicalOperator}
                                  onChange={(e) =>
                                    handleLogicalOperatorChange(
                                      groupIndex,
                                      e.target.value
                                    )
                                  }
                                  variant="outlined"
                                >
                                  <MenuItem value="AND">AND</MenuItem>
                                  <MenuItem value="OR">OR</MenuItem>
                                </TextField>
                              </Grid>
{/* 
                              <Grid item md={12} xs={12}>
                                <Tooltip title="Remove">
                                  <IconButton
                                    onClick={() =>
                                      handleRemoveOperator(groupIndex)
                                    }
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Grid> */}
                              {group.conditions.map(
                                (condition, conditionIndex) => (
                                  <React.Fragment key={conditionIndex}>
                                    <Grid item md={3} xs={12}>
                                      <TextField
                                        fullWidth
                                        label="Field Name"
                                        value={condition.fieldName}
                                        onChange={(e) =>
                                          handleCriteriaChange(
                                            groupIndex,
                                            conditionIndex,
                                            "fieldName",
                                            e.target.value
                                          )
                                        }
                                        variant="outlined"
                                      />
                                    </Grid>
                                    <Grid item md={3} xs={12}>
                                      <TextField
                                        fullWidth
                                        label="Value"
                                        value={condition.value}
                                        onChange={(e) =>
                                          handleCriteriaChange(
                                            groupIndex,
                                            conditionIndex,
                                            "value",
                                            e.target.value
                                          )
                                        }
                                        variant="outlined"
                                      />
                                    </Grid>
                                    <Grid item md={3} xs={12}>
                                      <TextField
                                        fullWidth
                                        label="Condition"
                                        select
                                        value={condition.condition}
                                        onChange={(e) =>
                                          handleCriteriaChange(
                                            groupIndex,
                                            conditionIndex,
                                            "condition",
                                            e.target.value
                                          )
                                        }
                                        variant="outlined"
                                      >
                                        <MenuItem value="equal">Equal</MenuItem>
                                        <MenuItem value="notEqual">
                                          Not Equal
                                        </MenuItem>
                                        <MenuItem value="greaterThan">
                                          Greater Than
                                        </MenuItem>
                                        <MenuItem value="greaterThanOrEqual">
                                          Greater Than or Equal To
                                        </MenuItem>
                                        <MenuItem value="lessThan">
                                          Less Than
                                        </MenuItem>
                                        <MenuItem value="lessThanOrEqual">
                                          Less Than or Equal To
                                        </MenuItem>
                                      </TextField>
                                    </Grid>

                                    <Grid item md={3} xs={12}>
                                      <Tooltip title="Remove">
                                        <IconButton
                                          onClick={() =>
                                            handleRemoveCondition(
                                              groupIndex,
                                              conditionIndex
                                            )
                                          }
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </Grid>
                                  </React.Fragment>
                                )
                              )}

                              <Grid item md={12} xs={12}>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleAddCondition(groupIndex)}
                                  sx={{ mt: 2, mr: 2 }}
                                >
                                  <AddIcon sx={{ mr: 1 }} />
                                  <span>Add Condition</span>
                                </Button>
                              </Grid>
                      
                            </Grid>
                          </Box>
                        ))}
                        <Grid item md={12} xs={12}>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleAddOperator}
                            sx={{ mt: 2, mr: 2 }}
                          >
                            <AddIcon sx={{ mr: 1 }} />
                            <span>Add Operator</span>
                          </Button>
                        </Grid>
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
                        {/* Checkbox for alertOnNotification */}
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={alertOnNotification}
                              onChange={(e) =>
                                setAlertOnNotification(e.target.checked)
                              }
                              name="alertOnNotification"
                            />
                          }
                          label="Alert on Notification"
                        />
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
    </>
  );
};

CreateAlert.getLayout = (page: any) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default CreateAlert;
