import { NextResponse } from "next/server"
import { generateStrategy } from "@/app/actions/ai-strategist"
import { generateArchitecture } from "@/app/actions/ai-architect"
import { generateLandingPage } from "@/app/actions/ai-coder"
import { prisma } from "@/lib/prisma"

// Clé secrète pour que seul TON script puisse lancer l'usine
const FACTORY_SECRET = process.env.FACTORY_SECRET || "changeme"

export async function POST(req: Request) {
  // 1. Sécurité : Vérifier que c'est bien toi (via le Script)
  const authHeader = req.headers.get("x-factory-secret")
  if (authHeader !== FACTORY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { step, payload } = body

  // 2. Orchestrateur : Quelle étape de l'usine activer ?
  try {
    switch (step) {
      case "INIT": // Étape 1 : Stratégie
        console.log("🏭 Factory: Init Strategy pour", payload.idea)
        const stratRes = await generateStrategy(payload.idea)
        return NextResponse.json(stratRes)

      case "ARCHITECT": // Étape 2 : Plan Technique
        console.log("🏭 Factory: Architecture pour Project ID", payload.projectId)
        const archRes = await generateArchitecture(payload.projectId)
        return NextResponse.json(archRes)

      case "CODE_LANDING": // Étape 3 : Code React
        console.log("🏭 Factory: Coding Landing pour Project ID", payload.projectId)
        const codeRes = await generateLandingPage(payload.projectId)
        return NextResponse.json(codeRes)

      default:
        return NextResponse.json({ error: "Unknown step" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("❌ Factory Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}