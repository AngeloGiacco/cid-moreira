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

A resposta completa deve ter aproximadamente 150 palavras para não exceder 45 segundos de leitura.`
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
      max_tokens: 500,
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
    
    const generated_text = await get_text_to_generate(message);

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

    // Updated database insert to match types
    const { data: noteData, error: noteError } = await supabase
      .from("messages")
      .insert({
        message: message.message,
        sender_name: message.sender,
        receiver_name: message.receiver,
        phone_number: message.phone,
        audio_url: publicUrl.publicUrl,
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
