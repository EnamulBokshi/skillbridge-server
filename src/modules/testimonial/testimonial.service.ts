import { prisma } from "../../lib/prisma.js";

export type TestimonialPayload = {
	title?: string;
	content: string;
	rating: number;
	userId: string;
};

export type TestimonialUpdatePayload = Partial<Pick<TestimonialPayload, "title" | "content" | "rating">>;

const createTestimonial = async (payload: TestimonialPayload) => {
	return await prisma.testimonial.create({
		data: payload,
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					role: true,
				},
			},
		},
	});
};

const getTestimonials = async (page = 1, limit = 10) => {
	const safePage = Math.max(page, 1);
	const safeLimit = Math.min(Math.max(limit, 1), 50);
	const skip = (safePage - 1) * safeLimit;

	const [testimonials, total] = await Promise.all([
		prisma.testimonial.findMany({
			skip,
			take: safeLimit,
			orderBy: { createdAt: "desc" },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						image: true,
						role: true,
					},
				},
			},
		}),
		prisma.testimonial.count(),
	]);

	return {
		testimonials,
		pagination: {
			page: safePage,
			limit: safeLimit,
			totalRecords: total,
			totalPages: Math.ceil(total / safeLimit),
		},
	};
};

const getTestimonialById = async (id: string) => {
	return await prisma.testimonial.findUnique({
		where: { id },
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					role: true,
				},
			},
		},
	});
};

const updateTestimonial = async (id: string, data: TestimonialUpdatePayload) => {
	return await prisma.testimonial.update({
		where: { id },
		data,
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					role: true,
				},
			},
		},
	});
};

const deleteTestimonial = async (id: string) => {
	return await prisma.testimonial.delete({
		where: { id },
	});
};

const getTestimonialOwner = async (id: string) => {
	return await prisma.testimonial.findUnique({
		where: { id },
		select: {
			id: true,
			userId: true,
		},
	});
};

export const testimonialService = {
	createTestimonial,
	getTestimonials,
	getTestimonialById,
	updateTestimonial,
	deleteTestimonial,
	getTestimonialOwner,
};
