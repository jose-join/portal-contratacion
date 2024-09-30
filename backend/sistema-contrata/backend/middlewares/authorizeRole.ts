import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { CustomRequest } from './authMiddleware'; // Importar el tipo CustomRequest

dotenv.config();

export const authorizeRole = (roles: ('admin' | 'postulante')[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.header('x-auth-token');  // Leer el token desde el header

    if (!token) {
      return res.status(401).json({ message: 'No hay token, permiso denegado' });
    }

    try {
      // Decodificar el token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecreto') as CustomRequest['user'];
      req.user = decoded;

      // Verificar si el rol del usuario está incluido en los roles permitidos
      if (req.user && roles.includes(req.user.role)) {
        next();  // Usuario autorizado
      } else {
        return res.status(403).json({ message: 'Acceso denegado' });
      }
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
};
