interface Props {
  name: string;
  gifPath?: string;
  videoUrl?: string;
}

/** GIF embutido (some sozinho se o arquivo não existir) + link de vídeo do YouTube. */
export function ExerciseMediaBlock({ name, gifPath, videoUrl }: Props) {
  return (
    <>
      {gifPath && (
        <img
          src={gifPath}
          alt={`Demonstração: ${name}`}
          className="w-full rounded-card mb-3"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}
      {videoUrl && (
        <a href={videoUrl} target="_blank" rel="noreferrer"
           className="inline-block mb-3 text-nude underline">▶ Ver vídeo do exercício</a>
      )}
    </>
  );
}
