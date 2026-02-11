import { NextFunction, Request, Response } from "express";
import { subjectService } from "./subject.service";
import { errorResponse } from "../../helpers/errorResponse";

const createSubject = async(req: Request, res:Response) => {
    try {
        const data = req.body;
        if(!data.name || !data.categoryId || !data.slug || !data.description || data.creditHours===undefined ) {
            return errorResponse(res, 400, null , "Missing required subject fields");
        }
        const subject = await subjectService.createSubject({...data, isActive: true});
        
        if(subject){
            return res.status(201).json({success:true, data: subject, error:null, message:"Subject created successfully"});
        }
        return errorResponse(res, 400, null , "Failed to create subject");
        
    } catch (error) {
        console.error("Error creating subject:", error);
        // next(error);   
        errorResponse(res, 500, error , "Failed to create subject");
    }
}

const getAllSubjects = async(req: Request, res:Response) => {
    try {
        const subjects =  await subjectService.getAllSubjects();
        // console.log("Fetched subjects:", subjects);

        return res.status(200).json({success:true, data: subjects, error:null, message:"Subjects fetched successfully"});
    } catch (error) {
        console.error("Error fetching subjects:", error);
        // next(error);   
        errorResponse(res, 500, error , "Failed to fetch subjects");
    }
}

const getSubjectsByCategory = async(req: Request, res:Response) => {
    try {
        const { categoryId } = req.params;
        if(!categoryId){
            return errorResponse(res, 400, null , "Category ID is required");
        }
        const subjects =  await subjectService.getSubjectsByCategory(categoryId as string);
        return res.status(200).json({success:true, data: subjects, error:null, message:"Subjects fetched successfully"});
    } catch (error) {
        console.error("Error fetching subjects by category:", error);
        // next(error);   
        errorResponse(res, 500, error , "Failed to fetch subjects by category");
    }
}

const deleteSubject = async(req: Request, res:Response,next:NextFunction) => {
    try {
        const { id } = req.params;
        if(!id){
            return errorResponse(res, 400, null , "Subject ID is required");
        }
        const subject = await subjectService.deleteSubject(id as string);
        if(subject){
            return res.status(200).json({success:true, data: subject, error:null, message:"Subject deleted successfully"});
        }
        return errorResponse(res, 404, null , "Subject not found");
        
    } catch (error) {
        console.error("Error deleting subject:", error);
        // next(error);   
        errorResponse(res, 500, error , "Failed to delete subject");
    }
}

const updateSubject = async(req: Request, res:Response,next:NextFunction) => {
    try {
        const { id } = req.params;
        if(!id){
            return errorResponse(res, 400, null , "Subject ID is required");
        }
        const subject = await subjectService.updateSubject(id as string, req.body);
        if(subject){
            return res.status(200).json({success:true, data: subject, error:null, message:"Subject updated successfully"});
        }
        return errorResponse(res, 404, null , "Subject not found");
        
    } catch (error) {
        console.error("Error updating subject:", error);
        // next(error);   
        errorResponse(res, 500, error , "Failed to update subject");
    }
}

export const subjectController = {
    createSubject,
    getAllSubjects,
    getSubjectsByCategory,
    deleteSubject,
    updateSubject
}