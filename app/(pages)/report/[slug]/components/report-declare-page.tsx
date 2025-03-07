"use client";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import React, { useEffect, useState, useReducer } from "react";
import Layout from "@/app/components/layout";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Container,
  TextField,
  Grid,
  Typography,
  Toolbar,
  AppBar,
  IconButton,
  CssBaseline,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Button } from "@/app/components/button";
import AddIcon from "@mui/icons-material/Add";
import theme from "@/app/components/theme";
// import ReportTable from "./report-table";
import CloseIcon from "@mui/icons-material/Close";
import useLocate from "@/app/hooks/useLocate";
import { useAppContext } from "@/app/hooks/AppContext";
import apiService from "@/app/untils/api";
// import { DepartmentsResponse } from "../../department/types/department";
import { useReducerReport } from "./useReducerReport";
import ReportSection from "./report-section";
import { fieldConfigurations } from "./variable";
import { initialState } from "./initalState";
import { useRouter } from "next/navigation";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { ImportDialog } from "./import-dialog";
interface StateType {
  [key: string]: string | number;
}

interface ReportData {
  safetyHygieneServiceProvider: string;
  healthServiceProvider: string;
}

interface ApiResponseData {
  url: string;
}

type CombinedType = StateType & ReportData;

export interface ReportDeclarePageProps {
  mode: "view" | "edit";
}

