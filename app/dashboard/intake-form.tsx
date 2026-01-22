'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { generateStrategy } from "@/app/actions/ai-strategist"
import { generateArchitecture } from "@/app/actions/ai-architect"

export function IntakeForm({ credits }: { credits: number }) {
  // Etats pour l'Agent 1 (Stratège)
  const [idea, setIdea] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

  // Etats pour l'Agent 2 (Architecte)
  const [isArchitectLoading, setArchitectLoading] = useState(false)
  const [architectResult, setArchitectResult] = useState<any>(null)

  // Lancer l'Agent 1
  async function handleSubmit() {
    if (!idea.trim()) return
    if (credits <= 0) {
      alert("Crédits épuisés ! Passez Pro.")
      return
    }

    setIsLoading(true)
    setResult(null)
    setArchitectResult(null)

    const response = await generateStrategy(idea)

    if (response.success) {
      setResult(response.data)
      setCurrentProjectId(response.projectId) // On garde l'ID pour l'étape suivante
    } else {
      alert("Erreur: " + response.error)
    }

    setIsLoading(false)
  }

  // Lancer l'Agent 2
  async function handleArchitect() {
    if (!currentProjectId) return
    
    setArchitectLoading(true)
    const response = await generateArchitecture(currentProjectId)
    
    if (response.success) {
      setArchitectResult(response.data)
    } else {
      alert("Erreur Architecte: " + response.error)
    }
    
    setArchitectLoading(false)
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
        {isLoading ? "L'Agent Stratège réfléchit... 🧠" : "Générer la Stratégie (Agent 1) 🚀"}
      </Button>

      {/* RÉSULTAT AGENT 1 : STRATÉGIE */}
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

            {/* BOUTON DÉCLENCHEUR AGENT 2 */}
            <div className="border-t border-zinc-200 pt-6 mt-6">
               {!architectResult ? (
                 <Button 
                   onClick={handleArchitect} 
                   disabled={isArchitectLoading}
                   variant="secondary"
                   className="w-full border-zinc-300 h-12 text-zinc-800 hover:bg-zinc-200"
                 >
                   {isArchitectLoading ? "L'Architecte dessine les plans... 🏗️" : "Valider & Générer l'Architecture Technique (Agent 2) ➡️"}
                 </Button>
               ) : (
                 // RÉSULTAT AGENT 2 : ARCHITECTURE
                 <div className="animate-in fade-in zoom-in-95">
                   <div className="bg-zinc-900 text-zinc-50 p-6 rounded-lg font-mono text-sm overflow-x-auto shadow-xl border border-zinc-700">
                     <div className="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-700">
                        <span className="text-xl">🏗️</span>
                        <h3 className="font-bold text-white">Blueprint Technique Généré</h3>
                     </div>

                     <h4 className="text-green-400 font-bold mb-2">// PRISMA SCHEMA (DB)</h4>
                     <pre className="text-xs text-zinc-300 mb-6 bg-black p-4 rounded">{architectResult.prisma_schema}</pre>
                     
                     <h4 className="text-blue-400 font-bold mt-4 mb-2">// USER STORIES (SPECS)</h4>
                     <div className="space-y-3">
                       {architectResult.user_stories.map((story: any, i: number) => (
                         <div key={i} className="p-3 bg-zinc-800 rounded border border-zinc-700">
                           <div className="font-bold text-yellow-500 mb-1">{story.title}</div>
                           <p className="text-zinc-400 text-xs mb-2">{story.description}</p>
                           <ul className="list-disc list-inside text-[10px] text-zinc-500">
                             {story.acceptance_criteria.map((crit: string, j: number) => (
                               <li key={j}>{crit}</li>
                             ))}
                           </ul>
                         </div>
                       ))}
                     </div>
                   </div>
                   <p className="text-center text-sm text-muted-foreground mt-4">
                     ✅ Projet sauvegardé en base de données. Prêt pour l'Agent Coder.
                   </p>
                 </div>
               )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}