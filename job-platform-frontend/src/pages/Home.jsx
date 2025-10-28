import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section avec espace minimal */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-blue-100 bg-blue-50 mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              <span className="text-sm font-medium text-blue-700">Plateforme premium</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Votre carrière
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                réinventée
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Découvrez des opportunités uniques et connectez avec des entreprises innovantes
            </p>

            {/* Stats */}
            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-500">Offres</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">200+</div>
                <div className="text-sm text-gray-500">Entreprises</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">5K+</div>
                <div className="text-sm text-gray-500">Talents</div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            {/* Job Seeker Card */}
            <Link 
              to="/jobs" 
              className="group relative bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 p-6 hover:shadow-lg"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
                  <span className="text-xl text-white">👤</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  Candidat
                </h2>
                <p className="text-gray-600 mb-4">
                  Explorez des offres sélectionnées
                </p>
                <div className="flex items-center justify-center text-blue-600 font-semibold text-sm">
                  <span>Découvrir les offres</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Employer Card */}
            <Link 
              to="/register?role=employer" 
              className="group relative bg-white rounded-xl border border-green-100 hover:border-green-300 transition-all duration-300 p-6 hover:shadow-lg"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
                  <span className="text-xl text-white">💼</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                  Recruteur
                </h2>
                <p className="text-gray-600 mb-4">
                  Attirez les talents exceptionnels
                </p>
                <div className="flex items-center justify-center text-green-600 font-semibold text-sm">
                  <span>Commencer à recruter</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <p className="text-gray-500 mb-4 text-sm">Déjà membre ?</p>
            <Link 
              to="/login" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>

      {/* Background très subtil */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-50 rounded-full blur-2xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-50 rounded-full blur-2xl opacity-20"></div>
      </div>
    </div>
  );
}