import { signout } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log("🔍 Vérification accès Dashboard...")

  // 1. Connexion Supabase Côté Serveur
  const supabase = await createClient()
  
  // 2. Récupération de l'utilisateur
  const { data: { user }, error } = await supabase.auth.getUser()

  // 3. Gestion des erreurs (Debugging)
  if (error) {
    console.error("❌ Erreur Supabase:", error.message)
  }

  // 4. Sécurité : Si pas d'utilisateur, on éjecte vers le login
  if (!user) {
    console.log("⛔ Pas d'utilisateur connecté -> Redirection Login")
    redirect("/login")
  }

  // 5. Succès
  console.log("✅ Accès autorisé pour:", user.email)

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-50">
      {/* --- Sidebar --- */}
      <aside className="w-full md:w-64 bg-zinc-950 text-white flex flex-col justify-between border-r border-zinc-800">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🏭</span>
            <h2 className="text-xl font-bold tracking-tight">SaaS Factory</h2>
          </div>
          
          <nav className="space-y-2">
            <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md bg-zinc-800/50 text-white text-sm font-medium transition-colors hover:bg-zinc-800 hover:text-white">
              Vue d'ensemble
            </a>
            <a href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-400 text-sm font-medium transition-colors hover:bg-zinc-800 hover:text-white">
              Paramètres
            </a>
          </nav>
        </div>
        
        <div className="p-6 border-t border-zinc-800">
          <div className="mb-4 px-2">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Compte</p>
            <p className="text-sm text-zinc-300 truncate">{user.email}</p>
          </div>
          
          <form action={signout}>
            <Button variant="secondary" className="w-full justify-start text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border-zinc-700">
              🚪 Se déconnecter
            </Button>
          </form>
        </div>
      </aside>

      {/* --- Contenu Principal --- */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}