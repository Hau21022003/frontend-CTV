"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  Alert,
  Grid2,
  Snackbar,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import apiService from "@/app/untils/api";
import { useAppContext, Location } from "@/app/hooks/AppContext";
import DeleteDialog from "./dialog/delete-dialog";
import {} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import EditDialog from "./dialog/edit-dialog";
interface Row {
  id: number;
  name: string;
  level: number;
  district: Location;
  ward: Location;
}

interface ApiResponse {
  message: string;
  data: {
    items: Row[];
    pagination: {
      totalItemInPage?: number;
      totalItems: number;
      totalPages?: number;
      currentPage?: number;
      pageSize?: number;
    };
  };
}

interface DepartmentTableProps {
  refresh: boolean;
}

export default function DepartmentTable({ refresh }: DepartmentTableProps) {
  // const [orderBy, setOrderBy] = useState<keyof Row>('level');
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState<Row[]>([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const {
    province,
    dpmLv1,
    dpmLv2,
    dpmLv3,
    dpmLv4,
    isLoading,
    setIsLoading,
    refreshAddNew,
    setRefreshAddNew,
    refreshDelete,
    setDeleteRefresh,
  } = useAppContext();
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");

  useEffect(() => {
    fetchRows();
    setPage(0);
  }, [
    province?.key,
    dpmLv1?.key,
    dpmLv2?.key,
    dpmLv3?.key,
    dpmLv4?.key,
    name,
    level,
    district,
    ward,
  ]);

  useEffect(() => {
    fetchRows();
  }, [page, rowsPerPage, refreshAddNew]);
  const determineLevelAndParentId = () => {
    if (dpmLv1.key === "" && dpmLv1.name === "") {
      return { levell: 1, parentId: null };
    }
    if (dpmLv2.key === "" && dpmLv2.name === "") {
      return { levell: 2, parentId: parseInt(dpmLv1.key, 10) };
    }
    if (dpmLv3.key === "" && dpmLv3.name === "") {
      return { levell: 3, parentId: parseInt(dpmLv2.key, 10) };
    }
    if (dpmLv4.key === "" && dpmLv4.name === "") {
      return { levell: 4, parentId: parseInt(dpmLv3.key, 10) };
    }
    return { levell: 5, parentId: parseInt(dpmLv4.key, 10) };
  };
  const fetchRows = async () => {
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
    const { levell, parentId } = determineLevelAndParentId();
    try {
      // setIsLoading(true);
      const searchParams = new URLSearchParams({
        currLevel: levell.toString(),
        provId: province.key,
      });
      if (parentId) searchParams.append("parentId", parentId.toString());

      if (name !== null && name !== "") searchParams.append("name", name);
      if (level && level !== "") searchParams.append("level", level);
      if (district && district !== "")
        searchParams.append("district", district);
      if (ward && ward !== "") searchParams.append("ward", ward);
      searchParams.append("page", (page + 1).toString());
      searchParams.append("limit", rowsPerPage.toString());

      let endpoint = "";

      endpoint = `/department/level-all?${searchParams.toString()}`;

      const response = await apiService.get<ApiResponse>(endpoint);

      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }

      const data = response.data;

      if (data && data.data && data.data.items) {
        setRows(data.data.items);
        setTotalRows(data.data.pagination.totalItems);
      } else {
        setRows([]);
        setTotalRows(0);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      setRows([]);
      setTotalRows(0);
    }
    // finally{
    //   setIsLoading(false);
    // }
  };
  const [permissions, setPermissions] = useState<any[]>([]);
  // useEffect(() => {
  //   const storedPermissions = localStorage.getItem("permissions");
  //   if (storedPermissions) {
  //     const parsedPermissions = JSON.parse(storedPermissions);
  //     if (Array.isArray(parsedPermissions)) {
  //       setPermissions(parsedPermissions);
  //     } else if (typeof parsedPermissions === "object") {
  //       const permissionsArray = Object.entries(parsedPermissions).map(
  //         ([subject, permission]) => ({
  //           subject,
  //           permission,
  //         })
  //       );
  //       setPermissions(permissionsArray);
  //     } else {
  //       console.error(
  //         "Permissions are not in the expected array or object format:",
  //         parsedPermissions
  //       );
  //       setPermissions([]);
  //     }
  //   }
  // }, []);

  // const hasPermission = (subject: string, action: string) => {
  //   const permission = permissions.find((perm) => perm.subject === subject);
  //   return permission ? permission.permission[action] : false;
  // };

  const handleDepartmentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setName(event.target.value);
  };
  const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLevel(event.target.value);
  };
  const handleDistrictChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDistrict(event.target.value);
  };
  const handleWardChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWard(event.target.value);
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
        `/department/delete?${queryString.toString()}`
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
      // setSnackbarSeverity('error');
      // setSnackbarMessage('Can not delete!');
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
        // if (hasPermission("department", "delete")) {
          handleOpenDelete();
        // }
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

    if (newSelected.length > 0 && hasPermission("department", "delete")) {
      handleOpenDelete();
    }
    // if (newSelected.length > 0) {
    //   handleOpenDelete();
    // }
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleOpenEdit = (row: Row) => {
    setSelectedRow(row);
    // setOpenEdit(true);
  };
  useEffect(() => {
    if (selectedRow) {
      setOpenEdit(true); // Thực hiện hành động sau khi `selectedRow` thay đổi
    }
  }, [selectedRow]);

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedRow(null);
    setSelected([]);
    fetchRows();
  };

  const handleExport = async () => {
    if (
      !province?.key &&
      !dpmLv1?.key &&
      !dpmLv2?.key &&
      !dpmLv3?.key &&
      !dpmLv4?.key
    ) {
      setSnackbarMessage("Không thể xuất dữ liệu.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }
    try {
      setIsLoading(true);
      const { levell, parentId } = determineLevelAndParentId();

      const searchParams = new URLSearchParams({
        currLevel: levell.toString(),
        provId: province.key,
      });
      if (parentId) searchParams.append("parentId", parentId.toString());

      if (name !== null && name !== "") searchParams.append("name", name);
      if (level && level !== "") searchParams.append("level", level);
      if (district && district !== "")
        searchParams.append("district", district);
      if (ward && ward !== "") searchParams.append("ward", ward);
      let endpoint = `/department/export-data?${searchParams.toString()}`;

      const response = await apiService.get<Blob>(endpoint, {
        responseType: "blob",
      });
      const contentType = response.headers["content-type"];
      if (
        contentType &&
        contentType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      ) {
        // Tạo URL tạm thời cho file tải xuống
        const downloadUrl = window.URL.createObjectURL(
          new Blob([response.data])
        );

        // Tạo element <a> để tải file
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", "departments.xlsx"); // Tên file tải về
        document.body.appendChild(link);
        link.click(); // Simulate click to download
        link.remove(); // Xóa element <a> sau khi tải
        window.URL.revokeObjectURL(downloadUrl); // Giải phóng URL blob
      } else {
        setSnackbarMessage("Không thể xuất dữ liệu.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        console.error("Wrong Content-Type:", contentType);
      }
    } catch (error) {
      setSnackbarMessage("Không thể xuất dữ liệu.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      console.error("Không có dữ liệu để xuất dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <TableContainer sx={{ flexGrow: 1 }}>
        <Table aria-label="enhanced table" size="small">
          <TableHead sx={{ backgroundColor: "#F4F6F8" }}>
            {/* First Row with Labels */}
            <TableRow sx={{ flexGrow: 1 }}>
              {/* {(hasPermission("department", "delete") ||
                hasPermission("department", "update")) && ( */}
                <TableCell sx={{ border: "none", width: "5%", padding: "8px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 700,
                    }}
                  >
                    {/* {hasPermission("department", "delete") && ( */}
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
                        defaultChecked
                        sx={{
                          marginLeft: "20px",
                          marginRight: "10px",
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
                        // disabled={!hasPermission("department", "delete")}
                      />
                    {/* )} */}
                    {/* {hasPermission("department", "update") && <span></span>} */}
                  </div>
                </TableCell>
              {/* )} */}
              <TableCell
                sx={{
                  fontWeight: 700,
                  border: "none",
                  width: "15%",
                  padding: "8px",
                }}
              >
                Mã đơn vị
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  border: "none",
                  width: "35%",
                  padding: "8px",
                }}
              >
                Tên cơ quan đơn vị
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  border: "none",
                  width: "15%",
                  padding: "8px",
                }}
              >
                Cấp
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  border: "none",
                  width: "15%",
                  padding: "8px",
                }}
              >
                Quận/ huyện
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  border: "none",
                  width: "15%",
                  padding: "8px",
                }}
              >
                Phường/ xã
              </TableCell>
            </TableRow>

            {/* Second Row with TextFields */}
            <TableRow>
              {/* {(hasPermission("department", "delete") ||
                hasPermission("department", "update")) && ( */}
                <TableCell sx={{ border: "none", padding: "8px" }}></TableCell>
              {/* )} */}

              <TableCell sx={{ border: "none", padding: "8px" }}>
                <TextField
                  size="small"
                  fullWidth
                  sx={{ background: "white", borderRadius: "10px" }}
                  value={name}
                  onChange={handleDepartmentChange}
                />
              </TableCell>
              <TableCell sx={{ border: "none", padding: "8px" }}>
                <TextField
                  size="small"
                  fullWidth
                  sx={{ background: "white", borderRadius: "10px" }}
                  value={name}
                  onChange={handleDepartmentChange}
                />
              </TableCell>
              <TableCell sx={{ border: "none", padding: "8px" }}>
                <TextField
                  size="small"
                  fullWidth
                  sx={{ background: "white", borderRadius: "10px" }}
                  value={level}
                  onChange={handleLevelChange}
                />
              </TableCell>
              <TableCell sx={{ border: "none", padding: "8px" }}>
                <TextField
                  size="small"
                  fullWidth
                  sx={{ background: "white", borderRadius: "10px" }}
                  value={district}
                  onChange={handleDistrictChange}
                />
              </TableCell>
              <TableCell sx={{ border: "none", padding: "8px" }}>
                <TextField
                  size="small"
                  fullWidth
                  sx={{ background: "white", borderRadius: "10px" }}
                  value={ward}
                  onChange={handleWardChange}
                />
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => {
                const isItemSelected = isSelected(row.id);

                return (
                  <TableRow
                    key={row.id}
                    sx={{
                      height: "45px",
                      marginLeft: "15px",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#F1F1F1" },
                      borderBottom: "1px solid #E0E0E0",
                    }}
                    selected={isItemSelected}
                  >
                    {/* {(hasPermission("department", "delete") ||
                      hasPermission("department", "update")) && ( */}
                      <TableCell
                        component="th"
                        scope="row"
                        style={{ display: "flex", alignItems: "center" }}
                        sx={{
                          padding: "4px 8px",
                          paddingLeft: "16px",
                          borderBottom: "none",
                        }}
                      >
                        {/* {hasPermission("department", "delete") && ( */}
                          <Checkbox
                            checked={isItemSelected}
                            defaultChecked
                            sx={{
                              color: "#637381",
                              "&.Mui-checked": {
                                color: "#2962FF",
                              },
                            }}
                            onChange={(event) =>
                              handleCheckboxClick(event, row.id)
                            }
                            // disabled={!hasPermission("department", "delete")}
                          />
                        {/* // )} */}
                        {/* {hasPermission("department", "update") && ( */}
                          <IconButton
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenEdit(row);
                            }}
                            // disabled={!hasPermission("department", "update")}
                            // sx={{
                            //   color: hasPermission("department", "update")
                            //     ? "#637381"
                            //     : "#E5E7EB",
                            // }}
                          >
                            <EditIcon />
                          </IconButton>
                        {/* )} */}
                      </TableCell>
                    {/* )} */}
                    <TableCell
                      sx={{
                        padding: "4px 8px",
                        paddingLeft: "16px",
                        borderBottom: "none",
                      }}
                    >
                      {row.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: "4px 8px",
                        paddingLeft: "16px",
                        borderBottom: "none",
                      }}
                    >
                      {row.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: "4px 8px",
                        paddingLeft: "16px",
                        borderBottom: "none",
                      }}
                    >
                      {row.level}
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: "4px 8px",
                        paddingLeft: "16px",
                        borderBottom: "none",
                      }}
                    >
                      {row.district?.name || ""}
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: "4px 8px",
                        paddingLeft: "16px",
                        borderBottom: "none",
                      }}
                    >
                      {row.ward?.name || ""}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={10}
                  sx={{ textAlign: "center", borderBottom: "none" }}
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <IconButton
              sx={{ color: "#919eab", ml: 1, gap: 1, fontSize: 14 }}
              onClick={handleExport}
              // disabled={!hasPermission('department', 'export')}
            >
              <FileDownloadOutlinedIcon />
              Export Data
            </IconButton>
          </Box>
          <Box>
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
        </Box>
      </div>
      {selectedRow && (
        <EditDialog
          open={openEdit}
          handleClose={handleCloseEdit}
          initialData={
            selectedRow
              ? {
                  id: selectedRow.id,
                  province: province,
                  district: {
                    key: selectedRow.district?.key,
                    name: selectedRow.district?.name,
                  },
                  ward: {
                    key: selectedRow.ward?.key,
                    name: selectedRow.ward?.name,
                  },
                  name: selectedRow.name,
                }
              : {
                  id: 0,
                  province: { key: "", name: "" },
                  district: { key: "", name: "" },
                  ward: { key: "", name: "" },
                  name: "",
                }
          }
        />
      )}
      <DeleteDialog
        open={openDelete}
        handleClose={handleCloseDelete}
        quantity={selected.length}
        onDelete={handleDelete}
      />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={1200}
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
