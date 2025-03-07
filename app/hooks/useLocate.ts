// import { useState, useEffect } from 'react';
// import apiService from '../untils/api';
// import { useAuth } from './AuthContext';

// interface City {
//   id: string;
//   name: string;
// }
// interface District {
//   id: string;
//   name: string;
// }
// interface Ward {
//   id: string;
//   name: string;
// }

// const useLocate = () => {
//   const {isAuthenticated} = useAuth();
//   const [cities, setCities] = useState<City[]>([]);
//   const [districts, setDistricts] = useState<District[]>([]);
//   const [wards, setWards] = useState<Ward[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchCities = async () => {
//     try {
//       const response = await apiService.get<{ data: City[] }>('/department/find-all-province');
//       console.log("fetchCities",response.data);
//       setCities(response.data);
//     } catch (err) {
//       setError('Error fetching cities');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDistrict = async (provinceId: string) => {
//     try {
//       const response = await apiService.get<{ data: District[] }>(`/deparment/find-district?id=${provinceId}`);
//       setDistricts(response.data.data);
//     } catch (err) {
//       setError('Error fetching districts');
//     }
//   };

//   const fetchWard = async (districtId: string) => {
//     try {
//       const response = await apiService.get<{ data: Ward[] }>(`/deparment/find-district?id=${districtId}`);
//       setWards(response.data.data);
//     } catch (err) {
//       setError('Error fetching wards');
//     }
//   };

//   useEffect(() => {
//     fetchCities();
//   }, []);

//   return { cities, districts, loading, error, wards, fetchDistrict, fetchWard };
// };

// export default useLocate;

import { useState, useEffect } from 'react'; 
import apiService from '../untils/api';
import { useAuth } from './AuthContext';

interface City {
  id: string;
  name: string;
}
interface District {
  idDistrict: string;
  name: string;
  idProvince: string;
}
interface Ward {
  idCommune: string;
  name: string;
  idDistrict: string;
}

const useLocate = () => {
  const { isAuthenticated } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = async () => {
    try {
      const response = await apiService.get<{ data: City[] }>('/department/find-all-province');
      console.log("fetchCities", response.data);
      setCities(response.data);
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError('Error fetching cities');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistrict = async (provinceId: string) => {
    try {
      const response = await apiService.get<{ data: District[] }>(`/department/find-district?id=${provinceId}`);
      console.log("fetchDistrict", response.data);
      setDistricts(response.data);
    } catch (err) {
      console.error('Error fetching districts:', err);
      setError('Error fetching districts');
    }
  };

  const fetchWard = async (districtId: string) => {
    try {
      const response = await apiService.get<{ data: Ward[] }>(`/department/find-ward?id=${districtId}`);
      console.log("fetchWard", response.data);
      setWards(response.data);
    } catch (err) {
      console.error('Error fetching wards:', err);
      setError('Error fetching wards');
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  return { cities, districts, wards, loading, error, fetchDistrict, fetchWard };
};

export default useLocate;
