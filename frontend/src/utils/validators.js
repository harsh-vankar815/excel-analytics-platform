/**
 * Validates if string matches MongoDB ObjectId pattern
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidObjectId = (id) => {
  if (!id) return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}; 