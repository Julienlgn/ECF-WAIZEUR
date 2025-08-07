import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Erreur de signature webhook:", error);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;

      case "customer.subscription.created":
        const subscription = event.data.object;
        await handleSubscriptionCreated(subscription);
        break;

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object;
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        await handleInvoicePaymentSucceeded(invoice);
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object;
        await handleInvoicePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erreur lors du traitement du webhook:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement du webhook" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session) {
  const userId = session.metadata?.userId;
  const customerId = session.customer;

  if (userId) {
    // Mettre à jour le statut premium de l'utilisateur
    const { error } = await supabase
      .from("users")
      .update({
        is_premium: true,
        stripe_customer_id: customerId,
        premium_start_date: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Erreur lors de la mise à jour du statut premium:", error);
    }
  }
}

async function handleSubscriptionCreated(subscription) {
  const customerId = subscription.customer;

  // Trouver l'utilisateur par customer_id
  const { data: user, error } = await supabase
    .from("users")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (user && !error) {
    await supabase
      .from("users")
      .update({
        is_premium: true,
        stripe_subscription_id: subscription.id,
        premium_start_date: new Date().toISOString(),
      })
      .eq("id", user.id);
  }
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;
  const status = subscription.status;

  const { data: user, error } = await supabase
    .from("users")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (user && !error) {
    const isPremium = status === "active" || status === "trialing";

    await supabase
      .from("users")
      .update({
        is_premium: isPremium,
        subscription_status: status,
      })
      .eq("id", user.id);
  }
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;

  const { data: user, error } = await supabase
    .from("users")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (user && !error) {
    await supabase
      .from("users")
      .update({
        is_premium: false,
        subscription_status: "canceled",
        premium_end_date: new Date().toISOString(),
      })
      .eq("id", user.id);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  // Gérer les paiements réussis
  console.log("Paiement réussi pour la facture:", invoice.id);
}

async function handleInvoicePaymentFailed(invoice) {
  // Gérer les échecs de paiement
  console.log("Échec de paiement pour la facture:", invoice.id);
}
