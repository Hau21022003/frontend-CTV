import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Box,
  LinearProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "@/app/components/button";
import { useAppContext } from "@/app/hooks/AppContext";
import apiService from "@/app/untils/api";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [errorData, setErrorData] = useState<any[]>([]);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const { choosed } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
      startUpload();
    }
  };
  const isDuplicateUsername = (username: string, users: any[]) => {
    const usernameCount = users.filter((user) => user.username === username).length;
    return usernameCount > 1;
  };
  
  const isDuplicateEmail = (email: string, users: any[]) => {
    const emailCount = users.filter((user) => user.email === email).length;
    return emailCount > 1;
  };
  
  useEffect(() => {
    if(!open){
      setSelectedFile(null);
    }
  },[open])
  const handleChangeFileClick = () => {
    setSelectedFile(null); // Reset the file
    setUploadSuccess(false);
    setUploadProgress(0);

    // Trigger the file input click programmatically
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const startUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setUploadSuccess(true);
          return 100;
        }
        return prevProgress + 10;
      });
    }, 200);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
  
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    try {
      const res: any = await apiService.post(
        `user/import-file-accounts?departmentId=${choosed.key}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (res && res.status === 201) {
        setSnackbarMessage(res.data.message);
        console.log(res.data.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        onClose();
      } else {
        console.error("Error importing data:", res.data.message);
        setSnackbarMessage(res.data.message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
  
      if (res.data.data && res.data.data.length > 0) {
        const errorList = res.data.data
          .map((user: any) => {
            const missingFields = [];
            if (!user.username) missingFields.push("Tên đăng nhập");
            if (!user.fullname) missingFields.push("Họ và tên");
            if (!user.title) missingFields.push("Chức danh");
            if (!user.gender) missingFields.push("Giới tính");
            if (!user.roleName) missingFields.push("Vai trò");
            if (!user.email) missingFields.push("Email");
  
            // Kiểm tra trùng email và username
            const duplicates = [];
            if (
              user.username &&
              isDuplicateUsername(user.username, res.data.data)
            ) {
              duplicates.push("Tên đăng nhập");
            }
            if (user.email && isDuplicateEmail(user.email, res.data.data)) {
              duplicates.push("Email");
            }
  
            // Return the user with missing fields and duplicates
            if (duplicates.length > 0 || missingFields.length > 0) {
              return { ...user, missingFields, duplicates };
            }
  
            return null;
          })
          .filter((user: any) => user !== null);
  
        if (errorList.length > 0) {
          setErrorData(errorList);
          setErrorDialogOpen(true);
        }
      }
      onClose();
    } catch (error) {
      console.error("Import Error:", error);
      const errorMessage = error.response?.data?.message;
      setSnackbarSeverity("error");
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };
  

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    setErrorData([]); // Clear error data on close
    setErrorDialogOpen(false); // Close error dialog
    onClose();
  };

  const handleDownExam = async () => {
    try {
      const res = await apiService.get(
        `/user/format-import-file?id=${choosed.key}`,
        {
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([res.data as Blob], {
        type: "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Mẫu nhập thông tin ${choosed.name}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          Upload a file
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Bạn có thể tải lên các tệp XLS để nhập tài khoản người dùng
          </Typography>
          <Box
            sx={{
              borderRadius: "8px",
              padding: "16px 0 8px 0",
              textAlign: "center",
              position: "relative",
              minHeight: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#EDF7FF",
              flexDirection: "column",
              border: "1px dashed #2962FF",
            }}
          >
            <label
              htmlFor="upload-file"
              style={{
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                opacity: uploadProgress > 0 && uploadProgress < 100 ? 0.5 : 1,
              }}
            >
              <input
                accept=".xls,.xlsx,.csv"
                style={{ display: "none" }}
                id="upload-file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <img
                src="/upload_icon.png"
                alt="Upload Icon"
                style={{ width: 70, height: 70 }}
              />
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                {uploadSuccess && (
                  <img
                    src="/success_icon.png"
                    alt="Success Icon"
                    style={{ width: 16, height: 16, marginRight: 4 }}
                  />
                )}
                <Typography>
                  {selectedFile ? selectedFile.name : "Upload an Excel file"}
                </Typography>
              </Box>
            </label>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box sx={{ width: "100%", mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography sx={{ mt: 1 }}>{uploadProgress}%</Typography>
              </Box>
            )}
          </Box>

          <Typography sx={{ mt: 2 }}>
            Hãy tải file xuống nếu bạn chưa có mẫu
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ mt: 1 }}
            onClick={handleDownExam}
          >
            Tải xuống file mẫu
          </Button>
        </DialogContent>
        <DialogActions sx={{ paddingRight: "20px" }}>
          {uploadSuccess && (
            <Button onClick={handleImport} color="primary" variant="contained">
              Import File
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 700 }}>
        Danh sách người dùng bị lỗi
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography color="red">
          Vui lòng điền đầy đủ thông tin cho những người dùng dưới đây!
        </Typography>
        <TableContainer
          component={Paper}
          sx={{ mt: 2, border: "1px solid red" }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#F4F6F8" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "red" }}>
                  Tên tài khoản
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "red" }}>
                  Họ và tên
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "red" }}>
                  Trường bị thiếu
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "red" }}>
                  Lỗi trùng
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {errorData.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.fullname || "Trống"}</TableCell>
                  <TableCell>{user.missingFields.join(", " || "Không có")}</TableCell>
                  <TableCell>
                    {user.duplicates?.join(", ") || "Không có"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
    </>
  );
}
