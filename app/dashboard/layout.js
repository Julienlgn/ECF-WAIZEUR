import ProtectedRoute from "../../components/common/ProtectedRoute";
import LogoutButton from "../../components/common/LogoutButton";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">WAIZEUR</h1>
              </div>
              <nav className="flex space-x-8">
                <a
                  href="/dashboard"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Météo
                </a>
                <a
                  href="/dashboard/favorite"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Favoris
                </a>
                <a
                  href="/dashboard/account"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Compte
                </a>
              </nav>
              <div className="flex items-center space-x-4">
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
        
      </div>
    </ProtectedRoute>
  );
}
