import { useRef } from "react";

interface Props {
  phrase: string;
  onClose: () => void;
}

/** Notificação do "Sistema" mostrada ao finalizar o treino. */
export function CelebrationCard({ phrase, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = "Terminei meu treino!";
    try {
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], text });
      } else if (nav.share) {
        await nav.share({ text });
      }
    } catch {
      // usuária cancelou o compartilhamento — tudo bem
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm p-6 text-center"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, rgba(13,22,48,0.96), rgba(7,11,24,0.97))",
          border: "1px solid rgba(56,189,248,0.55)",
          boxShadow:
            "0 0 40px -8px rgba(56,189,248,0.55), 0 0 80px -20px rgba(168,85,247,0.45), inset 0 1px 0 rgba(56,189,248,0.15)",
        }}
      >
        {/* cantos em colchete */}
        <span className="pointer-events-none absolute -left-px -top-px h-5 w-5 border-l-2 border-t-2 border-nude" />
        <span className="pointer-events-none absolute -right-px -top-px h-5 w-5 border-r-2 border-t-2 border-nude" />
        <span className="pointer-events-none absolute -left-px -bottom-px h-5 w-5 border-l-2 border-b-2 border-nude" />
        <span className="pointer-events-none absolute -right-px -bottom-px h-5 w-5 border-r-2 border-b-2 border-nude" />

        <div className="sys-label mb-2">⟢ Sistema ⟣</div>
        <h2 className="font-display text-lg text-nude glow-text tracking-widest mb-3">
          TREINO CONCLUÍDO
        </h2>

        <div
          className="mx-auto mb-4 h-px w-2/3"
          style={{ background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.7), transparent)" }}
        />

        <p className="font-serif text-2xl text-nude-warm glow-text mb-1">{phrase}</p>
        <p className="text-muted text-sm mb-5">Manda uma foto pro seu amor?</p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
        />

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-semibold tracking-wide uppercase text-sm"
          >
            Mandar foto pro amor
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-bg-deep border border-bg-border text-muted rounded-md py-2 text-sm tracking-wide"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
