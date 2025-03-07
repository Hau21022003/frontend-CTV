//AppContext.tsx
import React, { createContext, useContext, useState } from 'react';

export interface Location {
  key: string;
  name: string;
}

interface Department {
  departmentId: number;
  departmentName: string;
  province: Location;
  district: {
    name: string;
    idDistrict: string;
    idProvince: string;
  };
  ward: {
    name: string;
    idCommune: string;
    idDistrict: string;
  };
  level: number;
}

interface Role {
  id: string;
  type: string;
  code: string;
  name: string;
  parentId?: string;
  children?: Role[];
}

interface AppState {
  province: Location;
  setProvince: React.Dispatch<React.SetStateAction<Location>>;
  choosed: Location;
  setChoosed: React.Dispatch<React.SetStateAction<Location>>;
  district: Location;
  setDistrict: React.Dispatch<React.SetStateAction<Location>>;
  ward: Location;
  setWard: React.Dispatch<React.SetStateAction<Location>>;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  dpmLv1: Location;
  setDpmLv1: React.Dispatch<React.SetStateAction<Location>>;
  dpmLv2: Location;
  setDpmLv2: React.Dispatch<React.SetStateAction<Location>>;
  dpmLv3: Location;
  setDpmLv3: React.Dispatch<React.SetStateAction<Location>>;
  dpmLv4: Location;
  setDpmLv4: React.Dispatch<React.SetStateAction<Location>>;
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  reportId: string;
  setReportId: React.Dispatch<React.SetStateAction<string>>;
  refreshAddNew: boolean;
  setRefreshAddNew: React.Dispatch<React.SetStateAction<boolean>>;
  refreshDelete: boolean;
  setDeleteRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;

}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [province, setProvince] = useState<Location>({ key: '', name: '' });
  const [district, setDistrict] = useState<Location>({ key: '', name: '' });
  const [choosed, setChoosed] = useState<Location>({ key: '', name: '' });
  const [ward, setWard] = useState<Location>({ key: '', name: '' });
  const [name, setName] = useState<string>('');
  const [level, setLevel] = useState<number>(0);
  const [dpmLv1, setDpmLv1] = useState<Location>({ key: '', name: '' });
  const [dpmLv2, setDpmLv2] = useState<Location>({ key: '', name: '' });
  const [dpmLv3, setDpmLv3] = useState<Location>({ key: '', name: '' });
  const [dpmLv4, setDpmLv4] = useState<Location>({ key: '', name: '' });
  const [roles, setRoles] = useState<Role[]>([])
  const [reportId, setReportId] = useState('');
  const [refreshAddNew, setRefreshAddNew] = useState<boolean>(false);
  const [refreshDelete, setDeleteRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <AppContext.Provider value={{ province, setProvince, district, setDistrict, choosed, setChoosed, ward, setWard, name, setName, level, setLevel, dpmLv1, setDpmLv1, dpmLv2, setDpmLv2, dpmLv3, setDpmLv3, dpmLv4, setDpmLv4,roles, setRoles, reportId, setReportId , refreshAddNew, setRefreshAddNew, refreshDelete,setDeleteRefresh, isLoading, setIsLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
