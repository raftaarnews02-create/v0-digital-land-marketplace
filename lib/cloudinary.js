import crypto from 'crypto';

/**
 * Minimal signed-upload helper for Cloudinary. Signed uploads work on any
 * account, unlike unsigned ones which need an upload preset to be created and
 * marked unsigned in the dashboard first.
 */

export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

/**
 * Cloudinary signs the alphabetically sorted params (excluding file, api_key
 * and resource_type) joined as a query string, with the secret appended.
 */
function sign(params, apiSecret) {
  const toSign = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
}

/**
 * @param {string} dataUri  data:<mime>;base64,<data>
 * @param {{folder?: string, resourceType?: 'image'|'raw'|'auto'}} options
 */
export async function uploadToCloudinary(dataUri, { folder = 'landbid', resourceType = 'image' } = {}) {
  const config = getCloudinaryConfig();
  if (!config) {
    throw Object.assign(new Error('Image hosting is not configured on the server'), { status: 503 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signedParams = { folder, timestamp };
  const signature = sign(signedParams, config.apiSecret);

  const form = new FormData();
  form.append('file', dataUri);
  form.append('api_key', config.apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
    { method: 'POST', body: form }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error?.message || `Cloudinary responded with ${res.status}`;
    throw Object.assign(new Error(message), { status: 502 });
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    resourceType: data.resource_type,
  };
}

/** @param {string} publicId */
export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  const config = getCloudinaryConfig();
  if (!config) throw Object.assign(new Error('Image hosting is not configured'), { status: 503 });

  const timestamp = Math.round(Date.now() / 1000);
  const signature = sign({ public_id: publicId, timestamp }, config.apiSecret);

  const form = new FormData();
  form.append('public_id', publicId);
  form.append('api_key', config.apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/destroy`,
    { method: 'POST', body: form }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.result === 'error') {
    throw Object.assign(new Error(data?.error?.message || 'Delete failed'), { status: 502 });
  }
  return data;
}
