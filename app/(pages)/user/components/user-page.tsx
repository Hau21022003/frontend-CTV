import { Button } from "@/app/components/button";
import Layout from "@/app/components/layout";
import { Box, CssBaseline, MenuItem, Typography } from "@mui/material";
import TextField from "@/app/components/text-field";
import React, { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useAppContext } from "@/app/hooks/AppContext";
import useLocate from "@/app/hooks/useLocate";
import apiService from "@/app/untils/api";
import {
  Department,
  DepartmentsResponse,
} from "../../department/types/department";
import UserTable from "./table-user";
import AddNewPopup from "./dialog-popup";
import EditPopup from "./edit-dialog";
import ProgressOverlay from "@/app/components/progress-Overlay";
import { ImportDialog } from "./import-dialog";

const HomePage: React.FC = () => {
  const [isDisableNewButton, setIsDisableAddNewButton] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
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
  const [currLevel, setCurrLevel] = useState(0);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [dept, setDept] = useState<Department>();
  const [disable, setDisable] = useState<String[]>([]);
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
    choosed,
    setChoosed,
    setIsLoading,
    isLoading,
  } = useAppContext();
  useEffect(() => {
    const storedPermissions = localStorage.getItem("permissions");
    const depart = localStorage.getItem("dept");
    if (storedPermissions) {
      const parsedPermissions = JSON.parse(storedPermissions);
      if (Array.isArray(parsedPermissions)) {
        setPermissions(parsedPermissions);
      } else if (typeof parsedPermissions === "object") {
        const permissionsArray = Object.entries(parsedPermissions).map(
          ([subject, permission]) => ({
            subject,
            permission,
          })
        );
        setPermissions(permissionsArray);
      } else {
        console.error(
          "Permissions are not in the expected array or object format:",
          parsedPermissions
        );
        setPermissions([]);
      }
    }
    if (depart) {
      setDept(JSON.parse(depart));
      let departmentId = JSON.parse(depart).id;
      fetchProvinceDepartmentUser(departmentId);
    }
  }, []);
  
  const hasPermission = (subject: string, action: string) => {
    const permission = permissions.find(perm => perm.subject === subject);
    return permission ? permission.permission[action] : false;
  };

  const { cities } = useLocate();

  const fetchProvinceDepartmentUser = async (id: string) => {
    try {
      let isDepartChild = false;
      setIsLoading(true);

      const resPro: any = await apiService.get("user/province");
      const province = resPro.data.data;
      setProvince({ key: province.key, name: province.name });
      const resDpParent: any = await apiService.get(
        "department/parent-department-user"
      );
      const dpParent = resDpParent.data.data;
      console.log("Parent department", dpParent);
      const lv1 = dpParent.filter(
        (department: Department) => department.level === 1
      );
      const lv2 = dpParent.filter(
        (department: Department) => department.level === 2
      );
      const lv3 = dpParent.filter(
        (department: Department) => department.level === 3
      );
      const lv4 = dpParent.filter(
        (department: Department) => department.level === 4
      );  

      if (lv1.length > 0) {
        setDpmLv1({ key: lv1[0].id, name: lv1[0].name });
        setDepartmentsLv1(lv1);
        setChoosed({ key: lv1[0].id, name: lv1[0].name });
        setIsDisableLv1(true);

      } 
      else if(!isDepartChild){    
        const respChil1: any = await apiService.get(
          `department/children-department-user?level=1`
        );
        let lv1 = respChil1.data.data;
        setDepartmentsLv1(lv1);
        isDepartChild = true;
      }
      if (lv2.length > 0) {
        setDpmLv2({ key: lv2[0].id, name: lv2[0].name });
        setDepartmentsLv2(lv2);
        setIsDisableLv2(true);
        setChoosed({ key: lv2[0].id, name: lv2[0].name });
      } else if(!isDepartChild){
        const respChil2: any = await apiService.get(
          `department/children-department-user?level=2`
        );  
        let lv2 = respChil2.data.data;
        setDepartmentsLv2(lv2);
        isDepartChild = true;

      }
      if (lv3.length > 0) {
        setDpmLv3({ key: lv3[0].id, name: lv3[0].name });
        setDepartmentsLv3(lv3);
        setIsDisableLv3(true);
        setChoosed({ key: lv3[0].id, name: lv3[0].name });
      } else if(!isDepartChild){
        const respChil3: any = await apiService.get(
          `department/children-department-user?level=3`
        );
        let lv3 = respChil3.data.data;
        setDepartmentsLv3(lv3);
        isDepartChild = true;
      }
      if (lv4.length > 0) {
        setDpmLv4({ key: lv4[0].id, name: lv4[0].name });
        setDepartmentsLv4(lv4);
        setIsDisableLv4(true);
        setChoosed({ key: lv4[0].id, name: lv4[0].name });
      }

    } catch (error) {
      console.error("Failed to fetch province and departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async (url: string, setter: Function) => {
    try {
      setIsLoading(true);

      const response = await apiService.get<DepartmentsResponse>(url);
      const data: DepartmentsResponse = response.data;

      setter(data.data);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      setter([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvinceChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedProvinceName = event.target.value;
    const selectedProvince = cities.find(
      (city) => city.name === selectedProvinceName
    );
    if (selectedProvince) {
      setRefreshTable(() => !refreshOptions);
      setIsDisableAddNewButton(false);
      setProvince({ key: selectedProvince.key, name: selectedProvince.name });
    }
  };
  const resetAllLevels = (levelToReset: number) => {
    if(levelToReset === 0){
      if(!isDisableLv1){
        setDpmLv1({ key: '', name:''})
      }
      if (!isDisableLv2) {
        setDpmLv2({ key: "", name: "" });
        setDepartmentsLv2([])
      }
      if (!isDisableLv3) {
        setDpmLv3({ key: "", name: "" });
        setDepartmentsLv3([])

      }
      if (!isDisableLv4) {
        setDpmLv4({ key: "", name: "" });
        setDepartmentsLv4([])

      }
    }
    if (levelToReset === 1) {
      if (!isDisableLv2) {
        setDpmLv2({ key: "", name: "" });
      }
      if (!isDisableLv3) {
        setDpmLv3({ key: "", name: "" });
        setDepartmentsLv3([])

      }
      if (!isDisableLv4) {
        setDpmLv4({ key: "", name: "" });
        setDepartmentsLv4([])

      }
    } else if (levelToReset === 2) {
      // if (!isDisableLv1) setDpmLv1({ key: "", name: "" });
      if (!isDisableLv3) {
        setDpmLv3({ key: "", name: "" });

      }
      if (!isDisableLv4) {
        setDpmLv4({ key: "", name: "" });
        setDepartmentsLv4([])

      }
    } else if (levelToReset === 3) {
      if (!isDisableLv4) {
        setDpmLv4({ key: "", name: "" });
      }
    } else if (levelToReset === 4) {

    }
  };

  const handleDepartmentChange =
    (
      setter: Function,
      levelSetter: Function,
      nextLevelSetter: Function,
      urlTemplate: string,
      departments: Department[],
      currlevel: number = 5,
      isDisable: boolean
    ) =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isDisable) {
        const selectedDepartmentName = event.target.value;
        const selectedDepartment = departments.find(
          (dept) => dept.name === selectedDepartmentName
        );
        // console.log('SELECT: ', selectedDepartment);
        if (selectedDepartment) {
          console.log("departmentId:", selectedDepartment.id);
          setter({ key: selectedDepartment.id, name: selectedDepartment.name });
          setChoosed({
            key: selectedDepartment.id.toString(),
            name: selectedDepartment.name,
          });
          const url = urlTemplate.replace('{$id}', String(selectedDepartment.id));
          await fetchDepartments(url, levelSetter);
          nextLevelSetter([]);
          if (setter === setDpmLv1) {
            resetAllLevels(1);
          } else if (setter === setDpmLv2) {
            resetAllLevels(2);
          } else if (setter === setDpmLv3) {
            resetAllLevels(3);
          } else if (setter === setDpmLv4) {
            resetAllLevels(4);
            setIsDisableAddNewButton(true)
          }
        }
      }
    };

  const handleClear = (setter: any, isDisable: boolean) => {
    if (!isDisable) {
      // Clear the specific text field
      setter({ key: "", name: "" });

      // Enable the Add New button if any department or province is selected
      setIsDisableAddNewButton(false);

      if (setter === setDpmLv1) {
        resetAllLevels(0);
      } else if (setter === setDpmLv2) {
        resetAllLevels(1);
        if(dpmLv1){
        setChoosed({ key: dpmLv1.key, name: dpmLv1.name });
        }
      } else if (setter === setDpmLv3) {
        resetAllLevels(2);
        if(dpmLv2){ 
          setChoosed({ key: dpmLv2.key, name: dpmLv2.name });
          }

      } else if (setter === setDpmLv4) {
        resetAllLevels(3);
        if(dpmLv3){ 
          setChoosed({ key: dpmLv3.key, name: dpmLv3.name });
          }
      }
    }
  };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRefreshTable((prev) => !prev);
    setRefreshOptions((prev) => !prev);
  };
  const handleCloseImport = () => {
    setOpenImport(false);
    setRefreshTable(prev => !prev);
};

const handleOpenImport = () => {
    setOpenImport(true);
};

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
          <div className="py-2 px-6 bg-white flex items-center justify-between shadow-md rounded-lg h-11 gap-4">
            <Typography
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: "18px",
                color: "black",
                flexGrow: 1,
              }}
            >
              Quản lý người dùng
            </Typography>
            <Button
              customVariants="text-primary"
              color="primary"
              sx={{ textTransform: "none" }}
              onClick={handleOpenImport}
              disabled={!hasPermission('user', 'create') || choosed.key == ''}
              // disabled={isDisableNewButton}
            >
              {/* <FileDownloadOutlinedIcon sx={{ transform: "rotate(180deg)" }} /> */}
              Chỉnh sửa bảng
            </Button>
            <Button
              variant="outlined"
              color="primary"
              sx={{ textTransform: "none" }}
              onClick={handleOpenImport}
              disabled={!hasPermission('user', 'create') || choosed.key == ''}
              // disabled={isDisableNewButton}
            >
              <FileDownloadOutlinedIcon sx={{ transform: "rotate(180deg)" }} />
              Import
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ textTransform: "none" }}
              onClick={handleOpenDialog}
              disabled={!hasPermission('user', 'create') || isDisableNewButton}
            //   disabled={isDisableNewButton}
            >
              <AddIcon />
              Thêm mới
            </Button>
          </div>
          <Box sx={{ display: "flex", marginBottom: 1 }}>
            <Box
              sx={{ display: "flex", flex: 1, justifyContent: "space-between" }}
            >
              <TextField
                select
                size="small"
                label="Thành phố/Tỉnh thành"
                value={province.name}
                disabled={true}
                onChange={handleProvinceChange}
                sx={{ flex: 1, marginRight: 2 }}
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
                select
                size="small"
                label="Đơn vị bậc 1"
                value={dpmLv1.name}
                onChange={handleDepartmentChange(
                  setDpmLv1,
                  setDepartmentsLv2,
                  setDepartmentsLv3,
                  `/department/level-2-3-4?currLevel=2&parentId={$id}`,
                  departmentsLv1,
                  2,
                  isDisableLv1
                )}
                sx={{ flex: 1, marginRight: 2 }}
                disabled={!province.name ||isDisableLv1}
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
                    <MenuItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Đơn vị bậc 2"
                value={dpmLv2.name}
                disabled={!dpmLv1.name||isDisableLv2}
                onChange={handleDepartmentChange(
                  setDpmLv2,
                  setDepartmentsLv3,
                  setDepartmentsLv4,
                  `/department/level-2-3-4?currLevel=3&parentId={$id}`,
                  departmentsLv2,
                  3,
                  isDisableLv2
                )}
                sx={{ flex: 1, marginRight: 2 }}
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
                size="small"
                label="Đơn vị bậc 3"
                value={dpmLv3.name}
                onChange={handleDepartmentChange(
                  setDpmLv3,
                  setDepartmentsLv4,
                  () => {},
                  `/department/level-2-3-4?currLevel=4&parentId={$id}`,
                  departmentsLv3,
                  4,
                  isDisableLv3
                )}
                sx={{ flex: 1, marginRight: 2 }}
                disabled={!dpmLv2.name ||isDisableLv3}
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
                size="small"
                label="Đơn vị bậc 4"
                value={dpmLv4.name}
                onChange={handleDepartmentChange(
                  setDpmLv4,
                  () => {},
                  () => {},
                  `/department/level-2-3-4?currLevel=5&parentId={$id}`,
                  departmentsLv4,
                  5,
                  isDisableLv4
                )}
                sx={{ flex: 1 }}
                disabled={ !dpmLv3.name || isDisableLv4}
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
             {hasPermission("user", "view") ? (
                <UserTable refresh={refreshTable} />
            ) : (
                <Typography>You do not have permission to access</Typography>
            )}
          </Box>
        </Box>
        <AddNewPopup open={openDialog} onClose={handleCloseDialog} type="add" />
        <ImportDialog open={openImport} onClose={handleCloseImport}/>
      </Box>
      <ProgressOverlay isLoading={isLoading} />
    </Layout>
  );
};

export default HomePage;
