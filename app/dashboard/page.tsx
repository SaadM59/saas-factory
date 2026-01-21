import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/app/actions/stripe"
import { sendWelcomeEmail } from "@/lib/email" // Import ajouté pour le test

export default async function DashboardPage() {
  // 1. Qui est connecté ?
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <div>Erreur: Non connecté</div>

  // 2. Chercher le profil en Base de Données
  let userProfile = await prisma.userProfile.findUnique({
    where: { userId: user.id }
  })

  // 3. S'il n'existe pas, on le crée (Premier Login)
  if (!userProfile) {
    userProfile = await prisma.userProfile.create({
      data: {
        userId: user.id,
        email: user.email!,
        tier: "free",
        credits: 10
      }
    })
  }

  return (
    <div className="space-y-8"> {/* J'ai augmenté un peu l'espacement vertical */}
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      {/* --- ZONE PRINCIPALE (Tes cartes actuelles) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Carte Statut Abonnement */}
        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col space-y-1.5">
              <h3 className="font-semibold leading-none tracking-tight">Mon Abonnement</h3>
              <p className="text-sm text-muted-foreground">Géré via Database.</p>
            </div>
            <div className="p-6 pt-4 pl-0">
              <div className="text-3xl font-bold uppercase text-indigo-600">
                {userProfile.tier}
              </div>
            </div>
          </div>
          
          {/* Le Bouton Magique Stripe */}
          {userProfile.tier === "free" && (
            <form action={async () => {
              "use server"
              await createCheckoutSession(user.email!, user.id)
            }}>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Passer PRO (19€/mois)
              </Button>
            </form>
          )}
        </div>

        {/* Carte Crédits IA */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Crédits IA</h3>
            <p className="text-sm text-muted-foreground">Restants ce mois-ci.</p>
          </div>
          <div className="p-6 pt-4 pl-0">
            <div className="text-3xl font-bold text-zinc-900">
              {userProfile.credits}
            </div>
            <p className="text-xs text-gray-500 mt-2">Générations possibles</p>
          </div>
        </div>
      </div>

      {/* --- ZONE DE DIAGNOSTIC (Temporaire pour test) --- */}
      <div className="mt-8 p-6 border border-dashed border-yellow-500 rounded-xl bg-yellow-50">
        <h3 className="font-bold text-yellow-800 mb-2">Diagnostic Système Email</h3>
        <p className="text-sm text-yellow-700 mb-4">
          Ceci est un bouton de test manuel pour vérifier la connexion Resend.
          Regarde les logs Vercel après avoir cliqué.
        </p>
        
        <form action={async () => {
          "use server"
          console.log("🚀 Lancement du test email manuel...")
          
          // ATTENTION : On force l'envoi à ton adresse admin pour le test
          const targetEmail = "saad.mejdoubi14@gmail.com" 
          
          await sendWelcomeEmail(targetEmail)
          console.log("🏁 Fin de la tentative d'envoi.")
        }}>
          <Button variant="outline" className="border-yellow-600 text-yellow-800 hover:bg-yellow-100">
            📨 Envoyer un Email Test à Saad
          </Button>
        </form>
      </div>

    </div>
  )
}