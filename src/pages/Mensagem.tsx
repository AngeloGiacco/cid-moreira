import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface LoveNote {
  message: string;
  audio_url: string | null;
  sender_name: string;
  receiver_name: string;
}

const Note = () => {
  const { shareId } = useParams();
  const { toast } = useToast();
  const [note, setNote] = useState<LoveNote | null>(null);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-pulse">
          <Heart className="w-12 h-12 text-blue-300" />
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4">
          <Heart className="w-12 h-12 text-blue-500 mx-auto" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Mensagem Não Encontrada
          </h1>
          <p className="text-gray-600">
            Esta mensagem não existe ou foi removida.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center space-y-2">
          <Heart className="w-12 h-12 text-blue-500 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">
            Recados da Bíblia
          </h1>
          <h3 className="text-xl font-bold text-gray-900">
            The God's Voice na voz de Cid Moreira
          </h3>
          <p className="text-gray-600">
            Uma mensagem de <span className="font-semibold">{note.sender_name}</span> para <span className="font-semibold">{note.receiver_name}</span>
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-800 text-lg leading-relaxed italic">
              "{note.message}"
            </p>
          </div>

          {note.audio_url && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">
                Ouça esta mensagem
              </p>
              <audio controls className="w-full">
                <source src={note.audio_url} type="audio/mpeg" />
                Seu navegador não suporta o elemento de áudio.
              </audio>
            </div>
          )}
        </div>

        <div className="pt-8 border-t text-center space-y-6">          
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
          <ul className="flex items-center justify-center gap-x-8">
            <li>
              <a
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors"
                href="https://play.google.com/store/apps/details?id=io.elevenlabs.readerapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                Baixar para Android
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-black text-white px-6 py-2 hover:bg-blue-700 transition-colors"
                href="https://apps.apple.com/us/app/elevenlabs-reader-ai-audio/id6479373050"
                target="_blank"
                rel="noopener noreferrer"
              >
                Baixar para iOS
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Note;
