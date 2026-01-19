import { Button } from "@/components/ui/button"

export default function Home() {
  const isSupabaseConnected = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">SaaS Factory 🏭</h1>
        <p className="mt-2 text-muted-foreground">Design System chargé.</p>
        
        {/* Verification VISUELLE */}
        <div className={`mt-4 p-4 rounded border ${isSupabaseConnected ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700"}`}>
          Supabase Status : {isSupabaseConnected ? "CONNECTÉ ✅" : "DÉCONNECTÉ ❌"}
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button>Bouton Principal</Button>
        <Button variant="outline">Bouton Secondaire</Button>
        <Button variant="destructive">Danger</Button>
      </div>
    </main>
  )
}