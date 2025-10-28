import { useState, useEffect } from 'react';
import { applicationService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications();
  }, []);

  // Fonction pour normaliser les données en tableau
  const normalizeToArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.applications && Array.isArray(data.applications)) return data.applications;
    if (typeof data === 'object') return [data];
    return [];
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      console.log('Loading applications...');
      const data = await applicationService.getApplications();
      console.log('Raw applications data:', data);
      
      // CORRECTION : Normaliser les données en tableau
      const normalizedData = normalizeToArray(data);
      console.log('Normalized applications:', normalizedData);
      
      setApplications(normalizedData);
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Erreur lors du chargement des candidatures: ' + error.message);
      setApplications([]); // Assurer que applications reste un tableau
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer cette candidature ?')) {
      try {
        await applicationService.deleteApplication(applicationId);
        setApplications(applications.filter(app => app.id !== applicationId));
        alert('Candidature retirée avec succès !');
      } catch (error) {
        alert('Erreur lors du retrait de la candidature: ' + error.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      default:
        return 'En attente';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // CORRECTION : Vérifier que applications est bien un tableau avant de mapper
  const safeApplications = Array.isArray(applications) ? applications : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes candidatures</h1>
            <p className="text-gray-600">Suivez l'état de vos postulations</p>
          </div>
          <button 
            onClick={() => navigate('/jobs')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-4 sm:mt-0"
          >
            📋 Voir les offres
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center mb-2 sm:mb-0">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span><strong>Erreur :</strong> {error}</span>
              </div>
              <button 
                onClick={loadApplications}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-sm"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* CORRECTION : Utiliser safeApplications au lieu de applications */}
        {safeApplications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-12 text-center transform hover:shadow-3xl transition-all duration-300">
            <div className="text-6xl mb-6">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucune candidature pour le moment</h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
              Vous n'avez pas encore postulé à des offres d'emploi. Explorez les opportunités disponibles !
            </p>
            <button 
              onClick={() => navigate('/jobs')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              🚀 Découvrir les offres disponibles
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* CORRECTION : Utiliser safeApplications.map */}
            {safeApplications.map(application => (
              <div 
                key={application.id}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-purple-600 transition-colors cursor-pointer">
                      {application.job?.title || 'Offre non disponible'}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      {application.job?.company && (
                        <span className="flex items-center text-gray-700 font-medium">
                          <span className="w-5 h-5 mr-2">🏢</span>
                          {application.job.company}
                        </span>
                      )}
                      {application.job?.location && (
                        <span className="flex items-center text-gray-700">
                          <span className="w-5 h-5 mr-2">📍</span>
                          {application.job.location}
                        </span>
                      )}
                      {application.job?.salary && (
                        <span className="flex items-center text-green-600 font-semibold">
                          <span className="w-5 h-5 mr-2">💰</span>
                          {application.job.salary}€
                        </span>
                      )}
                    </div>

                    {application.job?.description && (
                      <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2">
                        {application.job.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-start lg:items-end gap-3">
                    <span 
                      className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(application.status || 'pending')} shadow-sm`}
                    >
                      {getStatusText(application.status || 'pending')}
                    </span>
                    
                    {(application.status === 'pending' || !application.status) && (
                      <button 
                        onClick={() => handleDeleteApplication(application.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-sm"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                </div>

                {application.cover_letter && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <span className="w-5 h-5 mr-1">📄</span>
                      Lettre de motivation :
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-gray-600 leading-relaxed italic">
                        "{application.cover_letter}"
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-200 text-sm text-gray-500">
                  <span className="flex items-center mb-2 sm:mb-0">
                    <span className="w-4 h-4 mr-1">📅</span>
                    Candidature envoyée le {formatDate(application.created_at)}
                  </span>
                  
                  {application.updated_at && application.updated_at !== application.created_at && (
                    <span className="italic">
                      Mise à jour le {formatDate(application.updated_at)}
                    </span>
                  )}
                </div>

                {application.status && application.status !== 'pending' && (
                  <div className={`mt-4 p-4 rounded-xl border ${
                    application.status === 'accepted' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <p className={`font-semibold flex items-center ${
                      application.status === 'accepted' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      <span className="w-5 h-5 mr-2">
                        {application.status === 'accepted' ? '🎉' : '💼'}
                      </span>
                      {application.status === 'accepted' 
                        ? 'Félicitations ! Votre candidature a été acceptée.' 
                        : 'Malheureusement, votre candidature n\'a pas été retenue.'
                      }
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CORRECTION : Utiliser safeApplications.length */}
        {safeApplications.length > 0 && (
          <div className="text-center mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <p className="text-gray-600 font-medium">
              {safeApplications.length} candidature{safeApplications.length > 1 ? 's' : ''} au total
            </p>
          </div>
        )}
      </div>
    </div>
  );
}