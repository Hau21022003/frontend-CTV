import { Alert, Box, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import { KeyboardArrowDown, KeyboardArrowUp} from '@mui/icons-material';
import { Button } from '@/app/components/button';
import apiService from '@/app/untils/api';
import { useAppContext } from '@/app/hooks/AppContext';
import { useAuth } from '@/app/hooks/AuthContext';
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

interface RoleDetails {
    id: number; 
    code: string;
    name: string; 
    permissionIds?: number[];
}

interface EditPopupProps {
    open: boolean;
    onClose: () => void;
    roleId: string;
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
            <TableRow sx={{ cursor: 'pointer', border: 'none' }}>
                <TableCell>
                    {row.type === 'Group' && (
                        <IconButton onClick={() => { toggleGroup(row.id); onExpand(); }} sx={{ color: 'black' }}>
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
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
            </TableRow>
        </React.Fragment>
    ));
};

const getGroupsToExpand = (rows: Row[], permissionIds: number[]): string[] => {
    const groupsToExpand: string[] = [];

    const checkRow = (row: Row) => {
        if (row.components && row.components.length > 0) {
            const hasSelectedComponent = row.components.some(
                (component) => permissionIds.includes(parseInt(component.id))
            );
            if (hasSelectedComponent) {
                groupsToExpand.push(row.id);
                row.components.forEach(checkRow);
            }
        }
    };

    rows.forEach(checkRow);
    return groupsToExpand;
};


const EditPopUp: React.FC<EditPopupProps> = ({ open, onClose, roleId }) => {
    const { setIsEditing } = useAuth();
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [selectedRowsUI, setSelectedRowsUI] = useState<string[]>([]);
    const [selectedRowsAPI, setSelectedRowsAPI] = useState<string[]>([]);
    const [roleCode, setRoleCode] = useState('');
    const [roleName, setRoleName] = useState('');
    const { setRoles, choosed, setIsLoading } = useAppContext();
    const [totalRows, setTotalRows] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [permissionCodeFilter, setPermissionCodeFilter] = useState('');
    const [permissionNameFilter, setPermissionNameFilter] = useState('');
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [rows, setRows] = useState<Row[]>([]);
    const [rowsHard, setHardRows] = useState<Row[]>([]);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };
    const fetchPermission = async () => {
        try {
            setIsLoading(true);
            // Check if required parameters are not null or empty
            // if (!permissionCodeFilter && !permissionNameFilter) {
            //     console.warn("No filters applied. Fetching default data.");
            // }

            const params = new URLSearchParams();

            // if (permissionCodeFilter && permissionCodeFilter !== '') params.append('code', permissionCodeFilter);
            // if (permissionNameFilter && permissionNameFilter !== '') params.append('name', permissionNameFilter);

            params.append('page', (page + 1).toString()); 
            params.append('limit', rowsPerPage.toString());

            const response = await apiService.get<ApiResponse>(`/permissions?${params.toString()}`);

            if (response.data.success) {
                const data = response.data.data.items;
                setHardRows(data)
            } else {
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

    const fetchRows = async () => {
        try {
            setIsLoading(true);
            // Check if required parameters are not null or empty
            // if (!permissionCodeFilter && !permissionNameFilter) {
            //     console.warn("No filters applied. Fetching default data.");
            // }

            const params = new URLSearchParams();

            if (permissionCodeFilter && permissionCodeFilter !== '') params.append('code', permissionCodeFilter);
            if (permissionNameFilter && permissionNameFilter !== '') params.append('name', permissionNameFilter);

            params.append('page', (page + 1).toString()); 
            params.append('limit', rowsPerPage.toString());

            const response = await apiService.get<ApiResponse>(`/permissions?${params.toString()}`);

            if (response.data.success) {
                const data = response.data.data.items;
                setRows(data);
                updateTotalRows(data, expandedGroups);
            } else {
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

    const collectIds = (permission: Row): string[] => {
        let ids = [permission.id];
        if (permission.components) {
            permission.components.forEach(child => {
                ids = ids.concat(collectIds(child));
            });
        }
        return ids;
    };

    const fetchRoleDetails = async () => {
        try {
            setIsLoading(true)
            const response = await apiService.get<RoleDetails>(`/role/${roleId}/edit`);
            const data = response.data.data;
            console.log('PERMISSION: ', data)

            if (!data.permissionIds || !Array.isArray(data.permissionIds)) {
                throw new Error('Invalid permissions data');
            }

            setRoleName(data.name);
            setRoleCode(data.code);

            //const newSelectedRowsUI = data.permissionIds.map((id: string) => id.toString())
            // const newSelectedRowsAPI = data.permissionIds.map((id: string) => id.toString());
            let newSelectedRowsUI = data.permissionIds.map((id :any) => id);
            // const newSelectedRowsAPI = data.permissionIds.map((id:any) => id); 
            const newSelectedRowsAPI = data.permissionIds.map((id:any) => id);

            newSelectedRowsUI = selectAllChildrenEditt(newSelectedRowsUI)
            setSelectedRowsUI(newSelectedRowsUI);
            setSelectedRowsAPI(newSelectedRowsAPI);
            const groupsToExpand = getGroupsToExpand(rows, newSelectedRowsUI);
            updateTotalRows(rows, groupsToExpand)  
            setExpandedGroups(groupsToExpand);
        } catch (error) {
            console.error('Error fetching role details: ', error);
        }
        finally{
            setIsLoading(false);
        }
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

    const handleSelect = (row: Row, checked: boolean, edit: boolean=false) => {
        if (checked) {
            if (row.type === 'Group') {
                const { updatedUI, updatedAPI } = selectAllChildren(row, selectedRowsUI, selectedRowsAPI);
                setSelectedRowsUI(updatedUI);
                setSelectedRowsAPI(updatedAPI);
            } else {
                let updatedUI = [...selectedRowsUI, row.id];
                let updatedAPI = [...selectedRowsAPI, row.id];
                rowsHard.forEach(parentRow => {
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
                // console.log()
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
    const selectAllChildrenEditt = (permissionIds: number[]) => {
        let updateSelectUI = permissionIds
        for (const permissionId of permissionIds){

            let permission = findRowById(permissionId.toString(), rows); /////////////
                        if(permission?.type === 'Group'){
                if(permission.components){
                    const componentIds =  permission.components.map((component) => parseInt(component.id))
                    updateSelectUI = [...updateSelectUI, ...componentIds]
                }
            }
        }
        return updateSelectUI
    }

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
        const parentRow = findRowById(parentId, rowsHard);
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
            let array = selectedUI;
            parentRow.components?.forEach(child => {
                array = array.filter(id => id !== child.id);
                // selectedAPI = selectedAPI.filter(id => id !== child.id);
            });
            let result = selectedUI.filter(item => !array.includes(item));
            selectedAPI = [...selectedAPI, ...result]
        }
        return selectedAPI;
    };

    const findRowById = (id: string, rows: Row[]): Row | undefined => {        
        for (const row of rows) {
            if (row.id == id) return row;
            if (row.components) {
                const found = findRowById(id, row.components);
                if (found) return found;
            }
        }
        return undefined;
    };
    
    useEffect(() => {
            fetchRows()
            fetchPermission()
    },[]);

    useEffect(() => {
        if (open) {
            fetchRows();
            fetchRoleDetails();
            setPage(0);
        }else{
            setRoleCode('');
            setRoleName('');
            setPermissionCodeFilter('');
            setPermissionNameFilter('');
            setSelectedRowsAPI([]);
            setSelectedRowsUI([]);
            setPage(0);
        }
    }, [open, permissionCodeFilter, permissionNameFilter, roleId]);
    

    useEffect(() => {
            fetchRows();
            setPage(0);
    }, [permissionCodeFilter, permissionNameFilter]);

    const handleSave = async () => {
        if (roleName === '') {
            setSnackbarSeverity('error');
            setSnackbarMessage('Name can not be empty.');
            setOpenSnackbar(true);
            return; // Return early if name is empty
        }

        if (selectedRowsUI.length === 0) {
            setSnackbarSeverity('error');
            setSnackbarMessage('No permissions have been selected.');
            setOpenSnackbar(true);
            return; 
        }

        try {
            setIsLoading(true)

            const payload = {
                name: roleName,
                departmentId: Number(choosed.key),
                permissionId: selectedRowsAPI.map(id => Number(id)),
            };
            const response = await apiService.put(`/role/update/${roleId}`, payload);
            const data = response.data.data;
            if(data) {
                localStorage.setItem("permissions", JSON.stringify(data?.permissions));
                setIsEditing((prev) => !prev);
            }
            if (response.status === 200) {
                setOpenSnackbar(true);
                setSnackbarMessage(response.data.message)
                setSnackbarSeverity('success');
                onClose(); 
            } else {
                setSnackbarSeverity('error');
                setSnackbarMessage('Update failed!');
                setOpenSnackbar(true);
            }
        } catch (error: any) {
            // console.error('Error updating role:', error);
            // setSnackbarSeverity('error');
            // setSnackbarMessage('Error');
            // setOpenSnackbar(true);
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
                    Chỉnh sửa
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
                        disabled
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
                <Button variant="contained" color="primary" onClick={handleSave} style={{ marginRight: '10px' }}>Save</Button>
            </DialogActions>
            

        </Dialog>
        <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
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

export default EditPopUp