import { useContext, useEffect, useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { useAuth } from "../../../hooks/use-auth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMounted } from "../../../hooks/use-mounted";
import { toast } from "react-hot-toast";
import { Avatar, Box, Chip, Container, Link, Typography } from "@mui/material";
import NextLink from "next/link";
import * as Yup from "yup";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Switch,
} from "@mui/material";
import Head from "next/head";
import { Users } from "src/types/users";
import { useFormik } from "formik";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { AuthContext } from "src/contexts/firebase-auth-context";
import { useSelector } from "react-redux";
import { RootState } from "src/store";
import { useRouter } from "next/router";

interface UserFormProps {
  user: Users;
}
const CreateUser = () => {
  const { createUserWithEmailAndPassword } = useAuth() as any;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { authToken } = useContext(AuthContext);
  const [selectedRolesIds, setSelectedRolesIds] = useState([]);
  const router = useRouter();
  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );
  const [roleOptions, setRoleOptions] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const dynamicPath = `/${isOrganizationName}/users`;
  const handleRegister = async (
    email: any,
    password: any,
    name: any,
    roles: any
  ) => {
    setLoading(true);
    try {
      const userDetails = {
        email: email,
        name: name,
        roles: roles,
        password: password,
      };

      const apiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}users/createUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(userDetails),
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
      setLoading(false);
    }
  };

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

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Must be a valid email")
        .max(255)
        .required("Email is required"),
      name: Yup.string().max(255).required("Name is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        const { email, password, name } = values;
        await handleRegister(email, password, name, selectedRolesIds);
        setSelectedRoles([]);
        setSelectedRolesIds([]);
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <>
      <Head>
        <title>Create User</title>
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
              alignItems: "center",
            }}
          >
            <Box mt={3}>
              <form onSubmit={formik.handleSubmit}>
                <Card>
                  <CardHeader title="Create User" />
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
                          label="Full name"
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
                            formik.touched.email && formik.errors.email
                          )}
                          fullWidth
                          helperText={
                            formik.touched.email && formik.errors.email
                          }
                          label="Email address"
                          name="email"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.email}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          type={showPassword ? "text" : "password"}
                          error={Boolean(
                            formik.touched.password && formik.errors.password
                          )}
                          helperText={
                            formik.touched.password && formik.errors.password
                          }
                          fullWidth
                          label="Password"
                          name="password"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={formik.values.password}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  edge="end"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          type={showConfirmPassword ? "text" : "password"}
                          error={Boolean(
                            formik.touched.confirmPassword &&
                              formik.errors.confirmPassword
                          )}
                          helperText={
                            formik.touched.confirmPassword &&
                            formik.errors.confirmPassword
                          }
                          fullWidth
                          label="Confirm Password"
                          name="confirmPassword"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={formik.values.confirmPassword}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  edge="end"
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                >
                                  {showConfirmPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      {/* <Grid item md={12} xs={12}>
                        <Autocomplete
                          multiple
                          id="roles-autocomplete"
                          options={roleOptions}
                          getOptionLabel={(option) => option.name}
                          onChange={(_, newValue) => {
                            // Extracting _id values from the selected roles
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
                      </Grid> */}
                      <Grid item md={12} xs={12}>
                        <Autocomplete
                          multiple
                          id="roles-autocomplete"
                          options={roleOptions.filter(
                            (role) =>
                              !selectedRoles.some(
                                (selectedRole) => selectedRole._id === role._id
                              )
                          )}
                          getOptionLabel={(option) => option.name}
                          onChange={(_, newValue) => {
                            // Extracting _id values from the selected roles
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

CreateUser.getLayout = (page: any) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default CreateUser;
