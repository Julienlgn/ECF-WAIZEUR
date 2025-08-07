'use client';

import { useStripe } from '../hooks/useStripe';
import { useState } from 'react';

export default function PremiumButton({ userId, userEmail }) {
  const { createCheckoutSession, loading, error } = useStripe();
  const [showError, setShowError] = useState(false);

  const handleUpgradeToPremium = async () => {
    try {
      await createCheckoutSession({
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_1OqX2X2X2X2X2X2X2X2X2X2X',
        userId: userId,
        email: userEmail,
      });
    } catch (err) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Bouton principal de paiement */}
      <button
        onClick={handleUpgradeToPremium}
        disabled={loading}
        className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg hover:from-blue-600 hover:to-purple-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Redirection vers le paiement...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>💳</span>
            <span>Commencer l'abonnement Premium</span>
            <span>→</span>
          </div>
        )}
      </button>
      
      {/* Message d'erreur */}
      {error && showError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span className="font-semibold">Erreur de paiement</span>
          </div>
          <p className="mt-2">{error}</p>
        </div>
      )}
      
      {/* Informations supplémentaires */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md">
        <h4 className="font-semibold text-blue-900 mb-3">✨ Ce qui est inclus :</h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-center space-x-2">
            <span>✅</span>
            <span>Prévisions météo détaillées (15 jours)</span>
          </li>
          <li className="flex items-center space-x-2">
            <span>✅</span>
            <span>Alertes météo personnalisées</span>
          </li>
          <li className="flex items-center space-x-2">
            <span>✅</span>
            <span>Historique complet avec graphiques</span>
          </li>
          <li className="flex items-center space-x-2">
            <span>✅</span>
            <span>Multi-locations illimitées</span>
          </li>
          <li className="flex items-center space-x-2">
            <span>✅</span>
            <span>Annulation gratuite à tout moment</span>
          </li>
        </ul>
      </div>
      
      {/* Sécurité */}
      <div className="text-xs text-gray-500 text-center max-w-md">
        🔒 Paiement sécurisé par Stripe • Pas d'engagement • Annulation gratuite
      </div>
    </div>
  );
} 