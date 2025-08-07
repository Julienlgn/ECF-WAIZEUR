"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import PremiumButton from "../../components/PremiumButton";
import ProtectedRoute from "../../components/common/ProtectedRoute";

function PremiumPageContent() {
  const searchParams = useSearchParams();
  const { user, loading, isPremium } = useAuth();

  // Gérer les paramètres d'URL pour les messages de succès/annulation
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <PremiumContent
        user={user}
        isPremium={isPremium}
        success={success}
        canceled={canceled}
      />
    </ProtectedRoute>
  );
}

export default function PremiumPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <PremiumPageContent />
    </Suspense>
  );
}

function PremiumContent({ user, isPremium, success, canceled }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Passer à Premium
            </h1>
            <p className="text-xl text-gray-600">
              Débloquez toutes les fonctionnalités avancées de votre app météo
            </p>
          </div>

          {/* Messages de statut */}
          {success && (
            <div className="mb-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <strong>Succès !</strong> Votre abonnement premium a été activé
              avec succès.
            </div>
          )}

          {canceled && (
            <div className="mb-8 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <strong>Paiement annulé.</strong> Vous pouvez réessayer à tout
              moment.
            </div>
          )}

          {/* Grille des fonctionnalités */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Fonctionnalité 1 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-500 text-3xl mb-4">🌤️</div>
              <h3 className="text-xl font-semibold mb-2">
                Prévisions Détaillées
              </h3>
              <p className="text-gray-600">
                Accédez à des prévisions météo ultra-précises avec des données
                horaires et des prévisions sur 15 jours.
              </p>
            </div>

            {/* Fonctionnalité 2 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-500 text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Alertes Météo</h3>
              <p className="text-gray-600">
                Recevez des notifications instantanées pour les alertes météo
                importantes dans votre région.
              </p>
            </div>

            {/* Fonctionnalité 3 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-500 text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Historique Complet</h3>
              <p className="text-gray-600">
                Consultez l'historique météo détaillé avec des graphiques et des
                statistiques avancées.
              </p>
            </div>

            {/* Fonctionnalité 4 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-500 text-3xl mb-4">📍</div>
              <h3 className="text-xl font-semibold mb-2">Multi-locations</h3>
              <p className="text-gray-600">
                Suivez la météo de plusieurs villes simultanément avec des
                tableaux de bord personnalisés.
              </p>
            </div>

            {/* Fonctionnalité 5 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-500 text-3xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-2">
                Couverture Mondiale
              </h3>
              <p className="text-gray-600">
                Accédez aux données météo de n'importe où dans le monde avec une
                précision exceptionnelle.
              </p>
            </div>

            {/* Fonctionnalité 6 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-500 text-3xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold mb-2">
                Notifications Avancées
              </h3>
              <p className="text-gray-600">
                Personnalisez vos alertes météo avec des seuils et des
                conditions personnalisées.
              </p>
            </div>
          </div>

          {/* Section de prix */}
          <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Abonnement Premium
              </h2>
              <div className="text-6xl font-bold text-blue-600 mb-2">€4.99</div>
              <div className="text-gray-600 mb-8">par mois</div>

              {/* Bouton de paiement */}
              {isPremium ? (
                <div className="text-center">
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    <strong>🎉 Félicitations !</strong> Vous avez déjà un
                    abonnement premium actif.
                  </div>
                  <a
                    href="/dashboard"
                    className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    Accéder au Dashboard
                  </a>
                </div>
              ) : (
                <PremiumButton userId={user?.id} userEmail={user?.email} />
              )}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Questions Fréquentes
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Puis-je annuler mon abonnement à tout moment ?
                </h4>
                <p className="text-gray-600">
                  Oui, vous pouvez annuler votre abonnement premium à tout
                  moment depuis votre tableau de bord. Vous continuerez à
                  bénéficier des fonctionnalités premium jusqu'à la fin de votre
                  période de facturation.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Comment fonctionne l'essai gratuit ?
                </h4>
                <p className="text-gray-600">
                  Nous offrons un essai gratuit de 7 jours pour tester toutes
                  les fonctionnalités premium. Aucune carte de crédit n'est
                  requise pour commencer l'essai.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Les données sont-elles sécurisées ?
                </h4>
                <p className="text-gray-600">
                  Absolument. Nous utilisons des protocoles de sécurité de
                  niveau bancaire et ne stockons jamais vos informations de
                  paiement. Toutes les données sont chiffrées.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
