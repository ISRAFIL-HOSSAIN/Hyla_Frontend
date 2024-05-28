import { useCallback, useContext, useEffect, useState } from "react";
import {
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { useAuth } from "../../../../../hooks/use-auth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMounted } from "../../../../../hooks/use-mounted";
import { toast } from "react-hot-toast";
import { Box, Container, Link, Typography } from "@mui/material";
import NextLink from "next/link";
import * as Yup from "yup";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
} from "@mui/material";
import Head from "next/head";
import { useFormik } from "formik";
import { AuthContext } from "src/contexts/firebase-auth-context";
import { useSelector } from "react-redux";
import { RootState } from "src/store";
import { useRouter } from "next/router";
import React from "react";

const EditUser = () => {
  const { authToken } = useContext(AuthContext);
  const { edit } = useRouter().query;
  const [loading, setLoading] = useState(true);
  const isMounted = useMounted();
  const [data, setData] = useState<any | null>(null);
  const [roleOptions, setRoleOptions] = useState([]);
  const router = useRouter();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedRolesIds, setSelectedRolesIds] = useState([]);
  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );

  const dynamicPath = `/${isOrganizationName}/users`;

  // Fetch roles when the component mounts
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const apiResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}roles/getAllRoles`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (apiResponse.ok) {
          const rolesData = await apiResponse.json();
          setRoleOptions(rolesData);
        } else {
          toast.error(`Oops!! Something went wrong. Please retry`);
        }
      } catch (error) {
        toast.error(`Oops!! Something went wrong. Please retry`);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!authToken || !edit) {
          console.error("Authorization token or user ID is missing.");
          return;
        }
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/${edit}`;
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }

        const userData = await response.json();
        if (isMounted()) {
          setData(userData);
          setLoading(false);
          setSelectedRolesIds(userData.roles);
          const selectedRoles = roleOptions.filter((role) =>
            userData.roles.includes(role._id)
          );
          setSelectedRoles(selectedRoles);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (roleOptions.length > 0) {
      fetchData();
    }
    // fetchData();
  }, [authToken, edit, isMounted, roleOptions, setLoading]);

  const formik = useFormik({
    initialValues: {
      name: data ? data.name || "" : "",
      roles: [],
      submit: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required("Name is required"),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        const { name } = values;

        const updateUserDetails = {
          name: name,
          roles: selectedRolesIds,
        };

        const apiResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}users/updateUser/${edit}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(updateUserDetails),
          }
        );

        if (apiResponse.ok) {
          const responseData = await apiResponse.json();

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
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    formik.setFieldValue("name", data ? data.name || "" : "");
  }, [data, formik.setFieldValue]);

  return (
    <>
      <Head>
        <title>Edit User</title>
      </Head>

      {loading ? (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          <CircularProgress />
        </Typography>
      ) : (
        data && (
          <React.Fragment>
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
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box mt={3}>
                    <form onSubmit={formik.handleSubmit}>
                      <Card>
                        <CardHeader title="Edit User" />
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
                                label="Full name"
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
                                id="roles-autocomplete"
                                options={roleOptions.filter(
                                  (role) =>
                                    !selectedRoles.some(
                                      (selectedRole) =>
                                        selectedRole._id === role._id
                                    )
                                )}
                                getOptionLabel={(option) => option.name}
                                isOptionEqualToValue={(option, value) =>
                                  option._id === value._id
                                }
                                onChange={(_, newValue) => {
                                  const selectedRoleIds = newValue.map(
                                    (role) => role._id
                                  );
                                  setSelectedRolesIds(selectedRoleIds);
                                  setSelectedRoles(newValue);
                                }}
                                value={selectedRoles}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Roles"
                                    placeholder="Select roles"
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                          <Divider sx={{ my: 3 }} />
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
                            Update
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
          </React.Fragment>
        )
      )}
    </>
  );
};

EditUser.getLayout = (page: any) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default EditUser;
