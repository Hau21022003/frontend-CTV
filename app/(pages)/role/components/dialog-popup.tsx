import { Alert, Box, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Pagination, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import { KeyboardArrowDown, KeyboardArrowUp, RollerShades } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { Button } from '@/app/components/button';
import apiService from '@/app/untils/api';
import { useAppContext } from '@/app/hooks/AppContext';
import { Location } from '@/app/hooks/AppContext';

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
        currentPage: number;
        items: Row[];
        nextPage: number | null;
        prevPage: number | null;
    };
    message: string;
    success: boolean;
}

interface AddNewPopupProps {
    open: boolean;
    onClose: () => void;
}

const renderRows = (
    rows: Row[],
    expandedGroups: string[],
    toggleGroup: (id: string) => void,
    handleSelect: (row: Row, checked: boolean) => void,
    selectedRowsUI: string[],
    onExpand: () => void
): JSX.Element[] => {
    return rows.map((row) => (
        <React.Fragment key={row.id}>
            <TableRow sx={{ cursor: 'pointer' }} >
                <TableCell>
                    {row.type === 'Group' && (
                        <IconButton onClick={() => toggleGroup(row.id)} sx={{ color: 'black' }}>
                            {expandedGroups.includes(row.id) ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                    )}
                </TableCell>
                <TableCell>
                    <Checkbox
                        checked={selectedRowsUI.includes(row.id)}
                        onChange={(e) => handleSelect(row, e.target.checked)}
                    />
                </TableCell>
                <TableCell sx={{ padding: row.type === 'Component' ? '16px 36px' : '16px 16px' }}>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
            </TableRow>
        </React.Fragment>
    ));
};
const flattenRows = (rows: Row[], expandedGroups: string[]): Row[] => {
    const result: Row[] = [];
    const flatten = (rows: Row[]) => {
        rows.forEach(row => {
            result.push(row);
            if (row.components && expandedGroups.includes(row.id)) {
                flatten(row.components);
            }
        });
    };
    flatten(rows);
    return result;
};



const AddNewPopUp: React.FC<AddNewPopupProps> = ({ open, onClose }) => {
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [selectedRowsUI, setSelectedRowsUI] = useState<string[]>([]);
    const [selectedRowsAPI, setSelectedRowsAPI] = useState<string[]>([]);
    const [roleCode, setRoleCode] = useState('');
    const [roleName, setRoleName] = useState('');
    const { roles, setRoles, choosed, setIsLoading } = useAppContext();
    const [rows, setRows] = useState<Row[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [permissionCodeFilter, setPermissionCodeFilter] = useState('');
    const [permissionNameFilter, setPermissionNameFilter] = useState('');
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const fetchRows = async () => {
        try {
            setIsLoading(true);
            // console.log('CODE FILTER: ', !permissionCodeFilter)
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
        finally{
            setIsLoading(false);
        }
    };
    const updateTotalRows = (rows: Row[], expandedGroups: string[]) => {
        const flattenedRows = flattenRows(rows, expandedGroups);
        setTotalRows(flattenedRows.length);
    };

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev => {
            const isExpanded = prev.includes(id);
            const newExpandedGroups = isExpanded ? prev.filter(groupId => groupId !== id) : [...prev, id];
            updateTotalRows(rows, newExpandedGroups);
            return newExpandedGroups;
        });
    };

    const handlePermissionCodeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPermissionCodeFilter(event.target.value);
    };

    const handlePermissionNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPermissionNameFilter(event.target.value);
    };

    const handleExpand = () => {
        if (tableContainerRef.current) {
            const tableHeight = tableContainerRef.current.scrollHeight;
            const containerHeight = tableContainerRef.current.clientHeight;
            if (tableHeight > containerHeight) {
                const totalPages = Math.ceil(tableHeight / containerHeight);
                setPage(prevPage => Math.min(prevPage + 1, totalPages - 1));
            }
        }
    };

    const handleSelect = (row: Row, checked: boolean) => {
        if (checked) {
            if (row.type === 'Group') {
                const { updatedUI, updatedAPI } = selectAllChildren(row, selectedRowsUI, selectedRowsAPI);
                setSelectedRowsUI(updatedUI);
                setSelectedRowsAPI(updatedAPI);
            } else {
                let updatedUI = [...selectedRowsUI, row.id];
                let updatedAPI = [...selectedRowsAPI, row.id];

                rows.forEach(parentRow => {
                    if (parentRow.components && parentRow.components.every(child => updatedUI.includes(child.id))) {
                        updatedUI = [...updatedUI, parentRow.id];
                        updatedAPI = [...updatedAPI, parentRow.id];
                    }
                });
                setSelectedRowsUI(updatedUI);
                setSelectedRowsAPI(checkParent(row.parentId, updatedUI, updatedAPI));
            }
        } else {
            if (row.type === 'Group') {
                const { updatedUI, updatedAPI } = deselectAllChildren(row, selectedRowsUI, selectedRowsAPI);
                setSelectedRowsUI(updatedUI);
                setSelectedRowsAPI(updatedAPI);
            } else {
                let updatedUI = selectedRowsUI.filter(id => id !== row.id);
                let updatedAPI = selectedRowsAPI.filter(id => id !== row.id);
                rows.forEach(parentRow => {
                    if (parentRow.components && parentRow.components.some(child => child.id === row.id)) {
                        updatedUI = updatedUI.filter(id => id !== parentRow.id);
                    }
                });
                setSelectedRowsUI(updatedUI);
                setSelectedRowsAPI(uncheckParent(row.parentId, updatedUI, updatedAPI));
            }
        }
    };

    const selectAllChildren = (row: Row, selectedUI: string[], selectedAPI: string[]): { updatedUI: string[], updatedAPI: string[] } => {
        let updatedUI = [...selectedUI, row.id];
        let updatedAPI = [...selectedAPI];

        if (row.type === 'Group') {
            updatedAPI = [...updatedAPI, row.id];
        } else {
            updatedAPI = updatedAPI.filter(id => id !== row.id);
        }

        if (row.components) {
            row.components.forEach(child => {
                updatedUI = [...updatedUI, child.id];
                if (child.type === 'Group') {
                    updatedAPI = [...updatedAPI, child.id];
                } else {
                    updatedAPI = updatedAPI.filter(id => id !== child.id);
                }
                const result = selectAllChildren(child, updatedUI, updatedAPI);
                updatedUI = result.updatedUI;
                updatedAPI = result.updatedAPI;
            });
        }
        return { updatedUI, updatedAPI };
    };

    const deselectAllChildren = (row: Row, selectedUI: string[], selectedAPI: string[]): { updatedUI: string[], updatedAPI: string[] } => {
        let updatedUI = selectedUI.filter(id => id !== row.id);
        let updatedAPI = selectedAPI.filter(id => id !== row.id);
        if (row.components) {
            row.components.forEach(child => {
                updatedUI = updatedUI.filter(id => id !== child.id);
                updatedAPI = updatedAPI.filter(id => id !== child.id);
                const result = deselectAllChildren(child, updatedUI, updatedAPI);
                updatedUI = result.updatedUI;
                updatedAPI = result.updatedAPI;
            });
        }
        return { updatedUI, updatedAPI };
    };

    const checkParent = (parentId: string | undefined, selectedUI: string[], selectedAPI: string[]): string[] => {
        if (!parentId) return selectedAPI;
        const parentRow = findRowById(parentId, rows);
        if (parentRow && parentRow.components) {
            const allChildrenSelected = parentRow.components.every(child => selectedAPI.includes(child.id));
            if (allChildrenSelected) {
                selectedUI = [...selectedUI, parentRow.id];
                selectedAPI = [...selectedAPI, parentRow.id];
                parentRow.components.forEach(child => selectedAPI = selectedAPI.filter(id => id !== child.id));
            }
        }
        return selectedAPI;
    };

    const uncheckParent = (parentId: string | undefined, selectedUI: string[], selectedAPI: string[]): string[] => {
        if (!parentId) return selectedAPI;
        const parentRow = findRowById(parentId, rows);
        if (parentRow) {
            selectedUI = selectedUI.filter(id => id !== parentRow.id);
            selectedAPI = selectedAPI.filter(id => id !== parentRow.id);
            parentRow.components?.forEach(child => {
                selectedUI = selectedUI.filter(id => id !== child.id);
                selectedAPI = selectedAPI.filter(id => id !== child.id);
            });
        }
        return selectedAPI;
    };

    const findRowById = (id: string, rows: Row[]): Row | undefined => {
        for (const row of rows) {
            if (row.id === id) return row;
            if (row.components) {
                const found = findRowById(id, row.components);
                if (found) return found;
            }
        }
        return undefined;
    };

    useEffect(() => {
        fetchRows();
        setSelectedRowsAPI([]);
        setSelectedRowsUI([]);
        setPage(0);
        if(!open){
            setRoleCode('');
            setRoleName('');
            setPermissionCodeFilter('');
            setPermissionNameFilter('');
        }else{
            setExpandedGroups([]);
        }
    }, [permissionCodeFilter, permissionNameFilter, open]);


    const handleSave = async () => {
        if (roleCode === '' ) {
            setSnackbarSeverity('error');
            setSnackbarMessage('Vui lòng nhập mã vai trò.');
            setOpenSnackbar(true);
        }
        else if ( roleName === '') {
            setSnackbarSeverity('error');
            setSnackbarMessage('Vui lòng nhập tên vai trò.');
            setOpenSnackbar(true);
        }
        else if (selectedRowsUI.length == 0) {
            setSnackbarSeverity('error');
            setSnackbarMessage('Vui lòng chọn quyền.');
            setOpenSnackbar(true);
        }
        else {
            try {
                setIsLoading(true);
                const payload = {
                    name: roleName,
                    code: roleCode,
                    permissionId: selectedRowsAPI,
                    departmentId: Number(choosed.key)
                };

                const response: any = await apiService.post('/role/add-new', payload);

                if (response.status === 201) {
                    setSnackbarSeverity('success');
                    setSnackbarMessage(response.data.message);
                    setOpenSnackbar(true);
                    onClose();
                }
            } catch (error: any) {
                if(error.response.data){
                setSnackbarSeverity('error');
                setSnackbarMessage( (Array.isArray(error.response.data.message)  && error.response.data.message.length > 1) ? error.response.data.message[error.response.data.message.length - 1  ] : error.response.data.message );
                setOpenSnackbar(true);
                }
                if (error.status === 403){
                    setSnackbarMessage(error.response.data.message)
                    setSnackbarSeverity('error')
                    setOpenSnackbar(true);
                }
                console.error('Error',error.response.data.message)
            }
            finally{
                setIsLoading(false);
            }
        }


    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const flattenRows = (rows: Row[], expandedGroups: string[]): Row[] => {
        const result: Row[] = [];
        const flatten = (rows: Row[]) => {
            rows.forEach(row => {
                result.push(row);
                if (row.components && expandedGroups.includes(row.id)) {
                    flatten(row.components);
                }
            });
        };
        flatten(rows);
        return result;
    };

    const paginatedRows = flattenRows(rows, expandedGroups).slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    return (
        <>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='md' sx={{ position: 'absolute' }}>
            <Box>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Thêm mới
                    <IconButton
                        aria-label='close'
                        onClick={onClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
            </Box>
            <DialogContent sx={{ border: 'none' }}>
                <div style={{ display: 'flex', marginBottom: '16px' }}>
                    <TextField
                        label="Mã vai trò"
                        required
                        value={roleCode}
                        onChange={(e) => setRoleCode(e.target.value)}
                        size='small'
                        fullWidth
                        style={{ marginRight: '40px' }}
                    />
                    <TextField
                        label="Tên vai trò"
                        required
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        size='small'
                        fullWidth
                    />
                </div>
                <TableContainer ref={tableContainerRef} sx={{ flexGrow: 1, minHeight: '300px' }}>
                    <Table arial-label='permission table' size='small'>
                        <TableHead sx={{ backgroundColor: '#F4F6F8', position: 'sticky', top: 0, zIndex: 1 }}>
                            <TableRow>
                                <TableCell sx={{ border: 'none', width: '5%' }}></TableCell>
                                <TableCell sx={{ border: 'none', width: '5%' }}></TableCell>
                                <TableCell sx={{ fontWeight: 700, border: 'none', width: '50%' }}>Mã quyền</TableCell>
                                <TableCell sx={{ fontWeight: 700, border: 'none', width: '40%' }}>Tên quyền</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ border: 'none' }}></TableCell>
                                <TableCell sx={{ border: 'none' }}></TableCell>
                                <TableCell sx={{ border: 'none' }}>
                                    <TextField
                                        size='small'
                                        fullWidth
                                        sx={{ background: 'white', borderRadius: '6px' }}
                                        value={permissionCodeFilter}
                                        onChange={handlePermissionCodeFilterChange}
                                        // onChange={(e) => setPermissionCodeFilter(e.target.value)}
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
                            {rows.length > 0 ? renderRows(paginatedRows, expandedGroups, toggleGroup, handleSelect, selectedRowsUI, handleExpand) : (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: 'center', border: 'none' }}>
                                        No data available
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box display="flex" alignItems="center" justifyContent="flex-end" sx={{ paddingX: '8px' }}>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={totalRows}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={handleSave} style={{ marginRight: '10px' }}>Lưu</Button>
            </DialogActions>
            
        </Dialog>
        <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    )
}

export default AddNewPopUp