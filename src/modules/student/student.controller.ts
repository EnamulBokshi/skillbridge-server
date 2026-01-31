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
        const student = await studentService.createStudent(studentData); 
        console.log(student);
        if(student){
        successResponse(res, 201, student, "Student profile created successfully!!" );
            
            return;
        }   

        new Error('Student profile creation failed!!')

    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message|| "Couldn't create student profile!!")
    }
}

const getStudentByIdFullProfile = async(req: Request, res: Response) => {
    try {
        const {studentId} = req.params;
        if(!studentId){
            return errorResponse(res, 400, null, "Student ID is required");
        }
        const student = await studentService.getStudentById(studentId as string);
        if(!student){
            return errorResponse(res, 404, null, "Student not found");
        }
        successResponse(res, 200, student, "Student profile fetched successfully!!");

    }catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message|| "Couldn't fetch student profile!!")
    }
}
const updateStudent = async (req: Request, res: Response) => {
    // Implementation for updating a student profile
    try {
        const {studentId} = req.params;
        const data = req.body;
        if(!studentId){
            return errorResponse(res, 400, null, "Student ID is required");
        }
        const updatedStudent = await studentService.updateStudent(studentId as string, data);

        successResponse(res, 200, updatedStudent, "Student profile updated successfully!!");

    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message|| "Couldn't fetch student profile!!")
    }
}

const deleteStudent = async (req: Request, res: Response) => {
    // Implementation for deleting a student profile
    try {
        const {studentId} = req.params;
        if(!studentId){
            return errorResponse(res, 400, null, "Student ID is required");
        }
        const deletedStudent = await studentService.deleteStudent(studentId as string);
        if(!deletedStudent){
            return errorResponse(res, 404, null, "Student not found");
        }
        successResponse(res, 200, deletedStudent, "Student profile deleted successfully!!");

    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message|| "Couldn't fetch student profile!!")
    }
}

export const studentController = {
    createStudent,
    getStudentByIdFullProfile,
    updateStudent,
    deleteStudent
}