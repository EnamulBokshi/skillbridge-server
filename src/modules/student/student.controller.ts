import {Request,Response } from "express";
import { errorResponse } from "../../helpers/errorResponse.js";
import { studentService } from "./student.service.js";
import { successResponse } from "../../helpers/successResponse.js";
import { StudentRegistration } from "../../types/index.js";
import { bookingService } from "../booking/booking.service.js";
import { ReviewUncheckedCreateInput } from "../../generated/prisma/models.js";
import { any } from "better-auth";

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

const studentStats = async (req: Request, res: Response) => {
    // Implementation for fetching student statistics
    try {
        const {studentId} = req.params;
        if(!studentId){
            return errorResponse(res, 400, null, "Student ID is required");
        }
        const stats = await studentService.studentStats(studentId as string);
        if(!stats){
            return errorResponse(res, 404, null, "Student not found");
        }
        successResponse(res, 200, stats, "Student statistics fetched successfully!!");

    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message|| "Couldn't fetch student statistics!!")
    }
}
const getCompletedBookings = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        if (!studentId) {
            return errorResponse(res, 400, null, "Student ID is required");
        }
        const completedBookings = await bookingService.getCompletedBookings();
        const filteredBookings = completedBookings.filter((booking: any) => booking.studentId === studentId);
        successResponse(res, 200, filteredBookings, "Completed bookings fetched successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch completed bookings!!");
    }
}

const upcomingBookings = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        if (!studentId) {
            return errorResponse(res, 400, null, "Student ID is required");
        }
        const bookings = await bookingService.upcomingBookings();
        console.log("All Upcoming Bookings: ", bookings);
        const filteredBookings = bookings.filter((booking: any) => booking.studentId === studentId);
        console.log("Filtered Bookings: ", filteredBookings);
        successResponse(res, 200, filteredBookings, "Upcoming bookings fetched successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch upcoming bookings!!");
    }
}
const createReview = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const { tutorId, rating, comment } = req.body;
        if (!studentId || !tutorId || rating === undefined) {
            return errorResponse(res, 400, null, "Student ID, Tutor ID and rating are required");
        }
        const reviewData: ReviewUncheckedCreateInput = {
            studentId: studentId as string,
            tutorId: tutorId as string,
            rating: rating as number,
            comment: comment as string | "",
        };
        const review = await studentService.createReview(reviewData);
        successResponse(res, 201, review, "Review created successfully!!");
    }
    catch (error: any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't create review!!");
    }
}


export const studentController = {
    createStudent,
    getStudentByIdFullProfile,
    updateStudent,
    deleteStudent,
    studentStats,
    getCompletedBookings,
    upcomingBookings,
    createReview
}