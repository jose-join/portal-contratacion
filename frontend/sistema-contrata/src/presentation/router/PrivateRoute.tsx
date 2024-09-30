import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  component: React.ComponentType;  // Tipo adecuado para un componente
}

export const PrivateRoute = ({ component: Component }: PrivateRouteProps) => {
  const isAuthenticated = localStorage.getItem('token'); // Cambiamos a 'token'

  return isAuthenticated ? <Component /> : <Navigate to="/login" />;
};
