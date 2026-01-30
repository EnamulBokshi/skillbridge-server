import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse";
import { categoryService } from "./category.service";

const createCategory = async(req: Request, res:Response,next:NextFunction) => {
    try {
        const category = await categoryService.createCategory(req.body);
        if(category){
            return res.status(201).json({success:true, data: category, error:null, message:"Category created successfully"});
        }
        return errorResponse(res, 400, null , "Failed to create category");
        
    } catch (error) {
        console.error("Error creating category:", error);
        // next(error);   
        errorResponse(res, 500, error , "Failed to create category");
    }
}

const getAllCategories = async(req: Request, res:Response,next:NextFunction) => {
    try {
        const categories =  await categoryService.getAllCategories();
        return res.status(200).json({success:true, data: categories, error:null, message:"Categories fetched successfully"});
    } catch (error) {
        console.error("Error fetching categories:", error);
        // next(error);   
        errorResponse(res, 500, error , "Failed to fetch categories");
    }
}

const deleteCategory = async(req: Request, res:Response,next:NextFunction) => {
    try {
        const { id } = req.params;
        if(!id){
            return errorResponse(res, 400, null , "Category ID is required");
        }
        const category = await categoryService.deleteCategory(id as string);
        if(category){
            return res.status(200).json({success:true, data: category, error:null, message:"Category deleted successfully"});
        }
        return errorResponse(res, 404, null , "Category not found");
        
    } catch (error) {
        console.error("Error deleting category:", error);
        // next(error);   
        errorResponse(res, 500, error , "Failed to delete category");
    }
}

const updateCategory = async(req: Request, res:Response,next:NextFunction) => {
    try {
        const { id } = req.params;
        if(!id){
            return errorResponse(res, 400, null , "Category ID is required");
        }
        const category = await categoryService.updateCategory(id as string, req.body);
        if(category){
            return res.status(200).json({success:true, data: category, error:null, message:"Category updated successfully"});
        }
        return errorResponse(res, 404, null , "Category not found");
        
    } catch (error) {
        console.error("Error updating category:", error);
        // next(error);   
        errorResponse(res, 500, error , "Failed to update category");
    }
}

export const categoryController = {
    createCategory,
    getAllCategories,
    deleteCategory,
    updateCategory
}