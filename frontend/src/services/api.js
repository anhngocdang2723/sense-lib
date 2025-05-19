import api, { endpoints } from '../api/api';

// Admin Comments API
export const getAdminComments = () => {
  return api.get(endpoints.comments.admin.all);
};

export const updateCommentStatus = (commentId, status) => {
  return api.put(endpoints.comments.admin.updateStatus(commentId), { status });
};

export const deleteComment = (commentId) => {
  return api.delete(endpoints.comments.admin.delete(commentId));
};

// Admin Ratings API
export const getAdminRatings = () => {
  return api.get(endpoints.ratings.admin.all);
};

export const deleteRating = (ratingId) => {
  return api.delete(endpoints.ratings.admin.delete(ratingId));
};

// Admin Favorites API
export const getAdminFavorites = () => {
  return api.get(endpoints.favorites.admin.all);
};

export const deleteFavorite = (favoriteId) => {
  return api.delete(endpoints.favorites.admin.delete(favoriteId));
}; 