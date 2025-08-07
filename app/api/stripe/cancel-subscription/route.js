import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'ID d\'abonnement requis' },
        { status: 400 }
      );
    }

    // Annuler l'abonnement dans Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true, // Annuler à la fin de la période de facturation
    });

    // Mettre à jour le statut dans Supabase
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'canceled',
        premium_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }

    return NextResponse.json({
      message: 'Abonnement annulé avec succès',
      subscription: subscription,
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de l\'abonnement' },
      { status: 500 }
    );
  }
} 