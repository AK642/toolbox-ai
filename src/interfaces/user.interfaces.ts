/** Define the interface for the create user params */
export type UserParams = {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    password: string;
};

/** Define the interface for updating user params */
export type UpdateUserParams = Partial<UserParams>;