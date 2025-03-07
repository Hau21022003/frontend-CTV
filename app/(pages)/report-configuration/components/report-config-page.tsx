import React, { useState } from "react";
import Layout from "@/app/components/layout";
import { Box, CssBaseline, Typography } from "@mui/material";
import { Button } from "@/app/components/button";
import AddIcon from "@mui/icons-material/Add";
import AddNewPopUp from "./dialog-popup";
import ReportConfigTable from "./report-config-table";
import { Department } from "../../department/types/department";
interface ApiResponse {
  data: {
      items: Department[];
      currentPage: number;
      nextPage: number | null;
      prevPage: number | null;
      total: number;
  };
  code: number;
  message: string;
  success: boolean;
}

const ReportConfigPage: React.FC = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [isDisableNewButton, setIsDisableAddNewButton] = useState(true);

  const [refreshTable, setRefreshTable] = useState(false);
  const [refreshOptions, setRefreshOptions] = useState(false);

  const handleOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleCloseOpenAdd = () => {
    setOpenAdd(false);
    setRefreshTable((prev) => !prev);
    // setRefreshOptions((prev) => !prev);
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
              sx={{ fontWeight: 700, fontSize: "18px", color: "black" }}
            >
              Năm làm việc
            </Typography>
            {/* {hasPermission("role", "create") && ( */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              // disable={isDisaleAddNewButton}
            >
              Thêm mới
            </Button>
            {/* )} */}
          </div>
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              borderRadius: "10px",
              boxShadow: 3,
              mt: 2, // Add margin-top to create space between the header and the table
            }}
          >
            <ReportConfigTable refresh={refreshTable} />
          </Box>
        </Box>
        <AddNewPopUp open={openAdd} onClose={handleCloseOpenAdd} type="add" />
      </Box>
    </Layout>
  );
};

export default ReportConfigPage;