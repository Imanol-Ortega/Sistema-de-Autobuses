import { axios } from './axios';

const GET_REVIEW_URL = '/api/usuarios';

export const getClientReview = () => {
  return axios.get(`${GET_REVIEW_URL}/create`).then(d => d.data);
};
