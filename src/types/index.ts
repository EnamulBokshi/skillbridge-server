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
    subjectId: string;

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
    

export interface ISlot{
 
    tutorId: string;
    date: string;
    startTime: string;
    endTime: string;
    subjectId: string;
    slotPrice: number;
    isBooked: boolean;
}
  