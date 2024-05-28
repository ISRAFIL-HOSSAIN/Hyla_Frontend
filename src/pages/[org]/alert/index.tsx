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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { Plus as PlusIcon } from "../../../icons/plus";
import { Search as SearchIcon } from "../../../icons/search";
import { gtm } from "../../../lib/gtm";
import type { Customer } from "../../../types/customer";
import { AuthContext } from "../../../contexts/firebase-auth-context";
import { AnyIfEmpty, useSelector } from "react-redux";
import { OrganizationListTable } from "src/components/Tables/organization";
import ClearIcon from "@mui/icons-material/Clear";
import { setDate } from "date-fns";
import { TransportListTable } from "src/components/Tables/transportTabel";
import { AlertListTable } from "src/components/Tables/alertTabel";
import { RootState } from "src/store";
import { Toaster, toast } from "react-hot-toast";
interface Filters {
  query?: string;
  hasAcceptedMarketing?: boolean;
  isProspect?: boolean;
  isReturning?: boolean;
}

const AlertList: NextPage = () => {
  const isMounted = useMounted();
  const queryRef = useRef<HTMLInputElement | null>(null);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState<number>(1);
  const [l, setL] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const { authToken } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [openAlertRemove, setOpenAlertRemove] = useState(false);
  const [removeId, setRemoveId] = useState("");
  const [filters, setFilters] = useState<Filters>({
    query: "",
    hasAcceptedMarketing: null,
    isProspect: null,
    isReturning: null,
  });

  const isOrganizationName = useSelector(
    (state: RootState) => state.isOrganization.isOrganizationName
  );

  let dynamicPath = `/${isOrganizationName}/alert/create`;

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getData = useCallback(async () => {
    try {
      if (!authToken) {
        console.error("Authorization token is missing.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}alerts/getAll`;

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
        setData(data.data);
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

  
  const RemoveDialog = ({ open, handleClose, handleRemove }) => {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="remove-dialog-title"
      >
        <DialogTitle id="remove-dialog-title">Confirm Removal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemove} color="primary" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const openRemoveDialog = async (id: any) => {
    setOpenAlertRemove(true);
    setRemoveId(id);
  };
  const closeRemoveDialog = () => {
    setOpenAlertRemove(false);
  };

  const handleRemove = async () => {
    try {
      setIsLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}alerts/delete`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ removeId }),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success === true) {
          toast.success(responseData.message);
          getData()
          closeRemoveDialog();
        } else {
          toast.error(responseData.message);
          closeRemoveDialog();
        }
      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong. Please retry`);
    }
  };

  return (
    <>
      <Head>
        <title>Alerts</title>
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
                <Typography variant="h4">Alert Details</Typography>
              </Grid>
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
                  placeholder="Search alert"
                />
              </Box>
            </Box>
            <AlertListTable
              data={data}
              dataCount={l}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPage={rowsPerPage}
              page={page - 1}
              isLoading={isLoading}
              openRemoveDialog={openRemoveDialog}
            />
          </Card>
        </Container>
      </Box>
      <RemoveDialog
        open={openAlertRemove}
        handleClose={closeRemoveDialog}
        handleRemove={handleRemove}
      />
    </>
  );
};

AlertList.getLayout = function (page) {
  return (
    <AuthGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
  );
  
};

export default AlertList;
