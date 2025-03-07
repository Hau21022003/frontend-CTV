import { useAppContext } from "@/app/hooks/AppContext";
import {
  Alert,
  Box,
  Checkbox,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
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
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Switch from "@mui/material/Switch";
import apiService from "@/app/untils/api";
import AddNewPopup from "./dialog-popup";
import DeleteDialog from "../../department/components/dialog/delete-dialog";
import { ResetPasswordDialog } from "./reset-password";
import theme from "@/app/components/theme";
import { error } from "console";
import ProgressOverlay from "@/app/components/progress-Overlay";

interface Role {
  id: string;
  name: string;
}

interface Row {
  id: number;
  username: string;
  email: string;
  phone: string;
  password: StorageManager;
  fullname: string;
  active: boolean;
  role: Role;
  title: string;
}
interface Pagination {
  totalItemInPage?: number;
  totalItems: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
}
interface RoleApiResponse {
  data: Role[];
}

interface ApiResponse {
  data: {
    items: Row[];
    pagination: Pagination;
  };
  message: string;
}

type Filters = {
  fullname: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  title: string;
  active: string;
};

interface UserTableProps {
  refresh: boolean;
}
export default function UserTable({ refresh }: UserTableProps) {
  const {
    refreshAddNew,
    setRefreshAddNew,
    refreshDelete,
    setDeleteRefresh,
    setIsLoading,
    isLoading,
  } = useAppContext();
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const { province, dpmLv1, dpmLv2, dpmLv3, dpmLv4, choosed } = useAppContext();
  const [openEditAtId, setOpenEditAtId] = useState("");
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [id, setId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  // Fetch user permissions from localStorage
  const [permissions, setPermissions] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [forbidden, setForbidden] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    fullname: "",
    username: "",
    email: "",
    phone: "",
    role: "All",
    title: "",
    active: "All",
  });

  const handleOpenEdit = (row: Row) => {
    setSelectedRow(row);
    setId(row.id.toString());
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    // fetchRows();
  };
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
  }, []);

  const hasPermission = (subject: string, action: string) => {
    const permission = permissions.find((perm) => perm.subject === subject);
    return permission ? permission.permission[action] : false;
  };
  useEffect(() => {
    setIsLoading(true);
    fetchRows();
  }, [
    page,
    refresh,
    rowsPerPage,
    province?.key,
    dpmLv1?.key,
    dpmLv2?.key,
    dpmLv3?.key,
    dpmLv4?.key,
  ]);
  useEffect(() => {
    setFilters({
      fullname: "",
      username: "",
      email: "",
      phone: "",
      role: "All",
      title: "",
      active: "All",
    });
  }, [
    refresh,
    rowsPerPage,
    province?.key,
    dpmLv1?.key,
    dpmLv2?.key,
    dpmLv3?.key,
    dpmLv4?.key,
  ]);
  useEffect(() => {
    fetchRows();
    setPage(0);
  }, [filters]);

  useEffect(() => {
    if (selected.length === 0) handleCloseDelete();
  }, [selected]);
  const fetchRoles = async () => {
    if(choosed.key){
      try {
        
        const res = await apiService.get<RoleApiResponse>(
          `role/department/${choosed.key}`
        );
        setRoles([{ id: "all", name: "All" }, ...res.data.data]);
      } catch (error) {
        setRoles([{ id: "all", name: "All" }]);
      }
  }

  };
  useEffect(() => {
    
    fetchRoles();
  }, [choosed.key]);

  const handleExport = async () => {
    try {
      const searchParams = new URLSearchParams({});
      for (const key in filters) {
        if (
          filters[key as keyof Filters] !== "" &&
          filters[key as keyof Filters] !== "All"
        ) {
          searchParams.append(key, filters[key as keyof Filters]);
        }
      }
      const response = await apiService.get(
        `user/export-data?departmentId=${
          choosed.key
        }&${searchParams.toString()}`,
        { responseType: "blob" }
      );

      if (response) {
        const url = window.URL.createObjectURL(
          new Blob([response.data as Blob])
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "users.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };
  const fetchRows = async () => {
    // Kiểm tra điều kiện để không gọi API
    if (
      !province?.key &&
      !dpmLv1?.key &&
      !dpmLv2?.key &&
      !dpmLv3?.key &&
      !dpmLv4?.key
    ) {
      setRows([]);
      return;
    }

    try {
      // Tạo đối tượng searchParams
      const searchParams = new URLSearchParams({
        departmentId: choosed.key.toString(), // Thêm departmentId vào query
        limit: rowsPerPage.toString(), // Thêm limit vào query
        page: (page + 1).toString(), // Thêm page vào query
      });

      // Thêm các bộ lọc vào searchParams
      for (const key in filters) {
        if (
          filters[key as keyof Filters] !== "" &&
          filters[key as keyof Filters] !== "All"
        ) {
          searchParams.append(key, filters[key as keyof Filters]);
        }
      }

      // Tạo endpoint với searchParams
      const endpoint = `user/department?${searchParams.toString()}`;
      const response = await apiService.get<ApiResponse>(endpoint);

      const data = response.data;
      if (data.data.items) {
        setRows(data.data.items);
        setTotalRows(data.data.pagination.totalItems);
        // setForbidden(false);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        setForbidden(true);
      } else {
        setRows([]);
        setTotalRows(0);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleOpenResetDialog = (id: number) => {
    setSelectedUserId(id);
    setOpenResetDialog(true);
  };

  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
    setSelectedUserId(null);
  };
  const handleSaveNewPassword = async () => {
    if (selectedRow?.id) {
      try {
        const response = await apiService.put<ApiResponse>(
          `user/${selectedRow.id}/reset-password-default`
        );

        if (response.status === 200 || response.status === 201) {
          setSnackbarMessage(response.data.message);
          setSnackbarSeverity("success");
        } else {
          setSnackbarMessage(response.data.message);
          setSnackbarSeverity("error");
        }
      } catch (error: any) {
        console.error(error); // Ghi lại lỗi để kiểm tra
        setSnackbarMessage(
          error?.response?.data?.message || "An error occurred"
        );
        setSnackbarSeverity("error");
      } finally {
        setOpenSnackbar(true);
        handleCloseResetDialog(); // Đóng dialog sau khi xử lý xong
      }
    }
  };

  const handleChangeActive = async (id: number) => {
    try {
      const updatedRows = rows.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      );
      const itemToUpdate = updatedRows.find((item) => item.id === id);
      const activeStatus = itemToUpdate ? itemToUpdate.active : true;
      const payload = {
        id: id,
        active: activeStatus,
      };
      const res = await apiService.post(`user/active`, payload);
      setRows(updatedRows);
    } catch (error: any) {
      setSnackbarMessage(error?.response.data.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    event.stopPropagation();
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];
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
    if (newSelected.length > 0 && hasPermission("user", "delete")) {
      handleOpenDelete();
    }
  };
  const handleDeleteSelected = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      selected.forEach((id) => params.append("ids", id.toString()));

      const response = await apiService.delete<ApiResponse>(
        `/user/delete?${params.toString()}`
      );

      if (response.status === 200) {
        setSnackbarMessage(response.data.message);
        setSnackbarSeverity("success");
        setSelected([]);
        fetchRows();
      } else {
        setSnackbarMessage("Failed to delete users");
        setSnackbarSeverity("error");
      }
    } catch (error: any) {
      console.error(error);
      setSelected([]);
      setSnackbarMessage(error.response.data.message);
      setSnackbarSeverity("error");
    } finally {
      setOpenSnackbar(true);
      setOpenDelete(false);
    }
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    if (selected.length !== 0) {
      setSelected([]);
    }
    setOpenDelete(false);
  };

  const handleOpenAdd = (id: any) => {
    setOpenEditAtId(id);
    setOpenAdd(true);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseOpenAdd = () => {
    setOpenAdd(false);
    fetchRows();
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target as HTMLInputElement; // Cast event.target to HTMLInputElement
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (rows.length > 0) {
      if (event.target.checked) {
        const newSelected = rows.map((row) => row.id);
        setSelected(newSelected);
        if (hasPermission("user", "delete")) {
          handleOpenDelete();
        }

        return;
      }
      setSelected([]);
    } else {
      event.target.checked;
    }
  };

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
                {(hasPermission("user", "delete") ||
                  hasPermission("user", "update")) && (
                  <TableCell sx={{ border: "none", width: "11%" }}>
                    {hasPermission("user", "delete") && (
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
                      disabled={!hasPermission("user", "delete")}
                    />
                    )}
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    border: "none",
                    width: "17%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Họ và tên
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "10%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Tài khoản
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "20%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Email
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "10%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Số điện thoại
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "17%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Vai trò
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "8%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Chức danh
                </TableCell>
                {hasPermission("user", "update") && (
                  <TableCell
                    sx={{
                      border: "none",
                      width: "7%",
                      fontWeight: 700,
                      padding: "8px",
                    }}
                  >
                    Hoạt động
                  </TableCell>
                )}
              </TableRow>
              <TableRow>
                {(hasPermission("user", "delete") ||
                  hasPermission("user", "update")) && (
                  <TableCell
                    sx={{ border: "none", padding: "8px" }}
                  ></TableCell>
                )}
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    name="fullname"
                    sx={{ background: "white", borderRadius: "10px" }}
                    value={filters.fullname}
                    onChange={handleFilterChange}
                  />
                </TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    name="username"
                    sx={{ background: "white", borderRadius: "10px" }}
                    value={filters.username}
                    onChange={handleFilterChange}
                  />
                </TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    name="email"
                    sx={{ background: "white", borderRadius: "10px" }}
                    value={filters.email}
                    onChange={handleFilterChange}
                  />
                </TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    name="phone"
                    sx={{ background: "white", borderRadius: "10px" }}
                    value={filters.phone}
                    onChange={handleFilterChange}
                  />
                </TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    select
                    fullWidth
                    name="role"
                    sx={{ background: "white", borderRadius: "10px" }}
                    value={filters.role}
                    onChange={handleFilterChange}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.name}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    name="title"
                    sx={{ background: "white", borderRadius: "10px" }}
                    value={filters.title}
                    onChange={handleFilterChange}
                  />
                </TableCell>
                {hasPermission("user", "update") && (
                  <TableCell sx={{ border: "none", padding: "8px" }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      name="active"
                      sx={{ background: "white", borderRadius: "10px" }}
                      value={filters.active}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value={"All"}>All</MenuItem>
                      <MenuItem value={"true"}>On</MenuItem>
                      <MenuItem value={"false"}>Off</MenuItem>
                    </TextField>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell sx={{ border: "none" }} colSpan={9} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const isItemSelected = isSelected(row.id);
                  return (
                    <TableRow
                      hover
                      onClick={() => handleOpenEdit(row)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      {(hasPermission("user", "delete") ||
                        hasPermission("user", "update")) && (
                        <TableCell padding="checkbox">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              fontWeight: 700,
                            }}
                          >
                            {hasPermission("user", "delete") && (
                              <Checkbox
                                checked={isItemSelected}
                                onChange={(event) =>
                                  handleCheckboxClick(event, row.id)
                                }
                                sx={{
                                  color: "#637381",
                                  "&.Mui-checked": { color: "#2962FF" },
                                  "&.MuiCheckbox-indeterminate": {
                                    color: "#2962FF",
                                  },
                                }}
                                disabled={!hasPermission("user", "delete")}
                              />
                            )}
                            {hasPermission("user", "update") && (
                              <div style={{display:"flex"}}>
                                <IconButton
                                  onClick={() => handleOpenAdd(row)}
                                  disabled={!hasPermission("user", "update")}
                                  sx={{
                                    color: hasPermission("user", "update")
                                      ? "#637381"
                                      : "#E5E7EB",
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                                <span>
                                  <IconButton
                                    onClick={() =>
                                      handleOpenResetDialog(row.id)
                                    }
                                    disabled={!hasPermission("user", "update")}
                                    sx={{
                                      color: hasPermission("user", "update")
                                        ? "#637381"
                                        : "#E5E7EB",
                                    }}
                                  >
                                    <KeyIcon />
                                  </IconButton>
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>{row.fullname}</TableCell>
                      <TableCell>{row.username}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell>{row.role?.name}</TableCell>
                      <TableCell>{row.title}</TableCell>
                      {hasPermission("user", "update") && (
                        <TableCell>
                          <Switch
                            // onClick={() => handleOpenEdit(row)}
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: theme.palette.primary.main,
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                {
                                  backgroundColor: theme.palette.primary.main,
                                },
                            }}
                            checked={row.active}
                            onChange={() => handleChangeActive(row.id)}
                            disabled={!hasPermission("user", "update")}
                          />
                        </TableCell>
                      )}
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
          rowsPerPageOptions={[10, 25, 50, 200]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      {/* <AddNewPopup open={openAdd} onClose={handleCloseOpenAdd} type='edit' id={openEditAtId} /> */}
      <AddNewPopup
        open={openAdd}
        onClose={handleCloseOpenAdd}
        type="edit"
        userId={id}
      />
      <ResetPasswordDialog
        open={openResetDialog}
        onClose={handleCloseResetDialog}
        onReset={handleSaveNewPassword}
      />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <DeleteDialog
        open={openDelete}
        handleClose={handleCloseDelete}
        quantity={selected.length}
        onDelete={handleDeleteSelected}
      />
      <ProgressOverlay isLoading={isLoading} />
    </Paper>
  );
}
