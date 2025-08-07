import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request) {
  try {
    // Vérifier que la clé Stripe est configurée
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY n'est pas configurée");
      return NextResponse.json(
        { error: "Configuration Stripe manquante" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { priceId, userId, email } = await request.json();

    // Vérifier les paramètres requis
    if (!priceId || !userId || !email) {
      return NextResponse.json(
        { error: "Paramètres manquants: priceId, userId, email" },
        { status: 400 }
      );
    }

    // URL de base pour les redirections
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://votre-projet.vercel.app');

    // Créer une session de checkout Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/premium?canceled=true`,
      customer_email: email,
      metadata: {
        userId: userId,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'fr',
    });

    console.log("Session Stripe créée avec succès:", session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Erreur détaillée lors de la création de la session Stripe:", {
      message: error.message,
      type: error.type,
      code: error.code,
    });

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: "Configuration Stripe invalide. Vérifiez vos clés API." },
        { status: 400 }
      );
    }

    if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { error: "Erreur d'authentification Stripe. Vérifiez votre clé secrète." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: `Erreur lors de la création de la session de paiement: ${error.message}` },
      { status: 500 }
    );
  }
} 