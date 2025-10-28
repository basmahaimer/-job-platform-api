import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, jobService, applicationService } from '../services/api';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [userJobs, setUserJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeAdminTab, setActiveAdminTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const normalizeToArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.applications && Array.isArray(data.applications)) return data.applications;
    if (typeof data === 'object') return [data];
    return [];
  };

  const mockUsers = [
    { id: 1, name: 'Admin Principal', email: 'admin@jobplatform.com', role: 'admin', created_at: '2024-01-01' },
    { id: 2, name: 'Entreprise Tech', email: 'tech@entreprise.com', role: 'employer', created_at: '2024-01-02' },
    { id: 3, name: 'Jean Candidate', email: 'jean@candidate.com', role: 'candidate', created_at: '2024-01-03' },
    { id: 4, name: 'Marie Dev', email: 'marie@dev.com', role: 'candidate', created_at: '2024-01-04' },
    { id: 5, name: 'Startup Innov', email: 'contact@startup.com', role: 'employer', created_at: '2024-01-05' }
  ];

  const loadUserData = async () => {
    try {
      const data = await authService.getMe();
      setUserData(data);
      
      const jobs = await jobService.getJobs();
      const applicationsData = await applicationService.getApplications();
      
      const normalizedJobs = normalizeToArray(jobs);
      const normalizedApplications = normalizeToArray(applicationsData);
      
      setAllJobs(normalizedJobs);
      setAllApplications(normalizedApplications);
      setUsers(mockUsers);
      
      if (data.roles.includes('employer')) {
        const userJobsData = normalizedJobs.filter(job => job.user_id === data.user.id);
        setUserJobs(userJobsData);
        
        try {
          const receivedApps = normalizedApplications.filter(app => 
            userJobsData.some(job => job.id === app.job_id)
          );
          setReceivedApplications(receivedApps);
        } catch (appError) {
          console.error('Error loading applications:', appError);
          setReceivedApplications([]);
        }
      }
      
      if (data.roles.includes('candidate')) {
        try {
          const userApplications = normalizedApplications.filter(app => 
            app.user_id === data.user.id
          );
          setApplications(userApplications);
        } catch (appError) {
          console.error('Error loading candidate applications:', appError);
          setApplications([]);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        await jobService.deleteJob(jobId);
        setUserJobs(userJobs.filter(job => job.id !== jobId));
        setAllJobs(allJobs.filter(job => job.id !== jobId));
        alert('Offre supprimée avec succès !');
      } catch (error) {
        alert('Erreur lors de la suppression: ' + error.message);
      }
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, status) => {
    try {
      await applicationService.updateApplication(applicationId, status);
      setReceivedApplications(receivedApplications.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));
      alert('Statut mis à jour avec succès !');
    } catch (error) {
      alert('Erreur lors de la mise à jour: ' + error.message);
    }
  };

  const handleAdminDeleteJob = async (jobId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre en tant qu\'administrateur ?')) {
      try {
        await jobService.deleteJob(jobId);
        setAllJobs(allJobs.filter(job => job.id !== jobId));
        alert('Offre supprimée avec succès !');
      } catch (error) {
        alert('Erreur lors de la suppression: ' + error.message);
      }
    }
  };

  const handleAdminDeleteApplication = async (applicationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature en tant qu\'administrateur ?')) {
      try {
        await applicationService.deleteApplication(applicationId);
        setAllApplications(allApplications.filter(app => app.id !== applicationId));
        alert('Candidature supprimée avec succès !');
      } catch (error) {
        alert('Erreur lors de la suppression: ' + error.message);
      }
    }
  };

  const handleAdminUpdateJob = (job) => {
    navigate(`/edit-job/${job.id}`);
  };

  const handleAdminUpdateApplication = (application) => {
    const newStatus = prompt(`Modifier le statut de la candidature (actuel: ${application.status}):\nOptions: pending, accepted, rejected`, application.status);
    if (newStatus && ['pending', 'accepted', 'rejected'].includes(newStatus)) {
      handleUpdateApplicationStatus(application.id, newStatus);
    }
  };

  const handleAdminDeleteUser = (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(user => user.id !== userId));
      alert('Utilisateur supprimé avec succès !');
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'employer':
        return 'bg-gradient-to-r from-orange-500 to-orange-600';
      case 'candidate':
        return 'bg-gradient-to-r from-green-500 to-green-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'employer':
        return '💼';
      case 'candidate':
        return '🎓';
      default:
        return '👤';
    }
  };

  const isEmployer = userData?.roles?.includes('employer');
  const isCandidate = userData?.roles?.includes('candidate');
  const isAdmin = userData?.roles?.includes('admin');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600">Impossible de charger vos données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header avec informations utilisateur stylisées */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 mb-8 transform hover:shadow-3xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-4 lg:mb-0">
              <div className={`w-16 h-16 ${getRoleColor(userData.roles?.[0])} rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg`}>
                {getRoleIcon(userData.roles?.[0])}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Bonjour, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{userData.user?.name}</span>
                </h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userData.roles?.map(role => (
                    <span key={role} className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getRoleColor(role)} shadow-sm`}>
                      {getRoleIcon(role)} {role === 'admin' ? 'Administrateur' : role === 'employer' ? 'Employeur' : 'Candidat'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm">Votre espace personnel</p>
              <p className="text-gray-500 text-xs mt-1">Connecté depuis {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        {/* Espace Employeur */}
        {isEmployer && (
          <div className="space-y-8">
            {/* Mes offres d'emploi */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes offres d'emploi</h2>
                  <p className="text-gray-600">Gérez vos publications et suivez les candidatures</p>
                </div>
                <button 
                  onClick={() => navigate('/post-job')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-4 sm:mt-0"
                >
                  + Publier une offre
                </button>
              </div>

              {userJobs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune offre publiée</h3>
                  <p className="text-gray-600 mb-6">Commencez par publier votre première offre d'emploi</p>
                  <button 
                    onClick={() => navigate('/post-job')}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Publier ma première offre
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {userJobs.map(job => (
                    <div key={job.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-200">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{job.title}</h3>
                          <div className="flex flex-wrap gap-4 mb-3">
                            <span className="flex items-center text-gray-700">
                              <span className="w-5 h-5 mr-2">🏢</span>
                              {job.company}
                            </span>
                            <span className="flex items-center text-gray-700">
                              <span className="w-5 h-5 mr-2">📍</span>
                              {job.location}
                            </span>
                            {job.salary && (
                              <span className="flex items-center text-green-600 font-semibold">
                                <span className="w-5 h-5 mr-2">💰</span>
                                {job.salary}€
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 line-clamp-2">{job.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/edit-job/${job.id}`)}
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                          >
                            Modifier
                          </button>
                          <button 
                            onClick={() => handleDeleteJob(job.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Candidatures reçues */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Candidatures reçues</h2>
              
              {receivedApplications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-4">📨</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune candidature reçue</h3>
                  <p className="text-gray-600">Les candidatures apparaîtront ici</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {receivedApplications.map(app => (
                    <div key={app.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-purple-300 transition-all duration-200">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{app.job?.title}</h3>
                          <div className="flex flex-wrap gap-4 mb-3">
                            <span className="flex items-center text-gray-700">
                              <span className="w-5 h-5 mr-2">👤</span>
                              {app.user?.name}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(app.status)} border`}>
                              {getStatusText(app.status)}
                            </span>
                          </div>
                          {app.cover_letter && (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Lettre de motivation :</p>
                              <p className="text-gray-600 italic line-clamp-2">"{app.cover_letter}"</p>
                            </div>
                          )}
                        </div>
                        {app.status === 'pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                            >
                              Accepter
                            </button>
                            <button 
                              onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                            >
                              Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Espace Candidat */}
        {isCandidate && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes candidatures</h2>
            
            {!applications || applications.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune candidature</h3>
                <p className="text-gray-600 mb-6">Postulez à votre première offre d'emploi</p>
                <button 
                  onClick={() => navigate('/jobs')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Explorer les offres
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {applications.map(app => (
                  <div key={app.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-green-300 transition-all duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{app.job?.title || 'Offre non disponible'}</h3>
                        <div className="flex flex-wrap gap-4 mb-3">
                          <span className="flex items-center text-gray-700">
                            <span className="w-5 h-5 mr-2">🏢</span>
                            {app.job?.company || 'Entreprise non spécifiée'}
                          </span>
                          <span className="flex items-center text-gray-700">
                            <span className="w-5 h-5 mr-2">📍</span>
                            {app.job?.location || 'Lieu non spécifié'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(app.status)} border`}>
                            {getStatusText(app.status)}
                          </span>
                        </div>
                        {app.cover_letter && (
                          <p className="text-gray-600 line-clamp-2 italic">"{app.cover_letter}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Espace Admin */}
        {isAdmin && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 transform hover:shadow-3xl transition-all duration-300">
            {/* Header Admin */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="flex items-center mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 shadow-lg">
                  👑
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Administration</h2>
                  <p className="text-gray-600">Gestion complète de la plateforme</p>
                </div>
              </div>
              <button 
                onClick={loadUserData}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                🔄 Actualiser
              </button>
            </div>

            {/* Navigation Admin */}
            <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-gray-200">
              {[
                { id: 'stats', label: 'Statistiques', emoji: '📊' },
                { id: 'users', label: 'Utilisateurs', emoji: '👥' },
                { id: 'jobs', label: 'Offres', emoji: '💼' },
                { id: 'applications', label: 'Candidatures', emoji: '📝' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 ${
                    activeAdminTab === tab.id 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
                  }`}
                >
                  {tab.emoji} {tab.label}
                </button>
              ))}
            </div>

            {/* Contenu des tabs Admin */}
            <div className="min-h-[400px]">
              {/* Statistiques */}
              {activeAdminTab === 'stats' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Vue d'ensemble</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
                      <div className="text-3xl mb-2">{users.length}</div>
                      <div className="text-lg font-semibold">Utilisateurs</div>
                      <div className="text-blue-100 text-sm mt-2">
                        {users.filter(u => u.role === 'admin').length} admin • 
                        {users.filter(u => u.role === 'employer').length} employeurs • 
                        {users.filter(u => u.role === 'candidate').length} candidats
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
                      <div className="text-3xl mb-2">{allJobs.length}</div>
                      <div className="text-lg font-semibold">Offres actives</div>
                      <div className="text-green-100 text-sm mt-2">Sur toute la plateforme</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
                      <div className="text-3xl mb-2">{allApplications.length}</div>
                      <div className="text-lg font-semibold">Candidatures</div>
                      <div className="text-purple-100 text-sm mt-2">
                        {allApplications.filter(a => a.status === 'pending').length} en attente
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gestion des Utilisateurs */}
              {activeAdminTab === 'users' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h3>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>👑 {users.filter(u => u.role === 'admin').length}</span>
                      <span>💼 {users.filter(u => u.role === 'employer').length}</span>
                      <span>🎓 {users.filter(u => u.role === 'candidate').length}</span>
                    </div>
                  </div>
                  
                  {users.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="text-6xl mb-4">👥</div>
                      <p className="text-gray-600">Aucun utilisateur</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {users.map(user => (
                        <div key={user.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-red-300 transition-all duration-200">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 ${getRoleColor(user.role)} rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-sm`}>
                                {getRoleIcon(user.role)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{user.name}</h4>
                                <p className="text-gray-600 text-sm">{user.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getRoleColor(user.role)}`}>
                                    {user.role === 'admin' ? 'ADMIN' : user.role === 'employer' ? 'EMPLOYEUR' : 'CANDIDAT'}
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    Inscrit le {new Date(user.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => alert(`Modification de ${user.name} - À implémenter`)}
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm"
                              >
                                Modifier
                              </button>
                              {user.role !== 'admin' && (
                                <button 
                                  onClick={() => handleAdminDeleteUser(user.id)}
                                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm"
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Gestion des Offres */}
              {activeAdminTab === 'jobs' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Gestion des Offres</h3>
                    <button 
                      onClick={() => navigate('/post-job')}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-4 sm:mt-0"
                    >
                      + Créer une offre
                    </button>
                  </div>
                  
                  {allJobs.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="text-6xl mb-4">💼</div>
                      <p className="text-gray-600">Aucune offre sur la plateforme</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {allJobs.map(job => (
                        <div key={job.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-orange-300 transition-all duration-200">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h4>
                              <div className="flex flex-wrap gap-4 mb-2">
                                <span className="flex items-center text-gray-700">
                                  <span className="w-4 h-4 mr-1">🏢</span>
                                  {job.company}
                                </span>
                                <span className="flex items-center text-gray-700">
                                  <span className="w-4 h-4 mr-1">📍</span>
                                  {job.location}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-2">
                                Publié par: {job.user?.name || 'Utilisateur inconnu'}
                              </p>
                              {job.salary && (
                                <p className="text-green-600 font-semibold text-sm">Salaire: {job.salary}€</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleAdminUpdateJob(job)}
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm"
                              >
                                Modifier
                              </button>
                              <button 
                                onClick={() => handleAdminDeleteJob(job.id)}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Gestion des Candidatures */}
              {activeAdminTab === 'applications' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Candidatures</h3>
                  
                  {allApplications.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="text-6xl mb-4">📝</div>
                      <p className="text-gray-600">Aucune candidature sur la plateforme</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {allApplications.map(app => (
                        <div key={app.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-purple-300 transition-all duration-200">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">{app.job?.title || 'Offre supprimée'}</h4>
                              <div className="flex flex-wrap gap-4 mb-2">
                                <span className="flex items-center text-gray-700 text-sm">
                                  <span className="w-4 h-4 mr-1">👤</span>
                                  {app.user?.name || 'Candidat inconnu'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)} border`}>
                                  {getStatusText(app.status)}
                                </span>
                              </div>
                              {app.cover_letter && (
                                <p className="text-gray-600 text-sm italic line-clamp-2">
                                  "{app.cover_letter}"
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleAdminUpdateApplication(app)}
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm"
                              >
                                Modifier
                              </button>
                              <button 
                                onClick={() => handleAdminDeleteApplication(app.id)}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}