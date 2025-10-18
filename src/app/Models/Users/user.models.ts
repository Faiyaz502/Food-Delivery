import { UserRole, UserStatus, VerificationStatus } from "src/app/Enums/profileEnums";


export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  primaryRole: UserRole;
  status: UserStatus;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserCreateDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  primaryRole: UserRole;
}

export interface UserUpdateDTO {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePictureUrl:string ;
}

export interface PasswordChangeDTO {
  oldPassword: string;
  newPassword: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}
