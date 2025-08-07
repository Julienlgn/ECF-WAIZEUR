import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { priceId, userId, email } = await request.json();

    // Créer une session de checkout Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId, // ID du prix Stripe pour l'abonnement premium
          quantity: 1,
        },
      ],
      mode: "subscription", // ou 'payment' pour un paiement unique
      success_url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "https://votre-projet.vercel.app"
      }/dashboard?success=true`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "https://votre-projet.vercel.app"
      }/premium?canceled=true`,
      customer_email: email,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    );
  }
}
