export type UserRole = 'user' | 'admin';
export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
