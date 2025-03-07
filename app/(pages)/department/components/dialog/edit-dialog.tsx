import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  SelectChangeEvent,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useLocate from "@/app/hooks/useLocate";
import apiService from "@/app/untils/api";
import { useAppContext, Location } from "@/app/hooks/AppContext"; // Import useAppContext
import { Button } from "@/app/components/button";
import TextField from "@/app/components/text-field";
interface EditDialogProps {
  open: boolean;
  handleClose: () => void;
  initialData: {
    id: number;
    province: Location;
    district: Location;
    ward: Location;
    name: string;
  };
}

const EditDialog: React.FC<EditDialogProps> = ({
  open,
  handleClose,
  initialData,
}) => {
  const { refreshDelete, setDeleteRefresh, setIsLoading } = useAppContext();
  const { cities, districts, wards, fetchDistrict, fetchWard } = useLocate();
  const { province: contextProvince } = useAppContext(); // Get province from context

  const [localProvince, setLocalProvince] = useState<Location>(
    initialData.province
  );
  const [localDistrict, setLocalDistrict] = useState<Location>(
    initialData.district
  );
  const [localWard, setLocalWard] = useState<Location>(initialData.ward);
  const [localName, setLocalName] = useState(initialData.name);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  useEffect(() => {
    if (open) {
      setLocalName(initialData.name);
      setLocalProvince(contextProvince);

      if (contextProvince.key) {
        fetchDistrict(contextProvince.key);
      }
      if (initialData.district.key) {
        fetchWard(initialData.district.key);
      }
    }
  }, [open]);

  const handleSave = async () => {
    const updatedDepartment = {
      name: localName,
      province: localProvince,
      district: localDistrict,
      ward: localWard,
    };

    try {
      setIsLoading(true);
      const response = await apiService.put(
        `/department/${initialData.id}/update`,
        updatedDepartment
      );
      setDeleteRefresh(!refreshDelete);
      handleClose();
    } catch (error: any) {
      // console.error('Error editing department:', error);
      if (error.status === 403) {
        setSnackbarMessage(error.response.data.message);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
      console.error("Error", error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvinceChange = async (event: SelectChangeEvent<string>) => {
    const selectedProvinceName = event.target.value;
    const selectedProvince = cities.find(
      (city) => city.name === selectedProvinceName
    );
    if (selectedProvince) {
      setLocalProvince({
        key: selectedProvince.key,
        name: selectedProvinceName,
      });
      setLocalDistrict({ key: "", name: "" });
      setLocalWard({ key: "", name: "" });
      await fetchDistrict(selectedProvince.key);
    }
  };

  const handleDistrictChange = async (event: SelectChangeEvent<string>) => {
    const selectedDistrictName = event.target.value;
    const selectedDistrict = districts.find(
      (district) => district.name === selectedDistrictName
    );
    if (selectedDistrict) {
      setLocalDistrict({
        key: selectedDistrict.key,
        name: selectedDistrictName,
      });
      setLocalWard({ key: "", name: "" });
      await fetchWard(selectedDistrict.key);
    }
  };

  const handleWardChange = (event: SelectChangeEvent<string>) => {
    const selectedWardName = event.target.value;
    const selectedWard = wards.find((ward) => ward.name === selectedWardName);
    if (selectedWard) {
      setLocalWard({ key: selectedWard.key, name: selectedWardName });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Chỉnh sửa
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <TextField
                autoFocus
                size="small"
                label="Tên cơ quan"
                type="text"
                required
                fullWidth
                variant="outlined"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                InputProps={{ sx: { height: "40px" } }}
              />
              <TextField
                select
                value={localProvince.name}
                onChange={handleProvinceChange}
                size="small"
                label="Tỉnh/Thành phố"
                variant="outlined"
              >
                {cities
                  .slice()
                  .reverse()
                  .map((city) => (
                    <MenuItem key={city.key} value={city.name}>
                      {city.name}
                    </MenuItem>
                  ))}
              </TextField>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                marginTop: "10px",
              }}
            >
              <TextField
                select
                value={localDistrict.name}
                onChange={handleDistrictChange}
                label="Quận/Huyện"
                variant="outlined"
              >
                {districts.map((district) => (
                  <MenuItem key={district.key} value={district.name}>
                    {district.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                value={localWard.name}
                onChange={handleWardChange}
                label="Phường/Xã"
                variant="outlined"
              >
                {wards.map((ward) => (
                  <MenuItem key={ward.key} value={ward.name}>
                    {ward.name}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <Box display="flex" justifyContent="flex-end" width="100%">
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              sx={{
                marginRight: "15px",
                height: "37px",
                width: "97px",
                textTransform: "none",
              }}
            >
              Lưu
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
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
    </>
  );
};

export default EditDialog;
