// department.ts
// export interface Department {
//     id: number;
//     province?: string;
//     district?: string;
//     ward?: string;
//     level?: number;
//     name: string;
// }

export interface Department {
    departmentId: number;
    departmentName: string;
    level?: number;
    parentId?: number | null;
    province?: {
        name: string;
        idProvince: string;
    };
    district?: {
        name: string;
        idDistrict: string;
        idProvince: string;
    };
    ward?: {
        name: string;
        idCommune: string;
        idDistrict: string;
    };
}



export interface DepartmentsResponse {
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

export interface Departments {
    data: Department[]
    code: number;
    message: string;
    success: boolean;
}
