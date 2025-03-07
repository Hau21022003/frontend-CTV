import Layout from "@/app/components/layout";
import React, { useEffect, useState } from "react";
import useLocate from "@/app/hooks/useLocate";
import { AppBar, Box, CssBaseline, Typography } from "@mui/material";
import PermissionTable from "./table-permission";
const HomePage: React.FC = () => {
  const [refreshTable, setRefreshTable] = useState(false);
  const [permissions, setPermissions] = useState<any[]>([]);
  useEffect(() => {
    const storedPermissions = localStorage.getItem("permissions");
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
  }, []);

  const hasPermission = (subject: string, action: string) => {
    const permission = permissions.find((perm) => perm.subject === subject);
    return permission ? permission.permission[action] : false;
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
          <div className="py-2 px-6 flex item-center justify-between shadow-md rounded-lg h-11 mb-6">
            <Typography
              component="div"
              sx={{ fontWeight: 700, fontSize: "18px", color: "black" }}
            >
              Quản lý quyền
            </Typography>
          </div>
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              borderRadius: "10px",
              boxShadow: 3,
            }}
          >
             {/* {hasPermission("permission", "view") ? (
                <PermissionTable refresh={refreshTable} />
            ) : (
                <Typography>You do not have permission to access</Typography>
            )} */}
             <PermissionTable refresh={refreshTable} />
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default HomePage;
