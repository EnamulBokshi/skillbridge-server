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