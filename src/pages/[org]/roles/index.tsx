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
import { useMounted } from "../../../hooks/use-mounted";
import { Download as DownloadIcon } from "../../../icons/download";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Search as SearchIcon } from "../../../icons/search";
import { Upload as UploadIcon } from "../../../icons/upload";
import { gtm } from "../../../lib/gtm";
import type { Customer } from "../../../types/customer";
import { AuthContext } from "../../../contexts/firebase-auth-context";
import { AnyIfEmpty, useSelector } from "react-redux";
import { OrganizationListTable } from "src/components/Tables/organization";
import { RolesListTable } from "src/components/Tables/roles";
import { RootState } from "src/store";
import LockIcon from '@mui/icons-material/Lock';
interface Filters {
  query?: string;
  hasAcceptedMarketing?: boolean;
  isProspect?: boolean;
  isReturning?: boolean;
}

type Sort = "updatedAt|desc" | "updatedAt|asc" | "orders|desc" | "orders|asc";

interface SortOption {
  value: Sort;
  label: string;
}

const sortOptions: SortOption[] = [
  {
    label: "Last update (newest)",
    value: "updatedAt|desc",
  },
  {
    label: "Last update (oldest)",
    value: "updatedAt|asc",
  },
  {
    label: "Total orders (highest)",
    value: "orders|desc",
  },
  {
    label: "Total orders (lowest)",
    value: "orders|asc",
  },
];

const applyFilters = (customers: Customer[], filters: Filters): Customer[] =>
  customers.filter((customer) => {
    if (filters.query) {
      let queryMatched = false;
      const properties = ["name"];

      properties.forEach((property) => {
        if (
          customer[property].toLowerCase().includes(filters.query.toLowerCase())
        ) {
          queryMatched = true;
        }
      });

      if (!queryMatched) {
        return false;
      }
    }

    if (filters.hasAcceptedMarketing && !customer.hasAcceptedMarketing) {
      return false;
    }

    if (filters.isProspect && !customer.isProspect) {
      return false;
    }

    if (filters.isReturning && !customer.isReturning) {
      return false;
    }

    return true;
  });

const descendingComparator = (
  a: Customer,
  b: Customer,
  orderBy: string
): number => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }

  if (b[orderBy] > a[orderBy]) {
    return 1;
  }

  return 0;
};

const getComparator = (order: "asc" | "desc", orderBy: string) =>
  order === "desc"
    ? (a: Customer, b: Customer) => descendingComparator(a, b, orderBy)
    : (a: Customer, b: Customer) => -descendingComparator(a, b, orderBy);

const applySort = (customers: Customer[], sort: Sort): Customer[] => {
  const [orderBy, order] = sort.split("|") as [string, "asc" | "desc"];
  const comparator = getComparator(order, orderBy);
  const stabilizedThis = customers.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    // @ts-ignore
    const newOrder = comparator(a[0], b[0]);

    if (newOrder !== 0) {
      return newOrder;
    }

    // @ts-ignore
    return a[1] - b[1];
  });

  // @ts-ignore
  return stabilizedThis.map((el) => el[0]);
};

const applyPagination = (
  customers: Customer[],
  page: number,
  rowsPerPage: number
): Customer[] =>
  customers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

const RolesList: NextPage = () => {
  const isMounted = useMounted();
  const queryRef = useRef<HTMLInputElement | null>(null);
  const [data, setData] = useState<any>([]);
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const { authToken } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );
  const userPermissions = useSelector(
    (state: RootState) => state.isUserPermissionReducer.permissions
  );

  const [filters, setFilters] = useState<Filters>({
    query: "",
    hasAcceptedMarketing: null,
    isProspect: null,
    isReturning: null,
  });

  let dynamicPath = `/${isOrganizationName}/roles/create`;

  const hasReadPermission =
    userPermissions &&
    (userPermissions.role_management === "rw" ||
      userPermissions.role_management === "wr" ||
      userPermissions.role_management === "r");

  const hasWritePermission =
    userPermissions &&
    (userPermissions.role_management === "rw" ||
      userPermissions.role_management === "wr" ||
      userPermissions.role_management === "w");

  const shouldShowTable = hasReadPermission;

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getRole = useCallback(async () => {
    try {
      if (!authToken) {
        console.error("Authorization token is missing.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}roles/getAllRoles`;

      const response = await fetch(apiUrl, {
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
        setData(data);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, authToken]);

  useEffect(() => {
    if (shouldShowTable) {
      getRole();
    }
  }, [getRole, shouldShowTable]);

  const handleTabsChange = (event: ChangeEvent<{}>, value: string): void => {
    const updatedFilters = {
      ...filters,
      hasAcceptedMarketing: null,
      isProspect: null,
      isReturning: null,
    };

    if (value !== "all") {
      updatedFilters[value] = true;
    }

    setFilters(updatedFilters);
    setCurrentTab(value);
  };

  const handleQueryChange = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFilters((prevState) => ({
      ...prevState,
      query: queryRef.current?.value,
    }));
  };

  const handleSortChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSort(event.target.value as Sort);
  };

  const handlePageChange = (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  // Usually query is done on backend with indexing solutions
  const filteredCustomers = applyFilters(data, filters);
  const sortedCustomers = applySort(filteredCustomers, sort);
  const paginatedCustomers = applyPagination(
    sortedCustomers,
    page,
    rowsPerPage
  );

  return (
    <>
      <Head>
        <title>Roles</title>
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
                  <Typography variant="h4">Roles Details</Typography>
                </Grid>
                <Grid item>
                  {hasWritePermission && (
                    <Box sx={{ mb: 4 }}>
                      <Grid
                        container
                        justifyContent="space-between"
                        spacing={3}
                      >
              
                        <Grid item>
                          <NextLink href={dynamicPath} passHref>
                            <Button
                              startIcon={<PlusIcon fontSize="small" />}
                              variant="contained"
                            >
                              Add
                            </Button>
                          </NextLink>
                        </Grid>
                      </Grid>
                      <Box
                        sx={{
                          m: -1,
                          mt: 3,
                        }}
                      ></Box>
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
                }}
                placeholder="Search Roles"
              />
            </Box>
          </Box>
          <RolesListTable
            data={paginatedCustomers}
            dataCount={filteredCustomers.length}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPage={rowsPerPage}
            page={page}
            isLoading={isLoading}
          />
        </Card>
          )}
        </Container>

      </Box>
    </>
  );
};

RolesList.getLayout = function (page) {
  return (
    <AuthGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
  );
};

export default RolesList;
