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
import theme from "@/app/components/theme";
import { error } from "console";
import ProgressOverlay from "@/app/components/progress-Overlay";
import CloseIcon from "@mui/icons-material/Close";
interface Row {
  id: number;
  // name: string;
  year: string;
  // period: string;
  // startDate: string;
  // finishDate: string;
  active: boolean;
}
interface Pagination {
  totalItemInPage?: number;
  totalItems: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ApiResponse {
  code: number;
  data: {
    currentPage: number;
    items: Row[];
    nextPage: number | null;
    prevPage: number | null;
    total: number;
  };
  message: string;
}

interface ReportConfigTableProps {
  refresh: boolean;
}
export default function ReportConfigTable({ refresh }: ReportConfigTableProps) {
  const { isLoading, setIsLoading } = useAppContext();
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
  // const [name, setName] = useState("");
  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("");
  // const [nameFilter, setNameFilter] = useState<string>("");
  // const [periodFilter, setPeriodFilter] = useState<string>("");
  // const [startDateFilter, setStartDateFilter] = useState<string>("");
  // const [finishDateFilter, setFinishDateFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const handleOpenEdit = (id: number) => {
    console.log("Dữ liệu được chọn", id);
    setIdEdit(id);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    fetchRows();
  };
  // const handleClearStartDate = () => {
  //   setStartDateFilter("");
  // };
  // const handleClearFinishDate = () => {
  //   setFinishDateFilter("");
  // };
  useEffect(() => {
    setIsLoading(true);
    fetchRows();
  }, [
    page,
    refresh,
    rowsPerPage,
  ]);

  useEffect(() => {
    fetchRows();
  }, [
    // nameFilter,
    yearFilter,
    // periodFilter,
    // startDateFilter,
    // finishDateFilter,
    activeFilter,
  ]);

