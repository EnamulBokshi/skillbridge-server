/**
 * SkillBridge Tutor API Documentation
 * Generated: February 3, 2026
 */

// ============================================
// AUTHENTICATION
// ============================================
// All endpoints require Bearer token in Authorization header:
// Authorization: Bearer <token>

// ============================================
// TYPE DEFINITIONS
// ============================================

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}

export enum UserRole {
  USER = "USER",
  TUTOR = "TUTOR",
  ADMIN = "ADMIN"
}

export interface CreateTutorPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  expertise?: string;
  experience?: number;
  hourlyRate?: number;
  education?: string;
  languages?: string[];
  certifications?: string[];
  profilePicture?: string;
  isFeatured?: boolean;
}

export interface TutorProfile {
  id: string;
  tid: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  expertise: string | null;
  experience: number | null;
  hourlyRate: number | null;
  education: string | null;
  languages: string[];
  certifications: string[];
  profilePicture: string | null;
  isFeatured: boolean;
  totalEarned: number;
  avgRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface TutorStats {
  totalEarnings: number;
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
  totalReviews: number;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  studentId: string;
  slotId: string;
  createdAt: string;
  updatedAt: string;
  student: {
    firstName: string;
    lastName: string;
  };
  slot: {
    date: string;
    startTime: string;
    endTime: string;
    tutorId: string;
    slotPrice: number;
  };
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  tutorId: string;
  studentId: string;
  bookingId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  slotPrice: number;
  tutorId: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * 1. CREATE TUTOR PROFILE
 * -------------------------
 * Method: POST
 * Path: /tutors
 * Auth: ADMIN, TUTOR, USER
 * 
 * Request Body:
 * {
 *   firstName: string;
 *   lastName: string;
 *   email: string;
 *   phone?: string;
 *   bio?: string;
 *   expertise?: string;
 *   experience?: number;
 *   hourlyRate?: number;
 *   education?: string;
 *   languages?: string[];
 *   certifications?: string[];
 *   profilePicture?: string;
 *   isFeatured?: boolean;
 * }
 * 
 * Response: ApiResponse<TutorProfile>
 * Status: 201
 * Message: "Tutor profile created successfully!!"
 */

/**
 * 2. UPDATE TUTOR PROFILE
 * -------------------------
 * Method: PATCH
 * Path: /tutors/:tutorId
 * Auth: TUTOR
 * 
 * Request Body: Partial<CreateTutorPayload>
 * {
 *   firstName?: string;
 *   lastName?: string;
 *   phone?: string;
 *   bio?: string;
 *   expertise?: string;
 *   experience?: number;
 *   hourlyRate?: number;
 *   education?: string;
 *   languages?: string[];
 *   certifications?: string[];
 *   profilePicture?: string;
 *   isFeatured?: boolean;
 * }
 * 
 * Response: ApiResponse<TutorProfile>
 * Status: 200
 * Message: "Tutor profile updated successfully!!"
 */

/**
 * 3. GET TUTOR BY ID
 * -------------------------
 * Method: GET
 * Path: /tutors/:tutorId
 * Auth: ADMIN, TUTOR
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<TutorProfile>
 * Status: 200
 * Message: "Tutor fetched successfully!!"
 */

/**
 * 4. DELETE TUTOR
 * -------------------------
 * Method: DELETE
 * Path: /tutors/:tutorId
 * Auth: ADMIN
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<TutorProfile>
 * Status: 200
 * Message: "Tutor deleted successfully!!"
 */

/**
 * 5. GET DASHBOARD STATS
 * -------------------------
 * Method: GET
 * Path: /tutors/dashboard/stats/:tutorId
 * Auth: TUTOR
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<TutorStats>
 * Status: 200
 * Message: "Tutor dashboard stats fetched successfully!!"
 * 
 * Data Structure:
 * {
 *   totalEarnings: number;
 *   totalBookings: number;
 *   completedBookings: number;
 *   averageRating: number;
 *   totalReviews: number;
 * }
 */

/**
 * 6. GET UPCOMING BOOKINGS
 * -------------------------
 * Method: GET
 * Path: /tutors/:tutorId/upcoming-bookings
 * Auth: TUTOR
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<Booking[]>
 * Status: 200
 * Message: "Upcoming bookings fetched successfully!!"
 * 
 * Note: Returns only CONFIRMED bookings with future dates
 */

/**
 * 7. GET COMPLETED BOOKINGS
 * -------------------------
 * Method: GET
 * Path: /tutors/:tutorId/completed-bookings
 * Auth: TUTOR
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<Booking[]>
 * Status: 200
 * Message: "Completed bookings fetched successfully!!"
 * 
 * Note: Returns only bookings with status COMPLETED
 */

/**
 * 8. GET TUTOR REVIEWS
 * -------------------------
 * Method: GET
 * Path: /tutors/:tutorId/reviews
 * Auth: TUTOR, ADMIN
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<Review[]>
 * Status: 200
 * Message: "Tutor reviews fetched successfully!!"
 */

/**
 * 9. GET TUTOR SLOTS
 * -------------------------
 * Method: GET
 * Path: /tutors/:tutorId/slots
 * Auth: TUTOR, ADMIN
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<Slot[]>
 * Status: 200
 * Message: "Tutor slots fetched successfully!!"
 * 
 * Note: Returns all slots (both booked and available)
 */

/**
 * 10. DELETE TUTOR SLOT
 * -------------------------
 * Method: DELETE
 * Path: /tutors/:tutorId/:slotId
 * Auth: TUTOR
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<Slot>
 * Status: 200
 * Message: "Tutor slot deleted successfully!!"
 */

/**
 * 11. UPDATE BOOKING STATUS
 * -------------------------
 * Method: PATCH
 * Path: /tutors/:tutorId/bookings/:bookingId/status
 * Auth: TUTOR
 * 
 * Request Body:
 * {
 *   status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
 * }
 * 
 * Response: ApiResponse<Booking>
 * Status: 200
 * Message: "Booking status updated successfully!!"
 */

/**
 * 12. GET ALL TUTOR BOOKINGS
 * -------------------------
 * Method: GET
 * Path: /tutors/:tutorId/bookings
 * Auth: TUTOR, ADMIN
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<Booking[]>
 * Status: 200
 * Message: "Tutor bookings fetched successfully!!"
 * 
 * Note: Returns all bookings regardless of status
 */

/**
 * 13. GET ALL TUTORS (PUBLIC)
 * -------------------------
 * Method: GET
 * Path: /tutors
 * Auth: None (Public API)
 * 
 * Query Parameters:
 * - page?: number (default: 1)
 * - limit?: number (default: 10)
 * - isFeatured?: boolean (filter by featured status)
 * - search?: string (search in firstName, lastName, bio, expertiseAreas)
 * - categoryId?: string (filter by category)
 * - minRating?: number (minimum average rating)
 * - maxRating?: number (maximum average rating)
 * - minExperience?: number (minimum years of experience)
 * - maxExperience?: number (maximum years of experience)
 * - sortBy?: string (avgRating|experienceYears|createdAt|updatedAt|totalEarned|firstName|lastName, default: avgRating)
 * - orderBy?: string (asc|desc, default: desc)
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<{
 *   data: TutorProfile[];
 *   pagination: {
 *     page: number;
 *     limit: number;
 *     totalRecords: number;
 *     totalPages: number;
 *   }
 * }>
 * Status: 200
 * Message: "Tutors fetched successfully!!"
 * 
 * Examples:
 * - Get featured tutors: /tutors?isFeatured=true
 * - Search by name: /tutors?search=John
 * - Filter by rating: /tutors?minRating=4.5&maxRating=5
 * - Filter by experience: /tutors?minExperience=5&maxExperience=10
 * - Sort by experience: /tutors?sortBy=experienceYears&orderBy=desc
 * - Combined filters: /tutors?isFeatured=true&minRating=4&categoryId=cat-123&sortBy=avgRating&orderBy=desc
 */

// ============================================
// API CLIENT IMPLEMENTATION
// ============================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const TUTOR_BASE = `${API_BASE_URL}/tutors`;

const getAuthHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const tutorApi = {
  // 1. Create Tutor Profile
  create: async (data: CreateTutorPayload): Promise<ApiResponse<TutorProfile>> => {
    const response = await fetch(TUTOR_BASE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // 2. Update Tutor Profile
  update: async (
    tutorId: string,
    data: Partial<CreateTutorPayload>
  ): Promise<ApiResponse<TutorProfile>> => {
    const response = await fetch(`${TUTOR_BASE}/${tutorId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // 3. Get Tutor By ID
  getById: async (tutorId: string): Promise<ApiResponse<TutorProfile>> => {
    const response = await fetch(`${TUTOR_BASE}/${tutorId}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 4. Delete Tutor
  delete: async (tutorId: string): Promise<ApiResponse<TutorProfile>> => {
    const response = await fetch(`${TUTOR_BASE}/${tutorId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 5. Get Dashboard Stats
  getDashboardStats: async (tutorId: string): Promise<ApiResponse<TutorStats>> => {
    const response = await fetch(`${TUTOR_BASE}/dashboard/stats/${tutorId}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 6. Get Upcoming Bookings
  getUpcomingBookings: async (tutorId: string): Promise<ApiResponse<Booking[]>> => {
    const response = await fetch(`${TUTOR_BASE}/${tutorId}/upcoming-bookings`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 7. Get Completed Bookings
  getCompletedBookings: async (tutorId: string): Promise<ApiResponse<Booking[]>> => {
    const response = await fetch(`${TUTOR_BASE}/${tutorId}/completed-bookings`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 8. Get Tutor Reviews
  getReviews: async (tutorId: string): Promise<ApiResponse<Review[]>> => {
    const response = await fetch(`${TUTOR_BASE}/${tutorId}/reviews`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 9. Get Tutor Slots
  getSlots: async (tutorId: string): Promise<ApiResponse<Slot[]>> => {
    const response = await fetch(`${TUTOR_BASE}/${tutorId}/slots`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 10. Delete Tutor Slot
  deleteSlot: async (tutorId: string, slotId: string): Promise<ApiResponse<Slot>> => {
    const response = await fetch(`${TUTOR_BASE}/${tutorId}/${slotId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 11. Update Booking Status
  updateBookingStatus: async (
    tutorId: string,
    bookingId: string,
    status: BookingStatus
  ): Promise<ApiResponse<Booking>> => {
    const response = await fetch(
      `${TUTOR_BASE}/${tutorId}/bookings/${bookingId}/status`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      }
    );
    return response.json();
  },

  // 12. Get All Tutor Bookings
  getAllBookings: async (tutorId: string): Promise<ApiResponse<Booking[]>> => {
    const response = await fetch(`${TUTOR_BASE}/${tutorId}/bookings`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 13. Get All Tutors (Public API with Advanced Filters)
  getTutors: async (params?: {
    page?: number;
    limit?: number;
    isFeatured?: boolean;
    search?: string;
    categoryId?: string;
    minRating?: number;
    maxRating?: number;
    minExperience?: number;
    maxExperience?: number;
    sortBy?: string;
    orderBy?: 'asc' | 'desc';
  }): Promise<ApiResponse<{
    data: TutorProfile[];
    pagination: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
    }
  }>> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `${TUTOR_BASE}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    return response.json();
  }
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*

// Create Tutor Profile
const result = await tutorApi.create({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  bio: "Experienced math tutor",
  expertise: "Mathematics, Physics",
  experience: 5,
  hourlyRate: 50
});

// Update Tutor Profile
await tutorApi.update("tutor-id", {
  bio: "Updated bio",
  hourlyRate: 75
});

// Get Dashboard Stats
const stats = await tutorApi.getDashboardStats("tutor-id");

// Update Booking Status
await tutorApi.updateBookingStatus(
  "tutor-id",
  "booking-id",
  BookingStatus.CONFIRMED
);

// Get All Tutors (Public - No Auth Required)
// Basic usage - get all tutors
const allTutors = await tutorApi.getTutors();

// Get featured tutors only
const featuredTutors = await tutorApi.getTutors({ isFeatured: true });

// Search for tutors
const searchResults = await tutorApi.getTutors({ 
  search: "math",
  page: 1,
  limit: 20 
});

// Filter by rating and experience
const experiencedTutors = await tutorApi.getTutors({
  minRating: 4.5,
  minExperience: 5,
  sortBy: 'avgRating',
  orderBy: 'desc'
});

// Complex filtering
const filteredTutors = await tutorApi.getTutors({
  isFeatured: true,
  categoryId: 'category-123',
  minRating: 4,
  maxRating: 5,
  minExperience: 3,
  maxExperience: 10,
  search: 'physics',
  sortBy: 'experienceYears',
  orderBy: 'desc',
  page: 1,
  limit: 10
});

console.log(filteredTutors.data); // Array of filtered tutors
console.log(filteredTutors.pagination); // Pagination info

*/
