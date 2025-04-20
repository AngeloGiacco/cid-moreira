import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Note from "./pages/Mensagem";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const FACEBOOK_PIXEL_ID = '689354663617183';

const FacebookPixelInitializer: React.FC = () => {

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      if (!window.fbq) {
        // @ts-ignore
        !function(f,b,e,v,n,t,s)
        // @ts-ignore
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        // @ts-ignore
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        // @ts-ignore
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        // @ts-ignore
        n.queue=[];t=b.createElement(e);t.async=!0;
        // @ts-ignore
        t.src=v;s=b.getElementsByTagName(e)[0];
        // @ts-ignore
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        // @ts-ignore
        'https://connect.facebook.net/en_US/fbevents.js');

        // @ts-ignore
        window.fbq('init', FACEBOOK_PIXEL_ID);
        // @ts-ignore
        window.fbq('track', 'PageView');
      }
    }
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FacebookPixelInitializer />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mensagem/:shareId" element={<Note />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
