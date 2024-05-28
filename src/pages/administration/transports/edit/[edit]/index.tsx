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
  IconButton,
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
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
const EditTransport = () => {
  const router = useRouter();
  const { authToken } = useContext(AuthContext);
  const { edit } = router.query;
  const [loading, setLoading] = useState(true);
  const isMounted = useMounted();
  const [data, setData] = useState<any | null>(null);

  const fieldNames: any= [
    "imoNumber",
    "transportName",
    "flagName",
    "StatCode5",
    "transportCategory",
    "transportSubCategory",
    "SpireTransportType",
    "buildYear",
    "GrossTonnage",
    "deadWeight",
    "LOA",
    "Beam",
    "MaxDraft",
    "ME_kW_used",
    "AE_kW_used",
    "RPM_ME_used",
    "Enginetype_code",
    "subst_nr_ME",
    "Stofnaam_ME",
    "Stofnaam_AE",
    "subst_nr_AE",
    "Fuel_ME_code_sec",
    "EF_ME",
    "Fuel_code_aux",
    "EF_AE",
    "EF_gr_prs_ME",
    "EF_gr_prs_AE_SEA",
    "EF_gr_prs_AE_BERTH",
    "EF_gr_prs_BOILER_BERTH",
    "EF_gr_prs_AE_MAN",
    "EF_gr_prs_AE_ANCHOR",
    "NO_OF_ENGINE_active",
    "CEF_type",
    "Loadfactor_ds",
    "Speed_used",
    "CRS_min",
    "CRS_max",
    "Funnel_heigth",
    "FO_consumption_factor",
    "coxemissionFactor",
    "soxEmissionFactor",
    "TEU",
    "CRUDE",
    "GAS",
    "BUILDER",
    "MANAGER",
    "OWNER",
    "CLASS",
    "MMSI",
    "flagCode",
  ];

  const initialValues = {
    ...fieldNames.reduce((acc, fieldName) => {
      return {
        ...acc,
        [fieldName]: "",
      };
    }, {}),
    SOFC_map_array: [{ speed: 0, loadFactor: 0, sofc: 0 }],
    submit: null,
  };

  const getTransport = useCallback(async () => {
    try {
      if (!authToken || !edit) {
        console.error("Authorization token or organization ID is missing.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}trackable-transports/${edit}`;
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
    getTransport();
  }, [getTransport]);

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      imoNumber: Yup.number().integer("IMO Number must be an integer"),
      transportName: Yup.string().required("Transport Name is required"),
      MMSI: Yup.number(),
      GrossTonnage: Yup.number(),
      deadWeight: Yup.number(),
      LOA: Yup.number(),
      Beam: Yup.number(),
      MaxDraft: Yup.number(),
      ME_kW_used: Yup.number(),
      AE_kW_used: Yup.number(),
      RPM_ME_used: Yup.number(),
      subst_nr_ME: Yup.number(),
      subst_nr_AE: Yup.number(),
      EF_ME: Yup.number(),
      EF_AE: Yup.number(),
      EF_gr_prs_ME: Yup.number(),
      EF_gr_prs_AE_SEA: Yup.number(),
      EF_gr_prs_AE_BERTH: Yup.number(),
      EF_gr_prs_BOILER_BERTH: Yup.number(),
      EF_gr_prs_AE_MAN: Yup.number(),
      EF_gr_prs_AE_ANCHOR: Yup.number(),
      NO_OF_ENGINE_active: Yup.number(),
      CEF_type: Yup.number(),
      Loadfactor_ds: Yup.number(),
      Speed_used: Yup.number(),
      CRS_min: Yup.number(),
      CRS_max: Yup.number(),
      Funnel_heigth: Yup.number(),
      FO_consumption_factor: Yup.number(),
      coxemissionFactor: Yup.number(),
      soxEmissionFactor: Yup.number(),
      TEU: Yup.number(),
      CRUDE: Yup.number(),
      GAS: Yup.number(),
      SOFC_map_array: Yup.array().of(
        Yup.object({
          speed: Yup.number(),
          loadFactor: Yup.number(),
          sofc: Yup.number(),
        })
      ),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        await handleEdit(values);
        formik.resetForm();
        router.push("/administration/transports");
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
      // Set the initial values for the form
      const initialFormValues = {
        ...fieldNames.reduce((acc, fieldName) => {
          return {
            ...acc,
            [fieldName]: data[fieldName] || "",
          };
        }, {}),
        SOFC_map_array: data.SOFC_map_array || [
          { speed: 0, loadFactor: 0, sofc: 0 },
        ],
        submit: null,
      };

      // Initialize formik with the initial values
      formik.setValues(initialFormValues);
    }
  }, [data, formik.setValues]);

  const addSOFCObject = () => {
    formik.setValues((prevValues) => ({
      ...prevValues,
      SOFC_map_array: [
        ...prevValues.SOFC_map_array,
        { speed: 0, loadFactor: 0, sofc: 0 },
      ],
    }));
  };

  const removeSOFCObject = (index) => {
    formik.setValues((prevValues) => {
      const updatedSOFC = [...prevValues.SOFC_map_array];
      updatedSOFC.splice(index, 1);
      return {
        ...prevValues,
        SOFC_map_array: updatedSOFC,
      };
    });
  };

  // console.log(data, "data");

  const handleEdit = async (formValues: any) => {
    setLoading(true);
    try {
      const apiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}trackable-transports/update/${edit}`,
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
        toast.success("Transport updated successfully!");
      } else {
        console.error(
          "Failed to store user details in the database:",
          apiResponse.statusText
        );
        toast.error(
          "Transport updated succeeded, but failed to store details in the database."
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
        <title>Edit Transports</title>
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
            <NextLink href="/administration/transports" passHref>
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
                  <CardHeader title="Edit Transports" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.imoNumber && formik.errors.imoNumber
                          )}
                          fullWidth
                          helperText={
                            formik.touched.imoNumber && formik.errors.imoNumber
                          }
                          label="IMO Number"
                          name="imoNumber"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.imoNumber}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.MMSI && formik.errors.MMSI
                          )}
                          fullWidth
                          helperText={formik.touched.MMSI && formik.errors.MMSI}
                          label="MMSI"
                          name="MMSI"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={formik.values.MMSI}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.transportName &&
                              formik.errors.transportName
                          )}
                          fullWidth
                          helperText={
                            formik.touched.transportName &&
                            formik.errors.transportName
                          }
                          label="Transport Name"
                          name="transportName"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.transportName}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          fullWidth
                          label="Transport Category"
                          name="transportCategory"
                          onChange={formik.handleChange}
                          value={formik.values.transportCategory}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.transportSubCategory && formik.errors.transportSubCategory
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.transportSubCategory && formik.errors.transportSubCategory
                          // }
                          label="Transport Sub Category"
                          name="transportSubCategory"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.transportSubCategory}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.SpireTransportType && formik.errors.SpireTransportType
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.SpireTransportType && formik.errors.SpireTransportType
                          // }
                          label="Spire Transport Category"
                          name="SpireTransportType"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.SpireTransportType}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.BUILDER && formik.errors.BUILDER
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.BUILDER && formik.errors.BUILDER
                          // }
                          label="Builder"
                          name="BUILDER"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.BUILDER}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.MANAGER && formik.errors.MANAGER
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.MANAGER && formik.errors.MANAGER
                          // }
                          label="Manager"
                          name="MANAGER"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.MANAGER}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.OWNER && formik.errors.OWNER
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.OWNER && formik.errors.OWNER
                          // }
                          label="Owner"
                          name="OWNER"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.OWNER}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.CLASS && formik.errors.CLASS
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.CLASS && formik.errors.CLASS
                          // }
                          label="Class"
                          name="CLASS"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.CLASS}
                        />
                      </Grid>

                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.flagName && formik.errors.flagName
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.flagName && formik.errors.flagName
                          // }
                          label="Flag Name"
                          name="flagName"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.flagName}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.flagCode && formik.errors.flagCode
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.flagCode && formik.errors.flagCode
                          // }
                          label="Flag Code"
                          name="flagCode"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.flagCode}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.StatCode5 && formik.errors.StatCode5
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.StatCode5 && formik.errors.StatCode5
                          // }
                          label="Stat Code"
                          name="StatCode5"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.StatCode5}
                        />
                      </Grid>

                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.buildYear && formik.errors.buildYear
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.buildYear && formik.errors.buildYear
                          // }
                          label="Build Year"
                          name="buildYear"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.buildYear}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.GrossTonnage &&
                              formik.errors.GrossTonnage
                          )}
                          fullWidth
                          helperText={
                            formik.touched.GrossTonnage &&
                            formik.errors.GrossTonnage
                          }
                          label="Gross Tonnage"
                          name="GrossTonnage"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.GrossTonnage}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.deadWeight &&
                              formik.errors.deadWeight
                          )}
                          fullWidth
                          helperText={
                            formik.touched.deadWeight &&
                            formik.errors.deadWeight
                          }
                          label="Dead Weight"
                          name="deadWeight"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.deadWeight}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.LOA && formik.errors.LOA
                          )}
                          fullWidth
                          helperText={formik.touched.LOA && formik.errors.LOA}
                          label="LOA"
                          name="LOA"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.LOA}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.Beam && formik.errors.Beam
                          )}
                          fullWidth
                          helperText={formik.touched.Beam && formik.errors.Beam}
                          label="Beam"
                          name="Beam"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.Beam}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.MaxDraft && formik.errors.MaxDraft
                          )}
                          fullWidth
                          helperText={
                            formik.touched.MaxDraft && formik.errors.MaxDraft
                          }
                          label="Max Draft"
                          name="MaxDraft"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.MaxDraft}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.ME_kW_used &&
                              formik.errors.ME_kW_used
                          )}
                          fullWidth
                          helperText={
                            formik.touched.ME_kW_used &&
                            formik.errors.ME_kW_used
                          }
                          label="ME kW Used"
                          name="ME_kW_used"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.ME_kW_used}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.AE_kW_used &&
                              formik.errors.AE_kW_used
                          )}
                          fullWidth
                          helperText={
                            formik.touched.AE_kW_used &&
                            formik.errors.AE_kW_used
                          }
                          label="AE kW used"
                          name="AE_kW_used"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.AE_kW_used}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.RPM_ME_used &&
                              formik.errors.RPM_ME_used
                          )}
                          fullWidth
                          helperText={
                            formik.touched.RPM_ME_used &&
                            formik.errors.RPM_ME_used
                          }
                          label="RPM ME used"
                          name="RPM_ME_used"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.RPM_ME_used}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.Enginetype_code && formik.errors.Enginetype_code
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.Enginetype_code && formik.errors.Enginetype_code
                          // }
                          label="Enginetype Code"
                          name="Enginetype_code"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.Enginetype_code}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.subst_nr_ME &&
                              formik.errors.subst_nr_ME
                          )}
                          fullWidth
                          helperText={
                            formik.touched.subst_nr_ME &&
                            formik.errors.subst_nr_ME
                          }
                          label="Subst Nr ME"
                          name="subst_nr_ME"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.subst_nr_ME}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.subst_nr_AE &&
                              formik.errors.subst_nr_AE
                          )}
                          fullWidth
                          helperText={
                            formik.touched.subst_nr_AE &&
                            formik.errors.subst_nr_AE
                          }
                          label="Subst Nr AE"
                          name="subst_nr_AE"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.subst_nr_AE}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.Stofnaam_ME && formik.errors.Stofnaam_ME
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.Stofnaam_ME && formik.errors.Stofnaam_ME
                          // }
                          label="Stofnaam ME"
                          name="Stofnaam_ME"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.Stofnaam_ME}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.Stofnaam_AE && formik.errors.Stofnaam_AE
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.Stofnaam_AE && formik.errors.Stofnaam_AE
                          // }
                          label="Stofnaam AE"
                          name="Stofnaam_AE"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.Stofnaam_AE}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.Fuel_ME_code_sec && formik.errors.Fuel_ME_code_sec
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.Fuel_ME_code_sec && formik.errors.Fuel_ME_code_sec
                          // }
                          label="Fuel ME Code Sec"
                          name="Fuel_ME_code_sec"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.Fuel_ME_code_sec}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.EF_ME && formik.errors.EF_ME
                          )}
                          fullWidth
                          helperText={
                            formik.touched.EF_ME && formik.errors.EF_ME
                          }
                          label="EF ME"
                          name="EF_ME"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.EF_ME}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          // error={Boolean(
                          //   formik.touched.Fuel_code_aux && formik.errors.Fuel_code_aux
                          // )}
                          fullWidth
                          // helperText={
                          //   formik.touched.Fuel_code_aux && formik.errors.Fuel_code_aux
                          // }
                          label="Fuel Code Aux"
                          name="Fuel_code_aux"
                          // onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.Fuel_code_aux}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.EF_AE && formik.errors.EF_AE
                          )}
                          fullWidth
                          helperText={
                            formik.touched.EF_AE && formik.errors.EF_AE
                          }
                          label="EF AE"
                          name="EF_AE"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={formik.values.EF_AE}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.EF_gr_prs_ME &&
                              formik.errors.EF_gr_prs_ME
                          )}
                          fullWidth
                          helperText={
                            formik.touched.EF_gr_prs_ME &&
                            formik.errors.EF_gr_prs_ME
                          }
                          label="EF Gr Prs ME"
                          name="EF_gr_prs_ME"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.EF_gr_prs_ME}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.EF_gr_prs_AE_SEA &&
                              formik.errors.EF_gr_prs_AE_SEA
                          )}
                          fullWidth
                          helperText={
                            formik.touched.EF_gr_prs_AE_SEA &&
                            formik.errors.EF_gr_prs_AE_SEA
                          }
                          label="EF Gr Prs AE SEA"
                          name="EF_gr_prs_AE_SEA"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.EF_gr_prs_AE_SEA}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.EF_gr_prs_AE_BERTH &&
                              formik.errors.EF_gr_prs_AE_BERTH
                          )}
                          fullWidth
                          helperText={
                            formik.touched.EF_gr_prs_AE_BERTH &&
                            formik.errors.EF_gr_prs_AE_BERTH
                          }
                          label="EF Gr Prs AE BERTH"
                          name="EF_gr_prs_AE_BERTH"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.EF_gr_prs_AE_BERTH}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.EF_gr_prs_BOILER_BERTH &&
                              formik.errors.EF_gr_prs_BOILER_BERTH
                          )}
                          fullWidth
                          helperText={
                            formik.touched.EF_gr_prs_BOILER_BERTH &&
                            formik.errors.EF_gr_prs_BOILER_BERTH
                          }
                          label="EF Gr Prs Boiler Berth"
                          name="EF_gr_prs_BOILER_BERTH"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.EF_gr_prs_BOILER_BERTH}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.EF_gr_prs_AE_MAN &&
                              formik.errors.EF_gr_prs_AE_MAN
                          )}
                          fullWidth
                          helperText={
                            formik.touched.EF_gr_prs_AE_MAN &&
                            formik.errors.EF_gr_prs_AE_MAN
                          }
                          label="EF Gr Prs AE MAN"
                          name="EF_gr_prs_AE_MAN"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.EF_gr_prs_AE_MAN}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.EF_gr_prs_AE_ANCHOR &&
                              formik.errors.EF_gr_prs_AE_ANCHOR
                          )}
                          fullWidth
                          helperText={
                            formik.touched.EF_gr_prs_AE_ANCHOR &&
                            formik.errors.EF_gr_prs_AE_ANCHOR
                          }
                          label="EF Gr Prs AE ANCHOR"
                          name="EF_gr_prs_AE_ANCHOR"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.EF_gr_prs_AE_ANCHOR}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.NO_OF_ENGINE_active &&
                              formik.errors.NO_OF_ENGINE_active
                          )}
                          fullWidth
                          helperText={
                            formik.touched.NO_OF_ENGINE_active &&
                            formik.errors.NO_OF_ENGINE_active
                          }
                          label="NO. OF ENGINE Active"
                          name="NO_OF_ENGINE_active"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.NO_OF_ENGINE_active}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.CEF_type && formik.errors.CEF_type
                          )}
                          fullWidth
                          helperText={
                            formik.touched.CEF_type && formik.errors.CEF_type
                          }
                          label="CEF Type"
                          name="CEF_type"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.CEF_type}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.Loadfactor_ds &&
                              formik.errors.Loadfactor_ds
                          )}
                          fullWidth
                          helperText={
                            formik.touched.Loadfactor_ds &&
                            formik.errors.Loadfactor_ds
                          }
                          label="Loadfactor Ds"
                          name="Loadfactor_ds"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.Loadfactor_ds}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.Speed_used &&
                              formik.errors.Speed_used
                          )}
                          fullWidth
                          helperText={
                            formik.touched.Speed_used &&
                            formik.errors.Speed_used
                          }
                          label="Speed Used"
                          name="Speed_used"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.Speed_used}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.CRS_min && formik.errors.CRS_min
                          )}
                          fullWidth
                          helperText={
                            formik.touched.CRS_min && formik.errors.CRS_min
                          }
                          label="CRS Min"
                          name="CRS_min"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.CRS_min}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.CRS_max && formik.errors.CRS_max
                          )}
                          fullWidth
                          helperText={
                            formik.touched.CRS_max && formik.errors.CRS_max
                          }
                          label="CRS Max"
                          name="CRS_max"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.CRS_max}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.Funnel_heigth &&
                              formik.errors.Funnel_heigth
                          )}
                          fullWidth
                          helperText={
                            formik.touched.Funnel_heigth &&
                            formik.errors.Funnel_heigth
                          }
                          label="Funnel Heigth"
                          name="Funnel_heigth"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.Funnel_heigth}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.FO_consumption_factor &&
                              formik.errors.FO_consumption_factor
                          )}
                          fullWidth
                          helperText={
                            formik.touched.FO_consumption_factor &&
                            formik.errors.FO_consumption_factor
                          }
                          label="FO Consumption Factor"
                          name="FO_consumption_factor"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.FO_consumption_factor}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.coxemissionFactor &&
                              formik.errors.coxemissionFactor
                          )}
                          fullWidth
                          helperText={
                            formik.touched.coxemissionFactor &&
                            formik.errors.coxemissionFactor
                          }
                          label="COx Emission Factor"
                          name="coxemissionFactor"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.coxemissionFactor}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.soxEmissionFactor &&
                              formik.errors.soxEmissionFactor
                          )}
                          fullWidth
                          helperText={
                            formik.touched.soxEmissionFactor &&
                            formik.errors.soxEmissionFactor
                          }
                          label="SOx Emission Factor"
                          name="soxEmissionFactor"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.soxEmissionFactor}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.TEU && formik.errors.TEU
                          )}
                          fullWidth
                          helperText={formik.touched.TEU && formik.errors.TEU}
                          label="TEU"
                          name="TEU"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.TEU}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.CRUDE && formik.errors.CRUDE
                          )}
                          fullWidth
                          helperText={
                            formik.touched.CRUDE && formik.errors.CRUDE
                          }
                          label="CRUDE"
                          name="CRUDE"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.CRUDE}
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <TextField
                          error={Boolean(
                            formik.touched.GAS && formik.errors.GAS
                          )}
                          fullWidth
                          helperText={formik.touched.GAS && formik.errors.GAS}
                          label="GAS"
                          name="GAS"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          // required
                          value={formik.values.GAS}
                        />
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 3 }} />
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        SOFC Mapping
                      </Typography>
                    </Grid>

                    {formik.values.SOFC_map_array.map((sofcObject, index) => (
                      <Grid container spacing={2} key={index} mt={2}>
                        <Grid item md={3} xs={12}>
                          <TextField
                            error={Boolean(
                              formik.touched.SOFC_map_array &&
                                formik.touched.SOFC_map_array[index]?.speed &&
                                formik.errors.SOFC_map_array &&
                                formik.errors.SOFC_map_array[index]?.speed &&
                                formik.errors.SOFC_map_array[index]?.speed !==
                                  "Speed must be a number"
                            )}
                            fullWidth
                            helperText={
                              formik.touched.SOFC_map_array &&
                              formik.touched.SOFC_map_array[index]?.speed &&
                              formik.errors.SOFC_map_array &&
                              formik.errors.SOFC_map_array[index]?.speed &&
                              formik.errors.SOFC_map_array[index]?.speed !==
                                "Speed must be a number"
                                ? formik.errors.SOFC_map_array[index]?.speed
                                : ""
                            }
                            label="Speed"
                            name={`SOFC_map_array[${index}].speed`}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={
                              formik.values.SOFC_map_array[index]?.speed || ""
                            }
                          />
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <TextField
                            error={Boolean(
                              formik.touched.SOFC_map_array &&
                                formik.touched.SOFC_map_array[index]
                                  ?.loadFactor &&
                                formik.errors.SOFC_map_array &&
                                formik.errors.SOFC_map_array[index]
                                  ?.loadFactor &&
                                formik.errors.SOFC_map_array[index]
                                  ?.loadFactor !==
                                  "Load Factor must be a number"
                            )}
                            fullWidth
                            helperText={
                              formik.touched.SOFC_map_array &&
                              formik.touched.SOFC_map_array[index]
                                ?.loadFactor &&
                              formik.errors.SOFC_map_array &&
                              formik.errors.SOFC_map_array[index]?.loadFactor &&
                              formik.errors.SOFC_map_array[index]
                                ?.loadFactor !== "Load Factor must be a number"
                                ? formik.errors.SOFC_map_array[index]
                                    ?.loadFactor
                                : ""
                            }
                            label="Load Factor"
                            name={`SOFC_map_array[${index}].loadFactor`}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={
                              formik.values.SOFC_map_array[index]?.loadFactor ||
                              ""
                            }
                          />
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <TextField
                            error={Boolean(
                              formik.touched.SOFC_map_array &&
                                formik.touched.SOFC_map_array[index]?.sofc &&
                                formik.errors.SOFC_map_array &&
                                formik.errors.SOFC_map_array[index]?.sofc &&
                                formik.errors.SOFC_map_array[index]?.sofc !==
                                  "SOFC must be a number"
                            )}
                            fullWidth
                            helperText={
                              formik.touched.SOFC_map_array &&
                              formik.touched.SOFC_map_array[index]?.sofc &&
                              formik.errors.SOFC_map_array &&
                              formik.errors.SOFC_map_array[index]?.sofc &&
                              formik.errors.SOFC_map_array[index]?.sofc !==
                                "SOFC must be a number"
                                ? formik.errors.SOFC_map_array[index]?.sofc
                                : ""
                            }
                            label="SOFC"
                            name={`SOFC_map_array[${index}].sofc`}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={
                              formik.values.SOFC_map_array[index]?.sofc || ""
                            }
                          />
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <Tooltip title="Remove" arrow>
                            <IconButton onClick={() => removeSOFCObject(index)}>
                              <RemoveCircleOutlineIcon
                                sx={{ color: pink[500] }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    ))}

                    <Grid item xs={12} mt={1}>
                      <Tooltip title="Add" arrow>
                        <Button onClick={addSOFCObject}>
                          <AddCircleOutlineIcon />
                        </Button>
                      </Tooltip>
                    </Grid>

                    <Divider sx={{ my: 3 }} />
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

                    <NextLink href="/administration/transports" passHref>
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

EditTransport.getLayout = (page: any) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default EditTransport;
