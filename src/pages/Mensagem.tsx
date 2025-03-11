import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, Share2, Mail, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { copyToClipboard, shareViaEmail, shareViaWhatsApp } from "@/utils/sharing";
import { Footer } from "@/components/Footer";

interface Note {
  message: string;
  audio_url: string | null;
  sender_name: string;
  receiver_name: string;
}

const Note = () => {
  const { shareId } = useParams();
  const { toast } = useToast();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Effect triggered, shareId:", shareId);

    const fetchNote = async () => {
      try {
        console.log("Fetching note for shareId:", shareId);
        const { data, error } = await supabase
          .from("messages")
          .select("message, audio_url, sender_name, receiver_name")
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

  const handleEmailShare = () => {
    if (!shareId) return;
    shareViaEmail(shareId);
  };

  const handleWhatsAppShare = () => {
    if (!shareId) return;
    shareViaWhatsApp(shareId);
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
          <div className="flex justify-center">
            <Heart className="w-8 h-8 text-primary-accent opacity-80" />
          </div>
          <h1 className="text-3xl font-serif text-primary">
            Recados da Bíblia
          </h1>
          <h3 className="text-lg font-medium text-primary/80">
            The God's Voice na voz de Cid Moreira
          </h3>
          <div className="text-sm text-muted-foreground mt-4">
            <span className="font-medium text-primary/90">{note.sender_name}</span>
            <span className="mx-1">enviou esta mensagem para</span>
            <span className="font-medium text-primary/90">{note.receiver_name}</span>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-message rounded-md relative">
            <p className="text-primary/90 text-lg leading-relaxed font-serif">
              "{note.message}"
            </p>
            <div className="absolute top-3 left-3 text-3xl text-primary/20 font-serif">"</div>
            <div className="absolute bottom-3 right-3 text-3xl text-primary/20 font-serif">"</div>
          </div>

          {note.audio_url && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-center text-muted-foreground font-medium">
                Ouça esta mensagem
              </p>
              <div className="audio-container">
                <audio 
                  controls 
                  className="w-full audio-player"
                >
                  <source src={note.audio_url} type="audio/mpeg" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-border/50 space-y-8">
          <div className="text-center space-y-6">
            <p className="text-lg text-primary/80 font-medium">
              Quer enviar uma mensagem para alguém especial?
            </p>
            <a 
              href="/"
              className="inline-block px-8 py-4 bg-primary-accent hover:bg-primary-accent/90 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
            >
              ✨ Criar minha mensagem agora!
            </a>
          </div>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Note;
