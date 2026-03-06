// Simple admin auth middleware — protects admin-only endpoints
export function adminAuthMiddleware(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.adminKey;

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Admin password not configured on server.' });
  }

  if (key !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  next();
}
