// edit-organization.tsx

import { useCallback, useContext, useEffect, useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
} from "@mui/material";
import { pink } from "@mui/material/colors";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { useAuth } from "../../../../../hooks/use-auth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMounted } from "../../../../../hooks/use-mounted";
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
} from "@mui/material";
import Head from "next/head";
import { useFormik } from "formik";
import { AuthContext } from "src/contexts/firebase-auth-context";
import { useRouter } from "next/router";
import React from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const EditOrganization = () => {
  const router = useRouter();
  const { authToken } = useContext(AuthContext);
  const { edit } = router.query;
  const [loading, setLoading] = useState(true);
  const isMounted = useMounted();
  const [data, setData] = useState<any | null>(null);

  const [tableData, setTableData] = useState([]);
  const [ids, setId] = useState([]);
  const [searchTrasnport, setSearchTrasnport] = useState("");
  const [searchTransportResults, setSearchTransportResults] = useState([]);

  const handleSearchTransportChange = (event: any) => {
    const value = event.target.value;
    setSearchTrasnport(value);
  };

  const handleSearchTransport = async () => {
    try {
      if (!authToken || !searchTrasnport) {
        console.error(
          "Authorization token or search transport value is missing."
        );
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}trackable-transports/getTransport?search=${searchTrasnport}`;
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch transport data: ${response.statusText}`
        );
      }

      const searchData = await response.json();

      if (searchData.length === 0) {
        toast.error("No transport data found.");
      }
      setSearchTransportResults(searchData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch transport data.");
    }
  };

  const handleAddToTableFromSearch = (transport) => {
    const isTransportExists = tableData.some(
      (existingTransport) =>
        existingTransport.transportName === transport.transportName &&
        existingTransport.imoNumber === transport.imoNumber
    );

    if (!isTransportExists) {
      setTableData((prevData) => [...prevData, transport]);
      setId((prevData) => [...prevData, transport._id]);
      setSearchTrasnport("");
      setSearchTransportResults((prevResults) =>
        prevResults.filter((result) => result._id !== transport._id)
      );
    } else {
      setSearchTrasnport("");
      setSearchTransportResults([]);
      toast.error("This Transport is already mapped to Organization.");
    }
  };

  // const handleRemoveTransport = (index: number) => {
  //   setTableData((prevData) => prevData.filter((_, i) => i !== index));
  // };

  const handleRemoveTransport = (index: number) => {
    setTableData((prevData) => {
      const updatedTableData = [...prevData];
      const removedTransport = updatedTableData.splice(index, 1)[0];
      setId((prevIds) => prevIds.filter((id) => id !== removedTransport._id));
  
      return updatedTableData;
    });
  };
  

  const handleResetSearchData = () => {
    setSearchTrasnport("");
    setSearchTransportResults([]);
  };

  const getOrganization = useCallback(async () => {
    try {
      if (!authToken || !edit) {
        console.error("Authorization token or organization ID is missing.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}organizations/getOrg/${edit}`;
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
      const organizationData = await response.json();
      if (isMounted()) {
        setData(organizationData);

        setId((prevData) => [
          ...prevData,
          ...organizationData.transports.map((transport: any) => transport._id),
        ]);

        const newTransports = organizationData.transports.filter(
          (transport: any) =>
            !tableData.some(
              (existingTransport) => existingTransport._id === transport._id
            )
        );

        setTableData((prevData) => [...prevData, ...newTransports]);

        setLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, [edit, authToken, isMounted, setData, setLoading]);

  useEffect(() => {
    getOrganization();
  }, [getOrganization]);

  const formik = useFormik({
    initialValues: {
      name: data ? data.name || "" : "",
      submit: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required("Name is required"),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        const { name } = values;

        const updateApiResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}organizations/updateOrg/${edit}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ name, transports: ids }),
          }
        );

        if (updateApiResponse.ok) {
          const responseData = await updateApiResponse.json();

          if (responseData.success === true) {
            toast.success(responseData.message);
            formik.resetForm();
            router.push("/administration/organization");
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
        <title>Edit Organization</title>
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
                  <NextLink href="/administration/organization" passHref>
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
                    // alignItems: "center",
                  }}
                >
                  <Box mt={3}>
                    <form onSubmit={formik.handleSubmit}>
                      <Card>
                        <CardHeader title="Edit Organization" />
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
                                label="Organization Name"
                                name="name"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                required
                                value={formik.values.name || ""}
                              />
                            </Grid>
                            <Divider sx={{ my: 3 }} />
                            <Grid item md={12} xs={12}>
                              <Typography
                                variant="h6"
                                sx={{ mt: 3, color: "text.primary" }}
                              >
                                Search Transport for Organization Mapping
                              </Typography>
                            </Grid>
                            <Grid
                              item
                              md={12}
                              xs={12}
                              sx={{ display: "flex", gap: 2 }}
                            >
                              <TextField
                                label="Search With Transport Name and IMO Number"
                                placeholder="Type transport name or IMO number"
                                onChange={handleSearchTransportChange}
                                value={searchTrasnport}
                                sx={{ flex: 1 }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSearchTransport();
                                  }
                                }}
                              />
                              <Tooltip title="Search Data" arrow>
                                <Button onClick={handleSearchTransport}>
                                  <SearchIcon />
                                </Button>
                              </Tooltip>

                              <Tooltip title="Reset Search Data" arrow>
                                <Button onClick={handleResetSearchData}>
                                  <RestartAltIcon />
                                </Button>
                              </Tooltip>
                            </Grid>
                            {searchTransportResults.length > 0 && (
                              <Grid item md={12} xs={12}>
                                <Typography
                                  variant="h6"
                                  sx={{ mt: 2, color: "text.secondary" }}
                                >
                                  Add Transport in Organization
                                </Typography>
                                <ul>
                                  {searchTransportResults.map((result) => (
                                    <li key={result._id}>
                                      <strong>Transport Name:-</strong>{" "}
                                      {result.transportName} -{" "}
                                      <strong>IMO Number:-</strong>{" "}
                                      {result.imoNumber}{" "}
                                      <Tooltip title="Add Data" arrow>
                                        <Button
                                          onClick={() =>
                                            handleAddToTableFromSearch(result)
                                          }
                                        >
                                          <AddCircleOutlineIcon />
                                        </Button>
                                      </Tooltip>
                                    </li>
                                  ))}
                                </ul>
                              </Grid>
                            )}
                          </Grid>
                          {/* <Divider sx={{ my: 1 }} /> */}

                          {tableData.length > 0 && (
                            <Typography
                              variant="h6"
                              sx={{ mt: 3, color: "text.primary" }}
                            >
                              Organization Transport Details
                            </Typography>
                          )}
                          <Divider sx={{ my: 2 }} />
                          {tableData.length > 0 && (
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Transport Name</TableCell>
                                  <TableCell>IMO Number</TableCell>
                                  <TableCell>Action</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tableData.map((row, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{row.transportName}</TableCell>
                                    <TableCell>{row.imoNumber}</TableCell>
                                    <TableCell>
                                      <Tooltip title="Remove" arrow>
                                        <Button
                                          onClick={() =>
                                            handleRemoveTransport(index)
                                          }
                                        >
                                          <RemoveCircleOutlineIcon
                                            sx={{ color: pink[500] }}
                                          />
                                        </Button>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}

                          {tableData.length === 0 && (
                            // <Typography variant="body2" sx={{ mt: 2 }}>
                            //   No transport data available.
                            // </Typography>
                            <></>
                          )}
                          <Divider sx={{ my: 3 }} />
                        </CardContent>
                        <CardActions
                          sx={{
                            flexWrap: "wrap",
                            m: -1,
                          }}
                        >
                          <Tooltip title="Update" arrow>
                            <Button
                              disabled={formik.isSubmitting}
                              type="submit"
                              sx={{ m: 1 }}
                              variant="contained"
                            >
                              Update
                            </Button>
                          </Tooltip>

                          <NextLink
                            href="/administration/organization"
                            passHref
                          >
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
          </React.Fragment>
        )
      )}
    </>
  );
};

EditOrganization.getLayout = (page: any) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default EditOrganization;
