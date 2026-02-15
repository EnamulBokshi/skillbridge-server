import "dotenv/config";
import { UserRole } from "../constants/userRole.js";
import { prisma } from "../lib/prisma.js";


async function seedAdmin(){
    try {
        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
        console.log({ ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD });
        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            console.error("Missing required environment variables: ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD");
            process.exit(1);
        }
    
        const adminData = {
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            role: UserRole.ADMIN,
            password: ADMIN_PASSWORD,
            image: process.env.DEFAULT_AVTAR_URL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
        }
        // find if the admin exists already or not
    
        const preAdmin = await prisma.user.findUnique({
            where: {
                email: adminData.email as string
            }
        })
    
        if(preAdmin) {
            console.error("Admin already exists!!");
            return 0;
        }
    
        const newAdminResponse = await fetch(`http://localhost:5000/api/auth/sign-up/email`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Origin': process.env.APP_URL ?? "http://localhost:3000"
            },
            body: JSON.stringify(adminData)
        })
        const newAdmin = await newAdminResponse.json();
        if(newAdmin){
            console.log("New admin created!");
            console.log("Updating the user email verification status:")
            const updateEmail = await prisma.user.update({
                where: {
                    email: adminData.email as string
                },
                data: {
                    emailVerified:true,
                    isAssociate: true
                }
            })
            console.log(`Email verified status updated successfully`)

        console.log(`******Admin seeded successfully*******`);
        console.log(`exiting------\-`)
        return 1;
        }
        console.error("Failed to create admin user");
    
    await prisma.$disconnect()

    } catch (error) {
        console.error("Error seeding admin:", error);
    await prisma.$disconnect()

    }

}

seedAdmin();