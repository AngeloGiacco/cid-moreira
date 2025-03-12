import { FC, useState, useEffect } from "react";

export const Footer: FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = [
    "/elevenreader.webp",
    "/elevenreader2.webp",
    "/elevenreader3.webp",
    "/elevenreader4.webp",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(timer);
  }, []);

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
      {/* Download Buttons */}
      <ul className="flex flex-wrap items-center justify-center gap-4">
        <li>
          <a
            className="download-button inline-flex items-center gap-2"
            href="https://play.google.com/store/apps/details?id=io.elevenlabs.readerapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Baixar para Android
          </a>
        </li>
        <li>
          <a
            className="download-button inline-flex items-center gap-2 text-white"
            href="https://apps.apple.com/us/app/elevenlabs-reader-ai-audio/id6479373050"
            target="_blank"
            rel="noopener noreferrer"
          >
            Baixar para iOS
          </a>
        </li>
      </ul>

      {/* App Screenshots Grid/Slideshow */}
      <div className="relative w-full max-w-5xl mx-auto mb-8">
        <div className="hidden md:grid grid-cols-4 gap-4 h-[400px]">
          {images.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`ElevenReader App Screenshot ${index + 1}`}
              className="w-full h-full object-contain"
            />
          ))}
        </div>
        
        <div className="md:hidden relative w-full max-w-md mx-auto h-[400px]">
          {images.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`ElevenReader App Screenshot ${index + 1}`}
              className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-500 ${
                currentImageIndex === index ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 