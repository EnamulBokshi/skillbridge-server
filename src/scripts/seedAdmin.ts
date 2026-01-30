import "dotenv/config";
import { UserRole } from "../constants/userRole";
import { prisma } from "../lib/prisma";


async function seedAdmin(){
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
        password: ADMIN_PASSWORD
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

    const newAdmin = await fetch(`http://localhost:5000/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
    })

    if(newAdmin.ok){
        console.log("New admin created!");
        console.log("Updating the user email verification status:")
        const updateEmail = await prisma.user.update({
            where: {
                email: adminData.email as string
            },
            data: {
                emailVerified:true
            }
        })
        console.log(`Email verified status updated successfully`)
    }

    console.log(`******Amin seeded successfully*******`);
    console.log(`exiting------\-`)
    await prisma.$disconnect()

}




seedAdmin();