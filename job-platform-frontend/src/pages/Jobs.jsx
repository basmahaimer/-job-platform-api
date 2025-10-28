import { useState, useEffect } from 'react';
import { jobService, applicationService } from '../services/api';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    company: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJobs();
      setJobs(data);
    } catch (error) {
      setError('Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await jobService.searchJobs(filters);
      setJobs(data);
    } catch (error) {
      setError('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleApply = async () => {
    try {
      await applicationService.applyToJob(selectedJob.id, coverLetter);
      alert('Candidature envoyée avec succès !');
      setShowApplyModal(false);
      setCoverLetter('');
      setSelectedJob(null);
    } catch (error) {
      alert('Erreur lors de la candidature: ' + error.message);
    }
  };

  const resetFilters = () => {
    setFilters({ title: '', company: '', location: '' });
    loadJobs();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Offres d'emploi</h1>
          <p className="text-xl text-gray-600">
            Découvrez les meilleures opportunités qui correspondent à votre profil
          </p>
        </div>

        {/* Formulaire de recherche avancée */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Titre du poste</label>
              <input
                type="text"
                value={filters.title}
                onChange={(e) => setFilters({...filters, title: e.target.value})}
                placeholder="Développeur, Designer..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Entreprise</label>
              <input
                type="text"
                value={filters.company}
                onChange={(e) => setFilters({...filters, company: e.target.value})}
                placeholder="Nom de l'entreprise"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Localisation</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                placeholder="Ville, Pays..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="flex space-x-3">
              <button 
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold"
              >
                Rechercher
              </button>
              
              <button 
                type="button"
                onClick={resetFilters}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Liste des offres */}
        <div className="space-y-6">
          {jobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune offre trouvée</h3>
              <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            jobs.map(job => (
              <div 
                key={job.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-blue-200 transition-all duration-300 p-6 hover:shadow-lg"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors cursor-pointer">
                      {job.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className="flex items-center text-gray-700 font-medium">
                        <span className="w-5 h-5 mr-2">🏢</span>
                        {job.company}
                      </span>
                      <span className="flex items-center text-gray-700">
                        <span className="w-5 h-5 mr-2">📍</span>
                        {job.location}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {job.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {job.salary ? `${job.salary}€` : 'Salaire non précisé'}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        Postée le {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex lg:flex-col gap-3">
                    <button 
                      onClick={() => handleApplyClick(job)}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold whitespace-nowrap"
                    >
                      Postuler
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de candidature */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Postuler à cette offre</h3>
                <button 
                  onClick={() => setShowApplyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedJob?.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                  <p><span className="font-semibold">Entreprise:</span> {selectedJob?.company}</p>
                  <p><span className="font-semibold">Localisation:</span> {selectedJob?.location}</p>
                  {selectedJob?.salary && (
                    <p><span className="font-semibold">Salaire:</span> {selectedJob?.salary}€</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Lettre de motivation *
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-vertical"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button 
                  onClick={() => setShowApplyModal(false)}
                  className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-semibold"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleApply}
                  disabled={!coverLetter.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Envoyer la candidature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}