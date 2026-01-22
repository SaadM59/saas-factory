'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
// Import des 3 cerveaux
import { generateStrategy } from "@/app/actions/ai-strategist"
import { generateArchitecture } from "@/app/actions/ai-architect"
import { generateLandingPage } from "@/app/actions/ai-coder"

export function IntakeForm({ credits }: { credits: number }) {
  // --- ETATS GLOBAUX ---
  const [idea, setIdea] = useState("")
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

  // --- ETAT AGENT 1 (STRATÈGE) ---
  const [isStratLoading, setStratLoading] = useState(false)
  const [stratResult, setStratResult] = useState<any>(null)

  // --- ETAT AGENT 2 (ARCHITECTE) ---
  const [isArchLoading, setArchLoading] = useState(false)
  const [archResult, setArchResult] = useState<any>(null)

  // --- ETAT AGENT 3 (CODEUR) ---
  const [isCoderLoading, setCoderLoading] = useState(false)
  const [coderResult, setCoderResult] = useState<any>(null)

  // 1. ACTION : LANCER LE STRATÈGE
  async function handleStrategist() {
    if (!idea.trim()) return
    if (credits <= 0) {
      alert("Crédits épuisés ! Passez Pro.")
      return
    }

    setStratLoading(true)
    // On reset les étapes suivantes si on relance
    setStratResult(null)
    setArchResult(null)
    setCoderResult(null)

    const response = await generateStrategy(idea)

    if (response.success) {
      setStratResult(response.data)
      setCurrentProjectId(response.projectId ?? null)
    } else {
      alert("Erreur Stratège : " + response.error)
    }
    setStratLoading(false)
  }

  // 2. ACTION : LANCER L'ARCHITECTE
  async function handleArchitect() {
    if (!currentProjectId) return
    
    setArchLoading(true)
    const response = await generateArchitecture(currentProjectId)
    
    if (response.success) {
      setArchResult(response.data)
    } else {
      alert("Erreur Architecte : " + response.error)
    }
    setArchLoading(false)
  }

  // 3. ACTION : LANCER LE CODEUR
  async function handleCoder() {
    if (!currentProjectId) return

    setCoderLoading(true)
    const response = await generateLandingPage(currentProjectId)

    if (response.success) {
      setCoderResult(response.data)
    } else {
      alert("Erreur Codeur : " + response.error)
    }
    setCoderLoading(false)
  }

  // --- RENDU VISUEL ---
  return (
    <div className="space-y-6">
      
      {/* ZONE DE SAISIE */}
      <div className="space-y-2">
        <textarea
          disabled={isStratLoading}
          className="w-full min-h-[150px] p-4 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black resize-none"
          placeholder="Décrivez votre idée de SaaS ici... (ex: Un Tinder pour adopter des chats...)"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Soyez précis pour un meilleur résultat.</span>
          <span>{idea.length} caractères</span>
        </div>
      </div>

      <Button 
        onClick={handleStrategist} 
        disabled={isStratLoading || !idea.trim()} 
        className="w-full h-12 text-lg"
      >
        {isStratLoading ? "L'Agent Stratège réfléchit... 🧠" : "1. Générer la Stratégie 🚀"}
      </Button>

      {/* RÉSULTAT ÉTAPE 1 : STRATÉGIE */}
      {stratResult && (
        <div className="mt-8 border-t pt-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-zinc-50 border rounded-xl p-6 space-y-6">
            
            {/* Header Stratégie */}
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-bold text-zinc-900">{stratResult.project_name}</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${stratResult.viability_score > 70 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                Score: {stratResult.viability_score}/100
              </div>
            </div>

            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-800">
              <span className="font-bold">🔥 Brutal Feedback :</span> {stratResult.brutal_feedback}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-zinc-700 mb-2">🎯 Pivot Océan Bleu</h4>
                <p className="text-sm text-zinc-600">{stratResult.blue_ocean_pivot}</p>
              </div>
              <div>
                <h4 className="font-semibold text-zinc-700 mb-2">💰 Business Model</h4>
                <p className="text-sm text-zinc-600">{stratResult.monetization}</p>
              </div>
            </div>

            {/* BOUTON ÉTAPE 2 : ARCHITECTE */}
            <div className="border-t border-zinc-200 pt-6 mt-6">
               {!archResult ? (
                 <Button 
                   onClick={handleArchitect} 
                   disabled={isArchLoading}
                   variant="secondary"
                   className="w-full border-zinc-300 h-12 text-zinc-800 hover:bg-zinc-200"
                 >
                   {isArchLoading ? "L'Architecte dessine les plans... 🏗️" : "2. Générer l'Architecture Technique ➡️"}
                 </Button>
               ) : (
                 // RÉSULTAT ÉTAPE 2 : ARCHITECTURE
                 <div className="animate-in fade-in zoom-in-95">
                   <div className="bg-zinc-900 text-zinc-50 p-6 rounded-lg font-mono text-sm overflow-x-auto shadow-xl border border-zinc-700">
                     <div className="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-700">
                        <span className="text-xl">🏗️</span>
                        <h3 className="font-bold text-white">Blueprint Technique</h3>
                     </div>

                     <h4 className="text-green-400 font-bold mb-2">// PRISMA SCHEMA</h4>
                     <pre className="text-xs text-zinc-300 mb-6 bg-black p-4 rounded max-h-40 overflow-y-auto">{archResult.prisma_schema}</pre>
                     
                     <h4 className="text-blue-400 font-bold mt-4 mb-2">// USER STORIES</h4>
                     <div className="space-y-2 max-h-40 overflow-y-auto">
                       {archResult.user_stories.map((story: any, i: number) => (
                         <div key={i} className="p-2 bg-zinc-800 rounded border border-zinc-700">
                           <div className="font-bold text-yellow-500 text-xs">{story.title}</div>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* BOUTON ÉTAPE 3 : CODEUR */}
                   <div className="mt-6">
                     {!coderResult ? (
                       <Button 
                         onClick={handleCoder} 
                         disabled={isCoderLoading}
                         className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-14 text-lg shadow-lg text-white"
                       >
                         {isCoderLoading ? "L'IA écrit le code React... 🎨" : "3. Générer la Landing Page Finale 🚀"}
                       </Button>
                     ) : (
                       // RÉSULTAT ÉTAPE 3 : CODE FINAL
                       <div className="mt-6 animate-in fade-in zoom-in-95">
                         <div className="bg-zinc-950 text-zinc-50 p-6 rounded-lg shadow-2xl border border-zinc-800">
                           <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">⚛️</span>
                                <h3 className="font-bold text-white">Code Source React</h3>
                              </div>
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => {
                                  navigator.clipboard.writeText(coderResult.landing_page_tsx)
                                  alert("Code copié dans le presse-papier !")
                                }}
                              >
                                📋 Copier le Code
                              </Button>
                           </div>
      
                           <p className="text-zinc-400 text-sm mb-4 italic border-l-2 border-indigo-500 pl-3">
                             "{coderResult.explanation}"
                           </p>
      
                           <div className="relative">
                             <pre className="text-[10px] md:text-xs text-zinc-300 bg-black p-4 rounded h-64 overflow-y-auto border border-zinc-800 font-mono">
                               {coderResult.landing_page_tsx}
                             </pre>
                           </div>
                         </div>
                         <p className="text-center text-green-600 mt-6 font-bold text-lg animate-pulse">
                           ✅ USINE TERMINÉE. PROJET PRÊT À DÉCOLLER.
                         </p>
                       </div>
                     )}
                   </div>

                 </div>
               )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}