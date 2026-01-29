import {Request,Response } from "express";
import { errorResponse } from "../../helpers/errorResponse";
import { studentService } from "./student.service";
import { successResponse } from "../../helpers/successResponse";
import { UserRole } from "../../constants/userRole";
import { StudentRegistration } from "../../types";

const createStudent = async(req: Request, res:Response) => {
    try {
        // const {firstName, lastName, } = req.body
        // const data = {firstName, lastName}
      const studentData: StudentRegistration = {...req.body, userId: req.user!.id};
        const user = await studentService.createStudent(studentData); 
        if(user){
        successResponse(res, 201, user, "Student profile created successfully!!" );
            return;
        }   

        new Error('Student profile creation failed!!')
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message|| "Couldn't create student profile!!")
    }
}


export const studentController = {
    createStudent,

}