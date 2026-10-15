import api from './api';
export const loginUser = async ({ email, password }) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });

  return response.data;
};
export const registerUser = async ({ email, password, confirmPassword }) => {
  const response = await api.post('/auth/register', {
    email,
    password,
    confirmPassword,
  });
  return response.data;
};
export const verifyOtp = async ({ email, otp }) => {
  const response = await api.post('/auth/verify-otp', {
    email,
    otp,
  });
  return response.data;
};
export const resendOtp = async email => {
  const response = await api.post('/auth/resend-otp', {
    email,
  });

  return response.data;
};
export const refreshAccessToken = async refreshToken => {
  const response = await api.post('/auth/refresh', {
    refreshToken,
  });
  return response.data;
};
export const logoutUser = async refreshToken => {
  const response = await api.post('/auth/logout', {
    refreshToken,
  });
  return response.data;
};
export const updateProfile = async ({
  name,
  mobile,
  address,
  businessName,
}) => {
  const response = await api.patch('/profile', {
    name,
    mobile,
    address,
    businessName,
  });

  return response.data;
};
