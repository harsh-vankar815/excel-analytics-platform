const mongoose = require('mongoose');

/**
 * Validates if string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = {
  isValidObjectId
}; 