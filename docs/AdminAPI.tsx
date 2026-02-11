/**
 * SkillBridge Admin API Documentation
 * Generated: February 3, 2026
 */

// ============================================
// AUTHENTICATION
// ============================================
// All endpoints require ADMIN role and Bearer token:
// Authorization: Bearer <token>
// Role: ADMIN

// ============================================
// TYPE DEFINITIONS
// ============================================

export enum UserRole {
  USER = "USER",
  STUDENT = "STUDENT",
  TUTOR = "TUTOR",
  ADMIN = "ADMIN"
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BANNED = "BANNED",
  INACTIVE = "INACTIVE"
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED"
}

export interface TotalEarningsResponse {
  totalEarnings: number;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  status: UserStatus | null;
  isAssociate: boolean;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
  } | null;
  tutorProfile: {
    id: string;
  } | null;
}

export interface UserFilterParams {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
  skip?: number;
  sortBy?: string;
  orderBy?: 'asc' | 'desc';
}

export interface UsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface Booking {
  id: string;
  studentId: string;
  slotId: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  student: {
    firstName: string | null;
    lastName: string | null;
  };
  slot: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    slotPrice: number;
    tutorProfile: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface BookingFilterParams {
  studentId?: string;
  tutorId?: string;
  slotId?: string;
  status?: BookingStatus;
  date?: string;
  page?: number;
  limit?: number;
  skip?: number;
  sortBy?: string;
  orderBy?: 'asc' | 'desc';
}

export interface BookingsResponse {
  data: Booking[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode?: number;
  message: string;
  data: T;
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * 1. GET TOTAL PLATFORM EARNINGS
 * -------------------------
 * Method: GET
 * Path: /admin/earnings
 * Auth: ADMIN
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<TotalEarningsResponse>
 * Status: 200
 * Message: "Total earnings fetched successfully!!"
 * 
 * Data Structure:
 * {
 *   totalEarnings: number;  // Sum of all CONFIRMED and COMPLETED bookings
 * }
 * 
 * Note: Calculates earnings from all confirmed and completed bookings
 */

/**
 * 2. DELETE USER
 * -------------------------
 * Method: DELETE
 * Path: /admin/users/:id
 * Auth: ADMIN
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<null>
 * Status: 200
 * Message: "User deleted successfully!!"
 * 
 * Note: Permanently deletes user and cascades to related records
 */

/**
 * 3. BAN USER
 * -------------------------
 * Method: POST
 * Path: /admin/users/:id/ban
 * Auth: ADMIN
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<null>
 * Status: 200
 * Message: "User banned successfully!!"
 * 
 * Note: Sets user status to BANNED, preventing access
 */

/**
 * 4. UNBAN USER
 * -------------------------
 * Method: POST
 * Path: /admin/users/:id/unban
 * Auth: ADMIN
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<null>
 * Status: 200
 * Message: "User unbanned successfully!!"
 * 
 * Note: Sets user status to ACTIVE, restoring access
 */

/**
 * 5. GET ALL BOOKINGS (WITH FILTERS)
 * -------------------------
 * Method: GET
 * Path: /admin/bookings
 * Auth: ADMIN
 * 
 * Query Parameters:
 * - studentId?: string (filter by student)
 * - tutorId?: string (filter by tutor)
 * - slotId?: string (filter by slot)
 * - status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REJECTED"
 * - date?: string (filter by date, format: YYYY-MM-DD)
 * - page?: number (default: 1)
 * - limit?: number (default: 10)
 * - sortBy?: string (default: createdAt)
 * - orderBy?: "asc" | "desc" (default: desc)
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<BookingsResponse>
 * Status: 200
 * Message: "Bookings fetched successfully!!"
 * 
 * Data Structure:
 * {
 *   data: Booking[];
 *   pagination: {
 *     page: number;
 *     limit: number;
 *     totalRecords: number;
 *     totalPages: number;
 *   }
 * }
 */

/**
 * 6. GET ALL USERS (WITH FILTERS)
 * -------------------------
 * Method: GET
 * Path: /admin/users
 * Auth: ADMIN
 * 
 * Query Parameters:
 * - role?: "USER" | "STUDENT" | "TUTOR" | "ADMIN"
 * - status?: "ACTIVE" | "BANNED" | "INACTIVE"
 * - search?: string (search in name and email)
 * - page?: number (default: 1)
 * - limit?: number (default: 50)
 * - sortBy?: string (default: createdAt)
 * - orderBy?: "asc" | "desc" (default: desc)
 * 
 * Request Body: None
 * 
 * Response: ApiResponse<UsersResponse>
 * Status: 200
 * Message: "Users fetched successfully!!"
 * 
 * Data Structure:
 * {
 *   data: User[];
 *   pagination: {
 *     page: number;
 *     limit: number;
 *     totalRecords: number;
 *     totalPages: number;
 *   }
 * }
 * 
 * Note: Includes student and tutorProfile IDs if associated
 */

// ============================================
// API CLIENT IMPLEMENTATION
// ============================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const ADMIN_BASE = `${API_BASE_URL}/admin`;

const getAuthHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const adminApi = {
  // 1. Get Total Platform Earnings
  getTotalEarnings: async (): Promise<ApiResponse<TotalEarningsResponse>> => {
    const response = await fetch(`${ADMIN_BASE}/earnings`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 2. Delete User
  deleteUser: async (userId: string): Promise<ApiResponse<null>> => {
    const response = await fetch(`${ADMIN_BASE}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 3. Ban User
  banUser: async (userId: string): Promise<ApiResponse<null>> => {
    const response = await fetch(`${ADMIN_BASE}/users/${userId}/ban`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 4. Unban User
  unbanUser: async (userId: string): Promise<ApiResponse<null>> => {
    const response = await fetch(`${ADMIN_BASE}/users/${userId}/unban`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 5. Get All Bookings (with filters)
  getAllBookings: async (params?: BookingFilterParams): Promise<ApiResponse<BookingsResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `${ADMIN_BASE}/bookings${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // 6. Get All Users (with filters)
  getAllUsers: async (params?: UserFilterParams): Promise<ApiResponse<UsersResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `${ADMIN_BASE}/users${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*

// Get Total Platform Earnings
const earnings = await adminApi.getTotalEarnings();
console.log(`Total Platform Earnings: $${earnings.data.totalEarnings}`);

// Get All Users
const allUsers = await adminApi.getAllUsers();
console.log(`Total Users: ${allUsers.data.pagination.totalRecords}`);

// Filter Users by Role
const tutors = await adminApi.getAllUsers({ role: UserRole.TUTOR });
console.log(`Total Tutors: ${tutors.data.data.length}`);

// Filter Users by Status
const bannedUsers = await adminApi.getAllUsers({ status: UserStatus.BANNED });
console.log(`Banned Users: ${bannedUsers.data.data.length}`);

// Search Users
const searchResults = await adminApi.getAllUsers({ 
  search: "john",
  page: 1,
  limit: 20
});

// Filter Users with Pagination
const activeStudents = await adminApi.getAllUsers({
  role: UserRole.STUDENT,
  status: UserStatus.ACTIVE,
  page: 2,
  limit: 50,
  sortBy: 'createdAt',
  orderBy: 'desc'
});

// Get All Bookings
const allBookings = await adminApi.getAllBookings();
console.log(`Total Bookings: ${allBookings.data.pagination.totalRecords}`);

// Filter Bookings by Status
const pendingBookings = await adminApi.getAllBookings({ 
  status: BookingStatus.PENDING 
});

// Filter Bookings by Student
const studentBookings = await adminApi.getAllBookings({ 
  studentId: "student-id-123" 
});

// Filter Bookings by Date
const todayBookings = await adminApi.getAllBookings({ 
  date: "2026-02-03" 
});

// Complex Booking Filter
const filteredBookings = await adminApi.getAllBookings({
  status: BookingStatus.CONFIRMED,
  date: "2026-02-03",
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  orderBy: 'desc'
});

// Ban a User
const banResult = await adminApi.banUser("user-id-123");
if (banResult.success) {
  console.log("User banned successfully");
}

// Unban a User
const unbanResult = await adminApi.unbanUser("user-id-123");
if (unbanResult.success) {
  console.log("User unbanned successfully");
}

// Delete a User
if (confirm("Are you sure you want to delete this user?")) {
  const deleteResult = await adminApi.deleteUser("user-id-123");
  if (deleteResult.success) {
    console.log("User deleted successfully");
  }
}

*/

// ============================================
// REACT QUERY (TANSTACK QUERY) HOOKS
// ============================================

/*

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/adminApi';

// Get Total Earnings
export const useTotalEarnings = () => {
  return useQuery({
    queryKey: ['admin-earnings'],
    queryFn: () => adminApi.getTotalEarnings(),
    refetchInterval: 60000 // refresh every minute
  });
};

// Get All Users
export const useAllUsers = (params?: UserFilterParams) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminApi.getAllUsers(params),
    keepPreviousData: true
  });
};

// Get All Bookings
export const useAllBookings = (params?: BookingFilterParams) => {
  return useQuery({
    queryKey: ['admin-bookings', params],
    queryFn: () => adminApi.getAllBookings(params),
    keepPreviousData: true
  });
};

// Ban User
export const useBanUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => adminApi.banUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
};

// Unban User
export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => adminApi.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
};

// Delete User
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
};

// Usage in Admin Dashboard Component
const AdminDashboard = () => {
  const { data: earnings, isLoading: earningsLoading } = useTotalEarnings();
  const [userFilters, setUserFilters] = useState<UserFilterParams>({
    page: 1,
    limit: 50
  });
  const [bookingFilters, setBookingFilters] = useState<BookingFilterParams>({
    page: 1,
    limit: 10
  });
  
  const { data: users, isLoading: usersLoading } = useAllUsers(userFilters);
  const { data: bookings, isLoading: bookingsLoading } = useAllBookings(bookingFilters);
  
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();
  const deleteUserMutation = useDeleteUser();

  const handleBanUser = (userId: string) => {
    if (confirm('Are you sure you want to ban this user?')) {
      banUserMutation.mutate(userId);
    }
  };

  const handleUnbanUser = (userId: string) => {
    unbanUserMutation.mutate(userId);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to permanently delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (earningsLoading || usersLoading || bookingsLoading) {
    return <Spinner />;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats">
        <StatCard 
          title="Total Platform Earnings" 
          value={`$${earnings?.data.totalEarnings.toFixed(2)}`} 
        />
        <StatCard 
          title="Total Users" 
          value={users?.data.pagination.totalRecords} 
        />
        <StatCard 
          title="Total Bookings" 
          value={bookings?.data.pagination.totalRecords} 
        />
      </div>

      <div className="filters">
        <select onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value as UserRole })}>
          <option value="">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="TUTOR">Tutors</option>
          <option value="ADMIN">Admins</option>
        </select>
        
        <select onChange={(e) => setUserFilters({ ...userFilters, status: e.target.value as UserStatus })}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        
        <input 
          type="text" 
          placeholder="Search users..."
          onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
        />
      </div>

      <div className="users-table">
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.data.data.map(user => (
              <tr key={user.id}>
                <td>{user.name || 'N/A'}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  {user.status === 'BANNED' ? (
                    <button onClick={() => handleUnbanUser(user.id)}>Unban</button>
                  ) : (
                    <button onClick={() => handleBanUser(user.id)}>Ban</button>
                  )}
                  <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination 
          currentPage={userFilters.page || 1}
          totalPages={users?.data.pagination.totalPages || 1}
          onPageChange={(page) => setUserFilters({ ...userFilters, page })}
        />
      </div>

      <div className="bookings-table">
        <h2>Recent Bookings</h2>
        <select onChange={(e) => setBookingFilters({ ...bookingFilters, status: e.target.value as BookingStatus })}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REJECTED">Rejected</option>
        </select>
        
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Tutor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings?.data.data.map(booking => (
              <tr key={booking.id}>
                <td>{booking.student.firstName} {booking.student.lastName}</td>
                <td>{booking.slot.tutorProfile.firstName} {booking.slot.tutorProfile.lastName}</td>
                <td>{new Date(booking.slot.date).toLocaleDateString()}</td>
                <td>{booking.slot.startTime} - {booking.slot.endTime}</td>
                <td>${booking.slot.slotPrice}</td>
                <td>{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination 
          currentPage={bookingFilters.page || 1}
          totalPages={bookings?.data.pagination.totalPages || 1}
          onPageChange={(page) => setBookingFilters({ ...bookingFilters, page })}
        />
      </div>
    </div>
  );
};

*/
