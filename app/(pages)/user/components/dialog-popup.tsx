import React, { useEffect, useState } from "react";
import { Location, useAppContext } from "@/app/hooks/AppContext";
import { useAuth } from "@/app/hooks/AuthContext";
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  SelectChangeEvent,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import useLocate from "@/app/hooks/useLocate";
import { Button } from "@/app/components/button";
import apiService from "@/app/untils/api";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import theme from "@/app/components/theme";
import ProgressOverlay from "@/app/components/progress-Overlay";
interface AddNewPopupProps {
  open: boolean;
  onClose: () => void;
  type: "add" | "edit";
  userId?: string;
}
interface Role {
  id: string;
  name: string;
  code: string;
}
interface ApiResponse {
  data: {
    items: Role[];
    message: string;
  };
}

interface ApiEditResponse {
  data: {
    active: boolean;
    address: string;
    avatar: string | null;
    birthday: string | null;
    district: Location | null;
    email: string;
    fullname: string;
    gender: string | null;
    id: string;
    title: string;
    password: string;
    phone: string | null;
    province: Location | null;
    username: string;
    ward: Location | null;
    role: object | null;
  };
}

const AddNewPopup: React.FC<AddNewPopupProps> = ({
  open,
  onClose,
  type,
  userId,
}) => {
  const { setIsEditing, user } = useAuth();
  const { cities, districts, wards, fetchDistrict, fetchWard } = useLocate();
  const { province, choosed, isLoading, setIsLoading } = useAppContext();
  const [localProvince, setLocalProvince] = useState<Location | null>({
    key: "",
    name: "",
  });
  const [localDistrict, setLocalDistrict] = useState<Location | null>({
    key: "",
    name: "",
  });
  const [localWard, setLocalWard] = useState<Location | null>({
    key: "",
    name: "",
  });
  const [localRoles, setLocalRoles] = useState<Role[]>([]);
  const [localRole, setLocalRole] = useState<Role>({
    id: "",
    name: "",
    code: "",
  });

  const [account, setAccount] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("Abcd1@34");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  // const [gender, setGender] = useState<string | null>(null);
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [active, setActive] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [accountError, setAccountError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isRoleDisabled, setIsRoleDisabled] = useState(false);

  useEffect(() => {
    if (open) {
      if (type === "add") {
        resetData();
        setLocalProvince({ key: province.key, name: province.name });
      }
      if (type === "edit") {
        const currentUserId = localStorage.getItem("id");
        if (userId === currentUserId) {
          // Disable textfield vai trò nếu userId khớp
          setIsRoleDisabled(true);
        } else {
          // Enable textfield vai trò nếu userId không khớp
          setIsRoleDisabled(false);
        }
        resetData();
        fetchRoles();
        fetchData();
      }
    }
  }, [open]);

  // useEffect(() => {
  //     if (open) {
  //         setLocalProvince({ key: province.key, name: province.name });
  //         console.log('Province: ', province)
  //         fetchDistrict(province.key);
  //         setLocalDistrict({ key: '', name: '' });
  //         setLocalWard({ key: '', name: '' });
  //     }
  // }, [open, province]);
  useEffect(() => {
    if (open) {
      if (choosed.key) {
        fetchRoles(); // Fetch roles only if choosed.key is available
      } else {
        console.error("choosed.key is undefined");
      }
    }
  }, [open, choosed]);
  useEffect(() => {
    if (localProvince) {
      fetchDistrict(localProvince.key);
    }
    if (localDistrict) {
      fetchWard(localDistrict.key);
    }
  }, [localProvince, localDistrict]);
  const resetData = () => {
    setActive(true);
    setSelectedFile(null);
    fetchRoles();
    setAvatar(null);
    setAccount("");
    setAddress("");
    setPassword("Abcd1@34");
    setFullName("");
    setTitle("");
    setEmail("");
    setPhone("");
    setLocalRole({ id: "", name: "", code: "" });
    setBirthday("");
    setGender("");
    setLocalProvince({ key: "", name: "" });
    setLocalDistrict({ key: "", name: "" });
    setLocalWard({ key: "", name: "" });
    setPhone("");
    setAccountError(null);
    setPasswordError(null);
    setEmailError(null);
    setFullNameError(null);
    setTitleError(null);
    setRoleError(null);
    setPhoneError(null);
  };
  const handleChangeAccount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccount(event.target.value);
  };
  const handleChangeFullName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(event.target.value);
  };
  const handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };
  const handleChangeGender = (event: React.ChangeEvent<{ value: unknown }>) => {
    setGender(event.target.value as string);
  };
  const handleChangeBirthday = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBirthday(event.target.value);
  };
  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const handleChangePhone = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value);
  };

  const handleChangeRole = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedRoleName = event.target.value as string;
    const selectedRole = localRoles.find(
      (role) => role.name === selectedRoleName
    );
    if (selectedRole)
      setLocalRole({
        id: selectedRole.id,
        name: selectedRoleName,
        code: selectedRole.code,
      });
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
      setLocalDistrict({ key: "", name: "" }); //
      setLocalWard({ key: "", name: "" }); //
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
      setLocalWard({ key: "", name: "" }); //
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
  const handleChangeAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  };
  const handleSave = async () => {
    // console.log(
    //   "SELECTED FILE: " +
    //     selectedFile +
    //     localProvince?.key +
    //     localProvince?.name
    // );
    // console.log("ACTIVE: SAVE", active);

    // Tạo FormData để gửi dữ liệu
    const formData = new FormData();
    // console.log("Pass: ", password);

    if (type === "add") {
      formData.append("username", account);
      formData.append("password", password);
    }
    formData.append("title", title);
    formData.append("email", email);
    formData.append("fullname", fullName);
    formData.append("roleId", localRole.id);

    if (selectedFile) {
      formData.append("avatar", selectedFile);
    }
    if (gender) {
      formData.append("gender", gender);
    }
    if (birthday) {
      formData.append("birthday", convertBirthday(birthday));
    }
    if (phone) {
      formData.append("phone", phone);
    }
    if (typeof active !== "undefined") {
      formData.append("active", active.toString());
    }
    if (choosed && choosed.key) {
      formData.append("departmentId", choosed.key);
    }
    if (localProvince?.key !== "") {
      formData.append("province", JSON.stringify(localProvince));
    }
    if (localDistrict?.key !== "") {
      formData.append("district", JSON.stringify(localDistrict));
    }
    if (localWard?.key !== "") {
      formData.append("ward", JSON.stringify(localWard));
    }
    if (address) {
      formData.append("address", address);
    }

    // Reset all error states
    setAccountError(null);
    setPasswordError(null);
    setEmailError(null);
    setFullNameError(null);
    setTitleError(null);
    setRoleError(null);
    setPhoneError(null);

    try {
      let response: any;
      setIsLoading(true);

      // Gọi API để thêm hoặc cập nhật người dùng
      if (type === "add") {
        response = await apiService.post("/user/create", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else if (type === "edit") {
        response = await apiService.put(`/user/update/${userId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const data = response.data?.data;
        if (data) {
          localStorage.setItem(
            "avatar",
            data.avatar !== null ? data.avatar : ""
          );
          localStorage.setItem("fullName", data.fullname);
          localStorage.setItem("dept", JSON.stringify(data.department));
          localStorage.setItem("permissions", JSON.stringify(data.permissions));
          setIsEditing((prev) => !prev);
        }
      }

      // Thiết lập thông báo thành công
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      onClose();
    } catch (error: any) {
      console.error("Error saving user:", error.response?.data);

      if (error.response && error.response.data) {
        const messages = error.response.data.message;

        // Kiểm tra xem messages có phải là mảng hay không
        if (Array.isArray(messages)) {
          messages.forEach((msg: string) => {
            if (msg.includes("tên tài khoản")) {
              setAccountError(msg);
            } else if (
              msg.includes("định dạng email") ||
              msg.includes("đúng định dạng")
            ) {
              setEmailError(msg);
            } else if (msg.includes("mật khẩu người dùng")) {
              setPasswordError(msg);
            } else if (msg.includes("họ tên người dùng")) {
              setFullNameError(msg);
            } else if (msg.includes("vị trí công việc")) {
              setTitleError(msg);
            } else if (msg.includes("vai trò người dùng")) {
              setRoleError(msg);
            } else if (msg.includes("Vui lòng nhập đúng số điện thoại")) {
              // Kiểm tra định dạng chỉ khi phone có giá trị
              setPhoneError(msg);
            }
          });
        } else if (typeof messages === "string") {
          if (messages.includes("Người dùng")) {
            setAccountError(messages);
          } else if (messages.includes("Email người dùng đã tồn tại")) {
            setEmailError(messages);
          }
        } else {
          // Nếu messages không phải là mảng hay chuỗi, có thể thêm xử lý khác
          console.warn("Unexpected format for error messages:", messages);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await apiService.get<ApiResponse>(
        `role/department/${choosed.key}`
      );
      setLocalRoles(res.data.data);
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
    }
  };
  const fetchData = async () => {
    try {
      const res = await apiService.get<ApiEditResponse>(`user/info/${userId}`);
      const data = res.data.data;
      if (data.avatar !== null) setAvatar(data.avatar);
      if (data.username !== null) setAccount(data.username);
      if (data.password !== null) setPassword(data.password);
      if (data.active !== null) setActive(data.active);
      if (data.role !== null) setLocalRole(data.role as Role);
      if (data.gender !== null) setGender(data.gender);
      if (data.fullname !== null) setFullName(data.fullname);
      if (data.title !== null) setTitle(data.title);
      if (data.birthday !== null) {
        const convertedBirthday = convertDateFormat(data.birthday);
        setBirthday(convertedBirthday);
      }
      if (data.email !== null) setEmail(data.email);
      if (data.phone !== null) setPhone(data.phone as string);
      if (data.address !== null) setAddress(data.address);
      if (data.province !== null)
        setLocalProvince({ key: data.province.key, name: data.province.name });
      if (data.district !== null)
        setLocalDistrict({ key: data.district.key, name: data.district.name });
      if (data.ward !== null)
        setLocalWard({ key: data.ward.key, name: data.ward.name });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const convertBirthday = (birthday: string) => {
    const [year, month, day] = birthday.split("-");
    return `${year}-${month}-${day}`;
  };

  const convertDateFormat = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);

      const maxSize = 1000 * 1024;
      if (file.size > maxSize) {
        alert("File quá lớn. Vui lòng chọn file dưới 5 MB.");
        return;
      }
      setSelectedFile(file);
    }
  };
  const handleChangeActive = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActive(event.target.checked);
  };
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          style: {
            width: "900px",
            position: "absolute",
            zIndex: 1300,
          },
        }}
      >
        {/* <DialogTitle>{type==='add' ? 'Add New' : 'Edit'}</DialogTitle> */}
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
        <DialogContent>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            gap="10px"
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              width="25%"
              height="320px"
              border="1px solid #E5E5E5"
              borderRadius="10px"
              padding="16px"
            >
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                border="1px dashed #F4F6F8"
                borderRadius="100%"
                width={180}
                height={180}
                position="relative"
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    border: "2px dashed #F4F6F8",
                    width: 170,
                    height: 170,
                    backgroundColor: "#F4F6F8",
                    borderRadius: "100%",
                  }}
                >
                  {avatar ? (
                    <>
                      <img
                        src={avatar}
                        alt="avatar"
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                        }}
                      />
                      <label
                        htmlFor="edit-avatar"
                        style={{
                          position: "absolute",
                          top: "120px",
                          right: "10px",
                          border: "1px solid white",
                          borderRadius: "100%",
                          background: "#F4F6F8",
                        }}
                      >
                        <IconButton component="span">
                          <PhotoCameraIcon sx={{ color: "#A7B1BC" }} />
                        </IconButton>
                      </label>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="edit-avatar"
                        type="file"
                        onChange={handleFileChange}
                      />
                    </>
                  ) : (
                    <>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="upload-avatar"
                        type="file"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="upload-avatar">
                        <IconButton component="span">
                          <AddAPhotoIcon sx={{ color: "#637381" }} />
                        </IconButton>
                      </label>
                      <Typography
                        align="center"
                        sx={{ fontSize: "14px", color: "#637381" }}
                      >
                        Tải lên hình đại diện
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
              <Typography
                align="center"
                sx={{ fontSize: "14px", color: "#637381" }}
              >
                *.jpeg, *.jpg, *.png.
                <br />
                Tối đa 1 MB
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "20px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: "#212B36",
                    fontWeight: 700,
                    marginRight: "8px",
                  }}
                >
                  Active
                </Typography>
                <Switch
                  sx={{
                    marginLeft: "40px",
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: theme.palette.primary.main,
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: theme.palette.primary.main,
                    },
                  }}
                  checked={active}
                  onChange={handleChangeActive}
                />
              </Box>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              gap="16px"
              width="75%"
              border="1px solid #E5E5E5"
              borderRadius="10px"
              padding="16px"
            >
              {type !== "edit" && (
                <Box display="flex" marginBottom="8px" gap="32px">
                  <TextField
                    label="Tên tài khoản"
                    fullWidth
                    variant="outlined"
                    size="small"
                    required
                    value={account}
                    onChange={handleChangeAccount}
                    error={!!accountError}
                    helperText={accountError}
                    InputLabelProps={{
                      shrink: !!account || undefined,
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
                    }}
                  />
                  <TextField
                    label="Mật khẩu"
                    required
                    size="small"
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!passwordError}
                    helperText={passwordError}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOutlined fontSize="small" />
                          ) : (
                            <VisibilityOffOutlined fontSize="small" />
                          )}
                        </IconButton>
                      ),
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
                    }}
                  />
                </Box>
              )}
              <Box display="flex" marginBottom="8px" gap="32px">
                <TextField
                  label="Họ và tên"
                  fullWidth
                  variant="outlined"
                  size="small"
                  required
                  value={fullName}
                  onChange={handleChangeFullName}
                  error={!!fullNameError}
                  helperText={fullNameError}
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
                />
                <TextField
                  label="Chức danh"
                  fullWidth
                  variant="outlined"
                  size="small"
                  required
                  value={title}
                  onChange={handleChangeTitle}
                  error={!!titleError}
                  helperText={titleError}
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
                />
              </Box>
              <Box display="flex" marginBottom="8px" gap="32px">
                <TextField
                  label="Giới tính"
                  select
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={gender}
                  onChange={handleChangeGender}
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
                  <MenuItem value="male">Nam</MenuItem>
                  <MenuItem value="female">Nữ</MenuItem>
                </TextField>
                <TextField
                  label="Ngày sinh"
                  type="date"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={birthday}
                  onChange={handleChangeBirthday}
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
                      color: birthday
                        ? theme.palette.text.primary
                        : theme.palette.text.disabled, // Nếu có giá trị thì hiển thị màu đen, ngược lại màu xám
                    },
                  }}
                />
              </Box>
              <Box display="flex" marginBottom="8px" gap="32px">
                <TextField
                  label="Vai trò"
                  select
                  fullWidth
                  variant="outlined"
                  size="small"
                  required
                  disabled={isRoleDisabled}
                  value={localRole?.name || ""}
                  onChange={handleChangeRole}
                  error={!!roleError}
                  helperText={roleError}
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
                  {localRoles?.length > 0 &&
                    localRoles.map((role: Role) => (
                      <MenuItem key={role.id} value={role.name}>
                        {role.name}
                      </MenuItem>
                    ))}
                </TextField>
                <TextField
                  label="Số điện thoại"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={phone}
                  onChange={handleChangePhone}
                  error={!!phoneError}
                  helperText={phoneError}
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
                />
              </Box>
              <Box display="flex" marginBottom="8px" gap="32px">
                <TextField
                  label="Email"
                  required
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={email}
                  onChange={handleChangeEmail}
                  error={!!emailError}
                  helperText={emailError}
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
                />
              </Box>
              <Box display="flex" marginBottom="8px" gap="32px">
                <TextField
                  label="Thành phố/Tỉnh thành"
                  select
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={localProvince?.name || ""}
                  onChange={handleProvinceChange}
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
                  {cities
                    .slice()
                    .reverse()
                    .map((city) => (
                      <MenuItem key={city.key} value={city.name}>
                        {city.name}
                      </MenuItem>
                    ))}
                </TextField>
                <TextField
                  label="Quận/Huyện"
                  select
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={localDistrict?.name || ""}
                  onChange={handleDistrictChange}
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
                  {districts?.length > 0 &&
                    districts.map((district) => (
                      <MenuItem key={district.key} value={district.name}>
                        {district.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Box>
              <Box display="flex" marginBottom="8px" gap="32px">
                <TextField
                  label="Phường/Xã"
                  select
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={localWard?.name || ""}
                  onChange={handleWardChange}
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
                  {wards?.length > 0 &&
                    wards.map((wards) => (
                      <MenuItem key={wards.key} value={wards.name}>
                        {wards.name}
                      </MenuItem>
                    ))}
                </TextField>
                <TextField
                  label="Địa chỉ"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={address}
                  onChange={handleChangeAddress}
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
                />
              </Box>
            </Box>
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
                height: "37px",
                width: "97px",
                textTransform: "none",
                padding: "16px",
              }}
            >
              Lưu
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

export default AddNewPopup;
