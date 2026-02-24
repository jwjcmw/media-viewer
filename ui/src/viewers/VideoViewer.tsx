interface Props {
  source: string;
}

function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (
      (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") &&
      u.searchParams.has("v")
    ) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
  } catch {
    // not a URL
  }
  return null;
}

function toVimeoEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (
      (u.hostname === "vimeo.com" || u.hostname === "www.vimeo.com") &&
      /^\/\d+/.test(u.pathname)
    ) {
      return `https://player.vimeo.com/video${u.pathname}`;
    }
  } catch {
    // not a URL
  }
  return null;
}

export default function VideoViewer({ source }: Props) {
  const ytEmbed = toYouTubeEmbed(source);
  if (ytEmbed) {
    return (
      <iframe
        src={ytEmbed}
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  const vimeoEmbed = toVimeoEmbed(source);
  if (vimeoEmbed) {
    return (
      <iframe
        src={vimeoEmbed}
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // Local file or direct URL
  const videoSrc = source.startsWith("/") ? `file://${source}` : source;

  return <video src={videoSrc} controls className="w-full h-full" />;
}
