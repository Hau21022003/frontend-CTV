import {
  Alert,
  Box,
  Checkbox,
  IconButton,
  Paper,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import EditIcon from "@mui/icons-material/Edit";
import apiService from "@/app/untils/api";
import { useAppContext } from "@/app/hooks/AppContext";
import EditPopUp from "./edit-dialog";
import DeleteDialog from "../../department/components/dialog/delete-dialog";
import { useAmp } from "next/amp";
import { useAuth } from "@/app/hooks/AuthContext";
interface Row {
  id: number;
  code: string;
  name: string;
  permissionIds?: number[];
}
interface Pagination {
  totalItemInPage?: number;
  totalItems: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ApiResponse {
  data: {
    items: Row[];
    pagination: Pagination;
  };
}

interface RoleTableProps {
  refresh: boolean;
}

export default function RoleTable({ refresh }: RoleTableProps) {
  const {isEditing, user} = useAuth();
  const { refreshAddNew, setRefreshAddNew, refreshDelete, setDeleteRefresh } =
    useAppContext();
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const { province, dpmLv1, dpmLv2, dpmLv3, dpmLv4, choosed, setIsLoading } =
    useAppContext();

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const [openEdit, setOpenEdit] = useState(false);
  const [id, setId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const [permissions, setPermissions] = useState<any[]>([]);
  useEffect(() => {
    const storedPermissions = localStorage.getItem("permissions");
    if (storedPermissions) {
      const parsedPermissions = JSON.parse(storedPermissions);
      if (Array.isArray(parsedPermissions)) {
        setPermissions(parsedPermissions);
      } else if (typeof parsedPermissions === "object") {
        const permissionsArray = Object.entries(parsedPermissions).map(
          ([subject, permission]) => ({
            subject,
            permission,
          })
        );
        setPermissions(permissionsArray);
      } else {
        console.error(
          "Permissions are not in the expected array or object format:",
          parsedPermissions
        );
        setPermissions([]);
      }
    }
  }, [isEditing]);

  const hasPermission = (subject: string, action: string) => {
    const permission = permissions.find((perm) => perm.subject === subject);
    return permission ? permission.permission[action] : false;
  };

  useEffect(() => {
    setTotalRows(0);
  }, [refreshAddNew]);
  ////

  useEffect(() => {
    fetchRows();
  }, [
    page,
    rowsPerPage,
    province?.key,
    dpmLv1?.key,
    dpmLv2?.key,
    dpmLv3?.key,
    dpmLv4?.key,
    choosed,
    refresh,
    name,
    code,
  ]);

  const fetchRows = async () => {
    if (!province?.key || !choosed.key) {
      setRows([]);
      return;
    }

    try {
      setIsLoading(true);

      const searchParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      if (code && code !== "") searchParams.append("code", code);
      if (name && name != "") searchParams.append("name", name);
      if (choosed.key) searchParams.append("departmentId", choosed.key);

      const endpoint = `role`;
      const response = await apiService.get<ApiResponse>(
        `${endpoint}?${searchParams.toString()}`
      );
      const data = response.data;


      if (data.data.items) {
        setRows(data.data.items);
        setTotalRows(data.data.pagination.totalItems);
      }
    } catch (error) {
      console.error("Error fetching rows:", error);
      setRows([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleExport = async () => {
    if (rows.length === 0) {
      setSnackbarMessage("Không có dữ liệu để xuất.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }
    if (
      !province.key &&
      !dpmLv1.key &&
      !dpmLv2.key &&
      !dpmLv3.key &&
      !dpmLv4.key
    ) {
      setSnackbarMessage("Không thể xuất dữ liệu.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }
    try {
      setIsLoading(true);

      const searchParams = new URLSearchParams({});
      if (choosed.key) searchParams.append("departmentId", choosed.key);
      if (code && code !== "") searchParams.append("code", code);
      if (name !== null && name !== "") searchParams.append("name", name);

      let endpoint = `role/export-data?${searchParams.toString()}`;
      const response = await apiService.get(endpoint, { responseType: "blob" });

      if (response) {
        const url = window.URL.createObjectURL(
          new Blob([response.data as Blob])
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "roles.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Export failed:", error);
      setSnackbarMessage("Không thể xuất dữ liệu.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (rows.length > 0) {
      if (event.target.checked) {
        const newSelected = rows.map((row) => row.id);
        setSelected(newSelected);
        if (hasPermission("role", "delete")) {
          handleOpenDelete();
        }
        handleOpenDelete();
        return;
      }
      setSelected([]);
    } else {
      event.target.checked;
    }
  };

  const handleCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    event.stopPropagation();

    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);

    if (newSelected.length > 0 && hasPermission("role", "delete")) {
      handleOpenDelete();
    }
    if (newSelected.length > 0) {
      handleOpenDelete();
    }
  };
  const handleOpenEdit = (row: Row) => {
    setSelectedRow(row);
    setId(row.id.toString());
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    fetchRows();
  };

  const handleCloseDelete = () => {
    if (selected.length !== 0) {
      setSelected([]);
    }
    setOpenDelete(false);
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
  };
  useEffect(() => {
    if (selected.length === 0) {
      handleCloseDelete();
    }
  }, [selected]);

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      let response;
      const queryString = new URLSearchParams();
      selected.forEach((id) => queryString.append("ids", id.toString()));
      response = await apiService.delete(
        `/role/delete?${queryString.toString()}`
      );
      if (response) {
        if (response.status === 200) {
          setSnackbarSeverity("success");
          setSnackbarMessage(response.data?.message);
          setDeleteRefresh(!refreshDelete);
        }
      }
      setOpenSnackbar(true);
      setSelected([]);
      fetchRows();
    } catch (error: any) {
      if (error?.status === 400) {
        setSelected([]);
        setSnackbarSeverity("error");
        setSnackbarMessage("Không thể xóa đơn vị này.");
      } else if (error?.status === 403) {
        setSnackbarMessage(error.response.data.message);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } else {
        setSnackbarSeverity("error");
        setSnackbarMessage("Error!");
      }

      console.error("Failed to delete row: ", error.status);
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  useEffect(() => {
    setCode("");
    setName("");
  }, [province, dpmLv1, dpmLv2, dpmLv3, dpmLv4, choosed]);
  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        boxShadow: 3,
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <TableContainer sx={{ flexGrow: 1 }}>
          <Table aria-label="enhanced table" size="small">
            <TableHead
              sx={{
                backgroundColor: "#F4F6F8",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              <TableRow>
                {(hasPermission("role", "delete") ||
                  hasPermission("role", "update")) && (
                  <TableCell sx={{ border: "none", width: "7%",  alignItems: "center"}}>
                    {hasPermission("role", "delete") && (
                      <Checkbox
                        indeterminate={
                          selected.length > 0 &&
                          rows.length > 0 &&
                          selected.length < rows.length
                        }
                        checked={
                          rows.length > 0 && selected.length === rows.length
                        }
                        onChange={handleSelectAllClick}
                        sx={{
                          marginX: "12px",
                          height: "0px",
                          width: "0px",
                          background: "white",
                          color: "#637381",
                          "&.Mui-checked": {
                            color: "#2962FF",
                          },
                          "&.MuiCheckbox-indeterminate": {
                            color: "#2962FF",
                          },
                        }}
                        disabled={!hasPermission("role", "delete")}
                      />
                    )}
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    fontWeight: 700,
                    border: "none",
                    width: "33%",
                    paddingX: "8px",
                  }}
                >
                  Mã vai trò
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    border: "none",
                    width: "60%",
                    paddingX: "8px",
                  }}
                >
                  Tên vai trò
                </TableCell>
              </TableRow>
              <TableRow>
                {(hasPermission("role", "delete") ||
                  hasPermission("role", "update")) && (
                  <TableCell sx={{ border: "none" }}></TableCell>
                )}
                <TableCell sx={{ border: "none", paddingX: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    sx={{ background: "white", borderRadius: "10px" }}
                    value={code}
                    onChange={handleCodeChange}
                  />
                </TableCell>
                <TableCell sx={{ border: "none", paddingX: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    sx={{ background: "white", borderRadius: "10px" }}
                    value={name}
                    onChange={handleNameChange}
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    sx={{ border: "none", padding: "14px" }}
                    colSpan={3}
                    align="center"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const isItemSelected = isSelected(row.id);
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ paddingY: "14px" }} // Add padding to the row
                    >
                      {(hasPermission("role", "delete") ||
                        hasPermission("role", "update")) && (
                        <TableCell padding="checkbox" sx={{ paddingY: "14px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              fontWeight: 700,
                            }}
                          >
                            {hasPermission("role", "delete") && (
                              <Checkbox
                                checked={isItemSelected}
                                onClick={(event) =>
                                  handleCheckboxClick(event, row.id)
                                }
                                sx={{
                                  color: "#637381",
                                  "&.Mui-checked": { color: "#2962FF" },
                                  "&.MuiCheckbox-indeterminate": {
                                    color: "#2962FF",
                                  },
                                }}
                                disabled={!hasPermission("role", "delete")}
                              />
                            )}

                            <span>
                              {hasPermission("role", "update") && (
                                <IconButton
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleOpenEdit(row);
                                  }}
                                  disabled={!hasPermission("role", "update")}
                                  sx={{
                                    color: hasPermission("role", "update")
                                      ? "#637381"
                                      : "#E5E7EB",
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              )}
                            </span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell sx={{ paddingY: "14px" }}>
                        {row.code}
                      </TableCell>
                      <TableCell sx={{ paddingY: "14px" }}>
                        {row.name}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ paddingX: "8px" }}
      >
        <IconButton
          sx={{ color: "#919eab", ml: 1, gap: 1, fontSize: 14 }}
          onClick={handleExport}
        >
          <FileDownloadOutlinedIcon />
          Export Data
        </IconButton>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      <EditPopUp open={openEdit} onClose={handleCloseEdit} roleId={id || ""} />
      <DeleteDialog
        open={openDelete}
        handleClose={handleCloseDelete}
        quantity={selected.length}
        onDelete={handleDelete}
      />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
