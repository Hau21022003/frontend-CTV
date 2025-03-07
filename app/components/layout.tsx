import React, { ReactNode } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, ThemeProvider, createTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import styles from './Home/HomePage.module.css';
import { useAppContext } from '../hooks/AppContext';
import ProgressOverlay from './progress-Overlay';

const drawerWidth = 290;
const theme = createTheme();

const SideBar = dynamic(() => import('./Home/side-bar'), { ssr: false });

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [open, setOpen] = React.useState(true);
    const {isLoading} = useAppContext();

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    return (
        <>
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' , height: '100vh'}}>
                <CssBaseline />
                <SideBar drawerWidth={drawerWidth} open={open} handleDrawerToggle={handleDrawerToggle} />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                    }}
                >
                    {children}
                </Box>
            </Box>
        <ProgressOverlay isLoading={isLoading} />
        </ThemeProvider>
        </>
    );
};

export default Layout;
