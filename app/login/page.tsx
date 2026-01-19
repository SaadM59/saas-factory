import { login, signup } from './actions'
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <form className="flex w-full max-w-md flex-col gap-4 rounded-lg border bg-white p-8 shadow-sm animate-in fade-in">
        <h1 className="mb-4 text-2xl font-bold text-center">Bienvenue</h1>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input className="rounded-md border p-2" id="email" name="email" type="email" required placeholder="you@example.com" />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="password">Mot de passe</label>
          <input className="rounded-md border p-2" id="password" name="password" type="password" required placeholder="••••••••" />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button formAction={login}>Se connecter</Button>
          <Button formAction={signup} variant="outline">S'inscrire</Button>
        </div>
      </form>
    </div>
  )
}