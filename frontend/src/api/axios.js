import axios, { AxiosHeaders } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

/**
 * Content-Type handling
 * --------------------
 * A global `Content-Type: application/json` breaks every file upload:
 * Axios' `transformRequest` sees a JSON content type and converts the
 * FormData into a plain JSON object (the File is dropped), so Multer on the
 * server never receives a file. Setting `multipart/form-data` by hand is
 * equally bad because the boundary is missing.
 *
 * So: let the browser generate the multipart header (with its boundary) for
 * FormData bodies, and keep JSON for everything else.
 */
api.interceptors.request.use((config) => {
  const isFormData =
    typeof FormData !== 'undefined' && config.data instanceof FormData;

  // `config.headers` is an AxiosHeaders instance, but stay defensive so a
  // plain object (e.g. from a custom adapter) cannot break the helper calls.
  const headers = AxiosHeaders.from(config.headers);

  if (isFormData) {
    // Remove any pre-set content type so the browser can add the
    // `multipart/form-data; boundary=...` header itself.
    headers.delete('Content-Type');
  } else if (config.data !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  config.headers = headers;

  return config;
});

export default api;