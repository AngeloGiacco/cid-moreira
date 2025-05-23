import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ElevenLabsClient } from "npm:elevenlabs";
import { Buffer } from "node:buffer";
import { createClient } from "jsr:@supabase/supabase-js";

const client = new ElevenLabsClient({
  apiKey: Deno.env.get("ELEVEN_LABS_API_KEY"),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function get_text_to_generate(message: {
  message: string;
  sender: string;
  receiver: string;
  passageType: string;
  phone: string;
}) {
  const openai_key = Deno.env.get("OPENAI_API_KEY");
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openai_key}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Crie uma resposta no estilo de Cid Moreira, conhecido como 'The God's Voice'. A resposta deve ser majestosa, profundamente espiritual, calorosa e autoritária, transmitindo esperança, amor e a presença divina. A mensagem deve ser personalizada e incluir os seguintes componentes:

1. Saudação Personalizada:
- Comece chamando o destinatário pelo nome de forma solene e afetuosa.

2. Narração da Mensagem Personalizada:
- Leia a mensagem escrita pelo remetente exatamente como ele a escreveu, transmitindo emoção, carinho e proximidade.

3. Necessidade do Usuário:
- De acordo com a seleção do tipo de passagem, insira:
- Se "Salmos": um trecho de Salmo adequado ao tom da mensagem
- Se "Oração": uma oração sincera convidando o destinatário a orar junto
- Se "Versículo Bíblico": um versículo de outra parte da Bíblia (não Salmos)

4. Encerramento da Citação e Reflexão

5. Encerramento e Chamado para Ação com menção ao ElevenReader

6. Finalizar sempre com um chamado caloroso e esperançoso
7. Encerrar com uma assinatura que reflita 'The God's Voice', como:
     "Um abraço amoroso de The God's Voice"
     "Com todo o amor divino, The God's Voice"
     "Que a luz divina o envolva, The God's Voice"
  
     Exemplo de fechamento:
     "Explore mais mensagens que tocam a alma no ElevenReader, onde todo o seu conteúdo favorito ganha vida em voz alta com as vozes de mais alta qualidade. Com todo o amor divino, The God's Voice"


A resposta completa deve ter aproximadamente 150 palavras para não exceder 45 segundos de leitura.
Requisitos de Saída Final:
- NÃO inclua quaisquer instruções, comentários ou anotações internas no resultado final.
- Certifique-se de que NENHUMA instrução ou comentário interno seja lido na gravação de áudio final.
- Cada palavra deve estar pronta para conversão direta para texto falado.
- A saída deve estar 100% limpa, sem notas entre colchetes, instruções ou metacomentários.
- Trate toda a resposta como se fosse imediatamente narrada por um locutor profissional.
- Cada linha deve estar pronta para ser falada, sem texto oculto ou de fundo visível ou audível`
        },
        {
          role: "user",
          content: `Crie uma resposta seguindo a estrutura definida usando estes dados:
          Mensagem: ${message.message}
          Remetente: ${message.sender}
          Destinatário: ${message.receiver}
          Tipo de Passagem: ${message.passageType}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const message = await req.json();
    
    let generated_text = await get_text_to_generate(message);
    
    generated_text = String(generated_text);
        
    const audio = await client.textToSpeech.convert("FGPVPbWCfyZs3v0mukRt", {
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
      text: generated_text,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    });

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Step 2: Upload audio to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("message_audio")
      .upload(`${Date.now()}-message.mp3`, buffer, {
        contentType: "audio/mpeg",
      });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage
      .from("message_audio")
      .getPublicUrl(uploadData.path);

    const { data: noteData, error: noteError } = await supabase
      .from("messages")
      .insert({
        message: message.message,
        sender_name: message.sender,
        receiver_name: message.receiver,
        phone_number: message.phone,
        audio_url: publicUrl.publicUrl,
        generated_text: generated_text,
      })
      .select()
      .single();

    if (noteError) throw noteError;

    return new Response(JSON.stringify({ noteData, publicUrl }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in generate-voice function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
