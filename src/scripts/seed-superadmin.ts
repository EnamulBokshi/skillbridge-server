// import { prisma } from "../lib/prisma.js";
// import { hashPassword } from "better-auth/crypto";
// import { randomUUID } from "node:crypto";

// /**
//  * Seed Script: Create First Super Admin
//  * 
//  * This script creates the first SUPER_ADMIN user in the database.
//  * Run this script ONCE after initial setup with:
//  * 
//  * pnpm tsx scripts/seed-superadmin.ts
//  * 
//  * Default credentials:
//  * Email: superadmin@skillbridge.com
//  * Password: Change this immediately after first login!
//  */

// const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "superadmin@skillbridge.com";
// const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "ChangeMe@12345";
// const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || "Super Administrator";

// async function seedSuperAdmin() {
//   try {
//     console.log("🌱 Starting Super Admin seeding...");

//     // Check if super admin already exists
//     const existingSuperAdmin = await prisma.user.findUnique({
//       where: { email: SUPER_ADMIN_EMAIL },
//       select: { id: true, role: true },
//     });

//     if (existingSuperAdmin) {
//       if (existingSuperAdmin.role === "SUPER_ADMIN") {
//         console.log(
//           "✅ Super Admin already exists:",
//           SUPER_ADMIN_EMAIL,
//         );
//         await prisma.$disconnect();
//         process.exit(0);
//       } else {
//         console.log(
//           "⚠️  User exists with this email but is not a SUPER_ADMIN. Updating role...",
//         );
//         const updated = await prisma.user.update({
//           where: { id: existingSuperAdmin.id },
//           data: { role: "SUPER_ADMIN" },
//         });
//         console.log("✅ User promoted to SUPER_ADMIN:", updated.email);
//         await prisma.$disconnect();
//         process.exit(0);
//       }
//     }

//     // Create new super admin
//     console.log("📝 Creating new SUPER_ADMIN account...");

//     const hashedPassword = await hashPassword(SUPER_ADMIN_PASSWORD);

//     const superAdmin = await prisma.$transaction(async (tx) => {
//       // Create user
//       const newUser = await tx.user.create({
//         data: {
//           id: randomUUID(),
//           email: SUPER_ADMIN_EMAIL,
//           name: SUPER_ADMIN_NAME,
//           role: "SUPER_ADMIN",
//           status: "ACTIVE",
//           emailVerified: true,
//         },
//       });

//       // Create account with hashed password
//       await tx.account.create({
//         data: {
//           id: randomUUID(),
//           userId: newUser.id,
//           accountId: "email-provider",
//           providerId: "credential",
//           password: hashedPassword,
//         },
//       });

//       return newUser;
//     });

//     console.log("✅ Super Admin created successfully!");
//     console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//     console.log("📧 Email:", superAdmin.email);
//     console.log("👤 Name:", superAdmin.name);
//     console.log("🔑 Role:", superAdmin.role);
//     console.log("📅 Created at:", superAdmin.createdAt);
//     console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//     console.log(
//       "\n⚠️  IMPORTANT: Change the default password immediately!",
//     );
//     console.log("📋 You can set custom credentials via environment variables:");
//     console.log("   - SUPER_ADMIN_EMAIL");
//     console.log("   - SUPER_ADMIN_PASSWORD");
//     console.log("   - SUPER_ADMIN_NAME\n");

//     await prisma.$disconnect();
//     process.exit(0);
//   } catch (error: any) {
//     console.error("❌ Error seeding SUPER_ADMIN:", error.message);
//     console.error(error);
//     await prisma.$disconnect();
//     process.exit(1);
//   }
// }

// // Run the seed
// seedSuperAdmin();



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