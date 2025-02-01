export class AppError extends Error {
    public statusCode: number;
    public details?: any;

    constructor(message: string, statusCode: number, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = "AppError";
    }
}

export interface AppErrorResponse {
    error: string; // A brief error message
    details?: any; // Optional detailed information about the error
    statusCode?: number; // Optional HTTP status code
}