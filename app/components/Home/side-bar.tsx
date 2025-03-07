//side-bar.tsx
import { useAuth } from "@/app/hooks/AuthContext";
import { useTheme } from "@emotion/react";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Collapse,
  ListItemIcon,
  ListItem,
  Popover,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
  ExpandLess,
  ExpandMore,
  Person as PersonIcon,
} from "@mui/icons-material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useRouter } from "next/navigation";
import apiService from "@/app/untils/api";
import { useAppContext } from "@/app/hooks/AppContext";

interface SideBarProps {
  drawerWidth: number;
  open: boolean;
  handleDrawerToggle: () => void;
}
interface Dept {
  key: number;
  departmentName: string;
  level: number;
}

const SideBar: React.FC<SideBarProps> = ({
  drawerWidth,
  open,
  handleDrawerToggle,
}) => {
  const theme = useTheme();
  const [openSideBar, setOpenSideBar] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isEditing, logout } = useAuth();
  const [dept, setDept] = useState<Dept | null>(null);
  const { setIsLoading } = useAppContext();
  const [notifiApproval, setNotifiApproval] = useState("");
  const router = useRouter();
  // State to track the selected department
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [permissions, setPermissions] = useState<any[]>([]);
  const parsePermissions = (storedPermissions: string | null) => {
    try {
      const parsedPermissions = JSON.parse(storedPermissions || "{}");
      if (Array.isArray(parsedPermissions)) {
        return parsedPermissions;
      } else if (typeof parsedPermissions === "object") {
        return Object.entries(parsedPermissions).map(
          ([subject, permission]) => ({
            subject,
            permission,
          })
        );
      } else {
        console.error(
          "Permissions are not in the expected array or object format:",
          parsedPermissions
        );
        return [];
      }
    } catch (error) {
      console.error("Failed to parse stored permissions:", error);
      return [];
    }
  };

  useEffect(() => {
    const storedPermissions = localStorage.getItem("permissions");
    setPermissions(
      storedPermissions ? parsePermissions(storedPermissions) : []
    );
  }, []);

  useEffect(() => {
    const storedPermissions = localStorage.getItem("permissions");
    setPermissions(
      storedPermissions ? parsePermissions(storedPermissions) : []
    );
  }, [isEditing]);

  const hasPermission = (subject: string, action: string) => {
    const permission = permissions.find((perm) => perm.subject === subject);
    return permission ? permission.permission[action] : false;
  };
  // Define paths and their corresponding labels
  const paths = [
    { path: "/department", label: "Cơ quan đơn vị" },
    { path: "/permission", label: "Quyền" },
    { path: "/role", label: "Vai trò" },
    { path: "/user", label: "Người dùng" },
    { path: "/report-configuration", label: "Cấu hình báo cáo" },
    { path: "/report", label: "An toàn vệ sinh lao động" },
  ];

  useEffect(() => {
    setIsMounted(true);
    const storedAvatar = localStorage.getItem("avatar");
    const storedFullName = localStorage.getItem("fullName");
    // const storedDept = localStorage.getItem("dept");

    // if (storedDept) {
    //   setDept(JSON.parse(storedDept) as Dept);
    // }
    setAvatar(storedAvatar);
    setFullName(storedFullName);

    // Set the selected department based on the current path
    const currentPath = window.location.pathname; // Get the current path
    setSelectedDepartment(currentPath); // Update selected department based on the path
  }, []);

  useEffect(() => {
    const storedAvatar = localStorage.getItem("avatar");
    const storedFullName = localStorage.getItem("fullName");
    // const storedDept = localStorage.getItem("dept");

    // if (storedDept) {
    //   setDept(JSON.parse(storedDept) as Dept);
    // }
    setAvatar(storedAvatar);
    setFullName(storedFullName);

    // Set the selected department based on the current path
    // const currentPath = window.location.pathname; // Get the current path
    // setSelectedDepartment(currentPath); // Update selected department based on the path
  }, [isEditing]);

  const handleNavigation = async (path: string) => {
    try {
      setIsLoading(true);
      setSelectedDepartment(path); // Update selected department
      await router.push(path); // Navigate to the new path
    } catch (error) {
      console.error("Navigation error:", error); // Handle navigation error
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleClick = () => {
    setOpenSideBar(!openSideBar);
  };

  const handleLogOut = async () => {
    logout();
  };
  const handleArrowClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);
  const popoverId = openPopover ? "simple-popover" : undefined;

  if (!isMounted) {
    return null;
  }

  return (
    <Box
      sx={{
        width: open ? drawerWidth : `calc(${theme.spacing(7)} + 1px)`,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : `calc(${theme.spacing(7)} + 1px)`,
          boxSizing: "border-box",
          backgroundColor: "#14317F",
        },
        height: "100vh",
        overflowX: "hidden",
        backgroundColor: "#14317F",
        position: "relative",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: [1],
          backgroundColor: "#14317f",
          gap: "5px",
          height: "90px",
        }}
      >
        {open && (
          <>
            <Avatar
              src="/gov_logo.png"
              sx={{ width: "42px", height: "44px" }}
              alt="Logo Gov"
            />
            <div></div>
            <Typography
              noWrap
              component="div"
              sx={{ color: "white", fontSize: "14px", textAlign: "center" }}
            >
              Ủy ban nhân dân thành phố
              <br />
              Hồ Chí Minh
            </Typography>
          </>
        )}
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleDrawerToggle}
          sx={{
            color: "white",
            marginRight: open ? "auto" : "0",
          }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Divider color="white" />
      <List>
        <ListItemButton onClick={handleClick}>
          <SettingsOutlinedIcon sx={{ color: "white", marginRight: "30px" }} />
          {open && (
            <ListItemText
              primary="Hệ Thống"
              sx={{
                color: "white",
                "& .css-1edfpdg-MuiTypography-root": { fontSize: "14px" },
              }}
            />
          )}
          {open ? (
            <ExpandLess sx={{ color: "white" }} />
          ) : (
            <ExpandMore sx={{ color: "white" }} />
          )}
        </ListItemButton>
        {open && (
          <Collapse in={openSideBar} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {paths.map(({ path, label }) => {
                // Check permissions before rendering
                if (hasPermission(path.replace("/", ""), "view")) {
                  return (
                    <ListItemButton
                      key={path}
                      onClick={() => handleNavigation(path)}
                      sx={{
                        backgroundColor:
                          selectedDepartment === path
                            ? "#1A40A5"
                            : "transparent",
                        color: "white",
                      }}
                    >
                      <ListItemIcon>
                        <FiberManualRecordIcon
                          sx={{
                            color: "white",
                            fontSize: "small",
                            width: "4px",
                            marginLeft: "10px",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={label}
                        sx={{
                          "& .css-1edfpdg-MuiTypography-root": {
                            fontSize: "14px",
                          },
                        }}
                      />
                    </ListItemButton>
                  );
                }
                return null; // If no permission, return null
              })}
            </List>
          </Collapse>
        )}
      </List>
      <Box
        sx={{
          marginTop: "auto",
          paddingBottom: "10px",
          width: open ? drawerWidth : `calc(${theme.spacing(7)} + 1px)`,
        }}
      >
        <Divider color="white" sx={{ margin: "0 auto", width: "90%" }} />
        <Box
          sx={{
            display: "flex",
            flexDirection: open ? "row" : "column",
            alignItems: open ? "center" : "center",
            justifyContent: open ? "flex-start" : "center",
            width: "100%",
          }}
        >
          <ListItem sx={{ width: "100%", justifyContent: "center" }}>
            <ListItemButton sx={{ justifyContent: "center" }}>
              <ListItemIcon
                sx={{
                  justifyContent: "center",
                  display: open ? "block" : "flex",
                }}
              >
                {avatar ? (
                  <Avatar
                    src={avatar}
                    sx={{
                      width: "40px",
                      height: "40px",
                      margin: open ? "0" : "0 auto",
                    }}
                    alt="Avatar"
                  />
                ) : (
                  <PersonIcon
                    sx={{ color: "white", height: "40px", width: "40px" }}
                  />
                )}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={fullName || "Not Found"}
                  sx={{
                    color: "white",
                    "& .css-1edfpdg-MuiTypography-root": { fontSize: "14px" },
                  }}
                />
              )}
            </ListItemButton>
            {open && (
              <IconButton onClick={handleArrowClick}>
                <KeyboardArrowRightIcon sx={{ color: "white" }} />
              </IconButton>
            )}
          </ListItem>
        </Box>
        <Divider color="white" sx={{ margin: "0 auto", width: "90%" }} />
      </Box>

      <Popover
        id={popoverId}
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <List sx={{ width: "200px" }}>
          {/* <ListItemButton onClick={handleLogOut}>
            <ListItemText primary="Thông tin tài khoản" sx={{ color: "black" }} />
          </ListItemButton> */}
          <ListItemButton onClick={handleLogOut}>
            <ListItemText primary="Đăng Xuất" sx={{ color: "black" }} />
          </ListItemButton>
        </List>
      </Popover>
    </Box>
  );
};

export default SideBar;
