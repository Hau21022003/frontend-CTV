import React, { useEffect, useState } from 'react'
import { Location, useAppContext } from '@/app/hooks/AppContext'
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, SelectChangeEvent, Switch, TextField, Typography } from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import useLocate from '@/app/hooks/useLocate';
import { Button } from '@/app/components/button';
import apiService from '@/app/untils/api';
import CloseIcon from '@mui/icons-material/Close';
import ProgressOverlay from '@/app/components/progress-Overlay';
interface EditPopupProps {
    open: boolean;
    onClose: () => void;
    type: 'add' | 'edit';
    key?: string;
}
interface Role {
    id: string;
    name: string;
    code: string;
}
interface ApiResponse {
    data: {
        items: Role[];
    };
}

interface ApiEditResponse {
    active: boolean;
    address: string;
    avatar: string | null;
    birthday: string | null;
    district: string | null;
    email: string;
    full_name: string;
    gender: string | null;
    id: string;
    jobTitle: string;
    password: string;
    phone: string | null;
    province: string | null;
    username: string;
    ward: string | null;
    role: object | null;
}

const EditPopup: React.FC<EditPopupProps> = ({ open, onClose, type, key }) => {
    const { cities, districts, wards, fetchDistrict, fetchWard } = useLocate();
    const { province, choosed, setIsLoading, isLoading } = useAppContext();
    const [localProvince, setLocalProvince] = useState<Location | null>({ key: '', name: '' });
    const [localDistrict, setLocalDistrict] = useState<Location | null>({ key: '', name: '' });
    const [localWard, setLocalWard] = useState<Location | null>({ key: '', name: '' });
    const [localRoles, setLocalRoles] = useState<Role[]>([]);
    const [localRole, setLocalRole] = useState<Role>({ id: '', name: '', code: '' });

    const [account, setAccount] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [fullName, setFullName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    // const [gender, setGender] = useState<string | null>(null);
    const [gender, setGender] = useState('');
    const [birthday, setBirthday] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [active, setActive] = useState(false);
    useEffect(() => {
        if (open) {
            setLocalProvince({ key: province.key, name: province.name });
            fetchDistrict(province.key);
            setLocalDistrict({ key: '', name: '' });
            setLocalWard({ key: '', name: '' });
        }
    }, [open, province]);
    useEffect(() => {
        if (open) {
            if (choosed.key) {
                fetchRoles(); // Fetch roles only if choosed.key is available
            } else {
                console.error('choosed.key is undefined');
            }
        }
    }, [open, choosed]);
    useEffect(() => {
        if (localProvince) {
            fetchDistrict(localProvince.key);
        }
        if (localDistrict) {
            fetchWard(localDistrict.key);
        }
    }, [localProvince, localDistrict, fetchDistrict, fetchWard]);
    const resetData = () => {
        // setActive(true);
        fetchRoles();
        setAvatar('');
        setAccount('');
        setAddress('');
        setPassword('');
        setFullName('');
        setJobTitle('');
        setEmail('');
        setLocalRole({ id: '', name: '', code: '' });
        setBirthday('');
        setGender('');
        setLocalProvince({ key: '', name: '' });
        setLocalDistrict({ key: '', name: '' });
        setLocalWard({ key: '', name: '' });
    };
    const handleChangeAccount = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAccount(event.target.value);
    }; const handleChangeFullName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFullName(event.target.value);
    };
    const handleChangeJobTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setJobTitle(event.target.value);
    };
    const handleChangeGender = (event: React.ChangeEvent<{ value: unknown }>) => {
        setGender(event.target.value as string);
    };
    const handleChangeBirthday = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBirthday(event.target.value);
    };
    const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };
    const handleChangePhone = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(event.target.value);
    };
    const handleChangeActive = (event: React.ChangeEvent<HTMLInputElement>) => {
        setActive(event.target.checked);
    };

    const handleChangeRole = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedRoleName = event.target.value as string;
        const selectedRole = localRoles.find(role => role.name === selectedRoleName);
        if (selectedRole)
            setLocalRole({ id: selectedRole.id, name: selectedRoleName, code: selectedRole.code });
    };
    const handleProvinceChange = async (event: SelectChangeEvent<string>) => {
        const selectedProvinceName = event.target.value;
        const selectedProvince = cities.find(city => city.name === selectedProvinceName);
        if (selectedProvince) {
            setLocalProvince({ key: selectedProvince.key, name: selectedProvinceName });
            setLocalDistrict({ key: '', name: '' });
            setLocalWard({ key: '', name: '' });
            await fetchDistrict(selectedProvince.key);
        }
    };

    const handleDistrictChange = async (event: SelectChangeEvent<string>) => {
        const selectedDistrictName = event.target.value;
        const selectedDistrict = districts.find(district => district.name === selectedDistrictName);
        if (selectedDistrict) {
            setLocalDistrict({ key: selectedDistrict.key, name: selectedDistrictName });
            setLocalWard({ key: '', name: '' });
            await fetchWard(selectedDistrict.key);
        }
    };

    const handleWardChange = (event: SelectChangeEvent<string>) => {
        const selectedWardName = event.target.value;
        const selectedWard = wards.find(ward => ward.name === selectedWardName);
        if (selectedWard) {
            setLocalWard({ key: selectedWard.key, name: selectedWardName });
        }
    };
    const handleChangeAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAddress(event.target.value);
    };
    const handleSave = async () => {
        // if (!account || !password || !jobTitle || !email || !fullName || !localRole.id ) {
        //     setSnackbarSeverity('error');
        //     setSnackbarMessage('Required fields cannot be empty');
        //     setOpenSnackbar(true);
        // } else {
        //     const formData = new FormData();

        //     formData.append('username', account);
        //     formData.append('password', password);
        //     formData.append('jobTitle', jobTitle);
        //     formData.append('email', email);
        //     formData.append('full_name', fullName);
        //     formData.append('roleId', localRole.id);
        //     setSnackbarSeverity('error');
        //                 setSnackbarMessage('Department lv1 that has child departments cannot be deleted');

        //     if (selectedFile) {
        //         formData.append('file', selectedFile);
        //     }
        //     if (gender) {
        //         formData.append('gender', gender);
        //     }
        //     if (birthday) {
        //         formData.append('birthday', convertBirthday(birthday));
        //     }
        //     if (phoneNum) {
        //         formData.append('phone', phoneNum);
        //     }
        //     if (typeof active !== 'undefined') {
        //         formData.append('active', active.toString());
        //     }
        //     if (choosed && choosed.id) {
        //         formData.append('departmentId', choosed.id);
        //     }
        //     if (localProvince) {
        //         formData.append('province', JSON.stringify(localProvince));
        //     }
        //     if (localDistrict) {
        //         formData.append('district', JSON.stringify(localDistrict));
        //     }
        //     if (localWard) {
        //         formData.append('ward', JSON.stringify(localWard));
        //     }
        //     if (address) {
        //         formData.append('address', address);
        //     }
        //     // for (let pair of formData.entries()) {
        //     //     console.log(pair[0] + ': ' + pair[1]);
        //     // }
        //     try {
        //         let response;
        //         if (type === 'add') {
        //             response = await apiService.post('/users', formData, {
        //                 headers: {
        //                     'Content-Type': 'multipart/form-data',
        //                 },
        //             });
        //             console.log('User saved successfully:', response.data);
        //             onClose();
        //         } else if (type === 'edit') {
        //             response = await apiService.put(`/users/${id}`, formData, {
        //                 headers: {
        //                     'Content-Type': 'multipart/form-data',
        //                 },
        //             });
        //             console.log('User edit successfully:', response.data);
        //             onClose();
        //         }
        //     } catch (error: any) {
        //         console.error('Error saving user:', error.response.data);

        //     }
        // }    
    };
    const fetchRoles = async () => {
        try {      
            setIsLoading(true)

            const res = await apiService.get<ApiResponse>(`role/department/${choosed.key}`);
            setLocalRoles(res.data.data.items);
        } catch (error: any) {
            console.error('Error fetching roles:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
            }
        }
        finally{
            setIsLoading(false);
        }
    };


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);

            const maxSize = 1000 * 1024;
            if (file.size > maxSize) {
                alert('File quá lớn. Vui lòng chọn file dưới 100 KB.');
                return;
            }

            setSelectedFile(file);
        }
    };


    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth='lg'
                PaperProps={{
                    style: {
                        width: '900px',
                        position: 'absolute',
                    },
                }}
            >
                {/* <DialogTitle>{type==='add' ? 'Add New' : 'Edit'}</DialogTitle> */}
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Edit
                    <IconButton
                        aria-label='close'
                        onClick={onClose}
                        sx={{ position: 'absolute', right: 16, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box display='flex' flexDirection='row' justifyContent='space-between' gap='10px'>
                        <Box
                            display='flex'
                            flexDirection='column'
                            alignItems='center'
                            width='25%'
                            height='300px'
                            border='1px solid #E5E5E5'
                            borderRadius='10px'
                            padding='16px'
                        >
                            <Box
                                display='flex'
                                flexDirection='column'
                                alignItems='center'
                                justifyContent='center'
                                border='1px dashed #F4F6F8'
                                borderRadius='100%'
                                width={180}
                                height={180}
                            >
                                <Box
                                    display='flex'
                                    flexDirection='column'
                                    alignItems='center'
                                    justifyContent='center'
                                    border='2px dashed #F4F6F8'
                                    width={160}
                                    height={160}
                                    backgroundColor='#F4F6F8'
                                    padding='10px'
                                    borderRadius='100%'
                                >
                                    {avatar ? (
                                        <img src={avatar} alt='avatar' style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                    ) : (
                                        <>
                                            <input
                                                accept='image/*'
                                                style={{ display: 'none' }}
                                                id='upload-avatar'
                                                type='file'
                                                onChange={handleFileChange}
                                            />
                                            <label htmlFor='upload-avatar'>
                                                <IconButton component='span'>
                                                    <AddAPhotoIcon sx={{ color: '#637381' }} />
                                                </IconButton>
                                            </label>
                                            <Typography align='center' sx={{ fontSize: '14px', color: '#637381' }}>
                                                Upload avatar
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                            </Box>
                            <Typography align='center' sx={{ fontSize: '14px', color: '#637381' }}>
                                *.jpeg, *.jpg, *.png.
                                <br />
                                Maximum 1 MB
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                                <Typography sx={{ fontSize: '14px', color: '#212B36', fontWeight: 700, marginRight: '8px' }}>
                                    Active
                                </Typography>
                                <Switch sx={{ marginLeft: '40px' }} checked={active} onChange={handleChangeActive} />
                            </Box>
                        </Box>
                        <Box
                            display='flex'
                            flexDirection='column'
                            gap='16px'
                            width='75%'
                            border='1px solid #E5E5E5'
                            borderRadius='10px'
                            padding='16px'
                        >
                            <Box display='flex' marginBottom='8px' gap='32px'>
                                <TextField
                                    label="Account"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    required
                                    value={account}
                                    onChange={handleChangeAccount}
                                    disabled={type === 'edit'}
                                    InputLabelProps={{
                                        shrink: !!account || undefined,
                                    }}
                                />
                                <TextField
                                    label="Password"
                                    required
                                    size="small"
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={type === 'edit'}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <Visibility fontSize='small' /> : <VisibilityOff fontSize='small' />}
                                            </IconButton>
                                        ),
                                    }}
                                />
                            </Box>
                            <Box display='flex' marginBottom='8px' gap='32px'>
                                <TextField
                                    label="Full Name"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    required
                                    value={fullName}
                                    onChange={handleChangeFullName}
                                />
                                <TextField
                                    label="Job Title"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    required
                                    value={jobTitle}
                                    onChange={handleChangeJobTitle}
                                />
                            </Box>
                            <Box display='flex' marginBottom='8px' gap='32px'>
                                <TextField
                                    label="Gender"
                                    select
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    required
                                    value={gender}
                                    onChange={handleChangeGender}
                                >
                                    <MenuItem value="male">Male</MenuItem>
                                    <MenuItem value="female">Female</MenuItem>
                                </TextField>
                                <TextField
                                    label="Birthday"
                                    type="date"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={birthday}
                                    onChange={handleChangeBirthday}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Box>
                            <Box display='flex' marginBottom='8px' gap='32px'>
                                <TextField
                                    label="Role"
                                    select
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    required
                                    value={localRole.name}
                                    onChange={handleChangeRole}
                                >
                                    {localRoles?.length > 0 &&
                                        localRoles.map((role: Role) => (
                                            <MenuItem key={role.id} value={role.name}>
                                                {role.name}
                                            </MenuItem>
                                        ))
                                    }
                                </TextField>
                                <TextField
                                    label="Phone"
                                    required
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={phone}
                                    onChange={handleChangePhone}
                                />
                            </Box>
                            <Box display='flex' marginBottom='8px' gap='32px'>
                                <TextField
                                    label="Email"
                                    required
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={email}
                                    onChange={handleChangeEmail}
                                />
                            </Box>
                            <Box display='flex' marginBottom='8px' gap='32px'>
                                <TextField
                                    label="Province/City"
                                    select
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    required
                                    value={localProvince?.name || ''}
                                    onChange={handleProvinceChange}
                                >
                                    {cities.slice().reverse().map((city) => (
                                        <MenuItem key={city.key} value={city.name}>
                                            {city.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="District"
                                    select
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    required
                                    value={localDistrict?.name || ''}
                                    onChange={handleDistrictChange}
                                >
                                    {districts?.length > 0 &&
                                        districts.map((district) => (
                                            <MenuItem key={district.key} value={district.name}>
                                                {district.name}
                                            </MenuItem>
                                        ))
                                    }
                                </TextField>
                            </Box>
                            <Box display='flex' marginBottom='8px' gap='32px'>
                                <TextField
                                    label="Ward"
                                    select
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    required
                                    value={localWard?.name || ''}
                                    onChange={handleWardChange}
                                >
                                    {wards?.length > 0 &&
                                        wards.map((ward) => (
                                            <MenuItem key={ward.key} value={ward.name}>
                                                {ward.name}
                                            </MenuItem>
                                        ))
                                    }
                                </TextField>
                                <TextField
                                    label="Address"
                                    required
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={email}
                                    onChange={handleChangeAddress}
                                />
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box display="flex" justifyContent="flex-end" width="100%" paddingRight='16px' paddingBottom='16px'>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            color="primary"
                            sx={{ height: '37px', width: '97px', textTransform: 'none', padding: '16px' }}
                        >
                            Save
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
            <ProgressOverlay isLoading={isLoading} />

        </>
    )
}

export default EditPopup