import { fetchJSON } from './helpers.mjs';

export const rd_user = async () => {
  try {
    const req = await fetchJSON('http://localhost:4500/customer');
    console.log(req);
  } catch (error) {}
};
