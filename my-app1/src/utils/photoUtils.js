
/**
 * Get the photo URL for a user
 * @param {Object} userData - User data object
 * @returns {string|null} - Photo URL or null if no photo
 */
export const getUserPhotoUrl = (userData) => {
  if (!userData) return null;

  // Check for base64 data (legacy support)
  if (userData.photoPreview) {
    return userData.photoPreview;
  }

  if (userData.photoData?.data) {
    return userData.photoData.data;
  }

  // Check for file path (new approach)
  if (userData.photoData?.path) {
    // Convert file path to URL
    const filename = userData.photoData.filename || userData.photoData.path.split('/').pop();
    return `http://localhost:8000/uploads/profiles/${filename}`;
  }

  return null;
};

/**
 * Check if user has a photo
 * @param {Object} userData - User data object
 * @returns {boolean} - True if user has a photo
 */
export const hasUserPhoto = (userData) => {
  return getUserPhotoUrl(userData) !== null;
};


