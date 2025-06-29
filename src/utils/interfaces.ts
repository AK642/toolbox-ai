/** Custom error type */
export interface CustomError {
    status?: number;
    message: string;
    stack?: string;
    name: string
}