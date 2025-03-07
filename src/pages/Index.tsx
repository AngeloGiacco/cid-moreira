import { useState } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Heart, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FormData {
  seuNome: string;
  seuEmail: string;
  nomeDestinatario: string;
  emailDestinatario: string;
  mensagem: string;
  tipoPassagem: string;
}

const Index = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      seuNome: "",
      seuEmail: "",
      nomeDestinatario: "",
      emailDestinatario: "",
      mensagem: "",
      tipoPassagem: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsGenerating(true);

      // Step 1: Generate audio using Edge Function (only using the message)
      const response = await supabase.functions.invoke("generate-voice", {
        body: { message: data.mensagem },
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
    const shareLink = `${window.location.origin}/note/${shareId}`;
    await navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copiado!",
      description: "Compartilhe este link com seu amigo ou parente.",
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center space-y-2">
          <Heart className="w-12 h-12 text-blue-500 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">
            Mensagem do The God's Voice
          </h1>
          <p className="text-gray-600">
            Preencha o formulário abaixo para enviar uma mensagem inspirada nas Palavras de Deus para um amigo querido ou parente
          </p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            ⚠️ Atenção: As mensagens são públicas e podem ser acessadas por qualquer pessoa
            com o ID da nota. Não inclua informações pessoais, endereços ou detalhes sensíveis em suas mensagens.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Seu Nome</label>
              <input
                {...register("seuNome", { required: "Por favor, insira seu nome" })}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="Seu nome completo"
              />
              {errors.seuNome && (
                <p className="text-sm text-red-500">{errors.seuNome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Seu E-mail</label>
              <input
                {...register("seuEmail", { 
                  required: "Por favor, insira seu e-mail",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "E-mail inválido"
                  }
                })}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="seu@email.com"
              />
              {errors.seuEmail && (
                <p className="text-sm text-red-500">{errors.seuEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome do Destinatário</label>
              <input
                {...register("nomeDestinatario", { required: "Por favor, insira o nome do destinatário" })}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="Nome do destinatário"
              />
              {errors.nomeDestinatario && (
                <p className="text-sm text-red-500">{errors.nomeDestinatario.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">E-mail do Destinatário</label>
              <input
                {...register("emailDestinatario", {
                  required: "Por favor, insira o e-mail do destinatário",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "E-mail inválido"
                  }
                })}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="destinatario@email.com"
              />
              {errors.emailDestinatario && (
                <p className="text-sm text-red-500">{errors.emailDestinatario.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tipos de Passagens Bíblicas
              </label>
              <Select onValueChange={(value) => setValue("tipoPassagem", value)}>
                <SelectTrigger>
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
            <label className="text-sm font-medium text-gray-700">Sua Mensagem</label>
            <Textarea
              {...register("mensagem", {
                required: "Por favor, escreva uma mensagem",
                minLength: {
                  value: 10,
                  message: "A mensagem deve ter pelo menos 10 caracteres",
                },
              })}
              placeholder="Escreva sua mensagem pessoal aqui..."
              className="min-h-[150px] resize-none"
            />
            {errors.mensagem && (
              <p className="text-sm text-red-500">{errors.mensagem.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              "Gerar Mensagem"
            )}
          </Button>
        </form>

        {shareId && audioUrl && (
          <div className="space-y-4 pt-4 border-t">
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              Seu navegador não suporta o elemento de áudio.
            </audio>

            <Button
              onClick={copyShareLink}
              variant="outline"
              className="w-full"
            >
              <Share2 className="mr-2" />
              Copiar Link para Compartilhar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
