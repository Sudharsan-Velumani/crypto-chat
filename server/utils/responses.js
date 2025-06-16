const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

const errorResponse = (message, code = 'INTERNAL_ERROR', details = null) => {
  return {
    success: false,
    error: {
      message,
      code,
      details
    },
    timestamp: new Date().toISOString()
  };
};

const paginatedResponse = (data, pagination) => {
  return {
    success: true,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || data.length,
      hasNext: pagination.hasNext || false,
      hasPrev: pagination.hasPrev || false
    },
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};