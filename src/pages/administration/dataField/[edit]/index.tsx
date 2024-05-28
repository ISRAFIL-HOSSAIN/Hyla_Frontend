import { useCallback, useContext, useEffect, useState } from "react";
import {
  TextField,
  Button,
  Grid,
  IconButton,
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import { pink } from "@mui/material/colors";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { useAuth } from "../../../../hooks/use-auth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMounted } from "../../../../hooks/use-mounted";
import { toast } from "react-hot-toast";
import { Box, Container, Link, Typography } from "@mui/material";
import NextLink from "next/link";
import * as Yup from "yup";
import Tooltip from "@mui/material/Tooltip";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Switch,
} from "@mui/material";
import Head from "next/head";
import { useFormik } from "formik";
import { AuthContext } from "src/contexts/firebase-auth-context";
import { useRouter } from "next/router";
import React from "react";
import DataField from "src/components/data";

const EditDataField = () => {
  const router = useRouter();
  const { authToken } = useContext(AuthContext);
  const { edit } = router.query;
  const [loading, setLoading] = useState(true);
  const isMounted = useMounted();
  const [data, setData] = useState<any | null>(null);

  const fieldNames: any = ["fieldName", "type", "description", "fromAIS"];

  const initialValues = {
    ...fieldNames.reduce((acc, fieldName) => {
      return {
        ...acc,
        [fieldName]: fieldName === "fromAIS" ? false : "",
      };
    }, {}),
    submit: null
  };
  

  const getData = useCallback(async () => {
    try {
      if (!authToken || !edit) {
        console.error("Authorization token or ID is missing.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}aisDataFiled/${edit}`;
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch organization data: ${response.statusText}`
        );
      }
      const Data = await response.json();
      if (isMounted()) {
        setData(Data);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, [edit, authToken, isMounted, setData, setLoading]);

  useEffect(() => {
    getData();
  }, [getData]);

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      fieldName: Yup.string().required("required."),
      type: Yup.string().required("required"),
      description: Yup.string().required("required"),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        await handleEdit(values);
        formik.resetForm();
        router.push("/administration/dataField");
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (data) {
      const initialFormValues = {
        ...fieldNames.reduce((acc, fieldName) => {
          return {
            ...acc,
            [fieldName]: data[fieldName] || "",
          };
        }, {}),
        submit: null,
        // showDropdown: true,
      };

      formik.setValues(initialFormValues);
    }
  }, [data, formik.setValues]);

  const handleFieldNameChange = (
    e: React.ChangeEvent<{ name: string; value: unknown }>
  ) => {
    const selectedFieldName = e.target.value;
    const selectedField = DataField.find(
      (field) => field.fieldName === selectedFieldName
    );

    formik.setFieldValue("type", selectedField?.type || "");
    formik.setFieldValue("description", selectedField?.description || "");
  };

  const handleEdit = async (formValues: any) => {
    setLoading(true);
    try {
      const apiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}aisDataFiled/update/${edit}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(formValues),
        }
      );

      if (apiResponse.ok) {
        toast.success(" updated successfully!");
      } else {
        console.error(
          "Failed to store user details in the database:",
          apiResponse.statusText
        );
        toast.error(
          " updated succeeded, but failed to store details in the database."
        );
      }
    } catch (error) {
      console.error("updated failed:", error.message);
      toast.error(`updated failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Edit Data Field</title>
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
            <NextLink href="/administration/dataField" passHref>
              <Link
                color="textPrimary"
                component="a"
                sx={{
                  alignItems: "center",
                  display: "flex",
                }}
              >
                <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Back</Typography>
              </Link>
            </NextLink>
          </Box>
          <Box
            sx={{
              marginTop: 6,
              display: "flex",
              flexDirection: "column",
              // alignItems: "center",
            }}
          >
            <Box mt={3}>
              <form onSubmit={formik.handleSubmit}>
                <Card>
                  <CardHeader title="Edit Data Field" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={12} xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formik.values.fromAIS}
                              onChange={() =>
                                formik.setFieldValue(
                                  "fromAIS",
                                  !formik.values.fromAIS
                                )
                              }
                              color="primary"
                            />
                          }
                          label="Show AIS Data Field"
                        />
                      </Grid>
                      <Grid item md={12} xs={12}>
                        {formik.values.fromAIS ? (
                          <TextField
                            select
                            fullWidth
                            label="Field Name"
                            name="fieldName"
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(
                                e as React.ChangeEvent<{
                                  name: string;
                                  value: unknown;
                                }>
                              );
                              handleFieldNameChange(
                                e as React.ChangeEvent<{
                                  name: string;
                                  value: unknown;
                                }>
                              );
                            }}
                            required
                            value={formik.values.fieldName}
                          >
                            {DataField.map((field) => (
                              <MenuItem key={field.fieldName} value={field.fieldName}>
                                {field.fieldName}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <TextField
                            error={Boolean(
                              formik.touched.fieldName &&
                                formik.errors.fieldName
                            )}
                            fullWidth
                            helperText={
                              formik.touched.fieldName &&
                              formik.errors.fieldName
                            }
                            label="Field Name"
                            name="fieldName"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            required
                            value={formik.values.fieldName}
                          />
                        )}
                      </Grid>
                      <Grid item md={12} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.type && formik.errors.type
                          )}
                          fullWidth
                          helperText={formik.touched.type && formik.errors.type}
                          label="Type"
                          name="type"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={formik.values.type}
                          select
                        >
                          <MenuItem value="text">Text</MenuItem>
                          <MenuItem value="number">Number</MenuItem>
                          <MenuItem value="datetime">Datetime</MenuItem>
                          <MenuItem value="bool">Boolean</MenuItem>
                        </TextField>
                        {/* <TextField
                          error={Boolean(
                            formik.touched.type && formik.errors.type
                          )}
                          fullWidth
                          helperText={formik.touched.type && formik.errors.type}
                          label="Type"
                          name="type"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={formik.values.type}
                        /> */}
                      </Grid>
                      <Grid item md={12} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.description &&
                              formik.errors.description
                          )}
                          fullWidth
                          helperText={
                            formik.touched.description &&
                            formik.errors.description
                          }
                          label="Description"
                          name="description"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.description}
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
                    <Tooltip title="Submit" arrow>
                      <Button
                        disabled={formik.isSubmitting}
                        type="submit"
                        sx={{ m: 1 }}
                        variant="contained"
                      >
                        Submit
                      </Button>
                    </Tooltip>

                    <NextLink href="/administration/dataField" passHref>
                      <Tooltip title="Cancel" arrow>
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
                      </Tooltip>
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

EditDataField.getLayout = (page: any) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default EditDataField;
