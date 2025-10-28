import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      onLogout(); // ← J'utilise onLogout comme dans votre code original
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              JobPlatform
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <span className="text-gray-600 font-medium">Bonjour, {user.name}</span>
                
                {/* Liens communs */}
                <Link 
                  to="/jobs" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  Offres
                </Link>
                
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  Tableau de bord
                </Link>

                {/* Liens spécifiques selon le rôle */}
                {user.roles?.includes('employer') && (
                  <Link 
                    to="/post-job" 
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  >
                    Publier une offre
                  </Link>
                )}

                {user.roles?.includes('candidate') && (
                  <Link 
                    to="/my-applications" 
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                  >
                    Mes candidatures
                  </Link>
                )}

                {user.roles?.includes('admin') && (
                  <Link 
                    to="/admin" 
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  >
                    Administration
                  </Link>
                )}

                <button 
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/jobs" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  Offres d'emploi
                </Link>
                
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  Connexion
                </Link>
                
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}