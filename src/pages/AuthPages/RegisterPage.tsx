import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    } else {
      openAuthModal('register');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, openAuthModal, navigate]);

  return null;
}
