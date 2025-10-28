import { useState } from 'react';
import { applicationService } from '../services/api';

export default function JobCard({ job, showApplyButton = true, onJobUpdate, showActions = false }) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      alert('Veuillez rédiger une lettre de motivation');
      return;
    }

    setLoading(true);
    try {
      await applicationService.applyToJob(job.id, coverLetter);
      alert('Candidature envoyée avec succès !');
      setShowApplyModal(false);
      setCoverLetter('');
    } catch (error) {
      alert('Erreur lors de la candidature: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        if (onJobUpdate) {
          onJobUpdate('delete', job.id);
        }
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  return (
    <>
      {/* Carte d'offre d'emploi */}
      <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-200 transition-all duration-300 p-6 shadow-sm hover:shadow-lg mb-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            
            <div className="flex flex-wrap gap-4 mb-3">
              <span className="flex items-center text-gray-600">
                <span className="w-5 h-5 mr-1">🏢</span>
                {job.company}
              </span>
              <span className="flex items-center text-gray-600">
                <span className="w-5 h-5 mr-1">📍</span>
                {job.location}
              </span>
              {job.salary && (
                <span className="flex items-center text-green-600 font-semibold">
                  <span className="w-5 h-5 mr-1">💰</span>
                  {job.salary}€
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2">
              {job.description}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                Postée le {new Date(job.created_at).toLocaleDateString()}
              </span>
              
              {job.type && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {job.type}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex lg:flex-col gap-2 lg:ml-4">
            {showApplyButton && (
              <button 
                onClick={() => setShowApplyModal(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold whitespace-nowrap"
              >
                Postuler
              </button>
            )}

            {showActions && (
              <>
                <button 
                  onClick={() => onJobUpdate?.('edit', job)}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold whitespace-nowrap"
                >
                  Modifier
                </button>
                <button 
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold whitespace-nowrap"
                >
                  Supprimer
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de candidature */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Postuler à : {job.title}
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <p className="text-gray-700">
                    <span className="font-semibold">Entreprise:</span> {job.company}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Localisation:</span> {job.location}
                  </p>
                  {job.salary && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Salaire:</span> {job.salary}€
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  disabled={loading}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleApply}
                  disabled={!coverLetter.trim() || loading}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    'Envoyer la candidature'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}