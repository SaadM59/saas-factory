import React from 'react';
import { Sparkle, Heart, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button" // On utilise le bouton Shadcn pour le style
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="font-sans min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-32">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            L'adoption facile, rapide et pleine d'amour avec PurrMatch
          </h1>
          <p className="text-xl md:text-2xl mb-10 opacity-90">
            Simplifiez votre processus d'adoption et trouvez le compagnon purrfait !
          </p>
          <div className="flex justify-center gap-4">
            <Link href="https://tally.so/r/ton-formulaire" target="_blank"></Link>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 h-auto">
              Commencer l'aventure
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Pourquoi choisir PurrMatch ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Profils détaillés</h3>
              <p className="text-gray-600 leading-relaxed">
                Explorez les profils détaillés des chats disponibles à l'adoption avec leur localisation géographique pour plus de facilité.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={32} className="text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Compatibilité optimisée</h3>
              <p className="text-gray-600 leading-relaxed">
                Découvrez notre système unique de compatibilité entre adoptants et chats, basé sur votre style de vie.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkle size={32} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Intégration Refuges</h3>
              <p className="text-gray-600 leading-relaxed">
                Restez informé en temps réel des disponibilités des animaux grâce à notre intégration avec les refuges partenaires.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Plans simples</h2>
            <p className="text-xl text-gray-600">Choisissez l'offre qui correspond à votre recherche.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Plan Gratuit */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold mb-2">Explorateur</h3>
              <div className="text-4xl font-extrabold mb-6">Gratuit</div>
              <p className="text-gray-600 mb-8 min-h-[60px]">Accédez aux profils de base et explorez les chats disponibles près de chez vous.</p>
              <Button className="w-full bg-gray-900 hover:bg-gray-800" size="lg">
                S'inscrire
              </Button>
            </div>

            {/* Plan Premium */}
            <div className="bg-purple-50 p-8 rounded-2xl border-2 border-purple-500 shadow-lg relative">
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAIRE
              </div>
              <h3 className="text-2xl font-bold mb-2 text-purple-900">Premium</h3>
              <div className="text-4xl font-extrabold mb-6 text-purple-900">9.99€<span className="text-lg font-normal text-purple-700">/mois</span></div>
              <p className="text-purple-800 mb-8 min-h-[60px]">Accès prioritaire aux nouvelles adoptions, alertes instantanées et support dédié.</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" size="lg">
                Devenir Premium
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">PurrMatch 🐱</div>
          <p className="text-gray-400">&copy; 2026 PurrMatch. Fait avec ❤️ par SaaS Factory.</p>
        </div>
      </footer>
    </div>
  );
}