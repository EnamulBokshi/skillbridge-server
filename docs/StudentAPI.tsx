/**
 * SkillBridge Student API Documentation
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

export enum StudentStatus {
  ACTIVE = "ACTIVE",
  BAN = "BAN",
  INACTIVE = "INACTIVE"
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}

export interface CreateStudentPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  email?: string;
  zip?: string;
}

export interface UpdateStudentPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  email?: string;
  zip?: string;
  profilePicture?: string;
  status?: StudentStatus;
}

export interface StudentProfile {
  id: string;
  sid: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  status: StudentStatus;
  profilePicture: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  zip: string | null;
  completedSessions: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDetailedProfile extends StudentProfile {
  user: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
  };
  reviews: {
    id: string;
    rating: number;
    comment: string;
    tutorId: string;
    studentId: string;
    createdAt: string;
    updatedAt: string;
    tutor: {
      tid: string;
      firstName: string;
      lastName: string;
      avgRating: number;
    };
  }[];
  bookings: {
    id: string;
    studentId: string;
    slotId: string;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
    slot: {
      id: string;
      tutorId: string;
      date: string;
      startTime: string;
      endTime: string;
      slotPrice: number;
      isBooked: boolean;
      isFeatured: boolean;
      isFree: boolean;
      subjectId: string;
      createdAt: string;
      updatedAt: string;
    };
  }[];
}

export interface StudentStats {
  totalBookings: number;
  latestBooking: {
    id: string;
    studentId: string;
    slotId: string;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
    slot: {
      id: string;
      date: string;
      startTime: string;
      endTime: string;
    };
  } | null;
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
    firstName: string | null;
    lastName: string | null;
  };
  slot: {
    date: string;
    startTime: string;
    endTime: string;
    tutorId: string;
    slotPrice: number;
  };
}

export interface CreateReviewPayload {
  tutorId: string;
  rating: number;
  comment?: string;
}

export interface Review {
  id: string;
  tutorId: string;
  studentId: string;
  rating: number;
  comment: string;
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
 * 1. CREATE STUDENT PROFILE
 * -------------------------
 * Method: POST
 * Path: /students
 * Auth: ADMIN, USER
 * 
 * Request Body:
 * {
 *   firstName?: string;
 *   lastName?: string;
 *   phone?: string;
 *   address?: string;
 *   email?: string;
 *   zip?: string;
 * }
 * 
 * Response: ApiResponse<StudentProfile>
 * Status: 201
 * Message: "Student profile created successfully!!"
 * 
 * Note: userId is automatically extracted from authenticated user
 */

/**
 * 2. GET STUDENT BY ID (FULL PROFILE)
 * -------------------------
 * Method: GET
 * Path: /students/:studentId
 * Auth: ADMIN, STUDENT, TUTOR, USER
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<StudentDetailedProfile>
 * Status: 200
 * Message: "Student profile fetched successfully!!"
 * 
 * Note: Returns complete profile with user, reviews, and bookings
 */

/**
 * 3. UPDATE STUDENT PROFILE
 * -------------------------
 * Method: PATCH
 * Path: /students/:studentId
 * Auth: ADMIN, STUDENT
 * 
 * Request Body: Partial<UpdateStudentPayload>
 * {
 *   firstName?: string;
 *   lastName?: string;
 *   phone?: string;
 *   address?: string;
 *   email?: string;
 *   zip?: string;
 *   profilePicture?: string;
 *   status?: "ACTIVE" | "BAN" | "INACTIVE";
 * }
 * 
 * Response: ApiResponse<StudentProfile>
 * Status: 200
 * Message: "Student profile updated successfully!!"
 */

/**
 * 4. DELETE STUDENT PROFILE
 * -------------------------
 * Method: DELETE
 * Path: /students/:studentId
 * Auth: ADMIN
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<StudentProfile>
 * Status: 200
 * Message: "Student profile deleted successfully!!"
 */

