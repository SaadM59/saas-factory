import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/app/actions/stripe"
import { IntakeForm } from "./intake-form" // On va créer ce composant juste après

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Erreur: Non connecté</div>

  // Récupération Profil
  let userProfile = await prisma.userProfile.findUnique({ where: { userId: user.id } })
  
  if (!userProfile) {
    // Fallback création (au cas où)
    userProfile = await prisma.userProfile.create({
      data: { userId: user.id, email: user.email!, tier: "free", credits: 10 }
    })
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SaaS Factory 🏭</h1>
          <p className="text-muted-foreground">Transformez vos idées en Business Plan en 1 clic.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white border rounded-lg p-3 text-center min-w-[100px]">
            <div className="text-xs text-muted-foreground uppercase font-bold">Plan</div>
            <div className="font-bold text-indigo-600">{userProfile.tier === 'pro' ? 'PRO 🚀' : 'FREE'}</div>
          </div>
          <div className="bg-white border rounded-lg p-3 text-center min-w-[100px]">
            <div className="text-xs text-muted-foreground uppercase font-bold">Crédits</div>
            <div className="font-bold">{userProfile.credits}</div>
          </div>
        </div>
      </div>

      {/* Bouton Upgrade si Free */}
      {userProfile.tier === "free" && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex justify-between items-center">
          <p className="text-indigo-800 text-sm">Passez PRO pour des générations illimitées et l'export PDF.</p>
          <form action={async () => { "use server"; await createCheckoutSession(user.email!, user.id) }}>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Passer PRO (19€)</Button>
          </form>
        </div>
      )}

      {/* LE COEUR DU RÉACTEUR : Formulaire d'Intake */}
      <div className="bg-white border rounded-xl shadow-sm p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-4">Nouvelle Idée</h2>
        <IntakeForm credits={userProfile.credits} />
      </div>

    </div>
  )
}