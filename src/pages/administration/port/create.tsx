import { useContext, useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  FormControlLabel,
} from "@mui/material";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { useAuth } from "../../../hooks/use-auth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMounted } from "../../../hooks/use-mounted";
import { toast } from "react-hot-toast";
import { Avatar, Box, Chip, Container, Link, Typography } from "@mui/material";
import NextLink from "next/link";
import { pink } from "@mui/material/colors";
import * as Yup from "yup";
import Tooltip from "@mui/material/Tooltip";
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
import { useRouter } from "next/router";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DataField from "src/components/data";
const CreatePort = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { authToken } = useContext(AuthContext);

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

  const handleCreate = async (formValues: any) => {
    setLoading(true);
    try {
      const apiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}ports/create`,
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
        await handleCreate(values);
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
        <title>Create Port</title>
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
                  <CardHeader title="Create Port" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={6} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.name &&
                              formik.errors.name
                          )}
                          fullWidth
                          helperText={
                            formik.touched.name &&
                            formik.errors.name
                          }
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
                            formik.touched.UNLOCODE &&
                              formik.errors.UNLOCODE
                          )}
                          fullWidth
                          helperText={
                            formik.touched.UNLOCODE &&
                            formik.errors.UNLOCODE
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
                            formik.touched.lat &&
                              formik.errors.lat
                          )}
                          fullWidth
                          helperText={
                            formik.touched.lat &&
                            formik.errors.lat
                          }
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
                            formik.touched.long &&
                              formik.errors.long
                          )}
                          fullWidth
                          helperText={
                            formik.touched.long &&
                            formik.errors.long
                          }
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

CreatePort.getLayout = (page: any) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default CreatePort;
