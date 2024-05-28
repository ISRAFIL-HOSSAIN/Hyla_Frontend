import {
  useState,
  useEffect,
  useCallback,
  FormEvent,
  useRef,
  useContext,
} from "react";
import type { ChangeEvent, MouseEvent } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { Lock as LockIcon } from "@mui/icons-material";
import { useMounted } from "../../../hooks/use-mounted";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Search as SearchIcon } from "../../../icons/search";
import { gtm } from "../../../lib/gtm";
import { AuthContext } from "../../../contexts/firebase-auth-context";
import { useSelector } from "react-redux";
import { RootState } from "src/store";
import { UserPagination } from "src/components/Tables/userPaginaitonTabel";
import ClearIcon from "@mui/icons-material/Clear";
interface Filters {
  query?: string;
  hasAcceptedMarketing?: boolean;
  isProspect?: boolean;
  isReturning?: boolean;
}

const applyFilters = (data: any, filters: Filters): any =>
  data.filter((item: any) => {
    if (filters.query) {
      let queryMatched = false;
      const properties = ["name"];

      properties.forEach((property) => {
        if (
          data[property] &&
          data[property].toLowerCase().includes(filters.query.toLowerCase())
        ) {
          queryMatched = true;
        }
      });

      if (!queryMatched) {
        return false;
      }
    }

    if (filters.hasAcceptedMarketing && !item.hasAcceptedMarketing) {
      return false;
    }

    if (filters.isProspect && !item.isProspect) {
      return false;
    }

    if (filters.isReturning && !item.isReturning) {
      return false;
    }

    return true;
  });

const applyPagination = (data: any, page: number, rowsPerPage: number): any =>
  data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
const CustomerList: NextPage = () => {
  const isMounted = useMounted();
  const queryRef = useRef<HTMLInputElement | null>(null);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState<number>(1);
  const [l, setL] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const { authToken } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );
  const userPermissions = useSelector(
    (state: RootState) => state.isUserPermissionReducer.permissions
  );

  let dynamicPath = `/${isOrganizationName}/users/create`;

  const hasReadPermission =
    userPermissions &&
    (userPermissions.user_management === "rw" ||
      userPermissions.user_management === "wr" ||
      userPermissions.user_management === "r");

  const hasWritePermission =
    userPermissions &&
    (userPermissions.user_management === "rw" ||
      userPermissions.user_management === "wr" ||
      userPermissions.user_management === "w");

  const shouldShowTable = hasReadPermission;

  const [filters, setFilters] = useState<Filters>({
    query: "",
    hasAcceptedMarketing: null,
    isProspect: null,
    isReturning: null,
  });

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        setLoadingPermissions(false);
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        setLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, []);

  const getData = useCallback(async () => {
    try {
      if (!authToken) {
        console.error("Authorization token is missing.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/getAll`;
      const queryParams = new URLSearchParams();
      queryParams.append("name", filters.query);
      queryParams.append("page", page.toString());
      queryParams.append("pageSize", rowsPerPage.toString());

      const response = await fetch(`${apiUrl}?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch customer data: ${response.statusText}`
        );
      }

      const data = await response.json();
      if (isMounted()) {
        setData(data.data);
        setL(data.total);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, authToken, filters.query, page, rowsPerPage]);

  useEffect(() => {
    if (shouldShowTable) {
      getData();
    }
  }, [getData, shouldShowTable]);

  const handleQueryChange = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFilters((prevState) => ({
      ...prevState,
      query: queryRef.current?.value,
    }));
  };

  const handlePageChange = (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ): void => {
    setPage(newPage + 1);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleClearSearch = (): void => {
    setPage(page);
    setFilters({
      query: "",
      hasAcceptedMarketing: null,
      isProspect: null,
      isReturning: null,
    });
    if (queryRef.current) {
      queryRef.current.value = "";
    }
  };

  const filteredCustomers = applyFilters(data, filters);
  const paginatedCustomers = applyPagination(data, page, rowsPerPage);

  const handleDeleteSuccess = () => {
    getData();
  };

  if (loadingPermissions) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh', 
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Users</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          {hasReadPermission ? (
            <Box sx={{ mb: 4 }}>
              <Grid container justifyContent="space-between" spacing={3}>
                <Grid item>
                  <Typography variant="h4">User Details</Typography>
                </Grid>
                <Grid item>
                  {hasWritePermission && (
                    <Box sx={{ mb: 4 }}>
                      <NextLink href={dynamicPath} passHref>
                        <Button
                          startIcon={<PlusIcon fontSize="small" />}
                          variant="contained"
                        >
                          Add
                        </Button>
                      </NextLink>
                    </Box>
                  )}
                </Grid>
              </Grid>
              <Box
                sx={{
                  m: -1,
                  mt: 3,
                }}
              ></Box>
            </Box>
          ) : (
            <Box
              component="main"
              sx={{
                alignItems: "center",
                backgroundColor: "background.paper",
                display: "flex",
                flexGrow: 1,
                py: "80px",
              }}
            >
              <Container maxWidth="md">
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <LockIcon sx={{ fontSize: "5rem", color: "error.main" }} />
                  <Typography align="center" variant="h4" color="error" mt={2}>
                    Access Denied
                  </Typography>
                  <Typography
                    align="center"
                    color="textSecondary"
                    variant="subtitle1"
                    mt={2}
                  >
                    You do not have permission to access this page. Please
                    contact the administrator for assistance.
                  </Typography>
                </Box>
              </Container>
            </Box>
          )}
          {hasReadPermission && (
            <Card>
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  flexWrap: "wrap",
                  m: -1.5,
                  p: 3,
                }}
              >
                <Box
                  component="form"
                  onSubmit={handleQueryChange}
                  sx={{
                    flexGrow: 1,
                    m: 1.5,
                  }}
                >
                  <TextField
                    defaultValue=""
                    fullWidth
                    inputProps={{ ref: queryRef }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {filters.query && (
                          
                              <ClearIcon onClick={handleClearSearch} fontSize="small" />
                            
                          )}
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Search field"
                  />
                </Box>
              </Box>
              {shouldShowTable && (
                <UserPagination
                  data={data}
                  dataCount={l}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  rowsPerPage={rowsPerPage}
                  page={page - 1}
                  isLoading={isLoading}
                  onDeleteSuccess={handleDeleteSuccess}
                />
              )}
            </Card>
          )}
        </Container>
      </Box>
      ;
    </>
  );
};

CustomerList.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default CustomerList;
