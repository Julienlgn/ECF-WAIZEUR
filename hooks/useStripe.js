import { useState } from 'react';

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCheckoutSession = async ({ priceId, userId, email }) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Tentative de création de session avec:', { priceId, userId, email });

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          email,
        }),
      });

      const data = await response.json();
      console.log('Réponse du serveur:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      if (!data.sessionId) {
        throw new Error('Session ID manquant dans la réponse');
      }

      // Vérifier que Stripe est configuré côté client
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error('Clé publique Stripe non configurée');
      }

      // Rediriger vers Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      
      if (!stripe) {
        throw new Error('Impossible de charger Stripe');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'annulation');
      }

      return data;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de l\'annulation de l\'abonnement:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    cancelSubscription,
    loading,
    error,
  };
};

// Fonction pour charger Stripe
const loadStripe = async (publishableKey) => {
  if (typeof window !== 'undefined' && !window.Stripe) {
    const { loadStripe } = await import('@stripe/stripe-js');
    return loadStripe(publishableKey);
  }
  return window.Stripe(publishableKey);
}; 