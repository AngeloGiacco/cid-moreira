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
    <div className="pt-4 border-t border-border/50 text-center space-y-10">
      {/* GOL Voice and ElevenLabs logos with "powered by" text */}
      <div className="flex flex-col items-center justify-center gap-4">
        <img 
          src="/gol-voice.png" 
          alt="GOL Voice" 
          className="h-24 w-auto"
        />
        
        <div className="flex items-center gap-3">
          <span className="text-sm">powered by</span>
          <a 
            href="https://elevenreader.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <img 
              src="/elevenlabs-logo-black.svg" 
              alt="ElevenLabs" 
              className="h-6 w-auto"
            />
          </a>
        </div>
      </div>
      
      <p className="text-md text-muted-foreground max-w-md mx-auto my-6">
        Transforme qualquer livro, artigo, PDF, newsletter ou texto em áudio com narração ultra realista em um único aplicativo
      </p>

      {/* QR Code Section */}
      <div className="flex flex-col items-center justify-center gap-4 my-8">
        <img 
          src="/download_image.png" 
          alt="Escaneie para instalar ElevenReader"
          className="h-40 w-40"
        />
        <p className="text-sm text-muted-foreground">Escaneie para instalar ElevenReader</p>
      </div>
      
      {/* Download Buttons */}
      <ul className="flex flex-wrap items-center justify-center gap-6 my-8">
        <li>
          <a
            className="download-button inline-flex items-center gap-2 px-6 py-3"
            href="https://elevenreader.sng.link/Ec0cy/d8bg2?_dl=elevenlabs%3A%2F%2Fcollection%2Fpartner%3Acid-moreira&_smtype=3"
            target="_blank"
            rel="noopener noreferrer"
          >
            Baixar para Android
          </a>
        </li>
        <li>
          <a
            className="download-button inline-flex items-center gap-2 text-white px-6 py-3"
            href="https://elevenreader.sng.link/Ec0cy/d8bg2?_dl=elevenlabs%3A%2F%2Fcollection%2Fpartner%3Acid-moreira&_smtype=3"
            target="_blank"
            rel="noopener noreferrer"
          >
            Baixar para iOS
          </a>
        </li>
      </ul>


      {/* App Screenshots Grid/Slideshow */}
      <div className="relative w-full my-12 mb-10">
        <div className="hidden md:grid grid-cols-4 gap-6 h-[450px]">
          {images.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`ElevenReader App Screenshot ${index + 1}`}
              className="w-full h-full object-contain rounded-md"
            />
          ))}
        </div>
        
        <div className="md:hidden relative w-screen -mx-4 h-[550px]">
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