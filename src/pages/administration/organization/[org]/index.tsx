import { useCallback, useState, useEffect, useContext } from "react";
import type { ChangeEvent } from "react";
import type { NextPage } from "next";
import NextLink from "next/link";
import Head from "next/head";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import { customerApi } from "../../../../__fake-api__/customer-api";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { useMounted } from "../../../../hooks/use-mounted";
import { ChevronDown as ChevronDownIcon } from "../../../../icons/chevron-down";
import { PencilAlt as PencilAltIcon } from "../../../../icons/pencil-alt";
import { gtm } from "../../../../lib/gtm";
import type { Customer } from "../../../../types/customer";
import { getInitials } from "../../../../utils/get-initials";
import { useRouter } from "next/router";
import { AuthContext } from "src/contexts/firebase-auth-context";
import { OrganizationBasicDetails } from "src/components/detail/organizationDetails";

const tabs = [
  { label: "Details", value: "details" },
  // { label: 'Invoices', value: 'invoices' },
  // { label: 'Logs', value: 'logs' }
];

const OrganizationDetails: NextPage = () => {
  const isMounted = useMounted();
  const router = useRouter();
  const { org } = router.query;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("details");
  const { authToken } = useContext(AuthContext);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getOrganization = useCallback(async () => {
    try {
      if (!authToken) {
        console.error("Authorization token is missing.");
        return;
      }
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}organizations/getOrg/${org}`;

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

      const data = await response.json();

      if (isMounted()) {
        setData(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [org, authToken, isMounted]);

  useEffect(() => {
    getOrganization();
  }, [getOrganization]);

  const handleTabsChange = (event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };

  if (!data) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Organization Details</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <div>
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
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid
                item
                sx={{
                  alignItems: "center",
                  display: "flex",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      fontSize: "1.5rem",
                      marginRight: "10px",
                    }}
                  >
                    {data?.name.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <div>
                    <Typography variant="h4">{data?.name.toUpperCase() || ""}</Typography>
                  </div>
                </div>
              </Grid>
            </Grid>
            <Divider />
            <Box sx={{ mt: 3 }}>
              {currentTab === "details" && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <OrganizationBasicDetails
                      email={data?.owner_id?.email || " "}
                      name={data?.ownerName || ""}
                    />
                  </Grid>

                  {/* <Grid
                  item
                  xs={12}
                >
                  <CustomerPayment />
                </Grid> */}
                  {/* <Grid
                  item
                  xs={12}
                >
                  <CustomerEmailsSummary />
                </Grid> */}
                  {/* <Grid
                  item
                  xs={12}
                >
                  <CustomerDataManagement />
                </Grid> */}
                </Grid>
              )}
              {/* {currentTab === 'invoices' && <CustomerInvoices />}
            {currentTab === 'logs' && <CustomerLogs />} */}
            </Box>
            {/* <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              sx={{ mt: 3 }}
              textColor="primary"
              value={currentTab}
              variant="scrollable"
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                />
              ))}
            </Tabs> */}
          </div>
        </Container>
      </Box>
    </>
  );
};

OrganizationDetails.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default OrganizationDetails;
