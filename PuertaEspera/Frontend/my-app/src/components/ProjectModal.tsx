import { useState } from 'react';
import type { Proyecto } from './../types/index';
import { Button } from './ui/button';
import { solicitarTurno } from './../services/turnoService';
//import { useAuth } from './../context/AuthContext';
import { useTurnos } from './../context/TurnoContext';

interface ProjectModalProps {
    proyecto: Proyecto;
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectModal({ proyecto, isOpen, onClose }: ProjectModalProps) {
    //const { user } = useAuth(); // Necesitamos el ID del visitante (aunque el servicio lo saca del token)
    const [step, setStep] = useState<'info' | 'success'>('info'); // Pasos: Información -> Éxito

    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    // Lógica: Si duración es 0, es "Informativo" (Robot). Si es > 0, es "Con Fila".
    const esInformativo = proyecto.duracionEstimada === 0;

    // Acción: Sacar Turno
    // 1. Traemos la función refrescar
    const { refrescarTurnos } = useTurnos();

    const handleUnirseFila = async () => {
        setLoading(true);
        try {
        await solicitarTurno(proyecto.id);
        
        // 2. ¡AQUÍ ESTÁ LA CLAVE!
        // Apenas tenemos éxito, recargamos los turnos para que aparezca el cartelito
        await refrescarTurnos(); 
        
        setStep('success'); // Mostramos "Confirmaste tu lugar"
        } catch (error: any) {
        alert(error.message || "Error al unirse");
        onClose();
        } finally {
        setLoading(false);
        }
    };

        // Acción: Cerrar todo (Volver a Home)
    const handleClose = () => {
        setStep('info'); // Reseteamos para la próxima
        onClose();
    };

    return (
        // 1. Overlay Oscuro (Fondo)
        <div className="fixed inset-0 bg-brand-dark/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"> 
        {/* 2. La Tarjeta Blanca */}
        <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Botón Cerrar (X) - Solo visible en el paso 'info' */}
            {step === 'info' && (
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
                ✕
            </button>
            )}

            {/* --- CONTENIDO: PASO 1 (INFORMACIÓN) --- */}
            {step === 'info' && (
            <div className="text-center flex flex-col items-center">
                {/* Título */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-dm-sans">
                {proyecto.nombre}
                </h2>

                {/* Descripción */}
                <p className="text-gray-600 mb-8 text-sm leading-relaxed px-2">
                {proyecto.descripcion || "Disfruta de esta experiencia increíble en Puerta 18."}
                </p>

                {/* Botón Diferente según tipo */}
                {esInformativo ? (
                // CASO A: INFORMATIVO (Amarillo)
                <button 
                    onClick={onClose}
                    className="w-full bg-[#EFB654] hover:bg-[#d9a54b] text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all"
                >
                    Te esperamos
                </button>
                ) : (
                // CASO B: FILA (Fucsia)
                <Button 
                    onClick={handleUnirseFila} 
                    disabled={loading}
                    className="bg-[#EF0886] hover:bg-[#d00775] w-full rounded-xl"
                >
                    {loading ? 'Procesando...' : 'Iniciar fila'}
                </Button>
                )}
            </div>
            )}

            {/* --- CONTENIDO: PASO 2 (ÉXITO) --- */}
            {step === 'success' && (
            <div className="text-center flex flex-col items-center py-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 font-dm-sans leading-tight">
                Confirmaste <br/> tu lugar en la fila
                </h2>
                
                {/* Puedes poner un icono de check o fueguito aquí si quieres */}

                <Button 
                onClick={handleClose}
                className="bg-[#EF0886] hover:bg-[#d00775] w-full rounded-xl"
                >
                Volver al inicio
                </Button>
            </div>
            )}

        </div>
        </div>
    );
}