  const fetchRows = async () => {
    try {
      // Tạo đối tượng searchParams
      const searchParams = new URLSearchParams();
      if (yearFilter) searchParams.append("year", yearFilter);
      // if (nameFilter) searchParams.append("name", nameFilter);
      // if (periodFilter) searchParams.append("period", periodFilter);
      // if (startDateFilter)
      //   searchParams.append("startDate", convertDateFormat(startDateFilter));
      // if (finishDateFilter)
      //   searchParams.append("finishDate", convertDateFormat(finishDateFilter));
      // console.log("ACTIVE: ", activeFilter);
      if (activeFilter !== "All") searchParams.append("active", activeFilter);

      const response = await apiService.get<ApiResponse>(
        `/report-config/all-report-config?${searchParams.toString()}`
      );
      console.log("Fetched data:", response);
      console.log("Total Items: ", response.data.data.pagination.totalItems);
      setRows(response.data.data.items);
      setTotalRows(response.data.data.pagination.totalItems);
    } catch (error) {
      console.error("Fetch data failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeActive = async (id: number) => {
    try {
      const updatedRows = rows.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      );
      const itemToUpdate = updatedRows.find((item) => item.id === id);
      const activeStatus = itemToUpdate ? itemToUpdate.active : true;
      console.log(id);
      const payload = {
        id: id,
        active: activeStatus,
      };
      const res = await apiService.post(`report-config/handle-active/${id}`);
      console.log('ACTIVE: ', res)
      setRows(updatedRows);
    } catch (error: any) {
      setSnackbarMessage(error?.response.data.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
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
  // const handleClearPeriod = () => {
  //   setPeriodFilter("");
  // };
  // const handleClearName= () => {
  //   setNameFilter("");
  // };

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
                    width: "10%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Thao tác
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "75%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Năm báo cáo
                </TableCell>
                {/* <TableCell
                  sx={{
                    border: "none",
                    width: "28%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Tên báo cáo
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "12%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Kỳ báo cáo
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "15%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Thời gian bắt đầu
                </TableCell>
                <TableCell
                  sx={{
                    border: "none",
                    width: "15%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Thời gian kết thúc
                </TableCell> */}
                <TableCell
                  sx={{
                    border: "none",
                    width: "15%",
                    fontWeight: 700,
                    padding: "8px",
                  }}
                >
                  Trạng thái
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: "none", padding: "8px" }}></TableCell>
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    fullWidth
                    name="reportYear"
                    sx={{
                      background: "white",
                      borderRadius: "10px",
                      "& .MuiInputBase-input": {
                        fontSize: "14px",
                      },
                    }}
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                  />
                </TableCell>
                {/* <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    select
                    fullWidth
                    name="name"
                    sx={{
                      background: "white",
                      borderRadius: "10px",
                      minWidth: "150px",
                      "& .MuiInputAdornment-root": {
                        position: "relative",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "14px",
                      },
                    }}
                    InputProps={{
                      endAdornment: nameFilter && (
                        <CloseIcon
                          fontSize="small"
                          onClick={handleClearName}
                          sx={{
                            position: "absolute",
                            right: "30px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                          }}
                        />
                      ),
                    }}
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  >
                    <MenuItem value="Báo cáo ATVSLĐ">Báo cáo ATVSLĐ</MenuItem>
                    {/* <MenuItem value="TNLD">Báo cáo Tai nạn lao động</MenuItem> */}
                  {/* </TextField>
                </TableCell>  */}
                {/* <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    select
                    fullWidth
                    name="period"
                    sx={{
                      background: "white",
                      borderRadius: "10px",
                      minWidth: "110px", // Điều chỉnh độ rộng tối thiểu
                      "& .MuiInputAdornment-root": {
                        position: "relative",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "14px",
                      },
                    }}
                    InputProps={{
                      endAdornment: periodFilter && (
                        <CloseIcon
                          fontSize="small"
                          onClick={handleClearPeriod}
                          sx={{
                            position: "absolute",
                            right: "30px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                          }}
                        />
                      ),
                    }}
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                  >
                    <MenuItem value="6 tháng">6 tháng</MenuItem>
                    <MenuItem value="Cả năm">Cả năm</MenuItem>
                  </TextField>
                </TableCell> */}
                {/* <TableCell sx={{ border: "none", padding: "8px" }}>
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
                            "& .MuiInputBase-input": {
                              fontSize: "14px",
                            },
                          }}
                        />
                      ),
                    }}
                  />
                </TableCell> */}
                {/* <TableCell sx={{ border: "none", padding: "8px" }}>
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
                            "& .MuiInputBase-input": {
                              fontSize: "14px",
                            },
                          }}
                        />
                      ),
                    }}
                  />
                </TableCell> */}
                <TableCell sx={{ border: "none", padding: "8px" }}>
                  <TextField
                    size="small"
                    select
                    fullWidth
                    name="active"
                    sx={{
                      background: "white",
                      borderRadius: "10px",
                      "& .MuiInputBase-input": {
                        fontSize: "14px",
                      },
                    }}
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="true">On</MenuItem>
                    <MenuItem value="false">Off</MenuItem>
                  </TextField>
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
                  // const isItemSelected = isSelected(row.id);
                  return (
                    <TableRow
                      hover
                      // onClick={() => handleOpenEdit(row)}
                      role="checkbox"
                      // aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      // selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <IconButton
                          onClick={() => handleOpenEdit(row.id)}
                          // disabled={!hasPermission("user", "update")}
                          // sx={{
                          //   color: hasPermission("user", "update")
                          //     ? "#637381"
                          //     : "#E5E7EB",
                          // }}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{row.year}</TableCell>
                      {/* <TableCell>{row.name}</TableCell>
                      <TableCell>{row.period}</TableCell>
                      <TableCell>{convertDateToApi(row.startDate)}</TableCell>
                      <TableCell>{convertDateToApi(row.finishDate)}</TableCell> */}
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
                          // disabled={!hasPermission("user", "update")}
                        />
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
        alignItems="flex-end"
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
      {/* <AddNewPopup open={openAdd} onClose={handleCloseOpenAdd} type='edit' id={openEditAtId} /> */}
      <AddNewPopup
        open={openEdit}
        onClose={handleCloseEdit}
        type="edit"
        id={idEdit}
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
      <ProgressOverlay isLoading={isLoading} />
    </Paper>
  );
}
