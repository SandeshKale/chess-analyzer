export function CommentaryPanel({
  commentary,
  loading,
  error,
  onGenerate,
}: {
  commentary: string | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
}) {
  return (
    <div className="rounded-lg border border-brassdim/30 p-4 bg-graphite2/50 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-ivory">Coach&rsquo;s notes</h3>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="text-xs px-3 py-1 rounded border border-brass text-brass hover:bg-brass/10 disabled:opacity-40 shrink-0"
        >
          {loading ? "Thinking…" : commentary ? "Regenerate" : "Generate"}
        </button>
      </div>
      {error && <p className="text-oxblood text-sm">{error}</p>}
      {!error && commentary && (
        <p className="text-ivorydim text-sm leading-relaxed whitespace-pre-wrap">{commentary}</p>
      )}
      {!error && !commentary && !loading && (
        <p className="text-ivorydim/60 text-sm italic">
          Runs your game&rsquo;s flagged moments through Groq (llama-3.3-70b) for plain-English
          coaching. Needs GROQ_API_KEY set — see README.
        </p>
      )}
    </div>
  );
}
