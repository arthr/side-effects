function App() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-text-primary mb-8">
        Side Effects - Pill Roulette
      </h1>
      
      <p className="text-text-secondary mb-8">
        Tailwind CSS v4 configurado com sucesso!
      </p>

      {/* Test Pill Colors */}
      <div className="flex gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-pill-safe flex items-center justify-center text-white font-bold">
          SAFE
        </div>
        <div className="w-16 h-16 rounded-full bg-pill-dmg-low flex items-center justify-center text-white font-bold text-xs">
          DMG
        </div>
        <div className="w-16 h-16 rounded-full bg-pill-dmg-high flex items-center justify-center text-white font-bold text-xs">
          HIGH
        </div>
        <div className="w-16 h-16 rounded-full bg-pill-fatal flex items-center justify-center text-white font-bold text-xs">
          FATAL
        </div>
        <div className="w-16 h-16 rounded-full bg-pill-heal flex items-center justify-center text-white font-bold">
          HEAL
        </div>
        <div className="w-16 h-16 rounded-full bg-pill-hidden flex items-center justify-center text-white font-bold">
          ?
        </div>
      </div>

      {/* Test Health Colors */}
      <div className="flex gap-4 mb-8">
        <div className="h-4 w-32 bg-health-full rounded-full" />
        <div className="h-4 w-32 bg-health-mid rounded-full" />
        <div className="h-4 w-32 bg-health-low rounded-full" />
      </div>

      {/* Test Accent Button */}
      <button className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors glow-accent">
        Iniciar Jogo
      </button>
    </div>
  )
}

export default App
