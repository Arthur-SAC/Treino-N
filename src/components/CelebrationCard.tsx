import { useRef } from "react";

interface Props {
  phrase: string;
  onClose: () => void;
}

/** Card de comemoração mostrado ao finalizar o treino. */
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6" onClick={onClose}>
      <div
        className="bg-bg-raised border border-wine-light rounded-card w-full max-w-sm p-6 text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl text-nude-warm">{phrase}</h2>
        <p className="text-muted text-sm">Manda uma foto pro seu amor?</p>

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
            className="w-full bg-wine text-nude-warm rounded-md py-3 font-medium"
          >
            Mandar foto pro amor
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-bg-deep border border-bg-border text-muted rounded-md py-2 text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
