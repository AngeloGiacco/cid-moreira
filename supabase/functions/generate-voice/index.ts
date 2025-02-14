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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
      text: message,
    });

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Step 2: Upload audio to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("love_notes_audio")
      .upload(`${Date.now()}-love-note.mp3`, buffer);

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage
      .from("love_notes_audio")
      .getPublicUrl(uploadData.path);

    // Step 3: Create love note record
    const { data: noteData, error: noteError } = await supabase
      .from("love_notes")
      .insert({
        message,
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
