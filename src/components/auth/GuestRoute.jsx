import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-400">Tuning into your cosmos...</div>;
  return user ? <Navigate to="/my-cosmos" replace state={{ from: location }} /> : children;
}