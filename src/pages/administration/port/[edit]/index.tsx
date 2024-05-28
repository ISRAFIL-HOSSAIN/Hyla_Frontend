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

const EditPort = () => {
  const router = useRouter();
  const { authToken } = useContext(AuthContext);
  const { edit } = router.query;
  const [loading, setLoading] = useState(true);
  const isMounted = useMounted();
  const [data, setData] = useState<any | null>(null);

  const fieldNames: any = ["name", "UNLOCODE", "lat", "long"];

  const initialValues = {
    ...fieldNames.reduce((acc, fieldName) => {
      return {
        ...acc,
        [fieldName]: "",
      };
    }, {}),
    submit: null,
    showDropdown: true,
  };

  const getData = useCallback(async () => {
    try {
      if (!authToken || !edit) {
        console.error("Authorization token or ID is missing.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}ports/${edit}`;
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
      name: Yup.string().required("required."),
      UNLOCODE: Yup.string().required("required"),
      lat: Yup.number().required("required"),
      long: Yup.number().required("required"),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        await handleEdit(values);
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
        showDropdown: true,
      };

      // Initialize formik with the initial values
      formik.setValues(initialFormValues);
    }
  }, [data, formik.setValues]);

  const handleEdit = async (formValues: any) => {
    setLoading(true);
    try {
      const apiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}ports/${edit}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(formValues),
        }
      );

      if (apiResponse.ok) {
        const responseData = await apiResponse.json();

        if (responseData.success === true) {
          toast.success(responseData.message);
          formik.resetForm();
          router.push("/administration/port");
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

  return (
    <>
      <Head>
        <title>Edit Port</title>
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
            <NextLink href="/administration/port" passHref>
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
                  <CardHeader title="Edit Port" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={6} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.name && formik.errors.name
                          )}
                          fullWidth
                          helperText={formik.touched.name && formik.errors.name}
                          label="Name"
                          name="name"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.name}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.UNLOCODE && formik.errors.UNLOCODE
                          )}
                          fullWidth
                          helperText={
                            formik.touched.UNLOCODE && formik.errors.UNLOCODE
                          }
                          label="UNLOCODE"
                          name="UNLOCODE"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.UNLOCODE}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.lat && formik.errors.lat
                          )}
                          fullWidth
                          helperText={formik.touched.lat && formik.errors.lat}
                          label="Latitude"
                          name="lat"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.lat}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.long && formik.errors.long
                          )}
                          fullWidth
                          helperText={formik.touched.long && formik.errors.long}
                          label="Longitude"
                          name="long"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.long}
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

                    <NextLink href="/administration/port" passHref>
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

EditPort.getLayout = (page: any) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default EditPort;
