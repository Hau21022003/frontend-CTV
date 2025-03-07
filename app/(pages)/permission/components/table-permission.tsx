import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from "@mui/material";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/app/hooks/AppContext";
import apiService from "@/app/untils/api";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

interface Row {
    id: string;
    no: string;
    type: string;
    code: string;
    name: string;
    subject: string;
    action: string;
    parentId?: string;
    components?: Row[];
}

interface ApiResponse {
    code: number;
    data: {
        currentPage?: number;
        items: Row[];
        nextPage: number | null;
        prevPage: number | null;
    }
    message: string;
    success: boolean;
}

interface PermissionTableProps {
    refresh: boolean;
}

export default function PermissionTable({ refresh }: PermissionTableProps) {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const { roles, setRoles } = useAppContext();
    const [rows, setRows] = useState<Row[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [permissionCodeFilter, setPermissionCodeFilter] = useState('');
    const [permissionNameFilter, setPermissionNameFilter] = useState('');
    const {setIsLoading} = useAppContext();

    useEffect(() => {
        fetchRows();
    }, [page, rowsPerPage, refresh, permissionCodeFilter, permissionNameFilter]);

   
    const fetchRows = async () => {
        try {
            setIsLoading(true);
            // Check if required parameters are not null or empty
            // if (!permissionCodeFilter && !permissionNameFilter) {
            //     console.warn("No filters applied. Fetching default data.");
            // }
            
            const params = new URLSearchParams();
            
            // Append filters to params if they are not empty
            if (permissionCodeFilter || permissionCodeFilter !== '') params.append('code', permissionCodeFilter);
            if (permissionNameFilter || permissionNameFilter !== '') params.append('name', permissionNameFilter);
            
            // Add pagination and limit parameters
            params.append('page', (page + 1).toString()); // Assuming API uses 1-based page index
            params.append('limit', rowsPerPage.toString());
    
            const response = await apiService.get<ApiResponse>(`/permissions?${params.toString()}`);
            
            // Check if response is successful before updating roles
            if (response.data.success) {
                const data = response.data.data.items;
                setRows(data);
                updateTotalRows(data, expandedGroups);
            } else {
                // Handle error messages if any
                console.error("Error fetching data:", response.data.message);
                setSnackbarSeverity('error');
                setSnackbarMessage(response.data.message);
                setOpenSnackbar(true);
            }
        } catch (error: any) {
            console.error('Error fetching data: ', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Failed to fetch data from API.');
            setOpenSnackbar(true);
        }
        finally {
            setIsLoading(false);
        }
    };
    

    const updateTotalRows = (data: Row[], expandedGroups: string[]) => {
        const calculateTotalRows = (rows: Row[]): number => {
            let count = rows.length;
            rows.forEach(row => {
                if (row.components && expandedGroups.includes(row.id)) {
                    count += calculateTotalRows(row.components);
                }
            });
            return count;
        };
        const total = calculateTotalRows(data);
        setTotalRows(total);
    };

    const handlePermissionCodeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPermissionCodeFilter(event.target.value);
    };

    const handlePermissionNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPermissionNameFilter(event.target.value);
    };

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev => {
            const isExpanded = prev.includes(id);
            const newExpandedGroups = isExpanded ? prev.filter(groupId => groupId !== id) : [...prev, id];
            updateTotalRows(rows, newExpandedGroups);
            return newExpandedGroups;
        });
    };

    const toRoman = (num: number): string => {
        const romanNumerals: { [key: number]: string } = {
            1: 'I', 4: 'IV', 5: 'V', 9: 'IX', 10: 'X',
            40: 'XL', 50: 'L', 90: 'XC', 100: 'C',
            400: 'CD', 500: 'D', 900: 'CM', 1000: 'M'
        };

        let result = '';
        let value = num;

        const keys = Object.keys(romanNumerals).map(Number).sort((a, b) => b - a);

        for (const key of keys) {
            while (value >= key) {
                result += romanNumerals[key];
                value -= key;
            }
        }

        return result;
    };

    const flattenRows = (rows: Row[]): { row: Row, id: string }[] => {
        const result: { row: Row, id: string }[] = [];
        const flatten = (rows: Row[], parentId: string | null = null, level: number = 0) => {
            rows.forEach((row, index) => {
                const id = parentId ? `${index + 1}` : toRoman(index + 1);
                result.push({ row, id });
                if (row.components && expandedGroups.includes(row.id)) {
                    flatten(row.components, id, level + 1);
                }
            });
        };
        flatten(rows);
        return result;
    };

    const renderRows = (rows: Row[], page: number, rowsPerPage: number): JSX.Element[] => {
        const flattenedRows = flattenRows(rows);
        const paginatedRows = flattenedRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

        return paginatedRows.map(({ row, id }, index) => (
            <React.Fragment key={row.id}>
                <TableRow sx={{ cursor: 'pointer' }} >
                    <TableCell>
                        {row.type === 'Group' && (
                            <IconButton onClick={() => toggleGroup(row.id)} sx={{ color: 'black' }}>
                                {expandedGroups.includes(row.id) ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            </IconButton>
                        )}
                    </TableCell>
                    <TableCell>{id}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell sx={{ padding: row.type === 'Component' ? '16px 46px' : '16px 16px' }}>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                </TableRow>
            </React.Fragment>
        ));
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Paper sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <TableContainer sx={{ flexGrow: 1 }}> {/* Adjust height here */}
                    <Table arial-label="enhanced table" size="small">
                        <TableHead sx={{ backgroundColor: '#F4F6F8', position: 'sticky', top: 0, zIndex: 1 }}>
                            <TableRow>
                                <TableCell sx={{ border: 'none', width: '5%' }}></TableCell>
                                <TableCell sx={{ fontWeight: 700, border: 'none', width:'5%' }}>STT</TableCell>
                                <TableCell sx={{ fontWeight: 700, border: 'none', width: '15%' }}>Loại</TableCell>
                                <TableCell sx={{ fontWeight: 700, border: 'none', width: '45%' }}>Mã quyền</TableCell>
                                <TableCell sx={{ fontWeight: 700, border: 'none', width: '30%' }}>Tên quyền</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ border: 'none' }}></TableCell>
                                <TableCell sx={{ border: 'none' }}></TableCell>
                                <TableCell sx={{ border: 'none', width: '150px' }}>
                                    <TextField
                                        size='small'
                                        fullWidth
                                        sx={{ background: '#EAEDF0', borderRadius: '6px' }}
                                        disabled
                                    />
                                </TableCell>
                                <TableCell sx={{ border: 'none' }}>
                                    <TextField
                                        size='small'
                                        fullWidth
                                        sx={{ background: 'white', borderRadius: '6px' }}
                                        value={permissionCodeFilter}
                                        onChange={handlePermissionCodeFilterChange}
                                    />
                                </TableCell>
                                <TableCell sx={{ border: 'none' }}>
                                    <TextField
                                        size='small'
                                        fullWidth
                                        sx={{ background: 'white', borderRadius: '6px' }}
                                        value={permissionNameFilter}
                                        onChange={handlePermissionNameFilterChange}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* {renderRows(roles, page, rowsPerPage)} */}
                            {rows.length > 0 ? renderRows(rows, page, rowsPerPage) : (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ textAlign: 'center'}}>
                                    No data available
                                </TableCell>
                            </TableRow>
                        )}

                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalRows}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}
