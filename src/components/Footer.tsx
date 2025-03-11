import { FC } from "react";

export const Footer: FC = () => {
  return (
    <div className="pt-8 border-t border-border/50 text-center space-y-6">          
      <a 
        href="https://elevenreader.io" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block hover:opacity-80 transition-opacity"
      >
        <img 
          src="/elevenlabs-logo-black.svg" 
          alt="ElevenLabs" 
          className="h-5 w-auto"
        />
      </a>
      <p className="text-md text-muted-foreground max-w-md mx-auto">
        Transforme qualquer livro, artigo, PDF, newsletter ou texto em áudio com narração ultra realista em um único aplicativo
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-4">
        <li>
          <a
            className="download-button"
            href="https://play.google.com/store/apps/details?id=io.elevenlabs.readerapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Baixar para Android
          </a>
        </li>
        <li>
          <a
            className="download-button"
            href="https://apps.apple.com/us/app/elevenlabs-reader-ai-audio/id6479373050"
            target="_blank"
            rel="noopener noreferrer"
          >
            Baixar para iOS
          </a>
        </li>
      </ul>
    </div>
  );
}; 