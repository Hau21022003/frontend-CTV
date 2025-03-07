export interface ApiResponse<T> {
    data:{
        message?: string;
        data?: T | {
        items:  T ;
        pagination?: {
            totalItemInPage?: number;
            totalItems: number;
            totalPages?: number;
            currentPage?: number;
            pageSize?: number;
            };
        };
    }
  }