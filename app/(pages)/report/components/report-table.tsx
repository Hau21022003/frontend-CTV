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
  InputAdornment,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Switch from "@mui/material/Switch";
import apiService from "@/app/untils/api";
// import AddNewPopup from "./dialog-popup";
// import DeleteDialog from "../../department/components/dialog/delete-dialog";
import theme from "@/app/components/theme";
import { error } from "console";
import ProgressOverlay from "@/app/components/progress-Overlay";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";

interface Row {
  id: number;
  departmentName: string;
  level: number;
  startDate: string;
  finishDate: string;
  period: string;
  updatedAt: string;
  updatedBy: string;
  status: string;
}

interface Pagination {
  totalItemInPage?: number;
  totalItems: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
}

// interface Status {
//   name: string;
//   createdBy: any;
//   id: number;
// }

interface ApiResponse {
  code: number;
  data: {
    items: Row[];
    pagination: Pagination;
  };
  message: string;
}

interface ApiResponseData {
  url: string;
}

interface ReportTableProps {
  refresh: boolean;
  year: number;
}
export default function ReportTable({ refresh, year }: ReportTableProps) {
  const router = useRouter();
  const [openView, setOpenView] = useState(false);
  const [id, setId] = useState(0);
  const [status, setStatus] = useState<string[]>([]);
  const {
    isLoading,
    setIsLoading,
    choosed,
    setReportId,
    province,
    dpmLv1,
    dpmLv2,
    dpmLv3,
    dpmLv4,
  } = useAppContext();
  const [rows, setRows] = useState<Row[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [openEdit, setOpenEdit] = useState(false);
  const [name, setName] = useState("");
  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [periodFilter, setPeriodFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [finishDateFilter, setFinishDateFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [departmentNameFilter, setDepartmentNameFilter] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [updatedAtFilter, setUpdateAtFilter] = useState<string>("");
  const [updatedByFilter, setUpdateByFilter] = useState<string>("");
  const [accLv, setAccLv] = useState<string>("");
  const handleOpenView = (id: number) => {
    // console.log("Dữ liệu được chọn", id);
    // setIdEdit(id);
    // setOpenEdit(true);
    // sessionStorage.setItem("mode", "view");
    sessionStorage.setItem("key", id.toString());
    sessionStorage.removeItem("url");
    router.push(`/report/view?id=${id}`);
  };
  const handleOpenEdit = (id: number) => {
    // console.log("Dữ liệu được chọn", id);
    // setIdEdit(id);
    // setOpenEdit(true);
    // sessionStorage.setItem("mode", "edit");
    sessionStorage.setItem("key", id.toString());
    sessionStorage.removeItem("url");
    router.push(`/report/edit?id=${id}`);
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    fetchRows();
  };
  const handleClearStartDate = () => {
    setStartDateFilter("");
  };
  const handleClearFinishDate = () => {
    setFinishDateFilter("");
  };
  const handleClearPeriod = () => {
    setPeriodFilter("");
  };
  const handleClearUpdatedAt = () => {
    setUpdateAtFilter("");
  };
  const handleClearStatus = () => {
    setStatusFilter("");
  };
  useEffect(() => {
    console.log("Current choosed:", choosed);
    setIsLoading(true);
    fetchRows();
  }, [
    province?.key,
    dpmLv1?.key,
    dpmLv2?.key,
    dpmLv3?.key,
    dpmLv4?.key,
    choosed,
    page,
    refresh,
    rowsPerPage,
  ]);

  useEffect(() => {
    fetchRows();
  }, [
    yearFilter,
    periodFilter,
    startDateFilter,
    finishDateFilter,
    statusFilter,
    levelFilter,
    departmentNameFilter,
    updatedAtFilter,
    updatedByFilter,
  ]);

  const fetchRows = async () => {
    if (!province?.key || !choosed.key) {
      setRows([]);
      return;
    }
    let reportConfigName = "Báo cáo ATVSLĐ";
    try {
      console.log("YEAR: ", year);
      // Tạo đối tượng searchParams
      const searchParams = new URLSearchParams({
        year: year.toString(),
        reportConfigName: reportConfigName,
        departmentId: choosed.key,
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });
      if (departmentNameFilter)
        searchParams.append("departmentName", departmentNameFilter);
      if (levelFilter) searchParams.append("level", levelFilter);
      if (periodFilter) searchParams.append("period", periodFilter);
      if (yearFilter) searchParams.append("year", yearFilter);
      if (updatedAtFilter) searchParams.append("updatedAt", updatedAtFilter);
      if (updatedByFilter) searchParams.append("updatedBy", updatedByFilter);
      if (startDateFilter)
        searchParams.append("startDate", convertDateFormat(startDateFilter));
      if (finishDateFilter)
        searchParams.append("finishDate", convertDateFormat(finishDateFilter));
      if (statusFilter) searchParams.append("status", statusFilter);
      console.log("SEARCH PARAMS: ", searchParams.toString());
      const response = await apiService.get<ApiResponse>(
        `/report/department-report-table?${searchParams.toString()}`
      );
      console.log("DATA TABLE REPORT INFO: ", response.data.data.items);
      const data: Row[] = response.data.data.items.map((row: Row) => ({
        ...row,
        updatedAt: convertDateToLocal(row.updatedAt), // Gọi hàm convertDateToLocal để chuyển đổi
      }));
      setRows(data);
      setTotalRows(response.data.data.pagination.totalItems);
    } catch (error) {
      console.error("Fetch data failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertDateToLocal = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh", // Đặt múi giờ Việt Nam
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const convertDateToApi = (date: string): string => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  function convertDateFormat(inputDate: string): string {
    const [day, month, year] = inputDate.split("/");
    return `${year}-${month}-${day}`;
  }

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
                <TableCell
                  sx={{
                    border: "none",
                    width: "3%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                ></TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "6%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Thao tác
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "12%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Tình trạng
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "16%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Tên đơn vị
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "6%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Cấp bậc
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "13%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Thời gian bắt đầu
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "13%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Thời gian kết thúc
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "10%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Kỳ báo cáo
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "10%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Ngày cập nhật
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "10%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Người cập nhật
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: "none", padding: "8px" }}></TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}></TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    select
                    fullWidth
                    name="status"
                    sx={{
                      background: "white",
                      borderRadius: "10px",
                      "& .MuiInputAdornment-root": {
                        position: "relative", // Giữ nguyên vị trí adornment
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "14px",
                      },
                    }}
                    InputProps={{
                      endAdornment: statusFilter && (
                        <CloseIcon
                          fontSize="small"
                          onClick={handleClearStatus}
                          sx={{
                            position: "absolute",
                            right: "25px", // Điều chỉnh khoảng cách từ bên phải
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                          }}
                        />
                      ),
                    }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="Nhập liệu">Nhập liệu</MenuItem>
                    <MenuItem value="Chờ duyệt">Chờ duyệt</MenuItem>
                    <MenuItem value="Hết hạn">Hết hạn</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    name="deparmentName"
                    sx={{
                      background: "white",
                      borderRadius: "10px",
                      "& .MuiInputBase-input": {
                        fontSize: "14px",
                      },
                    }}
                    value={departmentNameFilter}
                    onChange={(e) => setDepartmentNameFilter(e.target.value)}
                  ></TextField>
                </TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    name="level"
                    sx={{
                      background: "white",
                      borderRadius: "10px",
                      "& .MuiInputBase-input": {
                        fontSize: "14px",
                      },
                    }}
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                  ></TextField>
                </TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    name="startDate"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    type="date"
                    sx={{
                      background: "white",
                      borderRadius: "10px",
                      "& .MuiInputBase-input": {
                        color: startDateFilter
                          ? theme.palette.text.primary
                          : theme.palette.text.disabled,
                        fontSize: "14px",
                      },
                      "& .MuiInputAdornment-root": {
                        position: "relative", // Giữ nguyên vị trí adornment
                      },
                    }}
                    InputProps={{
                      endAdornment: startDateFilter && (
                        <CloseIcon
                          fontSize="small"
                          onClick={handleClearStartDate}
                          sx={{
                            position: "absolute",
                            right: "35px", // Điều chỉnh khoảng cách từ bên phải
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                          }}
                        />
                      ),
                    }}
                  />
                </TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    name="finishDate"
                    value={finishDateFilter}
                    onChange={(e) => setFinishDateFilter(e.target.value)}
                    type="date"
                    sx={{
                      background: "white",
                      borderRadius: "10px",
                      "& .MuiInputBase-input": {
                        color: finishDateFilter
                          ? theme.palette.text.primary
                          : theme.palette.text.disabled,
                        fontSize: "14px",
                      },
                      "& .MuiInputAdornment-root": {
                        position: "relative", // Giữ nguyên vị trí adornment
                      },
                    }}
                    InputProps={{
                      endAdornment: finishDateFilter && (
                        <CloseIcon
                          fontSize="small"
                          onClick={handleClearFinishDate}
                          sx={{
                            position: "absolute",
                            right: "35px", // Điều chỉnh khoảng cách từ bên phải
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                          }}
                        />
                      ),
                    }}
                  />
                </TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    select
                    name="period"
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                    sx={{
                      background: "white",
                      borderRadius: "10px",
                      "& .MuiInputAdornment-root": {
                        position: "relative", // Giữ nguyên vị trí adornment
                      },
                    }}
                    InputProps={{
                      endAdornment: periodFilter && (
                        <CloseIcon
                          fontSize="small"
                          onClick={handleClearPeriod}
                          sx={{
                            position: "absolute",
                            right: "25px", // Điều chỉnh khoảng cách từ bên phải
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            "& .MuiInputBase-input": {
                              fontSize: "14px",
                            },
                          }}
                        />
                      ),
                    }}
                  >
                    <MenuItem value="6 tháng">6 tháng</MenuItem>
                    <MenuItem value="Cả năm">Cả năm</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    name="updatedAt"
                    value={updatedAtFilter}
                    onChange={(e) => setUpdateAtFilter(e.target.value)}
                    type="date"
                    sx={{
                      background: "white",
                      borderRadius: "10px",
                      "& .MuiInputBase-input": {
                        color: updatedAtFilter
                          ? theme.palette.text.primary
                          : theme.palette.text.disabled,
                        fontSize: "14px",
                      },
                      "& .MuiInputAdornment-root": {
                        position: "relative", // Giữ nguyên vị trí adornment
                      },
                    }}
                    InputProps={{
                      endAdornment: updatedAtFilter && (
                        <CloseIcon
                          fontSize="small"
                          onClick={handleClearUpdatedAt}
                          sx={{
                            position: "absolute",
                            right: "35px", // Điều chỉnh khoảng cách từ bên phải
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                          }}
                        />
                      ),
                    }}
                  />
                </TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    name="updatedBy"
                    sx={{
                      background: "white",
                      borderRadius: "10px",
                      "& .MuiInputBase-input": {
                        fontSize: "14px",
                      },
                    }}
                    value={updatedByFilter}
                    onChange={(e) => setUpdateByFilter(e.target.value)}
                  ></TextField>
                </TableCell>
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
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      <TableCell padding="checkbox">
                        <IconButton onClick={() => handleOpenView(row.id)}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        {row.status === "Nhập liệu" && (
                          <IconButton onClick={() => handleOpenEdit(row.id)}>
                            <EditIcon />
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.departmentName}</TableCell>
                      <TableCell>{row.level}</TableCell>
                      <TableCell>{convertDateToApi(row.startDate)}</TableCell>
                      <TableCell>{convertDateToApi(row.finishDate)}</TableCell>
                      <TableCell>{row.period}</TableCell>
                      <TableCell>{row.updatedAt}</TableCell>
                      <TableCell>{row.updatedBy}</TableCell>
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
        justifyContent="flex-end"
        sx={{ paddingX: "8px" }}
      >
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
      <ProgressOverlay isLoading={isLoading} />
    </Paper>
  );
}
