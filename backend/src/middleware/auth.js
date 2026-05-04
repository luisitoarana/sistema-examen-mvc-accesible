import { verifyToken } from '../utils/jwt.js';

function extractToken(request) {
  const header = request.headers.authorization ?? '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

export function requireAuth(role) {
  return (request, response, next) => {
    const token = extractToken(request);
    if (!token) {
      response.status(401).json({ errors: ['Sesion requerida.'] });
      return;
    }
    try {
      const payload = verifyToken(token);
      if (role && payload.role !== role) {
        response.status(403).json({ errors: ['No tienes permiso para esta accion.'] });
        return;
      }
      request.auth = payload;
      next();
    } catch {
      response.status(401).json({ errors: ['La sesion expiro o el token es invalido.'] });
    }
  };
}

export function optionalAuth(request, _response, next) {
  const token = extractToken(request);
  if (token) {
    try {
      request.auth = verifyToken(token);
    } catch {
      request.auth = null;
    }
  }
  next();
}
