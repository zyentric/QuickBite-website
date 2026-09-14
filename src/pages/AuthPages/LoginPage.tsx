import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    } else {
      openAuthModal('login');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, openAuthModal, navigate]);

  return null;
}
