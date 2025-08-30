export const successResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

export const errorResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    success: false,
    message,
    ...(data && { data }),
  });
};
