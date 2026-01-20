import { useLocation, useNavigate } from 'react-router-dom';

export const useViewToggle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // /topics = Topic-wise view, /dsa-sheet = Level-wise view
  const isTopicsView = location.pathname === '/topics';
  
  const handleToggle = () => {
    if (isTopicsView) {
      navigate('/dsa-sheet'); // Go to Level-wise
    } else {
      navigate('/topics'); // Go to Topic-wise
    }
  };
  
  return {
    isTopicsView,
    handleToggle
  };
};