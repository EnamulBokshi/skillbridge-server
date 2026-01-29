import { Request, Response } from "express";
import { UserRole } from "../../constants/userRole";
import { tutorService } from "./tutor.service";

const createTutor = async(req: Request, res:Response) => {
    try {
        
        const tutorData: any = {...req.body};
        const userId = req.user?.id;
        const newTutor = await tutorService.createTutor({...tutorData, userId} );
        if(newTutor){
            res.status(201).json({
                success: true,
                data: newTutor,
                message: "Tutor profile created successfully!!"
            });
            return;
        }   
        throw new Error('Tutor profile creation failed!!')
        
    } catch (error:any) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || "Couldn't create tutor profile!!",
            details: error
        })
    }

}


export const tutorController = {
    createTutor,
}