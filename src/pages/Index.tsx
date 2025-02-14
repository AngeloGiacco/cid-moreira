
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Heart, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  message: string;
}

const Index = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsGenerating(true);
      
      // Step 1: Generate audio using Edge Function
      const response = await supabase.functions.invoke('generate-voice', {
        body: { message: data.message }
      });

      if (response.error) {
        throw new Error("Failed to generate audio");
      }

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const file = new File([audioBlob], "love-note.mp3", { type: "audio/mpeg" });

      // Step 2: Upload audio to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("love_notes_audio")
        .upload(`${Date.now()}-love-note.mp3`, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("love_notes_audio")
        .getPublicUrl(uploadData.path);

      // Step 3: Create love note record
      const { data: noteData, error: noteError } = await supabase
        .from("love_notes")
        .insert({
          message: data.message,
          audio_url: publicUrl.publicUrl,
        })
        .select()
        .single();

      if (noteError) throw noteError;

      setShareId(noteData.share_id);
      setAudioUrl(publicUrl.publicUrl);
      
      toast({
        title: "Love note created!",
        description: "Your love note is ready to be shared.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to create love note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareId) return;
    const shareLink = `${window.location.origin}/note/${shareId}`;
    await navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copied!",
      description: "Share this link with your loved one.",
    });
  };

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center space-y-2">
          <Heart className="w-12 h-12 text-pink-500 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Create a Love Note</h1>
          <p className="text-gray-600">Write a message and we'll turn it into a beautiful voice message</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              {...register("message", {
                required: "Please write a message",
                minLength: {
                  value: 10,
                  message: "Message must be at least 10 characters",
                },
              })}
              placeholder="Write your love note here..."
              className="min-h-[150px] resize-none"
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Love Note"
            )}
          </Button>
        </form>

        {shareId && audioUrl && (
          <div className="space-y-4 pt-4 border-t">
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            
            <Button
              onClick={copyShareLink}
              variant="outline"
              className="w-full"
            >
              <Share2 className="mr-2" />
              Copy Share Link
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
