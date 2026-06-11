import { useEffect, useState } from "react";

interface Props {
  name: string;
  gifPath?: string;
  frames?: string[];
  videoUrl?: string;
}

/**
 * Mídia do exercício:
 * - `frames` (2 imagens início/fim, domínio público) → anima alternando os quadros (efeito GIF).
 * - `gifPath` → GIF embutido (some sozinho se o arquivo não existir).
 * - `videoUrl` → link de vídeo do YouTube.
 */
export function ExerciseMediaBlock({ name, gifPath, frames, videoUrl }: Props) {
  const hasFrames = !!frames && frames.length >= 2;
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!hasFrames) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % frames!.length), 800);
    return () => clearInterval(t);
  }, [hasFrames, frames]);

  return (
    <>
      {hasFrames ? (
        <img
          src={frames![frame]}
          alt={`Demonstração: ${name}`}
          className="w-full rounded-card mb-3 bg-bg-deep object-contain"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ) : gifPath ? (
        <img
          src={gifPath}
          alt={`Demonstração: ${name}`}
          className="w-full rounded-card mb-3"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ) : null}
      {videoUrl && (
        <a href={videoUrl} target="_blank" rel="noreferrer"
           className="inline-block mb-3 text-nude underline">▶ Ver vídeo do exercício</a>
      )}
    </>
  );
}
