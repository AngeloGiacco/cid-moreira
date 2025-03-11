import { useState } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Heart, Share2, Mail, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { copyToClipboard, shareViaEmail, shareViaWhatsApp } from "@/utils/sharing";
import { Footer } from "@/components/Footer";

interface FormData {
  seuNome: string;           // maps to sender_name
  telefone: string;          // maps to phone_number
  nomeDestinatario: string;  // maps to receiver_name
  mensagem: string;          // maps to message
  tipoPassagem: string;      // used for AI generation
}

const Index = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      seuNome: "",
      telefone: "",
      nomeDestinatario: "",
      mensagem: "",
      tipoPassagem: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsGenerating(true);

      const response = await supabase.functions.invoke("generate-voice", {
        body: {
          message: data.mensagem,
          sender: data.seuNome,
          receiver: data.nomeDestinatario,
          passageType: data.tipoPassagem,
          phone: data.telefone
        },
      });

      if (response.error) {
        throw new Error("Falha ao gerar áudio");
      }
      const { noteData, publicUrl } = response.data;

      setShareId(noteData.share_id);
      setAudioUrl(publicUrl.publicUrl);

      toast({
        title: "Mensagem criada com sucesso!",
        description: "Sua mensagem está pronta para ser compartilhada.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar mensagem. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareId) return;
    const shareLink = await copyToClipboard(shareId);
    toast({
      title: "Link copiado!",
      description: "Compartilhe este link com seu amigo ou parente.",
    });
  };

  const shareOnWhatsApp = () => {
    if (!shareId) return;
    shareViaWhatsApp(shareId, form.getValues("telefone"));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  return (
    <div className="min-h-screen flex items-center justify-center bg-texture">
      <div className="w-full max-w-4xl p-10 space-y-10 bg-card rounded-lg shadow-soft">
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
          <p className="text-muted-foreground mt-4">
            Para enviar uma mensagem inspirada na Bíblia a um amigo querido ou a um familiar, preencha o formulário abaixo.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-primary/90">Seu Nome</label>
              <input
                {...register("seuNome", { required: "Por favor, insira seu nome" })}
                className="w-full rounded-md border border-border p-2 bg-message"
                placeholder="Seu nome completo"
              />
              {errors.seuNome && (
                <p className="text-sm text-red-500">{errors.seuNome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary/90">Seu Telefone</label>
              <input
                {...register("telefone", { 
                  required: "Por favor, insira seu telefone",
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: "Telefone inválido"
                  }
                })}
                className="w-full rounded-md border border-border p-2 bg-message"
                placeholder="+5511999999999"
              />
              {errors.telefone && (
                <p className="text-sm text-red-500">{errors.telefone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary/90">Nome do Destinatário</label>
              <input
                {...register("nomeDestinatario", { required: "Por favor, insira o nome do destinatário" })}
                className="w-full rounded-md border border-border p-2 bg-message"
                placeholder="Nome do destinatário"
              />
              {errors.nomeDestinatario && (
                <p className="text-sm text-red-500">{errors.nomeDestinatario.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary/90">
                Tipos de Passagens Bíblicas
              </label>
              <Select onValueChange={(value) => setValue("tipoPassagem", value)}>
                <SelectTrigger className="bg-message border-border">
                  <SelectValue placeholder="Escolha um tipo de passagem biblica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salmos">Salmos</SelectItem>
                  <SelectItem value="oracao">Oração</SelectItem>
                  <SelectItem value="versiculo">Versículo Bíblico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary/90">Sua Mensagem</label>
            <Textarea
              {...register("mensagem", {
                required: "Por favor, escreva uma mensagem",
                minLength: {
                  value: 10,
                  message: "A mensagem deve ter pelo menos 10 caracteres",
                },
              })}
              placeholder="Escreva sua mensagem pessoal aqui..."
              className="min-h-[150px] resize-none bg-message border-border"
            />
            {errors.mensagem && (
              <p className="text-sm text-red-500">{errors.mensagem.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {setTimeout(() => "Gerando...", 8000) ? "Só mais um pouco..." : "Gerando..."}
              </>
            ) : (
              "Gerar Mensagem"
            )}
          </Button>
        </form>

        {shareId && audioUrl && (
          <div className="space-y-6 pt-6 border-t border-border/50">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-center text-muted-foreground font-medium">
                Ouça esta mensagem
              </p>
              <div className="audio-container">
                <audio controls className="w-full audio-player">
                  <source src={audioUrl} type="audio/mpeg" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={copyShareLink}
                variant="outline"
                className="w-full share-button"
              >
                <Share2 className="mr-2 h-4 w-4 opacity-70" />
                Copiar Link
              </Button>

              <Button
                onClick={shareOnWhatsApp}
                variant="outline"
                className="w-full share-button text-white bg-green-500 border-green-500 hover:bg-green-400 hover:text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4 opacity-70" />
                Compartilhar no WhatsApp
              </Button>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default Index;
