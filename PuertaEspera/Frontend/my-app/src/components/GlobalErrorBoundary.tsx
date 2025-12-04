import { Component } from "react";
import type {ErrorInfo, ReactNode} from "react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  // Este método estático actualiza el estado cuando ocurre un error
  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  // Este método sirve para loguear el error (en consola o un servicio externo)
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🔥 Error Global capturado:", error, errorInfo);
  }

  // Acción para el botón "Volver" (Recargar la página es lo más seguro tras un crash)
  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // --- AQUÍ VA TU DISEÑO DEL MODAL ---
      return (
        <div className="fixed inset-0 bg-brand-dark/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-6">
          <div className="bg-white rounded-[21px] p-8 text-center max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
            
            {/* Título */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-dm-sans">
              ¡Ups! Algo salió mal
            </h2>
            
            {/* Subtítulo / Mensaje */}
            <p className="text-gray-600 font-medium mb-8 font-dm-sans">
              No se pudo cargar esta página correctamente.
            </p>

            {/* Botón Volver (Estilo Fucsia) */}
            <Button 
              onClick={this.handleReset} 
              className="bg-[#EF0886] hover:bg-pink-700 w-full rounded-xl"
            >
              Volver
            </Button>

          </div>
        </div>
      );
    }

    // Si no hay error, renderiza la App normalmente
    return this.props.children;
  }
}