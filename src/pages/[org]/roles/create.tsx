import { useContext, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { useMounted } from "../../../hooks/use-mounted";
import { toast } from "react-hot-toast";
import * as Yup from "yup";
import { AuthContext } from "src/contexts/firebase-auth-context";
import { RootState } from "src/store";

const CreateRole = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isMounted = useMounted();
  const [loading, setLoading] = useState(false);
  const { authToken } = useContext(AuthContext);
  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );

  const permissionsInitialValues = {
    user_management: { read: false, write: false },
    role_management: { read: false, write: false },
    ship_of_interest: { read: false, write: false },
    geofence: { read: false, write: false },
    voyage: { read: false, write: false },
    alerts: { read: false, write: false },
  };

  const dynamicPath = `/${isOrganizationName}/roles`;

  const formik = useFormik({
    initialValues: {
      name: "",
      permissions: permissionsInitialValues,
      submit: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required("Role name is required"),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        setLoading(true);

        const permissions = Object.keys(values.permissions).map((category) => ({
          category,
          read: values.permissions[category].read,
          write: values.permissions[category].write,
        }));

        const payload = {
          name: values.name,
          permissions,
        };
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}roles/createRole`,
          {
            method: "POST",
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
      } finally {
        setLoading(false);
        helpers.setSubmitting(false);
      }
    },
  });

  const handlePermissionChange = (category, type) => {
    const updatedPermissions = {
      ...formik.values.permissions,
      [category]: {
        ...formik.values.permissions[category],
        [type]: !formik.values.permissions[category][type],
      },
    };

    formik.setValues({
      ...formik.values,
      permissions: updatedPermissions,
    });
  };

  return (
    <>
      <Head>
        <title>Create Role</title>
      </Head>
      <Box
        component="main"
        sx={{ backgroundColor: "background.default", flexGrow: 1, py: 8 }}
      >
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4">Create Role</Typography>
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
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={12} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.name && formik.errors.name
                          )}
                          fullWidth
                          helperText={formik.touched.name && formik.errors.name}
                          label="Role Name"
                          name="name"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.name}
                        />
                      </Grid>
                      <Grid item md={12} xs={12}>
                        <Divider />
                        <Typography variant="h6" mt={3} mb={2}>
                          Permissions
                        </Typography>
                      </Grid>
                      <Grid item md={12} xs={12}>
                        <TableContainer component={Paper}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Module Name</TableCell>
                                <TableCell>Read</TableCell>
                                <TableCell>Write</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.keys(formik.values.permissions).map(
                                (category) => (
                                  <TableRow key={category}>
                                    <TableCell>
                                      {category.replace("_", " ")}
                                    </TableCell>
                                    <TableCell>
                                      <Checkbox
                                        checked={
                                          formik.values.permissions[category]
                                            .read
                                        }
                                        onChange={() =>
                                          handlePermissionChange(
                                            category,
                                            "read"
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Checkbox
                                        checked={
                                          formik.values.permissions[category]
                                            .write
                                        }
                                        onChange={() =>
                                          handlePermissionChange(
                                            category,
                                            "write"
                                          )
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={formik.isSubmitting || loading}
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

CreateRole.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default CreateRole;
