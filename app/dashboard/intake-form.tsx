'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { generateStrategy } from "@/app/actions/ai-strategist"

export function IntakeForm({ credits }: { credits: number }) {
  const [idea, setIdea] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function handleSubmit() {
    if (!idea.trim()) return
    if (credits <= 0) {
      alert("Crédits épuisés ! Passez Pro.")
      return
    }

    setIsLoading(true)
    setResult(null)

    // Appel à l'Agent Server-Side
    const response = await generateStrategy(idea)

    if (response.success) {
      setResult(response.data)
    } else {
      alert("Erreur: " + response.error)
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      
      {/* Zone de Saisie */}
      <div className="space-y-2">
        <textarea
          disabled={isLoading}
          className="w-full min-h-[150px] p-4 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black resize-none"
          placeholder="Décrivez votre idée de SaaS ici... (ex: Une app pour les dentistes qui automatise les rappels par WhatsApp en utilisant l'IA...)"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Soyez précis pour un meilleur résultat.</span>
          <span>{idea.length} caractères</span>
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={isLoading || !idea.trim()} 
        className="w-full h-12 text-lg"
      >
        {isLoading ? "L'Agent Stratège réfléchit... 🧠" : "Générer la Stratégie 🚀"}
      </Button>

      {/* Affichage du Résultat (JSON rendu joli) */}
      {result && (
        <div className="mt-8 border-t pt-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-zinc-50 border rounded-xl p-6 space-y-6">
            
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-bold text-zinc-900">{result.project_name}</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${result.viability_score > 70 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                Score: {result.viability_score}/100
              </div>
            </div>

            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-800">
              <span className="font-bold">🔥 Brutal Feedback :</span> {result.brutal_feedback}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-zinc-700 mb-2">🎯 Pivot Océan Bleu</h4>
                <p className="text-sm text-zinc-600">{result.blue_ocean_pivot}</p>
              </div>
              <div>
                <h4 className="font-semibold text-zinc-700 mb-2">💰 Business Model</h4>
                <p className="text-sm text-zinc-600">{result.monetization}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-700 mb-2">🛠️ MVP Features (Strict)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-600">
                {result.mvp_features.map((feat: string, i: number) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}