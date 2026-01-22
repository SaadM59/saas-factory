'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

// Configuration du modèle
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Définition de la structure de sortie attendue (Schema Validation)
const StrategySchema = z.object({
  project_name: z.string().describe("Nom court et percutant pour le projet"),
  viability_score: z.number().min(0).max(100).describe("Score de viabilité sur 100"),
  brutal_feedback: z.string().describe("Critique honnête et directe de l'idée"),
  blue_ocean_pivot: z.string().describe("Angle d'attaque pour éviter la concurrence directe"),
  target_persona: z.string().describe("Description psychographique de la cible"),
  monetization: z.string().describe("Modèle économique suggéré"),
  mvp_features: z.array(z.string()).max(3).describe("Liste stricte des 3 fonctionnalités MVP"),
})

export async function generateStrategy(userIdea: string) {
  'use server'

  console.log("🧠 Agent Strategist activé pour :", userIdea.substring(0, 50) + "...")

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'), // Le modèle le plus intelligent actuel
      schema: StrategySchema,
      system: `
        ROLE: Tu es un Partner Senior chez Y Combinator et expert en Stratégie Océan Bleu.
        MISSION: Analyser l'idée brute d'un entrepreneur et structurer un MVP gagnant.
        TON: Brutalement honnête, direct, orienté business. Pas de complaisance.
        
        INSTRUCTIONS:
        1. Cherche la faille dans l'idée ("Pre-mortem").
        2. Propose un pivot si c'est un marché saturé.
        3. Réduis le scope au strict minimum (3 features max).
      `,
      prompt: `Voici l'idée brute : "${userIdea}"`,
    })

    return { success: true, data: object }
  } catch (error) {
    console.error("❌ Erreur IA:", error)
    return { success: false, error: "L'IA n'a pas pu analyser l'idée." }
  }
}