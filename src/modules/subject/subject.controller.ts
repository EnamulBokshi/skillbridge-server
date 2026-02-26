import { NextFunction, Request, Response } from "express";
import { subjectService } from "./subject.service.js";
import { errorResponse } from "../../helpers/errorResponse.js";

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

        const { name, categoryId, creditHours, slug, description, isActive } = req.body;
        
        const updateData: any = {};
        
        if (name !== undefined) updateData.name = name;
        if (categoryId !== undefined) {
            if (typeof categoryId !== 'string' || !categoryId.trim()) {
                return errorResponse(res, 400, null, "Invalid category ID");
            }
            updateData.categoryId = categoryId;
        }
        if (creditHours !== undefined) {
            if (typeof creditHours !== 'number' || creditHours < 0) {
                return errorResponse(res, 400, null, "Credit hours must be a positive number");
            }
            updateData.creditHours = creditHours;
        }
        if (slug !== undefined) {
            if (typeof slug !== 'string' || !slug.trim()) {
                return errorResponse(res, 400, null, "Invalid slug");
            }
            updateData.slug = slug;
        }
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) {
            if (typeof isActive !== 'boolean') {
                return errorResponse(res, 400, null, "isActive must be a boolean");
            }
            updateData.isActive = isActive;
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return errorResponse(res, 400, null, "No valid fields to update");
        }

        const subject = await subjectService.updateSubject(id as string, updateData);
        if(subject){
            return res.status(200).json({success:true, data: subject, error:null, message:"Subject updated successfully"});
        }
        return errorResponse(res, 404, null , "Subject not found");
        
    } catch (error: any) {
        console.error("Error updating subject:", error);
        
        // Handle specific errors
        if (error.message === "Category not found") {
            return errorResponse(res, 404, null, "Category not found");
        }
        if (error.message === "Slug already exists") {
            return errorResponse(res, 409, null, "Slug already exists");
        }
        if (error.code === 'P2025') {
            return errorResponse(res, 404, null, "Subject not found");
        }
        
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