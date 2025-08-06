import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header avec lien de retour */}
      <header className="p-4">
        <Link 
          href="/" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Retour à WAIZEUR
        </Link>
      </header>
      
      {/* Contenu principal */}
      <main>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-500">
        <p>&copy; 2025 WAIZEUR - Tous droits réservés</p>
      </footer>
    </div>
  );
}
