import { useCallback, useState, useEffect, useContext } from 'react';
import type { ChangeEvent } from 'react';
import type { NextPage } from 'next';
import NextLink from 'next/link';
import Head from 'next/head';
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
  Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AuthGuard } from '../../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../../components/dashboard/dashboard-layout';
import { useMounted } from '../../../../hooks/use-mounted';
import { ChevronDown as ChevronDownIcon } from '../../../../icons/chevron-down';
import { PencilAlt as PencilAltIcon } from '../../../../icons/pencil-alt';
import { gtm } from '../../../../lib/gtm';
import type { Customer } from '../../../../types/customer';
import { getInitials } from '../../../../utils/get-initials';
import { useRouter } from 'next/router';
import { AuthContext } from 'src/contexts/firebase-auth-context';
import { OrganizationBasicDetails } from 'src/components/detail/organizationDetails';
import { RootState, useSelector } from 'src/store';
import { UserBasicDetails } from 'src/components/detail/userDetails';

const tabs = [
  { label: 'Details', value: 'details' },
  // { label: 'Invoices', value: 'invoices' },
  // { label: 'Logs', value: 'logs' }
];

const UserDetails: NextPage = () => {
  const isMounted = useMounted();
  const router = useRouter();
  const { userId } = router.query;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('details');
  const { authToken } = useContext(AuthContext);
  const isOrganizationName = useSelector((state: RootState) => state.isOrganization.isOrganizationName);
  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);


  const getUser = useCallback(async () => {
    try {
      if (!authToken) {
        console.error('Authorization token is missing.');
        return;
      }
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/${userId}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch organization data: ${response.statusText}`);
      }

      const data = await response.json();

      if (isMounted()) {
        setData(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [userId, authToken, isMounted]);

  useEffect(
    () => { 
      getUser()
    },
    
    [getUser]
  );

  const handleTabsChange = (event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };


  if (!data) {
    return null;
  }
  let dynamicPath = `/${isOrganizationName}/users`;
  return (
    <>
      <Head>
        <title>
          User Details
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="md">
          <div>
            <Box sx={{ mb: 4 }}>
              <NextLink
                href={dynamicPath}
                passHref
              >
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: 'center',
                    display: 'flex'
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="subtitle2">
                    Back
                  </Typography>
                </Link>
              </NextLink>
            </Box>
            <Grid
              container
              justifyContent="space-between"
              spacing={3}
            >
              <Grid
                item
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  overflow: 'hidden'
                }}
              >
                <div>
                  <Typography variant="h4">
                    {data.email}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="subtitle2">
                    Organization name:
                    </Typography>
                    <Chip
                      label={data?.organization?.name || ""}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </div>
              </Grid>
            </Grid>
            <Divider />
          <Box sx={{ mt: 3 }}>
            {currentTab === 'details' && (
              <Grid
                container
                spacing={3}
              >
                <Grid
                  item
                  xs={12}
                >
                  <UserBasicDetails
                      email={data?.email || " " }
                      name={data?.name || " " }
                  />
                </Grid>
              </Grid>
            )}
           
          </Box>
          </div>
  
        </Container>
      </Box>
    </>
  );
};

UserDetails.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default UserDetails;

