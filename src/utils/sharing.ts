export const generateShareLink = (shareId: string) => {
  return `${window.location.origin}/mensagem/${shareId}`;
};

export const copyToClipboard = async (shareId: string) => {
  const shareLink = generateShareLink(shareId);
  await navigator.clipboard.writeText(shareLink);
  return shareLink;
};

export const generateEmailContent = (
  shareLink: string,
  receiverName?: string,
  senderName?: string
) => {
  const androidLink = "https://play.google.com/store/apps/details?id=io.elevenlabs.readerapp";
  const iosLink = "https://apps.apple.com/us/app/elevenlabs-reader-ai-audio/id6479373050";
  
  const subject = "Uma mensagem especial para você via The God's Voice";
  let body = "";
  
  if (receiverName && senderName) {
    body = `Olá ${receiverName},\n\n`
      + `${senderName} enviou uma mensagem especial para você através do The God's Voice, `
      + `um serviço que transforma mensagens em áudio usando tecnologia ElevenLabs.\n\n`;
  } else {
    body = `Olá,\n\nAlguém enviou uma mensagem especial para você através do The God's Voice.\n\n`;
  }
  
  body += `Acesse sua mensagem aqui: ${shareLink}\n\n`
    + `Baixe nosso aplicativo:\n`
    + `Android: ${androidLink}\n`
    + `iOS: ${iosLink}\n\n`
    + `Com carinho,\nThe God's Voice`;

  return { subject, body };
};

export const shareViaWhatsApp = (shareId: string, senderName?: string) => {
  const shareLink = generateShareLink(shareId);
  const message = senderName
    ? `${senderName} enviou uma mensagem especial para você através do The God's Voice. Acesse aqui: ${shareLink}`
    : `Uma mensagem especial foi enviada para você através do The God's Voice. Acesse aqui: ${shareLink}`;
    
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}; 