import { API_ENDPOINTS } from '../config/api.js';
import { apiJson } from './client.js';

/**
 * Update current user profile (country, pfpUrl). Partial update; omit fields to leave unchanged.
 */
export async function updateProfile({ country, pfpUrl }) {
  const body = {};
  if (country !== undefined) body.country = country;
  if (pfpUrl !== undefined) body.pfpUrl = pfpUrl;
  return apiJson(API_ENDPOINTS.USER.PROFILE, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export default { updateProfile };
