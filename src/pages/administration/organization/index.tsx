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
  IconButton,
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
import { AnyIfEmpty } from "react-redux";
import { OrganizationListTable } from "src/components/Tables/organization";
import ClearIcon from "@mui/icons-material/Clear";

interface Filters {
  query?: string;
  hasAcceptedMarketing?: boolean;
  isProspect?: boolean;
  isReturning?: boolean;
}

const applyFilters = (customers: any, filters: Filters): any =>
  customers.filter((customer: any) => {
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

const applyPagination = (
  customers: any,
  page: number,
  rowsPerPage: number
): any => customers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

const OrganizationList: NextPage = () => {
  const isMounted = useMounted();
  const queryRef = useRef<HTMLInputElement | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState<number>(1);
  const [l, setL] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const { authToken } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    query: "",
    hasAcceptedMarketing: null,
    isProspect: null,
    isReturning: null,
  });

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getData = useCallback(async () => {
    try {
      if (!authToken) {
        console.error("Authorization token is missing.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}organizations/getAll`;

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
        throw new Error(`Failed to fetch org data: ${response.statusText}`);
      }

      const data = await response.json();

      if (isMounted()) {
        setCustomers(data.organizations);
        setL(data.totalCount);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, authToken, filters.query, page, rowsPerPage]);

  useEffect(() => {
    getData();
  }, [getData]);

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
    // console.log(page);
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

  const filteredCustomers = applyFilters(customers, filters);
  const paginatedCustomers = applyPagination(customers, page, rowsPerPage);

  return (
    <>
      <Head>
        <title>Organization</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">Organization Details</Typography>
              </Grid>
              <Grid item>
                <NextLink
                  href="/administration/organization/createOrganization"
                  passHref
                >
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
                          <IconButton onClick={handleClearSearch}>
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Search organization"
                />
              </Box>
            </Box>
            <OrganizationListTable
              data={customers}
              dataCount={l}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPage={rowsPerPage}
              page={page - 1}
              isLoading={isLoading}
            />
          </Card>
        </Container>
      </Box>
    </>
  );
};

OrganizationList.getLayout = function (page) {
  return (
    <AuthGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
  );
  
};

export default OrganizationList;
