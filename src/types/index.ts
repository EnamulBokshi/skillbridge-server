import { BookingStatus } from "../generated/prisma/enums.js";

export interface StudentRegistrationPayloadType {
        id? :string;
        sid?:string;
        firstName?: string;
        lastName?: string;
        userId: string;
        status: "ACTIVE" | "BANNED" | "INACTIVE"
       
}

export enum StudentStatus {
    ACTIVE,
    BAN,
    INACTIVE
}


export interface Bookings{
    id?: string;
    tutorId: string;
    studentId: string;
    slotId: string;

}

export interface StudentRegistration{
    firstName?: string;
    lastName?: string;
    userId: string;
    phone  ?: string;
    address? : string;
    email?: string;
    zip?: string 
}

export interface TutorRegistration{
    firstName: string;
    lastName: string;
    bio: string;
    categoryId: string;
    userId: string;
    phone  ?: string;
    address? : string;
    email?: string;
    zip?: string 
    
    experienceYears: number;
    cv?: string;
    expertiseAreas: string[];
}

export interface TutorDetailedProfile {
    id: string;
    tid: string;
    userId: string;
    firstName: string;
    lastName: string;
    isFeatured: boolean;
    profilePicture: string | null;
    bio: string;
    completedSessions: number;
    experienceYears: number;
    cv: string | null;
    expertiseAreas: string[];
    categoryId: string;
    avgRating: number;
    totalReviews: number;
    totalEarned: number;
    phone: string | null;
    address: string | null;
    email: string | null;
    zip: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        status: string | null;
        email: string;
        image: string | null;
    };
    category: {
        id: string;
        name: string;
        slug: string;
    };
    slot: {
        id: string;
        date: Date;
        startTime: Date;
        endTime: Date;
        subjectId: string;
        slotPrice: number;
        isBooked: boolean;
        isFeatured: boolean;
        isFree: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[];
    reviews: {
        id: string;
        rating: number;
        comment: string;
        createdAt: Date;
        student: {
            id: string;
            firstName: string | null;
            lastName: string | null;
        };
    }[];
}

export interface Category{
    id?: string;
    name: string;
    slug: string;
    description: string;

}

// export interface Subject{
//     id?: string;
//     name: string;
//     slug: string;
//     categoryId: string;
// }

export interface Subject {
    id ?:string;
    name: string;
    creditHours: number;
    categoryId: string;
    slug: string;
    description: string;
    isActive: boolean;
}
    

export interface ISlot {
    id: string;
    tutorId: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    subjectId: string;
    slotPrice: number;
    isBooked: boolean;
    isFeatured: boolean;
    isFree: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateSlotPayload {
    tutorId: string;
    date: string; // ISO datetime string
    startTime: string; // ISO datetime string
    endTime: string; // ISO datetime string
    subjectId: string;
    slotPrice: number;
    isBooked: boolean;
    isFeatured?: boolean;
    isFree?: boolean;
}

export interface IUpdateSlotPayload {
    date?: string;
    startTime?: string;
    endTime?: string;
    slotPrice?: number;
    isBooked?: boolean;
    isFeatured?: boolean;
    isFree?: boolean;
}

export interface ISlotResponse {
    id: string;
    tutorId: string;
    date: string;
    startTime: string;
    endTime: string;
    subjectId: string;
    slotPrice: number;
    isBooked: boolean;
    isFeatured: boolean;
    isFree: boolean;
    createdAt: string;
    updatedAt: string;
}
  
export interface ParamsType{
    search?: string;
    page?: number;
    limit?: number;
    skip?: number;
    sortBy?: string;
    orderBy?: string;
}

export interface SlotSearchParams extends ParamsType{
    isBooked?: boolean;
    isFeatured?: boolean;
    isFree?: boolean;
    tutorId? : string;
    subjectId?: string;
    startDate? : string;
    endDate?: string;
    date?: string;
    isBookable?: boolean ;

}

export interface BookingSearchParams extends ParamsType{
    studentId?: string;
    tutorId?: string;
    slotId?: string;
    status?: "PENDING" | "CONFIRMED" | "CANCELLED";
    startDate? : string;
    endDate?: string;
    date?: string;
}

export interface TutorSearchParams extends ParamsType{
    isFeatured?: boolean;
    categoryId?: string;
    minRating?: number;
    maxRating?: number;
    minExperience?: number;
    maxExperience?: number;
}

export interface PaginationMeta{
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
}

export interface PaginatedResult<T> {
    data: T;
    pagination: PaginationMeta;
}

export interface CreateBookingPayload{
    slotId: string;
    studentId: string;
}

export interface UpdateBookingPayload{
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
}

export interface UserFilterParams extends ParamsType{
    role?: "STUDENT" | "TUTOR" | "ADMIN";
    status?: "ACTIVE" | "BANNED" | "INACTIVE";
}

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    banned: number;
  };

  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
    recent: number; // last 30 days
  };

  revenue: {
    total: number;
    lastThirtyDays: number;
  };

  slots: {
    total: number;
    booked: number;
    free: number;
    available: number;
  };

  reviews: {
    total: number;
    averageRating: number;
  };
}


export interface IUser {
    id: string;
    email: string;
    password: string;
    role: "STUDENT" | "TUTOR" | "ADMIN";
    status: "ACTIVE" | "BANNED" | "INACTIVE";
    isAssociate: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Booking{
    id: string;
    studentId: string;
    slotId: string;
    status: BookingStatus;
    createdAt: Date;
    updatedAt: Date;
}

export type BookingWithDetails = (
{
    student: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        profilePicture: string | null;
        email: string | null;
    };
    slot: {
        date: Date;
        id: string;
        startTime: Date;
        endTime: Date;
        slotPrice: number;
        tutorProfile: {
            id: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            email: string | null;
        };
    };
} & Booking

)

export type UserUpdatePayload = {
    email?: string;
    name?: string;
    image?: string;
    emailVerified?: Date | null;
}