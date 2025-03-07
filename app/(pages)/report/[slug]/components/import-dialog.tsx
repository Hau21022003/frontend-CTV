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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "@/app/components/button";
import { useAppContext } from "@/app/hooks/AppContext";
import apiService from "@/app/untils/api";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const { choosed } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
    setUploadSuccess(false);
    startUpload();
  };

  useEffect(() => {
    if (!open) {
      setSelectedFiles([]);
    }
  }, [open]);

  const handleChangeFileClick = () => {
    setSelectedFiles([]); // Reset the files
    setUploadSuccess(false);
    setUploadProgress(0);

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
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const res: any = await apiService.post(
        `user/import-images?departmentId=${choosed.key}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res && res.status === 201) {
        setSnackbarMessage(res.data.message);
        setSnackbarOpen(true);
        onClose();
      } else {
        console.error("Error importing data:", res.data.message);
        setSnackbarMessage(res.data.message);
        setSnackbarOpen(true);
      }

      onClose();
    } catch (error) {
      console.error("Import Error:", error);
      const errorMessage = error.response?.data?.message;
      console.error("Error saving data:", error);
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setUploadProgress(0);
    setUploadSuccess(false);
    onClose();
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  // Render filenames for selected files
  const renderFilePreviews = selectedFiles.map((file, index) => (
    <Box key={index} sx={{ width: "100%", margin: "8px 0" }}>
      <Typography variant="body2" sx={{ wordWrap: "break-word" }}>
        {file.name}
      </Typography>
    </Box>
  ));

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          Upload files
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
            Bạn có thể tải lên nhiều ảnh hoặc tài liệu
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
                accept=".png, .jpg, .jpeg, .docx"
                style={{ display: "none" }}
                id="upload-file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
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
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} files selected`
                    : "Upload image or document files"}
                </Typography>
              </Box>
            </label>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box sx={{ width: "100%", mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography sx={{ mt: 1 }}>{uploadProgress}%</Typography>
              </Box>
            )}

            {/* Display the selected file names in full width */}
            <Box sx={{ display: "flex", flexDirection: "column", mt: 2 }}>
              {renderFilePreviews}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ paddingRight: "20px" }}>
          {uploadSuccess && (
            <Button onClick={handleImport} color="primary" variant="contained">
              Import Files
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
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
