import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button" // Assure-toi d'avoir cet import
import { createCheckoutSession } from "@/app/actions/stripe" // Et celui-ci

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
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
          
          {/* Le Bouton Magique */}
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
    </div>
  )
}