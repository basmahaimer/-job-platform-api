import Navbar from './Navbar';

export default function Layout({ children, user, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar user={user} onLogout={onLogout} /> {/* ← J'ai gardé onLogout */}
      
      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-5rem)]">
        {children}
      </main>
    </div>
  );
}