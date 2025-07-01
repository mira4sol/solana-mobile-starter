import { CreateUserDto, UpdateUserDto } from '@/types';
import { apiResponse, httpRequest } from '../api.helpers';

export const userRequests = {
  /**
   * Get the current user's profile
   */
  getProfile: async () => {
    try {
      const api = httpRequest();
      const response = await api.get('/users/me');
      return apiResponse(
        true,
        'User profile fetched successfully',
        response.data
      );
    } catch (err: any) {
      console.log('Error fetching user profile:', err?.response?.data);
      return apiResponse(
        false,
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          'Error fetching user profile',
        null
      );
    }
  },

  /**
   * Create a new user
   * @param userData The user data to create
   */
  createUser: async (userData: CreateUserDto) => {
    try {
      const api = httpRequest();
      const response = await api.post('/users', userData);
      return apiResponse(true, 'User created successfully', response.data);
    } catch (err: any) {
      console.log('Error creating user:', err?.response?.data);
      return apiResponse(
        false,
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          'Error creating user',
        null
      );
    }
  },

  /**
   * Update the current user's profile
   * @param userData The user data to update
   */
  updateProfile: async (userData: UpdateUserDto) => {
    try {
      const api = httpRequest();
      const response = await api.patch('/users/me', userData);
      return apiResponse(
        true,
        'User profile updated successfully',
        response.data
      );
    } catch (err: any) {
      console.log('Error updating user profile:', err?.response?.data);
      return apiResponse(
        false,
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          'Error updating user profile',
        null
      );
    }
  },

  /**
   * Delete the current user's profile
   */
  deleteUser: async () => {
    try {
      const api = httpRequest();
      const response = await api.delete('/users/me');
      return apiResponse(true, 'User deleted successfully', response.data);
    } catch (err: any) {
      console.log('Error deleting user:', err?.response?.data);
      return apiResponse(
        false,
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          'Error deleting user',
        null
      );
    }
  },

  /**
   * Check if a user exists and create if not
   * @param userData The user data to create if needed
   */
  checkAndCreateUser: async (userData: CreateUserDto) => {
    try {
      // First try to get the user profile
      const profileResponse = await userRequests.getProfile();

      // If user exists, return the profile
      if (profileResponse.success) {
        return profileResponse;
      }

      // If user doesn't exist, create new user
      return await userRequests.createUser(userData);
    } catch (err: any) {
      console.log('Error in check and create user:', err);
      return apiResponse(false, 'Error checking or creating user', null);
    }
  },
};
