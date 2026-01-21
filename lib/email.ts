import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string) {
  // Sécurité Dev : Si pas de clé, on ne plante pas l'app
  if (!process.env.RESEND_API_KEY) {
    console.log("⚠️ Resend Key manquante, email ignoré.")
    return
  }

  try {
    await resend.emails.send({
      from: 'SaaS Factory <onboarding@resend.dev>', // L'adresse par défaut de Resend
      to: email, 
      subject: 'Bienvenue dans la Factory 🏭',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>Bienvenue !</h1>
          <p>Votre compte a été créé avec succès.</p>
          <p>Ceci est une preuve que le système d'emailing fonctionne.</p>
          <br/>
          <p>Cordialement,<br/>L'Architecte.</p>
        </div>
      `
    });
    console.log("📧 Email envoyé à", email)
  } catch (error) {
    console.error("❌ Erreur envoi email:", error)
  }
}