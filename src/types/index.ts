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
        byRole: Array<{
            role: string | null;
            _count: {
                id: number;
            };
        }>;
        recentSignups: number;
        growthRate: number;
    };
    tutors: {
        total: number;
        featured: number;
        topPerformer: {
            id: string;
            firstName: string;
            lastName: string;
            completedSessions: number;
            avgRating: number;
        } | null;
        topRated: Array<{
            id: string;
            firstName: string;
            lastName: string;
            avgRating: number;
            totalReviews: number;
            completedSessions: number;
        }>;
        totalEarnings: number;
        averageEarnings: number;
    };
    students: {
        total: number;
        active: number;
        topBooker: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            completedSessions: number;
            _count: {
                bookings: number;
            };
        } | null;
    };
    bookings: {
        total: number;
        byStatus: Array<{
            status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REJECTED";
            _count: {
                id: number;
            };
        }>;
        confirmed: number;
        completed: number;
        cancelled: number;
        pending: number;
        recent: number;
        growthRate: number;
    };
    slots: {
        total: number;
        booked: number;
        available: number;
        featured: number;
        free: number;
        pricing: {
            average: number;
            minimum: number;
            maximum: number;
            total: number;
        };
    };
    revenue: {
        total: number;
        lastThirtyDays: number;
        averagePerBooking: number;
    };
    reviews: {
        total: number;
        averageRating: number;
        ratingDistribution: Array<{
            rating: number;
            _count: {
                id: number;
            };
        }>;
        recent: number;
    };
    categories: {
        total: number;
        details: Array<{
            id: string;
            name: string;
            _count: {
                subject: number;
                tutorProfile: number;
            };
        }>;
    };
    subjects: {
        total: number;
        active: number;
        mostPopular: Array<{
            id: string;
            name: string;
            creditHours: number;
            _count: {
                slots: number;
                tutorSubject: number;
            };
        }>;
    };
    sessions: {
        totalCompleted: number;
    };
}