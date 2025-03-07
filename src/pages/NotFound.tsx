import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600">Oops! Página não encontrada</p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.location.href = '/'}
        >
          <Home className="mr-2 h-4 w-4" />
          Voltar para Início
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
