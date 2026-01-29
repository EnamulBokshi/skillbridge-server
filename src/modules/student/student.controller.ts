import {Request,Response } from "express";
import { errorResponse } from "../../helpers/errorResponse";
import { studentService } from "./student.service";
import { successResponse } from "../../helpers/successResponse";
import { UserRole } from "../../constants/userRole";

const createStudent = async(req: Request, res:Response) => {
    try {
        // const {firstName, lastName, } = req.body
        // const data = {firstName, lastName}
        const userId = req.user?.id;
        const userRole= req.user?.role;
        if(userRole === UserRole.ADMIN && userId !== req.body.id){
            errorResponse(res, 401, null, 'Forbidden! you are not authorized for such an operation');
            return;
        }

        const user = await studentService.createStudent(req.body as any)
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