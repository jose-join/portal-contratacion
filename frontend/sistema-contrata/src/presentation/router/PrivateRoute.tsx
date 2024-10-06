import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  component: React.ComponentType;  // Tipo adecuado para un componente
  [key: string]: any;
}

export const PrivateRoute = ({ component: Component, ...rest }: PrivateRouteProps) => {
  const isAuthenticated = localStorage.getItem('token'); // Cambiamos a 'token'

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};