/**
 * 5. GET STUDENT STATISTICS
 * -------------------------
 * Method: GET
 * Path: /students/:studentId/stats
 * Auth: ADMIN, STUDENT
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<StudentStats>
 * Status: 200
 * Message: "Student statistics fetched successfully!!"
 * 
 * Data Structure:
 * {
 *   totalBookings: number;
 *   latestBooking: Booking | null;
 *   totalReviews: number;
 * }
 */

/**
 * 6. GET COMPLETED SESSIONS
 * -------------------------
 * Method: GET
 * Path: /students/:studentId/sessions
 * Auth: ADMIN, STUDENT
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
 * 7. GET UPCOMING BOOKINGS
 * -------------------------
 * Method: GET
 * Path: /students/:studentId/upcoming-bookings
 * Auth: ADMIN, STUDENT
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
 * 8. CREATE REVIEW FOR TUTOR
 * -------------------------
 * Method: POST
 * Path: /students/:studentId/review
 * Auth: ADMIN, STUDENT
 * 
 * Request Body:
 * {
 *   tutorId: string;
 *   rating: number;  // 1-5
 *   comment?: string;
 * }
 * 
 * Response: ApiResponse<Review>
 * Status: 201
 * Message: "Review created successfully!!"
 * 
 * Note: Automatically updates tutor's average rating and total reviews
 */

/**
 * 9. CANCEL BOOKING
 * -------------------------
 * Method: DELETE or POST
 * Path: /students/:studentId/bookings/:bookingId/cancel
 * Auth: ADMIN, STUDENT
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<Booking>
 * Status: 200
 * Message: "Booking canceled successfully!!"
 * 
 * Note: Updates booking status to CANCELLED and may trigger refund
 */

// ============================================
// API CLIENT IMPLEMENTATION
// ============================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const STUDENT_BASE = `${API_BASE_URL}/students`;

const getAuthHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const studentApi = {
  // 1. Create Student Profile
  create: async (data: CreateStudentPayload): Promise<ApiResponse<StudentProfile>> => {
    const response = await fetch(STUDENT_BASE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // 2. Get Student By ID (Full Profile)
  getById: async (studentId: string): Promise<ApiResponse<StudentDetailedProfile>> => {
    const response = await fetch(`${STUDENT_BASE}/${studentId}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 3. Update Student Profile
  update: async (
    studentId: string,
    data: UpdateStudentPayload
  ): Promise<ApiResponse<StudentProfile>> => {
    const response = await fetch(`${STUDENT_BASE}/${studentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // 4. Delete Student Profile
  delete: async (studentId: string): Promise<ApiResponse<StudentProfile>> => {
    const response = await fetch(`${STUDENT_BASE}/${studentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 5. Get Student Statistics
  getStats: async (studentId: string): Promise<ApiResponse<StudentStats>> => {
    const response = await fetch(`${STUDENT_BASE}/${studentId}/stats`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 6. Get Completed Sessions
  getCompletedSessions: async (studentId: string): Promise<ApiResponse<Booking[]>> => {
    const response = await fetch(`${STUDENT_BASE}/${studentId}/sessions`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 7. Get Upcoming Bookings
  getUpcomingBookings: async (studentId: string): Promise<ApiResponse<Booking[]>> => {
    const response = await fetch(`${STUDENT_BASE}/${studentId}/upcoming-bookings`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 8. Create Review for Tutor
  createReview: async (
    studentId: string,
    reviewData: CreateReviewPayload
  ): Promise<ApiResponse<Review>> => {
    const response = await fetch(`${STUDENT_BASE}/${studentId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData)
    });
    return response.json();
  },

  // 9. Cancel Booking
  cancelBooking: async (
    studentId: string,
    bookingId: string
  ): Promise<ApiResponse<Booking>> => {
    const response = await fetch(`${STUDENT_BASE}/${studentId}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*

// Create Student Profile
const newStudent = await studentApi.create({
  firstName: "Jane",
  lastName: "Smith",
  email: "jane@example.com",
  phone: "+1234567890",
  address: "123 Main St"
});

// Get Student Profile with Full Details
const studentProfile = await studentApi.getById("student-id-123");
console.log(studentProfile.data.user);
console.log(studentProfile.data.bookings);
console.log(studentProfile.data.reviews);

// Update Student Profile
await studentApi.update("student-id-123", {
  firstName: "Jane",
  profilePicture: "https://example.com/image.jpg",
  phone: "+0987654321"
});

// Get Student Statistics
const stats = await studentApi.getStats("student-id-123");
console.log(`Total Bookings: ${stats.data.totalBookings}`);
console.log(`Total Reviews: ${stats.data.totalReviews}`);
console.log(`Latest Booking:`, stats.data.latestBooking);

// Get Upcoming Bookings
const upcomingBookings = await studentApi.getUpcomingBookings("student-id-123");
upcomingBookings.data.forEach(booking => {
  console.log(`Session on ${booking.slot.date} at ${booking.slot.startTime}`);
});

// Get Completed Sessions
const completedSessions = await studentApi.getCompletedSessions("student-id-123");
console.log(`Completed ${completedSessions.data.length} sessions`);

// Create a Review for Tutor
const review = await studentApi.createReview("student-id-123", {
  tutorId: "tutor-id-456",
  rating: 5,
  comment: "Excellent tutor! Very helpful and patient."
});

// Cancel a Booking
const canceledBooking = await studentApi.cancelBooking(
  "student-id-123",
  "booking-id-789"
);

*/

// ============================================
// REACT QUERY (TANSTACK QUERY) HOOKS
// ============================================

/*

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../services/studentApi';

// Get Student Profile
export const useStudentProfile = (studentId: string) => {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentApi.getById(studentId),
    enabled: !!studentId
  });
};

// Get Student Stats
export const useStudentStats = (studentId: string) => {
  return useQuery({
    queryKey: ['student-stats', studentId],
    queryFn: () => studentApi.getStats(studentId),
    refetchInterval: 30000 // refresh every 30 seconds
  });
};

// Get Upcoming Bookings
export const useUpcomingBookings = (studentId: string) => {
  return useQuery({
    queryKey: ['upcoming-bookings', studentId],
    queryFn: () => studentApi.getUpcomingBookings(studentId)
  });
};

// Update Student Profile
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data: UpdateStudentPayload }) =>
      studentApi.update(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] });
    }
  });
};

// Create Review
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ studentId, reviewData }: { 
      studentId: string; 
      reviewData: CreateReviewPayload 
    }) => studentApi.createReview(studentId, reviewData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['tutor', variables.reviewData.tutorId] });
    }
  });
};

// Cancel Booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ studentId, bookingId }: { 
      studentId: string; 
      bookingId: string 
    }) => studentApi.cancelBooking(studentId, bookingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-bookings', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['student-stats', variables.studentId] });
    }
  });
};

// Usage in Component
const StudentDashboard = ({ studentId }: { studentId: string }) => {
  const { data: profile, isLoading } = useStudentProfile(studentId);
  const { data: stats } = useStudentStats(studentId);
  const { data: upcomingBookings } = useUpcomingBookings(studentId);
  const updateStudent = useUpdateStudent();
  const createReview = useCreateReview();
  const cancelBooking = useCancelBooking();

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1>Welcome, {profile?.data.firstName}</h1>
      <div>
        <p>Total Bookings: {stats?.data.totalBookings}</p>
        <p>Total Reviews: {stats?.data.totalReviews}</p>
      </div>
      {upcomingBookings?.data.map(booking => (
        <BookingCard 
          key={booking.id} 
          booking={booking}
          onCancel={() => cancelBooking.mutate({ studentId, bookingId: booking.id })}
        />
      ))}
    </div>
  );
};

*/
