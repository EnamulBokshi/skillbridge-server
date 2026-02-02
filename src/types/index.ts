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
    
    isFeatured?: boolean;
    isFree?: boolean;
    tutorId? : string;
    subjectId?: string;
    startDate? : string;
    endDate?: string;
    date?: string;

}