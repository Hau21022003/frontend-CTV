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
import { useAppContext, Location } from "@/app/hooks/AppContext";
import apiService from "@/app/untils/api";
import TextField from "../text-field";
import { Button } from "../button";
interface DialogPopupProps {
  type: "Chỉnh sửa" | "Thêm mới";
  open: boolean;
  handleClose: () => void;
}

const DialogPopup: React.FC<DialogPopupProps> = ({
  type,
  open,
  handleClose,
}) => {
  const { refreshAddNew, setRefreshAddNew, setIsLoading } = useAppContext();
  const { cities, districts, wards, fetchDistrict, fetchWard } = useLocate();
  const {
    province,
    setProvince,
    level,
    setLevel,
    name,
    setName,
    district,
    setDistrict,
    ward,
    setWard,
    dpmLv1,
    dpmLv2,
    dpmLv3,
    dpmLv4,
  } = useAppContext();

  const [localProvince, setLocalProvince] = useState<Location>({
    key: "",
    name: "",
  });
  const [localDistrict, setLocalDistrict] = useState<Location>({
    key: "",
    name: "",
  });
  const [localWard, setLocalWard] = useState<Location>({ key: "", name: "" });
  const [localName, setLocalName] = useState("");
  const [localParentId, setLocalParentId] = useState<number | null>(null);
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
      setLocalProvince({ key: province.key, name: province.name });
      fetchDistrict(province.key);
      setLocalDistrict({ key: "", name: "" });
      setLocalWard({ key: "", name: "" });
      setLocalName("");
      setLocalParentId(null);
    }
  }, [open, province]);
  const determineLevelAndParentId = () => {
    if (dpmLv1.key === "" && dpmLv1.name === "") {
      return { level: 1, parentId: null };
    }
    if (dpmLv2.key === "" && dpmLv2.name === "") {
      return { level: 2, parentId: parseInt(dpmLv1.key, 10) };
    }
    if (dpmLv3.key === "" && dpmLv3.name === "") {
      return { level: 3, parentId: parseInt(dpmLv2.key, 10) };
    }
    if (dpmLv4.key === "" && dpmLv4.name === "") {
      return { level: 4, parentId: parseInt(dpmLv3.key, 10) };
    }
    return { level: 5, parentId: parseInt(dpmLv4.key, 10) };
  };

  const handleSave = async () => {
    const { level, parentId } = determineLevelAndParentId();
    if (level !== 5) {
      const newDepartment = {
        name: localName,
        province: localProvince,
        level: level,
        district: localDistrict,
        ward: localWard,
        parentId: parentId,
      };
      if (type === "Thêm mới") {
        try {
          setIsLoading(true);

          const response = await apiService.post(
            "/department/add-new-department",
            newDepartment
          );
          setRefreshAddNew(!refreshAddNew);
        } catch (error: any) {
          if (error.status === 403) {
            setSnackbarMessage(error.response.data.message);
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
          }
          console.error("Error", error.response.data.message);
        } finally {
          setIsLoading(false);
        }
      }
    }

    handleClose();
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
          {type}
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
                label="Tên cơ quan"
                type="text"
                fullWidth
                variant="outlined"
                required
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
              }}
            >
              <TextField
                select
                value={localDistrict.name}
                onChange={handleDistrictChange}
                label="Quận/Huyện"
                variant="outlined"
              >
                {districts &&
                  districts.map((district) => (
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
                {wards &&
                  wards.map((ward) => (
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

export default DialogPopup;
