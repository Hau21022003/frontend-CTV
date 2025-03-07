//department-service.ts
import apiService from '@/app/untils/api';
import { Departments, DepartmentsResponse } from '@/app/(pages)/department/types/department';

const fetchDepartments = async (): Promise<Departments> => {
    const response = await apiService.get<Departments>('/department/');
    return response.data;
};

export { fetchDepartments };
