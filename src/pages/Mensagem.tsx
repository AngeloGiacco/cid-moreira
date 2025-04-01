import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, Share2, Mail, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/utils/sharing";
import { Footer } from "@/components/Footer";

interface Note {
  message: string;
  audio_url: string | null;
  sender_name: string;
  receiver_name: string;
  generated_text: string | null;
}

const Note = () => {
  const { shareId } = useParams();
  const { toast } = useToast();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    console.log("Effect triggered, shareId:", shareId);

    const fetchNote = async () => {
      try {
        console.log("Fetching note for shareId:", shareId);
        const { data, error } = await supabase
          .from("messages")
          .select("message, audio_url, sender_name, receiver_name, generated_text")
          .eq("share_id", shareId)
          .single();
        console.log("Supabase response:", { data, error });
        if (error) throw error;
        setNote(data);
      } catch (error) {
        console.error("Error fetching note:", error);
        toast({
          title: "Error",
          description: "Could not find the love note.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (shareId) {
      fetchNote();
    } else {
      console.log("No shareId provided");
    }
  }, [shareId, toast]);

  const handleCopyLink = async () => {
    if (!shareId) return;
    await copyToClipboard(shareId);
    toast({
      title: "Link copiado!",
      description: "Compartilhe este link com seus amigos.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-texture">
        <div className="animate-pulse">
          <Heart className="w-12 h-12 text-primary-accent" />
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-texture">
        <div className="text-center space-y-4">
          <Heart className="w-12 h-12 text-primary-accent" />
          <h1 className="text-2xl font-semibold text-primary">
            Mensagem Não Encontrada
          </h1>
          <p className="text-primary/80">
            Esta mensagem não existe ou foi removida.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-texture">
      <div className="w-full max-w-3xl p-10 space-y-10 bg-card rounded-lg shadow-soft">
        <div className="text-center space-y-3">
          <div className="flex flex-col items-center gap-4">
            <img 
              src="/cidmoreira.png" 
              alt="Cid Moreira" 
              className="w-32 h-32 rounded-full object-cover border-2 border-primary/20 object-top"
            />
          </div>
          <h1 className="text-3xl font-serif text-primary">
            Recados da Bíblia
          </h1>
          <h3 className="text-lg font-medium text-primary/80">
            The God's Voice na voz eterna de Cid Moreira
          </h3>
          <div className="text-sm text-muted-foreground mt-4">
            <span className="font-medium text-primary/90">{note.sender_name}</span>
            <span className="mx-1">enviou esta mensagem para</span>
            <span className="font-medium text-primary/90">{note.receiver_name}</span>
          </div>
        </div>

        <div className="space-y-8">
          {note.audio_url && (
            <div className="space-y-3 p-4 bg-message rounded-md border border-primary/20">
              <p className="text-sm text-center text-primary font-medium">
                Ouça a mensagem na voz de Cid Moreira
              </p>
              <div className="audio-container bg-primary-accent/10 p-4 rounded-lg border border-primary-accent/20 shadow-inner">
                <audio 
                  controls 
                  className="w-full audio-player"
                  preload="metadata"
                >
                  <source src={note.audio_url} type="audio/mpeg" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
              <div className="flex justify-center mt-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-primary hover:text-primary-accent transition-colors"
                >
                  {showTranscript ? "Ocultar transcrição" : "Ver transcrição"}
                </Button>
              </div>
            </div>
          )}

          {note.audio_url && showTranscript && (
            <div className="p-8 bg-message rounded-md relative">
              <p className="text-primary/90 text-lg leading-relaxed font-serif">
                {note.generated_text}
              </p>
              <div className="absolute top-3 left-3 text-3xl text-primary/20 font-serif">"</div>
              <div className="absolute bottom-3 right-3 text-3xl text-primary/20 font-serif">"</div>
            </div>
          )}

          {!note.audio_url && (
            <div className="p-8 bg-message rounded-md relative">
              <p className="text-primary/90 text-lg leading-relaxed font-serif">
                "{note.generated_text}"
              </p>
              <div className="absolute top-3 left-3 text-3xl text-primary/20 font-serif">"</div>
              <div className="absolute bottom-3 right-3 text-3xl text-primary/20 font-serif">"</div>
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-border/50 space-y-8">
          <div className="text-center space-y-4">
            <p className="text-lg text-primary/80">
              Quer enviar uma mensagem para alguém especial?
              <span className="block mt-2 text-lg text-primary">Totalmente grátis</span>
            </p>
            <a 
              href="/"
              className="inline-flex items-center px-8 py-3.5 bg-primary/90 hover:bg-primary/80 text-primary-foreground rounded-md transition-colors duration-200 font-medium shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)] hover:shadow-[0_3px_12px_-2px_rgba(0,0,0,0.2)]"
            >
              ✨ Crie sua mensagem clicando aqui!! 
            </a>
          </div>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Note;
