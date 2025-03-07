import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface LoveNote {
  message: string;
  audio_url: string | null;
}

const Note = () => {
  const { shareId } = useParams();
  const { toast } = useToast();
  const [note, setNote] = useState<LoveNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const { data, error } = await supabase
          .from("love_notes")
          .select("message, audio_url")
          .eq("share_id", shareId)
          .single();

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
            Uma Mensagem Inspirada para Você
          </h1>
          <h2 className="text-xl font-bold text-gray-900">
            Lido por{" "}
            <a
              href="https://elevenlabs.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              ElevenLabs
            </a>
          </h2>
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
      </div>
    </div>
  );
};

export default Note;
