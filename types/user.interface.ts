export interface User {
  id: string;
  username: string;
  profile_picture_url?: string;
  about?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserDto {
  user_id: string;
  username: string;
  profile_picture_url?: string;
  about?: string;
}

export interface UpdateUserDto {
  user_id: string;
  username?: string;
  profile_picture_url?: string;
  about?: string;
}