const ReportDeclarePage: React.FC<ReportDeclarePageProps> = ({ mode }) => {
  const [state, dispatch] = useReducer(useReducerReport, initialState);
  const router = useRouter();
  const [errorList, setErrorList] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [healthServiceProvider, setHealthServiceProvider] = useState("");
  const [safetyHygieneServiceProvider, setSafetyHygieneServiceProvider] =
    useState("");
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [status, setStatus] = useState(1);
  const [saveEdits, setSaveEdits] = useState(false);
  // const [openDialog, setOpenDiolog] = useState(true);
  const { reportId } = useAppContext();
  const [openImport, setOpenImport] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const handleCloseImport = () => {
    setOpenImport(false);
  };
  const handleOpenImport = () => {
    setOpenImport(true);
  };
  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const config =
        fieldConfigurations[field as keyof typeof fieldConfigurations];
      let value: string | number = event.target.value;

      if (config.type === "number" || config.type === "money") {
        value = value.replace(/,/g, ".");
        value = parseFloat(value);
        if (isNaN(value)) {
          value = 0;
        }
      }
      dispatch({ type: "UPDATE_FIELD", field, value });
    };

  const transformData = (data: any) => {
    return {
      laborInfo: {
        totalLaborers: data.totalLaborers,
        safetyHygieneWorkers: data.safetyHygieneWorkers,
        healthWorkers: data.healthWorkers,
        femaleWorkers: data.femaleWorkers,
        heavyDangerousWorkers: data.heavyDangerousWorkers,
        minorWorkers: data.minorWorkers,
        workersUnder15: data.workersUnder15,
        disabledWorkers: data.disabledWorkers,
        elderlyWorkers: data.elderlyWorkers,
      },

      laborAccidents: {
        totalAccidents: data.totalAccidents,
        fatalAccidents: data.fatalAccidents,
        totalLaborAccidents: data.totalLaborAccidents,
        laborDeaths: data.laborDeaths,
        totalAccidentCost: data.totalAccidentCost,
        propertyDamageCost: data.propertyDamageCost, // If this is available, replace 0
        daysOff: data.daysOff,
      },

      occupationalDiseases: {
        totalCumulativeCases: data.totalCumulativeCases,
        newCases: data.newCases,
        daysOffDueToDisease: data.daysOffDueToDisease,
        earlyRetirementsDueToDisease: data.earlyRetirementsDueToDisease,
        totalDiseaseCost: data.totalDiseaseCost,
      },

      healthClassification: {
        typeI: data.typeI,
        typeII: data.typeII,
        typeIII: data.typeIII,
        typeIV: data.typeIV,
        typeV: data.typeV,
      },

      trainingSafetyHealth: {
        totalTypeITrained: data.totalTypeITrained,
        totalTypeIITrained: data.totalTypeIITrained,
        totalTypeIIITrained: data.totalTypeIIITrained,
        selfTraining: data.selfTraining,
        hiredTraining: data.hiredTraining,
        totalTypeIVTrained: data.totalTypeIVTrained,
        totalTypeVTrained: data.totalTypeVTrained,
        totalTrainingCost: data.totalTrainingCost,
      },

      machineEquipment: {
        totalMachines: data.totalMachines,
        machinesInUse: data.machinesInUse,
        inspectedMachines: data.inspectedMachines,
        uninspectedMachines: data.uninspectedMachines,
        declaredMachines: data.declaredMachines,
        undeclaredMachines: data.undeclaredMachines,
      },

      workingTime: {
        partTimeLaborers: data.partTimeLaborers,
        totalOvertimeHours: data.totalOvertimeHours,
        highestWorkingHours: data.highestWorkingHours,
      },

      hazardAllowance: {
        totalLaborersHazard: data.totalLaborersHazard,
        totalCost: data.totalCost,
      },

      environmentalMonitoring: {
        totalSamples: data.totalSamples,
        nonStandardSamples: data.nonStandardSamples,
        temperatureSamples: data.temperatureSamples,
        humiditySamples: data.humiditySamples,
        windSpeedSamples: data.windSpeedSamples,
        lightSamples: data.lightSamples,
        noiseSamples: data.noiseSamples,
        dustSamples: data.dustSamples,
        vibrationSamples: data.vibrationSamples,
        toxicGasSamples: data.toxicGasSamples,
        radiationSamples: data.radiationSamples,
        electromagneticSamples: data.electromagneticSamples,
        otherSamples: data.otherSamples,
      },

      safetyHygienePlanCost: {
        technicalSafetyMeasures: data.technicalSafetyMeasures,
        technicalHygieneMeasures: data.technicalHygieneMeasures,
        personalProtectiveEquipment: data.personalProtectiveEquipment,
        workerHealthCare: data.workerHealthCare,
        trainingAndAwareness: data.trainingAndAwareness,
        riskAssessmentSafetyHygiene: data.riskAssessmentSafetyHygiene,
        otherCosts: data.otherCosts,
      },

      serviceProviderInfo: {
        safetyHygieneServiceProvider: data.safetyHygieneServiceProvider,
        healthServiceProvider: data.healthServiceProvider,
      },

      riskAssessmentDate: data.riskAssessmentDate,
    };
  };

  // const fetchData = async (id: string) => {
  //   try {
  //     const res = await apiService.get(`/report/info/${id}`);
  //     console.log("Fetched data:", res);
  //     const data = res.data as ReportData;

  // Set individual service provider values (outside state management)
  // if (data.healthServiceProvider && data.safetyHygieneServiceProvider) {
  //   setHealthServiceProvider(data.healthServiceProvider);
  //   setSafetyHygieneServiceProvider(data.safetyHygieneServiceProvider);
  // }

  //     // Ensure the response is valid and transform the data
  //     if (res.status === 200 && data) {
  //       const transformedData = transformData(data); // Transform the data
  //       console.log("Transformed data:", transformedData);
  //       // Dispatch the transformed data to the reducer state
  //       dispatch({
  //         type: "SET_STATE", // Action to update state
  //         payload: transformedData, // The transformed data
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };
  const reverseTransformData = (data: any) => {
    return {
      totalLaborers: data.laborInfo.totalLaborers,
      safetyHygieneWorkers: data.laborInfo.safetyHygieneWorkers,
      healthWorkers: data.laborInfo.healthWorkers,
      femaleWorkers: data.laborInfo.femaleWorkers,
      heavyDangerousWorkers: data.laborInfo.heavyDangerousWorkers,
      minorWorkers: data.laborInfo.minorWorkers,
      workersUnder15: data.laborInfo.workersUnder15,
      disabledWorkers: data.laborInfo.disabledWorkers,
      elderlyWorkers: data.laborInfo.elderlyWorkers,

      totalAccidents: data.laborAccidents.totalAccidents,
      fatalAccidents: data.laborAccidents.fatalAccidents,
      totalLaborAccidents: data.laborAccidents.totalLaborAccidents,
      laborDeaths: data.laborAccidents.laborDeaths,
      totalAccidentCost: data.laborAccidents.totalAccidentCost,
      propertyDamageCost: data.laborAccidents.propertyDamageCost,
      daysOff: data.laborAccidents.daysOff,

      totalCumulativeCases: data.occupationalDiseases.totalCumulativeCases,
      newCases: data.occupationalDiseases.newCases,
      daysOffDueToDisease: data.occupationalDiseases.daysOffDueToDisease,
      earlyRetirementsDueToDisease:
        data.occupationalDiseases.earlyRetirementsDueToDisease,
      totalDiseaseCost: data.occupationalDiseases.totalDiseaseCost,

      typeI: data.healthClassification.typeI,
      typeII: data.healthClassification.typeII,
      typeIII: data.healthClassification.typeIII,
      typeIV: data.healthClassification.typeIV,
      typeV: data.healthClassification.typeV,

      totalTypeITrained: data.trainingSafetyHealth.totalTypeITrained,
      totalTypeIITrained: data.trainingSafetyHealth.totalTypeIITrained,
      totalTypeIIITrained: data.trainingSafetyHealth.totalTypeIIITrained,
      selfTraining: data.trainingSafetyHealth.selfTraining,
      hiredTraining: data.trainingSafetyHealth.hiredTraining,
      totalTypeIVTrained: data.trainingSafetyHealth.totalTypeIVTrained,
      totalTypeVTrained: data.trainingSafetyHealth.totalTypeVTrained,
      totalTrainingCost: data.trainingSafetyHealth.totalTrainingCost,

      totalMachines: data.machineEquipment.totalMachines,
      machinesInUse: data.machineEquipment.machinesInUse,
      inspectedMachines: data.machineEquipment.inspectedMachines,
      uninspectedMachines: data.machineEquipment.uninspectedMachines,
      declaredMachines: data.machineEquipment.declaredMachines,
      undeclaredMachines: data.machineEquipment.undeclaredMachines,

      partTimeLaborers: data.workingTime.partTimeLaborers,
      totalOvertimeHours: data.workingTime.totalOvertimeHours,
      highestWorkingHours: data.workingTime.highestWorkingHours,

      totalLaborersHazard: data.hazardAllowance.totalLaborersHazard,
      totalCost: data.hazardAllowance.totalCost,

      totalSamples: data.environmentalMonitoring.totalSamples,
      nonStandardSamples: data.environmentalMonitoring.nonStandardSamples,
      temperatureSamples: data.environmentalMonitoring.temperatureSamples,
      humiditySamples: data.environmentalMonitoring.humiditySamples,
      windSpeedSamples: data.environmentalMonitoring.windSpeedSamples,
      lightSamples: data.environmentalMonitoring.lightSamples,
      noiseSamples: data.environmentalMonitoring.noiseSamples,
      dustSamples: data.environmentalMonitoring.dustSamples,
      vibrationSamples: data.environmentalMonitoring.vibrationSamples,
      toxicGasSamples: data.environmentalMonitoring.toxicGasSamples,
      radiationSamples: data.environmentalMonitoring.radiationSamples,
      electromagneticSamples:
        data.environmentalMonitoring.electromagneticSamples,
      otherSamples: data.environmentalMonitoring.otherSamples,

      technicalSafetyMeasures:
        data.safetyHygienePlanCost.technicalSafetyMeasures,
      technicalHygieneMeasures:
        data.safetyHygienePlanCost.technicalHygieneMeasures,
      personalProtectiveEquipment:
        data.safetyHygienePlanCost.personalProtectiveEquipment,
      workerHealthCare: data.safetyHygienePlanCost.workerHealthCare,
      trainingAndAwareness: data.safetyHygienePlanCost.trainingAndAwareness,
      riskAssessmentSafetyHygiene:
        data.safetyHygienePlanCost.riskAssessmentSafetyHygiene,
      otherCosts: data.safetyHygienePlanCost.otherCosts,

      safetyHygieneServiceProvider:
        data.serviceProviderInfo.safetyHygieneServiceProvider,
      healthServiceProvider: data.serviceProviderInfo.healthServiceProvider,

      riskAssessmentDate: data.riskAssessmentDate,
    };
  };

  const fetchData = async (id: string) => {
    try {
      const res = await apiService.get(`/report/info/${id}`);
      const data = res.data as ReportData;
      console.log("Fetched data:", res);
      // if (data.healthServiceProvider && data.safetyHygieneServiceProvider) {
      //   setHealthServiceProvider(data.healthServiceProvider);
      //   setSafetyHygieneServiceProvider(data.safetyHygieneServiceProvider);
      // }
      if (res.status === 200 && data) {
        const reversedData = reverseTransformData(data);
        setHealthServiceProvider(reversedData.healthServiceProvider);
        setSafetyHygieneServiceProvider(
          reversedData.safetyHygieneServiceProvider
        );
        console.log("reversedData", reversedData); // Reverse the transformation
        dispatch({
          type: "SET_STATE", // Action to update state
          payload: reversedData, // The reversed data
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // const setStatusId = async ( isCompleted: boolean) => {
  //   try {
  //     let value = sessionStorage.getItem("key");
  //     const res = await apiService.put(
  //       `/report/update-status?reportId=${value}&isCompleted=${isCompleted}`
  //     );
  //     console.log(res);
  //   } catch (error) {
  //     console.error("Failed to reset status:", error);
  //   }
  // };

  useEffect(() => {
    let value = sessionStorage.getItem("key");
    console.log("value", value);
    if (value) {
      // setStatusId(parseInt(value), 2);
      dispatch({ type: "UPDATE_FIELD", field: "id", value: parseInt(value) });
      fetchData(value);
    }
  }, []);

  useEffect(() => {
    dispatch({
      type: "UPDATE_FIELD",
      field: "healthServiceProvider",
      value: healthServiceProvider,
    });
  }, [healthServiceProvider]);

  useEffect(() => {
    dispatch({
      type: "UPDATE_FIELD",
      field: "safetyHygieneServiceProvider",
      value: safetyHygieneServiceProvider,
    });
  }, [safetyHygieneServiceProvider]);

  const handleSave = async () => {
    try {
      const value = sessionStorage.getItem("key");
      console.log("Saving report with value1: ", value);
      const res = await apiService.post(
        `report/synthies-report?id=${value}`,
        transformData(state)
      );
      console.log("API response: ", res);
      if (res.status === 201) {
        setSnackbarMessage(res.data.message);
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        return true;
      }
      if (res.status === 400) {
        console.log("status=400", res.data.message);

        // Nếu lỗi là một mảng, chúng ta sẽ thêm tất cả các lỗi vào errorList
        if (Array.isArray(res.data.message)) {
          setErrorList((prevState) => [
            ...prevState,
            ...res.data.message, // Thêm từng lỗi vào
          ]);
        } else {
          setErrorList((prevState) => [
            ...prevState,
            res.data.message, // Nếu là chuỗi lỗi đơn lẻ, thêm vào
          ]);
        }
        setOpenDialog(true); // Mở dialog
        return false;
      }
    } catch (error: any) {
      console.error("Error during save:", error);
      setErrorList((prevState) => [
        ...prevState,
        error.response?.data?.message || "Unknown error",
      ]);
      setOpenDialog(true); // Mở dialog
      return false;
    }
  };

  const handleSaveTemp = async () => {
    const isSaved = await handleSave(); // Gọi hàm lưu và điều hướng

    if (isSaved) {
      router.push("/report");
    } // Điều hướng đến trang report sau khi lưu
  };
  const handleSaveReport = async () => {
    console.log("Saving report as completed...");
    if (mode === "edit") {
      try {
        const value = sessionStorage.getItem("key");
        console.log("Saving completed report with value: ", value);
        const res = await apiService.post(
          `report/synthies-report?id=${value}&isCompleted=true`,
          transformData(state)
        );
        console.log("API response: ", res);
        if (res.status === 201) {
          setSnackbarMessage(res.data.message);
          setSnackbarSeverity("success");
          setOpenSnackbar(true);

          // Điều hướng về trang report sau khi hiển thị thông báo
          setTimeout(() => {
            router.push("/report");
          }, 1500); // Đợi 1.5 giây để thông báo hiển thị trước khi điều hướng
          return true;
        }
        if (res.status === 400) {
          console.log("status=400", error.res.data.message);
          setSnackbarMessage(error.res.data.message);
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
          return false;
        }
      } catch (error: any) {
        console.error("Error during saving completed report:", error);
        setSnackbarMessage(error.response.data.message);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return false;
      }
    }
  };

  const handleCancel = () => {
    router.push("/report");
  };
  const handleNext = async (mode: string) => {
    try {
      const isSave = await handleSave();

      // console.log("Mode:", mode, "isSave:", isSave); // kiểm tra giá trị isSave và mode

      // Tiếp tục nếu isSave là true hoặc ở chế độ view
      if (isSave || mode === "view") {
        const value = sessionStorage.getItem("key");
        if (!value) {
          console.log("No ID found in sessionStorage.");
          return;
        }

        console.log("value", value);

        // Gọi API review-docx-report
        const res = await apiService.get<ApiResponseData>(
          `report/review-docx-report?id=${value}`
        );
        console.log("res", res);

        const url = res.data.url;
        console.log("url", url);

        // Lưu URL vào sessionStorage và cập nhật URL cục bộ
        sessionStorage.setItem("url", url);
        setLocalUrl(url);

        // Chuyển sang bước tiếp theo trong UI
        setActiveStep(1);
      } else {
        console.log("Unable to save the report.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
  const handleBack = () => {
    setActiveStep(0);
    setSaveEdits(false);
  };

  const handleDownload = async () => {
    try {
      const value = sessionStorage.getItem("key");
      if (!value) {
        console.log("No ID found in sessionStorage.");
        return;
      }

      // Gọi API để lấy đường dẫn tải xuống
      const res = await apiService.get<ApiResponseData>(
        `report/review-docx-report?id=${value}`
      );
      const url = res.data.url; // Đường dẫn từ phản hồi API
      console.log("Download URL:", url);

      if (url) {
        // Tạo một thẻ <a> ẩn để kích hoạt tải xuống
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "report.docx"); // Tên file mong muốn
        link.style.display = "none"; // Ẩn thẻ <a>
        document.body.appendChild(link);
        link.click(); // Kích hoạt sự kiện click để tải xuống
        document.body.removeChild(link); // Xóa thẻ sau khi tải xuống
      } else {
        console.log("URL not found in response data.");
      }
    } catch (error) {
      console.error("An error occurred during file download:", error);
    }
  };

  return (
    <Layout>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          height: "100vh",
          paddingBottom: "10px",
        }}
      >
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
              sx={{
                fontWeight: 700,
                fontSize: "18px",
                color: "black",
                flex: 2,
              }}
            >
              Báo cáo An toàn vệ sinh lao động
            </Typography>
            {/* {hasPermission("role", "create") && ( */}
            {activeStep === 0 ? (
              <>
                <Box display="flex" gap="8px">
                  <Button
                    variant="text"
                    onClick={handleCancel}
                    sx={{
                      width: "120px",
                      color: "green",
                      marginTop: "10px",
                      marginBottom: "10px",
                      border: "solid 3px green",
                      fontWeight: "bold",
                      textTransform: "none",
                    }}
                  >
                    Hủy
                  </Button>

                  {mode === "edit" && (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{
                          width: "120px",
                          color: "green",
                          marginTop: "10px",
                          marginBottom: "10px",
                          border: "solid 3px green",
                          fontWeight: "bold",
                          textTransform: "none",
                        }}
                        onClick={handleOpenImport}
                        // disabled={
                        //   !hasPermission("user", "create") || choosed.key == ""
                        // }
                        // disabled={isDisableNewButton}
                      >
                        <FileDownloadOutlinedIcon
                          sx={{ transform: "rotate(180deg)" }}
                        />
                        Import
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleSaveTemp}
                        sx={{
                          width: "120px",
                          marginY: "10px",
                          textTransform: "none",
                        }}
                        //disabled= {saveEdits ? false : true}
                      >
                        Lưu tạm thời
                      </Button>
                    </>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    sx={{
                      width: "120px",
                      marginY: "10px",
                      textTransform: "none",
                    }}
                    // disabled= {saveEdits ? false : true}
                  >
                    Tiếp theo
                  </Button>
                </Box>
              </>
            ) : (
              // && saveEdits == true
              activeStep === 1 && (
                <>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="text"
                      color="primary"
                      onClick={handleBack}
                      sx={{
                        width: "120px",
                        marginTop: "10px",
                        marginBottom: "10px",
                        textTransform: "none",
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{
                        width: "120px",
                        color: "green",
                        marginTop: "10px",
                        marginBottom: "10px",
                        border: "solid 3px green",
                        fontWeight: "bold",
                        textTransform: "none",
                      }}
                      onClick={handleDownload}
                      // disabled={
                      //   !hasPermission("user", "create") || choosed.key == ""
                      // }
                      // disabled={isDisableNewButton}
                    >
                      <FileDownloadOutlinedIcon />
                      Tải báo cáo
                    </Button>
                    {mode === "edit" && (
                      <Button
                        onClick={handleSaveReport}
                        sx={{
                          width: "120px",
                          color: "green",
                          marginTop: "10px",
                          marginBottom: "10px",
                          border: "solid 3px green",
                          fontWeight: "bold",
                          textTransform: "none",
                        }}
                      >
                        Lưu
                      </Button>
                    )}
                  </Box>
                </>
              )
            )}

            {/* )} */}
          </div>
          <Box sx={{ height: "93vh", overflow: "auto" }}>
            <Container maxWidth="lg">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  mt: 5,
                }}
              >
                <Box sx={{ width: "40%" }}>
                  <Stepper activeStep={activeStep}>
                    <Step
                      sx={{
                        ".css-15rfbsb-MuiSvgIcon-root-MuiStepIcon-root.Mui-active":
                          { color: theme.palette.primary.main },
                        ".css-15rfbsb-MuiSvgIcon-root-MuiStepIcon-root.Mui-completed":
                          { color: theme.palette.primary.main },
                      }}
                    >
                      <StepLabel>Report Declaration</StepLabel>
                    </Step>
                    <Step
                      sx={{
                        ".css-15rfbsb-MuiSvgIcon-root-MuiStepIcon-root.Mui-active":
                          { color: theme.palette.primary.main },
                      }}
                    >
                      <StepLabel>Review Report</StepLabel>
                    </Step>
                  </Stepper>
                </Box>
              </Box>

              {activeStep === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    mt: 5,
                  }}
                >
                  <ReportSection
                    title="1. Thông tin lao động"
                    fields={[
                      "totalLaborers",
                      "safetyHygieneWorkers",
                      "healthWorkers",
                      "femaleWorkers",
                      "heavyDangerousWorkers",
                      "minorWorkers",
                      "workersUnder15",
                      "disabledWorkers",
                      "elderlyWorkers",
                    ]}
                    disable={mode === "view"}
                    state={state}
                    handleChange={handleChange}
                  />
                  <ReportSection
                    title="2. Thông tin tai nạn lao động"
                    fields={[
                      "totalAccidents",
                      "fatalAccidents",
                      "totalLaborAccidents",
                      "laborDeaths",
                      "totalAccidentCost",
                      "daysOff",
                    ]}
                    disable={mode === "view"}
                    state={state}
                    handleChange={handleChange}
                  />
                  <ReportSection
                    title="3. Bệnh nghề nghiệp"
                    fields={[
                      "totalCumulativeCases",
                      "newCases",
                      "daysOffDueToDisease",
                      "earlyRetirementsDueToDisease",
                      "totalDiseaseCost",
                    ]}
                    disable={mode === "view"}
                    state={state}
                    handleChange={handleChange}
                  />
                  <ReportSection
                    title="4. Kết quả phân loại sức khỏe của người lao động"
                    fields={["typeI", "typeII", "typeIII", "typeIV", "typeV"]}
                    disable={mode === "view"}
                    state={state}
                    handleChange={handleChange}
                  />
                  <ReportSection
                    title="5. Huấn luyện về vệ sinh an toàn lao động"
                    fields={[
                      "totalTypeITrained",
                      "totalTypeIITrained",
                      "totalTypeIIITrained",
                      "selfTraining",
                      "hiredTraining",
                      "totalTypeIVTrained",
                      "totalTypeVTrained",
                      "totalTypeVITrained",
                      "totalTrainingCost",
                    ]}
                    disable={mode === "view"}
                    state={state}
                    handleChange={handleChange}
                  />
                  <ReportSection
                    title="6. Máy, thiết bị, vật tư có yêu cầu nghiêm ngặt về ATVSLĐ"
                    fields={[
                      "totalMachines",
                      "machinesInUse",
                      "inspectedMachines",
                      "uninspectedMachines",
                      "declaredMachines",
                      "undeclaredMachines",
                    ]}
                    disable={mode === "view"}
                    state={state}
                    handleChange={handleChange}
                  />
                  <ReportSection
                    title="7. Thời gian làm việc, thời gian nghỉ ngơi"
                    fields={[
                      "partTimeLaborers",
                      "totalOvertimeHours",
                      "highestWorkingHours",
                    ]}
                    disable={mode === "view"}
                    state={state}
                    handleChange={handleChange}
                  />
                  <ReportSection
                    title="8. Bồi dưỡng chống độc hại bằng hiện vật"
                    fields={["totalLaborersHazard", "totalCost"]}
                    disable={mode === "view"}
                    state={state}
                    handleChange={handleChange}
                  />
                  <ReportSection
                    title="9. Tình hình quan trắc môi trường"
                    fields={[
                      "totalSamples",
                      "nonStandardSamples",
                      "temperatureSamples",
                      "humiditySamples",
                      "windSpeedSamples",
                      "lightSamples",
                      "noiseSamples",
                      "dustSamples",
                      "vibrationSamples",
                      "toxicGasSamples",
                      "radiationSamples",
                      "electromagneticSamples",
                      "otherSamples",
                    ]}
                    disable={mode === "view"}
                    state={state}
                    handleChange={handleChange}
                  />
                  <ReportSection
                    title="10. Chi phí thực hiện kế hoạch ATVSLĐ"
                    fields={[
                      "technicalSafetyMeasures",
                      "technicalHygieneMeasures",
                      "personalProtectiveEquipment",
                      "workerHealthCare",
                      "trainingAndAwareness",
                      "riskAssessmentSafetyHygiene",
                      "otherCosts",
                    ]}
                    disable={mode === "view"}
                    state={state}
                    handleChange={handleChange}
                  />
                  <Typography
                    variant="body1"
                    fontWeight={700}
                    gutterBottom
                    sx={{ mt: 4, mb: 2 }}
                  >
                    11. Tổ chức cung cấp dịch vụ
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid
                      item
                      xs={12}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        label="Tên tổ chức dịch vụ ATVSLĐ được thuê"
                        variant="outlined"
                        value={safetyHygieneServiceProvider}
                        fullWidth
                        size="small"
                        multiline
                        minRows={1}
                        maxRows={5}
                        onChange={(e) =>
                          setSafetyHygieneServiceProvider(e.target.value)
                        }
                        disabled={mode === "view"}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sx={{
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        label="Tên tổ chức dịch vụ y tế được thuê"
                        variant="outlined"
                        value={healthServiceProvider}
                        fullWidth
                        size="small"
                        multiline
                        minRows={1}
                        maxRows={5}
                        onChange={(e) =>
                          setHealthServiceProvider(e.target.value)
                        }
                        disabled={mode === "view"}
                      />
                    </Grid>
                  </Grid>

                  <div style={{ marginBottom: "20px" }}>
                    <ReportSection
                      title="12. Thời điểm tổ chức tiến hành đánh giá nguy cơ rủi ro về ATVSLĐ"
                      fields={["riskAssessmentDate"]}
                      disable={mode === "view"}
                      state={state}
                      handleChange={handleChange}
                    />
                  </div>
                </Box>
              ) : (
                <Box sx={{ height: "calc(100vh - 57px)", overflow: "auto" }}>
                  <Container maxWidth="lg">
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "850px",
                        mt: 5,
                      }}
                    >
                      {localUrl ? (
                        <iframe
                          src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
                            localUrl
                          )}`}
                          width="100%"
                          height="100%"
                          title="Word Document Viewer"
                          style={{ border: "none" }}
                        ></iframe>
                      ) : (
                        <Typography variant="h6" gutterBottom>
                          No report available
                        </Typography>
                      )}
                    </Box>
                  </Container>
                </Box>
              )}
            </Container>
            {/* <HistoryDiolog open={openDialog} onClose={handleCloseDialog} /> */}
            <ImportDialog open={openImport} onClose={handleCloseImport} />
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
          </Box>
        </Box>
      </Box>
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setErrorList([]); // Reset danh sách lỗi khi đóng popup
        }}
      >
        <DialogTitle sx={{fontWeight: 700}}>
          Danh sách lỗi
          <IconButton
            aria-label="close"
            onClick={() => {
              setOpenDialog(false);
              setErrorList([]); // Reset danh sách lỗi khi đóng popup
            }}
            sx={{ position: "absolute", right: 16, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="red" mb="16px">
            Danh sách loại dữ liệu chưa hợp lệ, vui lòng kiểm tra lại!
          </Typography>
          <ul>
            {errorList.map((error, index) => (
              <li key={index}>{error}</li> // Hiển thị từng lỗi trên một dòng
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};
export default ReportDeclarePage;
