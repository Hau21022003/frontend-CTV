import { useAuth } from "@/app/hooks/AuthContext";
import { useAppContext } from "@/app/hooks/AppContext";
import useLocate from "@/app/hooks/useLocate";
import React, { useEffect, useState } from "react";
import apiService from "@/app/untils/api";
import { DepartmentsResponse } from "@/app/(pages)/department/types/department";
import Layout from "../layout";
import { Box, CssBaseline, MenuItem, Typography } from "@mui/material";
import { Button } from "../button";
import TextField from "../text-field";
import DepartmentTable from "@/app/(pages)/department/components/table-department";
import DialogPopup from "./dialog-popup";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import CloseIcon from "@mui/icons-material/Close";
import ProgressOverlay from "../progress-Overlay";
interface Department {
  id: number;
  idProvince: number;
  idCommune: number;
  idDistrict: number;
  departmentName: string;
  departmentId: number;
  province: string;
  district: string;
  ward: string;
  level: number;
  name: string;
}
const HomePage: React.FC = () => {
  const { user } = useAuth();
  const provinceName = user?.department?.province?.name;
  console.log("PRO", provinceName);
  const departmentName = user?.department?.departmentName;
  console.log("DEP", departmentName);
  const [openDialog, setOpenDialog] = useState(false);
  //   const [isDisableNewButton, setIsDisableAddNewButton] = useState(true);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(
    null
  );
  const [provinceId, setProvinceId] = useState<number | null>(null); // Lưu ID của tỉnh
  const [refreshTable, setRefreshTable] = useState(false);
  const [refreshOptions, setRefreshOptions] = useState(false);
  const [departmentsLv1, setDepartmentsLv1] = useState<Department[]>([]);
  const [departmentsLv2, setDepartmentsLv2] = useState<Department[]>([]);
  const [departmentsLv3, setDepartmentsLv3] = useState<Department[]>([]);
  const [departmentsLv4, setDepartmentsLv4] = useState<Department[]>([]);
  const [isDisableLv1, setIsDisableLv1] = useState<boolean>(false);
  const [isDisableLv2, setIsDisableLv2] = useState<boolean>(false);
  const [isDisableLv3, setIsDisableLv3] = useState<boolean>(false);
  const [isDisableLv4, setIsDisableLv4] = useState<boolean>(false);
  const [isDisableProvince, setIsDisableProvince] = useState<boolean>(false);
  const [isDisaleAddNewButton, setIsDisableAddNewButton] =
    useState<boolean>(false);
  const [isDepartmentDisabled, setIsDepartmentDisabled] =
    useState<boolean>(false);
  const [currLevel, setCurrLevel] = useState(0);

  const {
    province,
    setProvince,
    dpmLv1,
    setDpmLv1,
    dpmLv2,
    setDpmLv2,
    dpmLv3,
    setDpmLv3,
    dpmLv4,
    setDpmLv4,
    refreshAddNew,
    setRefreshAddNew,
    refreshDelete,
    setDeleteRefresh,
    isLoading,
    setIsLoading,
  } = useAppContext();

  const { cities } = useLocate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [provinceOptions, setProvinceOptions] = useState<Department[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDepartmentName, setSelectedDepartmentName] =
    useState<string>("");
  const [isProvinceDisabled, setIsProvinceDisabled] = useState<boolean>(false);

  useEffect(() => {
    const storedIsAdmin = localStorage.getItem("isAdmin");
    const storedUser = localStorage.getItem("user_info"); // Lấy thông tin người dùng lưu trữ
    console.log("STOREDUser", storedUser);
    const storedProvince = localStorage.getItem("province");
    console.log("STOREDProvince", storedProvince);
    if (storedIsAdmin !== null) {
      setIsAdmin(storedIsAdmin === "true");
    }

    if (storedIsAdmin === "false" && storedUser) {
      // Nếu không phải admin, lấy province từ department của storedUser
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.department && parsedUser.department.province) {
          setSelectedProvince(parsedUser.department.province);
          setIsProvinceDisabled(true);
        }
        if (parsedUser.department?.departmentName) {
          setSelectedDepartmentName(parsedUser.department.departmentName); // Gán đơn vị cấp 1 từ user
          setIsDisableLv1(true); // Disable TextField đơn vị cấp 1
        }
      } catch (error) {
        console.error("Lỗi parsing storedUser:", error);
      }
    } else if (storedIsAdmin === "true") {
      // Nếu là admin, gọi API lấy danh sách tỉnh thành
      apiService
        .get("/department/find-all-province")
        .then((response) => {
          if (response.data && response.data.length > 0) {
            setProvinceOptions(response.data);
            setSelectedProvince(response.data[0].name); // Tên tỉnh
            setSelectedProvinceId(response.data[0].idProvince); // ID tỉnh
          }
        })
        .catch((error) => {
          console.error("Lỗi khi lấy danh sách tỉnh:", error);
        });
    }
  }, []);
  useEffect(() => {
    if (selectedProvinceId) {
      apiService
        .get(`/department/province-level1?province_id=${selectedProvinceId}`)
        .then((response) => {
          console.log("responseDPMLV1", response.data);
          if (response.data && response.data.length > 0) {
            setDepartmentsLv1(response.data); // Lưu danh sách đơn vị cấp 1
          } else {
            setDepartmentsLv1([]); // Xóa danh sách nếu không có dữ liệu
          }
        })
        .catch((error) => {
          console.error("Lỗi khi lấy danh sách đơn vị cấp 1:", error);
          setDepartmentsLv1([]);
        });
    }
  }, [selectedProvinceId]);

  const handleProvinceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const provinceName = event.target.value;
    const selected = provinceOptions.find((p) => p.name === provinceName);
    if (selected) {
      setSelectedProvince(selected.name);
      setSelectedProvinceId(selected.idProvince);
      setDepartmentsLv1([]);
    }
    // console.log("SELECTED", selected?.idProvince);
  };

  // const [permissions, setPermissions] = useState<any[]>([]);
  // useEffect(() => {
  //   const storedPermissions = localStorage.getItem("permissions");
  //   const depart = localStorage.getItem("dept");
  //   if (storedPermissions) {
  //     try {
  //       const parsedPermissions = JSON.parse(storedPermissions);
  //       if (Array.isArray(parsedPermissions)) {
  //         setPermissions(parsedPermissions);
  //       } else if (typeof parsedPermissions === "object") {
  //         const permissionsArray = Object.entries(parsedPermissions).map(
  //           ([subject, permission]) => ({
  //             subject,
  //             permission,
  //           })
  //         );
  //         setPermissions(permissionsArray);
  //       } else {
  //         console.error(
  //           "Permissions are not in the expected array or object format:",
  //           parsedPermissions
  //         );
  //         setPermissions([]);
  //       }
  //     } catch (error) {
  //       console.error("Error parsing permissions from localStorage:", error);
  //       setPermissions([]);
  //     }
  //   }
  //   if (depart) {
  //     // setDept(JSON.parse(depart));
  //     let departmentId = JSON.parse(depart).id;
  //     fetchProvinceDepartmentUser(departmentId);
  //   }
  // }, []);

  // const fetchProvinceDepartmentUser = async (id: string) => {
  //   try {
  //     let isDepartChild = false;
  //     setIsLoading(true);

  //     const resPro: any = await apiService.get("user/province");
  //     const province = resPro.data.data;
  //     if (province.name) {
  //       setProvince({ key: province.key, name: province.name });
  //       setIsDisableProvince(true);
  //     }
  //     const resDpParent: any = await apiService.get(
  //       "department/parent-department-user"
  //     );
  //     const dpParent = resDpParent.data.data;

  //     const lv1 = dpParent.filter(
  //       (department: Department) => department.level === 1
  //     );
  //     const lv2 = dpParent.filter(
  //       (department: Department) => department.level === 2
  //     );
  //     const lv3 = dpParent.filter(
  //       (department: Department) => department.level === 3
  //     );
  //     const lv4 = dpParent.filter(
  //       (department: Department) => department.level === 4
  //     );

  //     if (lv1.length > 0) {
  //       setDpmLv1({ key: lv1[0].id, name: lv1[0].name });
  //       setDepartmentsLv1(lv1);
  //       // setChoosed({ key: lv1[0].id, name: lv1[0].name });

  //       setIsDisableLv1(true);
  //     } else if (!isDepartChild) {
  //       const respChil1: any = await apiService.get(
  //         `department/children-department-user?level=1`
  //       );
  //       let lv1 = respChil1.data.data;
  //       setDepartmentsLv1(lv1);
  //       isDepartChild = true;
  //     }
  //     if (lv2.length > 0) {
  //       setDpmLv2({ key: lv2[0].id, name: lv2[0].name });
  //       setDepartmentsLv2(lv2);
  //       setIsDisableLv2(true);
  //       // setChoosed({ key: lv2[0].id, name: lv2[0].name });
  //     } else if (!isDepartChild) {
  //       const respChil2: any = await apiService.get(
  //         `department/children-department-user?level=2`
  //       );
  //       let lv2 = respChil2.data.data;
  //       setDepartmentsLv2(lv2);
  //       isDepartChild = true;
  //     }
  //     if (lv3.length > 0) {
  //       setDpmLv3({ key: lv3[0].id, name: lv3[0].name });
  //       setDepartmentsLv3(lv3);
  //       setIsDisableLv3(true);
  //       // setChoosed({ key: lv3[0].id, name: lv3[0].name });
  //     } else if (!isDepartChild) {
  //       const respChil3: any = await apiService.get(
  //         `department/children-department-user?level=3`
  //       );
  //       let lv3 = respChil3.data.data;
  //       setDepartmentsLv3(lv3);
  //       isDepartChild = true;
  //     }
  //     if (lv4.length > 0) {
  //       setDpmLv4({ key: lv4[0].id, name: lv4[0].name });
  //       setDepartmentsLv4(lv4);
  //       setIsDisableLv4(true);
  //       // setChoosed({ key: lv4[0].id, name: lv4[0].name });
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch province and departments:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const hasPermission = (subject: string, action: string) => {
  //   const permission = permissions.find((perm) => perm.subject === subject);
  //   return permission ? permission.permission[action] : false;
  // };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRefreshTable((prev) => !prev);
    setRefreshOptions((prev) => !prev);
  };

  const fetchDepartments = async (url: string, setter: Function) => {
    try {
      setIsLoading(true);
      // console.log('LIST CURRENTLEVEL:', currLevel);
      // console.log('URL: ', url);
      const response = await apiService.get<DepartmentsResponse>(url);
      const data: DepartmentsResponse = response.data;

      console.log("DATA: ", data.data);
      setter(data.data);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      setter([]);
    } finally {
      setIsLoading(false);
    }
  };
  // const handleProvinceChange = async (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const selectedProvinceName = event.target.value;
  //   const selectedProvince = cities.find(
  //     (city) => city.name === selectedProvinceName
  //   );
  //   if (selectedProvince) {
  //     setRefreshTable(() => !refreshOptions);
  //     //   setIsDisableAddNewButton(false);
  //     setProvince({ key: selectedProvince.key, name: selectedProvince.name });
  //     await fetchDepartments(
  //       `/department/level1/${selectedProvince.key}`,
  //       setDepartmentsLv1
  //     );
  //     setDpmLv1({ key: "", name: "" });
  //     setDpmLv2({ key: "", name: "" });
  //     setDpmLv3({ key: "", name: "" });
  //     setDpmLv4({ key: "", name: "" });
  //     setDepartmentsLv2([]);
  //     setDepartmentsLv3([]);
  //     setDepartmentsLv4([]);
  //     setCurrLevel(1);
  //   }
  // };
  const handleDeparmentLevel1Change = async () => {
    if (!selectedProvinceId) return;

    try {
      const response = await apiService.get(
        `/department/province-level1?province_id=${selectedProvinceId}`
      );
      console.log("responseDPMLV1", response.data);

      if (response.data && response.data.length > 0) {
        const departmentNames = response.data.map(
          (dept: any) => dept.departmentName
        );
        setSelectedDepartmentName(departmentNames.join(", ")); // Hiển thị danh sách đơn vị cấp 1
      } else {
        setSelectedDepartmentName(""); // Nếu không có đơn vị nào
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn vị cấp 1:", error);
      setSelectedDepartmentName("");
    }
  };
  useEffect(() => {
    handleDeparmentLevel1Change();
  }, [selectedProvinceId]);
  console.log("SELECTEDDPMN", selectedDepartmentName);

  const handleDepartmentChange =
    (
      setter: Function,
      levelSetter: Function,
      nextLevelSetter: Function,
      urlTemplate: string,
      departments: Department[],
      currlevel: number = 5
    ) =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedDepartmentName = event.target.value;
      const selectedDepartment = departments.find(
        (dept) => dept.name === selectedDepartmentName
      );
      // console.log('SELECT: ', selectedDepartment);
      if (selectedDepartment) {
        setCurrLevel(currlevel);
        // setIsDisableAddNewButton(false);
        // setRefreshOptions(()=> !refreshOptions);
        setter({ key: selectedDepartment.id, name: selectedDepartment.name });
        const url = urlTemplate.replace("{$id}", String(selectedDepartment.id));
        await fetchDepartments(url, levelSetter);
        nextLevelSetter([]);
        if (setter === setDpmLv1) {
          setDpmLv2({ key: "", name: "" });
          setDpmLv3({ key: "", name: "" });
          setDpmLv4({ key: "", name: "" });
          setDepartmentsLv3([]);
          setDepartmentsLv4([]);
        } else if (setter === setDpmLv2) {
          setDpmLv3({ key: "", name: "" });
          setDpmLv4({ key: "", name: "" });
          setDepartmentsLv4([]);
        } else if (setter === setDpmLv3) {
          setDpmLv4({ key: "", name: "" });
        } else if (setter === setDpmLv4) {
          setIsDisableAddNewButton(true);
        }
      }
    };

  const handleClear = (setter: any, isDisable: boolean) => {
    if (!isDisable) {
      // Clear the specific text field
      setter({ key: "", name: "" });

      // Enable the Add New button if any department or province is selected
      setIsDisableAddNewButton(false);

      // Check if it’s the first text field, and if so, clear the others as well
      if (setter === setDpmLv1) {
        setDpmLv2({ key: "", name: "" });
        setDpmLv3({ key: "", name: "" });
        setDpmLv4({ key: "", name: "" });

        setDepartmentsLv2([]);
        setDepartmentsLv3([]);
        setDepartmentsLv4([]);
      }
      if (setter === setDpmLv2) {
        setDpmLv3({ key: "", name: "" });
        setDpmLv4({ key: "", name: "" });

        setDepartmentsLv3([]);
        setDepartmentsLv4([]);
      }
      if (setter === setDpmLv3) {
        setDpmLv4({ key: "", name: "" });

        setDepartmentsLv4([]);
      }
    }
  };

  // useEffect(() => {
  //   const fetchAllData = async () => {
  //     if (province.key) {
  //       await fetchDepartments(
  //         `/department/level1/${province.key}`,
  //         setDepartmentsLv1
  //       );
  //     }
  //     if (dpmLv1.key) {
  //       await fetchDepartments(
  //         `/department/level-2-3-4?currLevel=2&parentId=${dpmLv1.key}`,
  //         setDepartmentsLv2
  //       );
  //     }
  //     if (dpmLv2.key) {
  //       await fetchDepartments(
  //         `/department/level-2-3-4?currLevel=3&parentId=${dpmLv2.key}`,
  //         setDepartmentsLv3
  //       );
  //     }
  //     if (dpmLv3.key) {
  //       await fetchDepartments(
  //         `/department/level-2-3-4?currLevel=4&parentId=${dpmLv3.key}`,
  //         setDepartmentsLv4
  //       );
  //     }
  //   };
  //   fetchAllData();
  // }, [refreshOptions, refreshDelete]);

  return (
    <Layout>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh", paddingBottom: "10px" }}>
        <Box
          component="main"
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            bgcolor: "background.default",
            px: "8px",
            height: "100%",
          }}
        >
          <div className="py-2 px-6 bg-white flex items-center justify-between shadow-md rounded-lg h-11">
            <Typography
              component="div"
              sx={{ fontWeight: 700, fontSize: "18px", color: "black" }}
            >
              Quản lý cơ quan đơn vị
            </Typography>
            {/* {hasPermission("department", "create") && ( */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              // disable={isDisaleAddNewButton}
            >
              Thêm mới
            </Button>
            {/* )} */}
          </div>

          <Box sx={{ display: "flex", marginBottom: 1 }}>
            <Box
              sx={{ display: "flex", flex: 1, justifyContent: "space-between" }}
            >
              {/* <TextField
                select
                label="Thành phố/Tỉnh thành"
                value={province.name}
                onChange={handleProvinceChange}
                sx={{ flex: 1, marginRight: 2 }}
                disabled={
                  !hasPermission("department", "view") || isDisableProvince
                }
              >
                {cities
                  .slice()
                  .reverse()
                  .map((city) => (
                    <MenuItem key={city.key} value={city.name}>
                      {city.name}
                    </MenuItem>
                  ))}
              </TextField> */}
              <TextField
                label="Tỉnh/Thành phố"
                value={
                  isAdmin === false ? provinceName || "" : selectedProvince
                }
                onChange={handleProvinceChange}
                sx={{ flex: 1, marginRight: 2, minHeight: "40px" }}
                select={!isProvinceDisabled} // Chỉ cho phép chọn nếu không bị disable
                disabled={isProvinceDisabled} // Vô hiệu hóa nếu là user thường
                fullWidth
                // disabled={isAdmin === false}
              >
                {provinceOptions.map((province) => (
                  <MenuItem key={province.id} value={province.name}>
                    {province.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select={!isDisableLv1}
                label="Đơn vị cấp 1"
                // value={dpmLv1.name}
                value={
                  isAdmin === false
                    ? departmentName || ""
                    : selectedDepartmentName
                }
                // onChange={handleDepartmentChange(
                //   setDpmLv1,
                //   setDepartmentsLv2,
                //   setDepartmentsLv3,
                //   `/department/level-2-3-4?currLevel=2&parentId={$id}`,
                //   departmentsLv1,
                //   2
                // )}
                onChange={(e) => setSelectedDepartmentName(e.target.value)}
                sx={{ flex: 1, marginRight: 2 }}
                // disabled={!province.name || isDisableLv1}
                disabled={isDisableLv1}
                InputProps={{
                  endAdornment: dpmLv1.name && (
                    <CloseIcon
                      fontSize="small"
                      sx={{ marginRight: "15px" }}
                      onClick={() => handleClear(setDpmLv1, isDisableLv1)}
                      style={{ cursor: "pointer" }}
                    />
                  ),
                }}
              >
                {departmentsLv1 &&
                  departmentsLv1.map((dept) => (
                    <MenuItem key={dept.departmentId} value={dept.departmentName}>
                      {dept.departmentName}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                select
                label="Đơn vị cấp 2"
                value={dpmLv2.name}
                onChange={handleDepartmentChange(
                  setDpmLv2,
                  setDepartmentsLv3,
                  setDepartmentsLv4,
                  `/department/level-2-3-4?currLevel=3&parentId={$id}`,
                  departmentsLv2,
                  3
                )}
                sx={{ flex: 1, marginRight: 2 }}
                // disabled={!dpmLv1.name || isDisableLv2}
                InputProps={{
                  endAdornment: dpmLv2.name && (
                    <CloseIcon
                      fontSize="small"
                      sx={{ marginRight: "15px" }}
                      onClick={() => handleClear(setDpmLv2, isDisableLv2)}
                      style={{ cursor: "pointer" }}
                    />
                  ),
                }}
              >
                {departmentsLv2 &&
                  departmentsLv2.map((dept) => (
                    <MenuItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                select
                label="Đơn vị cấp 3"
                value={dpmLv3.name}
                onChange={handleDepartmentChange(
                  setDpmLv3,
                  setDepartmentsLv4,
                  () => {},
                  `/department/level-2-3-4?currLevel=4&parentId={$id}`,
                  departmentsLv3,
                  4
                )}
                sx={{ flex: 1, marginRight: 2 }}
                // disabled={!dpmLv2.name || isDisableLv3}
                InputProps={{
                  endAdornment: dpmLv3.name && (
                    <CloseIcon
                      fontSize="small"
                      sx={{ marginRight: "15px" }}
                      onClick={() => handleClear(setDpmLv3, isDisableLv3)}
                      style={{ cursor: "pointer" }}
                    />
                  ),
                }}
              >
                {departmentsLv3 &&
                  departmentsLv3.map((dept) => (
                    <MenuItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                select
                label="Đơn vị cấp 4"
                value={dpmLv4.name}
                onChange={handleDepartmentChange(
                  setDpmLv4,
                  () => {},
                  () => {},
                  `/department/level-2-3-4?currLevel=5&parentId={$id}`,
                  departmentsLv4,
                  5
                )}
                sx={{ flex: 1 }}
                // disabled={!dpmLv3.name || isDisableLv4}
                InputProps={{
                  endAdornment: dpmLv4.name && (
                    <CloseIcon
                      fontSize="small"
                      sx={{ marginRight: "15px" }}
                      onClick={() => handleClear(setDpmLv4, isDisableLv4)}
                      style={{ cursor: "pointer" }}
                    />
                  ),
                }}
              >
                {departmentsLv4 &&
                  departmentsLv4.map((dept) => (
                    <MenuItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              borderRadius: "10px",
              boxShadow: 3,
            }}
          >
            <DepartmentTable refresh={refreshTable} />
            {/* {hasPermission("department", "view") ? (
              <DepartmentTable refresh={refreshTable} />
            ) : (
              <Typography>You do not have permission to access</Typography>
            )} */}
          </Box>
        </Box>
        <DialogPopup
          type="Thêm mới"
          open={openDialog}
          handleClose={handleCloseDialog}
        />
      </Box>
      {/* <ProgressOverlay isLoading={isLoading} /> */}
    </Layout>
  );
};

export default HomePage;
