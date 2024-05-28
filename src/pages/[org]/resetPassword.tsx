// UpdatePasswordForm.tsx

import React, { useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Button,
  TextField,
  Box,
  FormHelperText,
  Typography,
  Container,
} from "@mui/material";
import { useAuth } from "../../hooks/use-auth";
import { toast } from "react-hot-toast";
import { RootState, useSelector } from "src/store";
import { AuthGuard } from "src/components/authentication/auth-guard";
import { DashboardLayout } from "src/components/dashboard/dashboard-layout";
import Head from "next/head";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const UpdatePasswordForm = () => {
  const { updatePassword } = useAuth() as any;
  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dynamicPath = `/${isOrganizationName}/resetPassword`;
  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      submit: null,
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required("Old Password is required"),
      newPassword: Yup.string().required("New Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
        .required("Confirm Password is required"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await updatePassword(values.oldPassword, values.newPassword);
        formik.resetForm();
      } catch (err) {
        console.error(err);
      }
    },
  });

  return (
    <div>
      <Head>
        <title>Change Password</title>
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
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
            Change Password
            </Typography>
            <form noValidate onSubmit={formik.handleSubmit}>
              <TextField
                error={Boolean(
                  formik.touched.oldPassword && formik.errors.oldPassword
                )}
                fullWidth
                helperText={
                  formik.touched.oldPassword && formik.errors.oldPassword
                }
                label="Old Password"
                margin="normal"
                name="oldPassword"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.oldPassword}
                type={showOldPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        edge="end"
                      >
                        {showOldPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                error={Boolean(
                  formik.touched.newPassword && formik.errors.newPassword
                )}
                fullWidth
                helperText={
                  formik.touched.newPassword && formik.errors.newPassword
                }
                label="New Password"
                margin="normal"
                name="newPassword"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                // type="password"
                value={formik.values.newPassword}
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                error={Boolean(
                  formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                )}
                fullWidth
                helperText={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                }
                label="Confirm Password"
                margin="normal"
                name="confirmPassword"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                // type="password"
                value={formik.values.confirmPassword}
                type={showConfirmPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {formik.errors.submit && (
                <Box mt={3}>
                  <FormHelperText error>{formik.errors.submit}</FormHelperText>
                </Box>
              )}
              <Box mt={2}>
                <Button
                  disabled={formik.isSubmitting}
                  type="submit"
                  sx={{ m: 1 }}
                  variant="contained"
                >
                  Change Password
                </Button>
              </Box>
            </form>
          </Box>
        </Container>
      </Box>
    </div>
  );
};

UpdatePasswordForm.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default UpdatePasswordForm;
