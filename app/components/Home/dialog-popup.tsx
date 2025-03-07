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
    id: "",
    name: "",
  });
  const [localDistrict, setLocalDistrict] = useState<Location>({
    id: "",
    name: "",
  });
  const [localWard, setLocalWard] = useState<Location>({ id: "", name: "" });
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
      setLocalProvince({ id: province.id, name: province.name });
      fetchDistrict(province.id);
      setLocalDistrict({ id: "", name: "" });
      setLocalWard({ id: "", name: "" });
      setLocalName("");
      setLocalParentId(null);
    }
  }, [open, province]);
  const determineLevelAndParentId = () => {
    if (dpmLv1.id === "" && dpmLv1.name === "") {
      return { level: 1, parentId: null };
    }
    if (dpmLv2.id === "" && dpmLv2.name === "") {
      return { level: 2, parentId: parseInt(dpmLv1.id, 10) };
    }
    if (dpmLv3.id === "" && dpmLv3.name === "") {
      return { level: 3, parentId: parseInt(dpmLv2.id, 10) };
    }
    if (dpmLv4.id === "" && dpmLv4.name === "") {
      return { level: 4, parentId: parseInt(dpmLv3.id, 10) };
    }
    return { level: 5, parentId: parseInt(dpmLv4.id, 10) };
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
        id: selectedProvince.id,
        name: selectedProvinceName,
      });
      setLocalDistrict({ id: "", name: "" });
      setLocalWard({ id: "", name: "" });
      await fetchDistrict(selectedProvince.id);
    }
  };

  const handleDistrictChange = async (event: SelectChangeEvent<string>) => {
    const selectedDistrictName = event.target.value;
    const selectedDistrict = districts.find(
      (district) => district.name === selectedDistrictName
    );
    if (selectedDistrict) {
      setLocalDistrict({
        id: selectedDistrict.id,
        name: selectedDistrictName,
      });
      setLocalWard({ id: "", name: "" });
      await fetchWard(selectedDistrict.id);
    }
  };

  const handleWardChange = (event: SelectChangeEvent<string>) => {
    const selectedWardName = event.target.value;
    const selectedWard = wards.find((ward) => ward.name === selectedWardName);
    if (selectedWard) {
      setLocalWard({ id: selectedWard.id, name: selectedWardName });
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
                    <MenuItem key={city.id} value={city.name}>
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
                    <MenuItem key={district.id} value={district.name}>
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
                    <MenuItem key={ward.id} value={ward.name}>
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
