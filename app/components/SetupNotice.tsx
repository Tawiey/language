export default function SetupNotice() {
  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="max-w-md rounded-3xl bg-surface/70 p-7 shadow-card">
        <div className="font-display text-3xl font-black text-ink">
          Phrase<span className="text-ochre">Duel</span>
        </div>
        <p className="mt-3 text-ink/80">
          Almost there! This app needs its shared database connected.
        </p>
        <p className="mt-3 text-sm text-ink/70">
          Set these environment variables on the deployment, then redeploy:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-bark/90 p-4 text-xs text-cream">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...`}
        </pre>
      </div>
    </main>
  );
}
