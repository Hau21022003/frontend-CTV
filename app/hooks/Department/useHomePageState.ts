// import { useState, useEffect } from 'react';
// import { useAppContext } from '../../hooks/AppContext';
// import useLocate from '../useLocate';
// import apiService from '@/untils/api';

// interface Department {
//     id: number;
//     level: number;
//     name: string;
// }

// const useHomePageState = () => {
//     const [open, setOpen] = useState(true);
//     const [openAdd, setOpenAdd] = useState(false);
//     const [refreshTable, setRefreshTable] = useState(false);
//     const [refreshOptions, setRefreshOptions] = useState(false);
//     const [departments, setDepartments] = useState<Department[]>([]);
//     const { province, setProvince, dpmLv1, setDpmLv1, dpmLv2, setDpmLv2, dpmLv3, setDpmLv3, dpmLv4, setDpmLv4 } = useAppContext();
//     const { cities } = useLocate();

//     useEffect(() => {
//         const fetchDepartments = async () => {
//             try {
//                 const res = await apiService.get<Department[]>('/department/list'); 
//                 setDepartments(res.data || []);
//             } catch (error) {
//                 console.error('Error fetching departments:', error);
//             }
//         };

//         fetchDepartments();
//     }, []);

//     return {
//         open, setOpen, openAdd, setOpenAdd, refreshTable, setRefreshTable,
//         refreshOptions, setRefreshOptions, departments,
//         province, setProvince, dpmLv1, setDpmLv1,
//         dpmLv2, setDpmLv2, dpmLv3, setDpmLv3, dpmLv4, setDpmLv4, cities
//     };
// };

// export default useHomePageState;
