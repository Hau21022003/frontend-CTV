import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Snackbar,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import theme from "@/app/components/theme";
import { Button } from "@/app/components/button";
import SaveIcon from "@mui/icons-material/Save";
import apiService from "@/app/untils/api";
import { useAppContext } from "@/app/hooks/AppContext";
import {
  useFormContext,
  Controller,
  useForm,
  FieldValues,
  set,
} from "react-hook-form";
import { ApiResponse } from "@/app/services/types/apirespone";
interface AddNewPopupProps {
  open: boolean;
  onClose: () => void;
  type: "add" | "edit";
  id?: number;
}
interface Report {
  id: string;
  name: string;
  year: string;
  period: string;
  startDate: string;
  finishDate: string;
  active: boolean;
}

const AddNewPopUp: React.FC<AddNewPopupProps> = ({
  open,
  onClose,
  type,
  id,
}) => {
  const [req, setReq] = useState<Report>();
  const form = useForm<FieldValues, Report>();

  const [formData, setFormData] = useState({
    name: "",
    year: "",
    period: "",
    startDate: "",
    finishDate: "",
    active: true,
  });
  const { setError, register, handleSubmit } = useForm();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const { isLoading, setIsLoading } = useAppContext();
  const [nameError, setNameError] = useState<string | null>(null);
  const [yearError, setYearError] = useState<string | null>(null);
  const [periodError, setPeriodError] = useState<string | null>(null);
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [finishDateError, setFinishDateError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      if (type === "edit" && id) {
        resetData();
        fetchData();
      } else if (type === "add") {
        refreshData();
        resetData();
      }
    }
  }, [open, type, id]);

  const resetData = () => {
    setNameError(null);
    setYearError(null);
    setPeriodError(null);
    setStartDateError(null);
    setFinishDateError(null);
  };
  const fetchData = async () => {
    try {
      const res: ApiResponse<Report> = await apiService.get(`report-config/info/${id}`);
      console.log("DATA INFO REPORT: ", res.data.data);
      setFormData(res.data.data as Report);
    } catch (error) {
      console.log("Lỗi");
    }
  };

  const refreshData = () => {
    const refresh = {
      name: "",
      year: "",
      period: "",
      startDate: "",
      finishDate: "",
      active: true,
    };
    setFormData(refresh);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === "active" ? value === "true" : value,
    }));
  };

  const handleSave = async () => {
    console.log("Form Data:", formData);
    const dataToApi = {
      name: formData.name,
      year: formData.year,
      period: formData.period,
      startDate: formData.startDate,
      finishDate: formData.finishDate,
      active: formData.active?.toString(),
    };
    console.log("Data to be saved:", {
      ...dataToApi,
      active: formData.active, // Check the value of active
    });
    setNameError(null);
    setYearError(null);
    setPeriodError(null);
    setStartDateError(null);
    setFinishDateError(null);
    try {
      let res: any;
      setIsLoading(true);

      if (type === "add") {
        res = await apiService.post("/report-config/create", dataToApi);
        console.log("report-cofig", res);
        setSnackbarMessage(res.data.message);
        setSnackbarSeverity("success");
      }

      if (type === "edit") {
        res = await apiService.put(`/report-config/edit/${id}`, dataToApi);
        setSnackbarMessage(res.data.message);
        setSnackbarSeverity("success");
      }

      setOpenSnackbar(true);
      onClose();
    } catch (error: any) {
      console.error("Error saving data:", error);
      // setSnackbarMessage(error.response?.data?.message);
      // setSnackbarSeverity("error");
      // setOpenSnackbar(true);
      // const message = error.response?.data?.message;
      if (error.response && error.response.data) {
        const messages = error.response?.data?.message;
        if (Array.isArray(messages)) {
          messages.forEach((msg: string) => {
            if (msg.includes("chọn loại báo cáo")) {
              setNameError(msg);
            }
            if (msg.includes("chọn kỳ báo cáo")) {
              setPeriodError(msg);
            }
            if (msg.includes("chọn năm báo cáo")) {
              setYearError(msg);
            }
            if (msg.includes("Ngày kết thúc phải bằng hoặc lớn hơn ngày bắt đầu")) {
              setFinishDateError(msg);
            }
            if (msg.includes("Ngày bắt đầu phải nằm trong cùng năm báo cáo")) {
              setStartDateError(msg);
            }
            if (msg.includes("Ngày kết thúc phải nằm trong cùng năm báo cáo")) {
              setFinishDateError(msg);
            }
            if (msg.includes("Vui lòng chọn ngày bắt đầu")) {
              setStartDateError(msg);
            }
            if (msg.includes("Vui lòng chọn ngày kết thúc")) {
              setFinishDateError(msg);
            }
          });
        }
        if (typeof messages === "string") {
          setSnackbarMessage(messages)
          setOpenSnackbar(true)
          setSnackbarSeverity('error')
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(100), (val, index) => currentYear - index);
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            width: "900px",
            position: "absolute",
            zIndex: 1300,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {type === "add" ? "Thêm mới" : "Chỉnh sửa"}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 16, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Divider sx={{marginX: 3}}/>
        <DialogContent>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            // paddingTop="8px"
            // gap="11px"
          >
            {/* <Box display="flex" gap="32px">
              <TextField
                label="Loại báo cáo"
                required
                select
                fullWidth
                variant="outlined"
                size="small"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={type === "edit"}
                error={!!nameError}
                helperText={nameError}
                sx={{
                  "& .MuiOutlinedInput-root:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& label.Mui-focused": {
                    color: theme.palette.primary.main,
                  },
                  marginBottom: !!nameError ? "11px" : "35px",
                }}
              >
                <MenuItem value="Báo cáo ATVSLĐ">Báo cáo ATVSLĐ</MenuItem>
                {/* <MenuItem value="Báo cáo TNLD">Báo cáo TNLĐ</MenuItem> */}
              {/* </TextField>
            </Box>  */}
            {/* <Box display="flex"> */}
              <TextField
                select
                label="Năm"
                required
                name="year"
                value={formData.year}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                disabled={type === "edit"}
                error={!!yearError}
                helperText={yearError}
                sx={{
                  "& .MuiOutlinedInput-root:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& label.Mui-focused": {
                    color: theme.palette.primary.main,
                  },
                  "& .MuiInputBase-input": {
                    color: formData.year
                      ? theme.palette.text.primary
                      : theme.palette.text.disabled,
                  },
                  marginBottom: !!yearError ? "11px" : "24px",
                }}
              >
                {years.map((yearOption) => (
                  <MenuItem key={yearOption} value={yearOption}>
                    {yearOption}
                  </MenuItem>
                ))}
              </TextField>
              {/* <TextField
                label="Kỳ báo cáo"
                required
                select
                fullWidth
                variant="outlined"
                size="small"
                name="period"
                value={formData.period}
                onChange={handleChange}
                disabled={type === "edit"}
                error={!!periodError}
                helperText={periodError}
                sx={{
                  "& .MuiOutlinedInput-root:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& label.Mui-focused": {
                    color: theme.palette.primary.main,
                  },
                  marginBottom: !!periodError ? "11px" : "35px",
                }}
              >
                <MenuItem value="6 tháng">6 tháng</MenuItem>
                <MenuItem value="Cả năm">Cả năm</MenuItem>
              </TextField> */}
            {/* </Box> */}
            {/* <Box display="flex" gap="32px">
              <TextField
                label="Ngày bắt đầu"
                required
                type="date"
                fullWidth
                variant="outlined"
                size="small"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!startDateError}
                helperText={startDateError}
                sx={{
                  "& .MuiOutlinedInput-root:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& label.Mui-focused": {
                    color: theme.palette.primary.main,
                  },
                  "& .MuiInputBase-input": {
                    color: formData.startDate
                      ? theme.palette.text.primary
                      : theme.palette.text.disabled,
                  },
                  marginBottom: !!startDateError ?  "11px" : "35px",
                }}
              />
              <TextField
                label="Ngày kết thúc"
                required
                type="date"
                fullWidth
                variant="outlined"
                size="small"
                name="finishDate"
                value={formData.finishDate}
                onChange={handleChange}
                error={!!finishDateError}
                helperText={finishDateError}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& label.Mui-focused": {
                    color: theme.palette.primary.main,
                  },
                  "& .MuiInputBase-input": {
                    color: formData.finishDate
                      ? theme.palette.text.primary
                      : theme.palette.text.disabled,
                  },
                  marginBottom: !!finishDateError ? "11px" : "35px",
                }}
              />
            </Box> */}
            {/* <Box display="flex" gap="32px"> */}
              <TextField
                label="Trạng thái"
                select
                fullWidth
                variant="outlined"
                size="small"
                name="active"
                value={formData.active?.toString() || ""}
                onChange={handleChange}
                sx={{
                  "& .MuiOutlinedInput-root:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& label.Mui-focused": {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <MenuItem value="true">Hoạt động</MenuItem>
                <MenuItem value="false">Không hoạt động</MenuItem>
              </TextField>
            {/* </Box> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Box
            display="flex"
            justifyContent="flex-end"
            width="100%"
            paddingRight="16px"
            paddingBottom="16px"
          >
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              sx={{
                textTransform: "none",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <SaveIcon sx={{ marginRight: 1 }} /> Lưu
              </Box>
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
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
    </>
  );
};

export default AddNewPopUp;
