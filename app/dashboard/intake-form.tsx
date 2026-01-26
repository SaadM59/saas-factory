'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { generateStrategy } from "@/app/actions/ai-strategist"
import { generateArchitecture } from "@/app/actions/ai-architect"
import { generateLandingPage } from "@/app/actions/ai-coder"
import { generateFeatureCode } from "@/app/actions/ai-feature" // Import du nouvel agent

export function IntakeForm({ credits }: { credits: number }) {
  // --- ETATS GLOBAUX ---
  const [idea, setIdea] = useState("")
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

  // --- ETATS AGENTS ---
  const [isStratLoading, setStratLoading] = useState(false)
  const [stratResult, setStratResult] = useState<any>(null)

  const [isArchLoading, setArchLoading] = useState(false)
  const [archResult, setArchResult] = useState<any>(null)

  const [isCoderLoading, setCoderLoading] = useState(false)
  const [coderResult, setCoderResult] = useState<any>(null)

  // --- NOUVEAU : ETAT FEATURE BUILDER ---
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [isFeatureLoading, setFeatureLoading] = useState(false)
  const [featureResult, setFeatureResult] = useState<any>(null)

  // 1. STRATÈGE
  async function handleStrategist() {
    if (!idea.trim()) return
    setStratLoading(true)
    setStratResult(null); setArchResult(null); setCoderResult(null); setFeatureResult(null);
    
    const response = await generateStrategy(idea)
    if (response.success) {
      setStratResult(response.data)
      setCurrentProjectId(response.projectId ?? null)
    } else {
      alert(response.error)
    }
    setStratLoading(false)
  }

  // 2. ARCHITECTE
  async function handleArchitect() {
    if (!currentProjectId) return
    setArchLoading(true)
    const response = await generateArchitecture(currentProjectId)
    if (response.success) setArchResult(response.data)
    else alert(response.error)
    setArchLoading(false)
  }

  // 3. CODEUR LANDING
  async function handleCoder() {
    if (!currentProjectId) return
    setCoderLoading(true)
    const response = await generateLandingPage(currentProjectId)
    if (response.success) setCoderResult(response.data)
    else alert(response.error)
    setCoderLoading(false)
  }

  // 4. FEATURE BUILDER (Nouveau)
  async function handleBuildFeature(title: string, desc: string) {
    if (!currentProjectId) return
    setActiveFeature(title)
    setFeatureLoading(true)
    setFeatureResult(null) // Reset pour réaffichage propre

    const response = await generateFeatureCode(currentProjectId, title, desc)
    
    if (response.success) {
      setFeatureResult(response.data)
    } else {
      alert("Erreur Builder: " + response.error)
    }
    setFeatureLoading(false)
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* ZONE DE SAISIE */}
      <div className="space-y-2">
        <textarea
          disabled={isStratLoading}
          className="w-full min-h-[100px] p-4 rounded-md border border-zinc-200 focus:ring-2 focus:ring-black resize-none"
          placeholder="Décrivez votre idée..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
      </div>

      <Button onClick={handleStrategist} disabled={isStratLoading || !idea.trim()} className="w-full h-12 text-lg">
        {isStratLoading ? "Analyse en cours..." : "1. Lancer l'Usine 🚀"}
      </Button>

      {/* RÉSULTATS */}
      {stratResult && (
        <div className="mt-8 border-t pt-8 animate-in fade-in">
          <div className="bg-zinc-50 border rounded-xl p-6 space-y-6">
            <h3 className="text-2xl font-bold">{stratResult.project_name} <span className="text-sm font-normal bg-green-100 text-green-800 px-2 py-1 rounded">Score: {stratResult.viability_score}</span></h3>
            <p className="text-red-700 bg-red-50 p-3 rounded text-sm font-medium">{stratResult.brutal_feedback}</p>

            {/* SECTION ARCHITECTURE */}
            <div className="border-t border-zinc-200 pt-6">
               {!archResult ? (
                 <Button onClick={handleArchitect} disabled={isArchLoading} variant="secondary" className="w-full border-zinc-300">
                   {isArchLoading ? "Architecture en cours..." : "2. Générer le Plan Technique 🏗️"}
                 </Button>
               ) : (
                 <div className="space-y-6">
                   
                   {/* BOUTON LANDING PAGE */}
                   {!coderResult ? (
                      <Button onClick={handleCoder} disabled={isCoderLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                        {isCoderLoading ? "Coding..." : "3. Générer la Landing Page 🎨"}
                      </Button>
                   ) : (
                      <div className="bg-indigo-50 p-4 rounded border border-indigo-200 flex justify-between items-center">
                        <span className="text-indigo-900 font-medium">Landing Page prête !</span>
                        <Button size="sm" onClick={() => navigator.clipboard.writeText(coderResult.landing_page_tsx)}>Copier le Code</Button>
                      </div>
                   )}

                   {/* LISTE DES FEATURES À CONSTRUIRE */}
                   <div className="bg-zinc-900 text-zinc-50 p-4 rounded-lg">
                     <h4 className="font-bold text-yellow-400 mb-4 flex items-center gap-2">
                       <span>🛠️</span> Atelier de Construction (Backend & Frontend)
                     </h4>
                     
                     <div className="space-y-4">
                       {archResult.user_stories.map((story: any, i: number) => (
                         <div key={i} className="p-4 bg-black rounded border border-zinc-800">
                           <div className="flex justify-between items-start gap-4 mb-2">
                             <div>
                               <div className="font-bold text-white text-sm">{story.title}</div>
                               <p className="text-zinc-400 text-xs mt-1">{story.description}</p>
                             </div>
                             <Button 
                               size="sm" 
                               onClick={() => handleBuildFeature(story.title, story.description)}
                               disabled={isFeatureLoading}
                               className="bg-zinc-700 hover:bg-zinc-600 text-[10px] h-8 px-3"
                             >
                               {isFeatureLoading && activeFeature === story.title ? "Construction..." : "🔨 Coder cette Feature"}
                             </Button>
                           </div>

                           {/* ZONE D'AFFICHAGE DU CODE GÉNÉRÉ */}
                           {featureResult && activeFeature === story.title && (
                             <div className="mt-3 pt-3 border-t border-zinc-800 animate-in fade-in">
                               <p className="text-green-400 text-xs font-mono mb-2">✅ {featureResult.instructions}</p>
                               <div className="grid grid-cols-1 gap-2">
                                 <div className="relative">
                                   <div className="text-[10px] text-zinc-500 mb-1 uppercase font-bold">Server Action (Backend)</div>
                                   <Button 
                                     size="sm" variant="outline" className="w-full text-xs h-7 bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                                     onClick={() => navigator.clipboard.writeText(featureResult.server_action_ts)}
                                   >
                                     📋 Copier le code Serveur
                                   </Button>
                                 </div>
                                 <div className="relative">
                                   <div className="text-[10px] text-zinc-500 mb-1 uppercase font-bold">Composant React (Frontend)</div>
                                   <Button 
                                     size="sm" variant="outline" className="w-full text-xs h-7 bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                                     onClick={() => navigator.clipboard.writeText(featureResult.component_tsx)}
                                   >
                                     📋 Copier le code Client
                                   </Button>
                                 </div>
                               </div>
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
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