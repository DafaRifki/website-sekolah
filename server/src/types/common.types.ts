export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  kelasId?: string;
  tahunAjaranId?: number | string;
  status?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type UserRole = "ADMIN" | "GURU" | "SISWA";

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  guruId?: number;
  siswaId?: number;
}

export interface UserManagementData {
  id: number;
  email: string;
  role: "ADMIN" | "GURU" | "SISWA";
  guruId?: number;
  siswaId?: number;
  guru?: {
    id_guru: number;
    nama: string;
    nip: string;
  };
  siswa?: {
    id_siswa: number;
    nama: string;
    nis?: string;
  };
}
