'use client';

import { useStripe } from '../hooks/useStripe';
import { useState } from 'react';

export default function PremiumButton({ userId, userEmail }) {
  const { createCheckoutSession, loading, error } = useStripe();
  const [showError, setShowError] = useState(false);

  const handleUpgradeToPremium = async () => {
    try {
      await createCheckoutSession({
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID, // ID du prix Stripe
        userId: userId,
        email: userEmail,
      });
    } catch (err) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleUpgradeToPremium}
        disabled={loading}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Chargement...' : 'Passer à Premium'}
      </button>
      
      {error && showError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="text-sm text-gray-600 text-center max-w-md">
        Accédez à toutes les fonctionnalités premium : prévisions détaillées, 
        alertes météo, historique complet et plus encore !
      </div>
    </div>
  );
} 