import { useEffect, useState } from "react";

interface Props {
  name: string;
  gifPath?: string;
  frames?: string[];
  videoUrl?: string;
}

/** Resolve um caminho de asset respeitando o `base` do app (ex.: /Treino-N/). */
function withBase(p: string): string {
  return `${import.meta.env.BASE_URL}${p.replace(/^\//, "")}`;
}

/**
 * Extrai o ID de um vídeo do YouTube de links "assistíveis"
 * (watch?v=, youtu.be/, embed/). Retorna null pra links de busca
 * (results?search_query=) ou qualquer coisa que não seja um vídeo.
 */
function youtubeId(url?: string): string | null {
  if (!url) return null;
  const m =
    url.match(/[?&]v=([\w-]{11})/) ||
    url.match(/youtu\.be\/([\w-]{11})/) ||
    url.match(/\/embed\/([\w-]{11})/);
  return m ? m[1] : null;
}

/**
 * Mídia do exercício:
 * - `frames` (2 imagens início/fim, domínio público) → anima alternando os quadros (efeito GIF).
 * - `gifPath` → GIF embutido (some sozinho se o arquivo não existir).
 * - `videoUrl` de um vídeo do YouTube → player "clique pra tocar" embutido na tela.
 *   O iframe só carrega quando ela aperta play (mantém o app leve/offline até lá).
 *   Links de busca (results?search_query) viram só o link "Abrir no YouTube".
 */
export function ExerciseMediaBlock({ name, gifPath, frames, videoUrl }: Props) {
  const hasFrames = !!frames && frames.length >= 2;
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);

  const videoId = youtubeId(videoUrl);

  useEffect(() => {
    if (!hasFrames) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % frames!.length), 800);
    return () => clearInterval(t);
  }, [hasFrames, frames]);

  // Reseta o player ao trocar de exercício.
  useEffect(() => setPlaying(false), [videoUrl]);

  return (
    <>
      {hasFrames ? (
        <img
          src={withBase(frames![frame])}
          alt={`Demonstração: ${name}`}
          className="w-full rounded-card mb-3 bg-bg-deep object-contain"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ) : gifPath ? (
        <img
          src={withBase(gifPath)}
          alt={`Demonstração: ${name}`}
          className="w-full rounded-card mb-3"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ) : null}

      {videoId && (
        <div className="mb-3">
          {playing ? (
            <div className="relative w-full overflow-hidden rounded-card bg-black" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={`Vídeo: ${name}`}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Tocar vídeo: ${name}`}
              className="group relative block w-full overflow-hidden rounded-card bg-bg-deep border border-bg-border"
              style={{ aspectRatio: "16 / 9" }}
            >
              <img
                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-2xl text-nude border border-nude/60 transition group-hover:scale-105 group-hover:bg-black/70">
                  ▶
                </span>
              </span>
            </button>
          )}
        </div>
      )}

      {videoUrl && (
        <a href={videoUrl} target="_blank" rel="noreferrer"
           className="inline-block mb-3 text-sm text-muted underline">
          {videoId ? "Abrir no YouTube" : "▶ Ver vídeo do exercício"}
        </a>
      )}
    </>
  );
}
