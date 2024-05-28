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
const CreateField = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { authToken } = useContext(AuthContext);
  
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
  

  const handleCreate = async (formValues: any) => {
    setLoading(true);
    try {
      const apiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}aisDataFiled/create`,
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
        // console.log(responseData);
        if (responseData.success === true) {
          toast.success(responseData.message);
          formik.resetForm();
          router.push("/administration/dataField");
        } else {
          toast.error(responseData.message);
        }
      } else {
        const errorData = await apiResponse.json();
        console.error(
          "Failed to create AIS data:",
          apiResponse.statusText,
          errorData
        );
        toast.error("Failed to create AIS data");
      }
    } catch (error) {
      console.error("Create failed:", error.message);
      toast.error(`Create failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      fieldName: Yup.string().required("required."),
      type: Yup.string().required("required"),
      description: Yup.string().required("required")
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

  return (
    <>
      <Head>
        <title>Create Data Field</title>
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
                  <CardHeader title="Create Data Field" />
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

CreateField.getLayout = (page: any) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default CreateField;
