import { useState } from 'react';
import type { Proyecto } from './../types/index';
import { Button } from './ui/button';
import { solicitarTurno, getTurnosDeProyecto } from './../services/turnoService';
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
    const { refrescarTurnos, turnosActivos } = useTurnos();

    if (!isOpen) return null;

    const yaEstoyEnFila = turnosActivos.some(t => t.proyectoId === proyecto.id);
    // Lógica: Si duración es 0, es "Informativo" (Robot). Si es > 0, es "Con Fila".
    const esInformativo = !proyecto.duracionEstimada || proyecto.duracionEstimada <= 0;

    // Acción: Sacar Turno
    // 1. Traemos la función refrescar

    const handleUnirseFila = async () => {
        setLoading(true);
        try {
            // ============================================================
            // 🛑 VALIDACIÓN DE CHOQUE DE HORARIOS (Lógica Frontend)
            // ============================================================

            // Si es un taller con cupo (capacidad > 1), la lógica de tiempo es distinta 
            // (pasan todos juntos), pero para stands normales (capacidad 1), validamos choque.

            if (proyecto.capacidadMaxima === 1) {
                // 1. Consultamos la fila ACTUAL del proyecto para estimar mi demora
                const turnosDelProyecto = await getTurnosDeProyecto(proyecto.id);

                // Filtramos solo los que molestan (Pendientes o Llamados)
                const cantidadEnEspera = turnosDelProyecto.filter(t => t.estado === 'PENDIENTE' || t.estado === 'LLAMADO').length;

                // Mi demora estimada para este NUEVO turno
                const demoraNuevaEstimada = cantidadEnEspera * (proyecto.duracionEstimada || 5);

                const ahora = new Date().getTime();
                const BUFFER_MINUTOS = 10; // Margen de error (si caen a menos de 10 min uno del otro)

                // 2. Buscamos conflictos con mis turnos ACTIVOS
                const conflicto = turnosActivos.find(miTurno => {
                    // Calculamos tiempo real restante de mi turno activo
                    const fechaCreacion = new Date(miTurno.fecha).getTime();
                    const minutosPasados = (ahora - fechaCreacion) / 60000;

                    // Tiempo original estimado - lo que ya esperé
                    let tiempoRestanteMio = (miTurno.tiempoDeEspera || 0) - minutosPasados;
                    if (tiempoRestanteMio < 0) tiempoRestanteMio = 0; // Si ya debería haber pasado, es inminente

                    // 3. COMPARACIÓN: ¿La diferencia es peligrosa?
                    // Ej: Me faltan 20 min para el turno A. El nuevo tarda 25 min. Diferencia 5 min -> PELIGRO.
                    const diferencia = Math.abs(tiempoRestanteMio - demoraNuevaEstimada);

                    return diferencia < BUFFER_MINUTOS;
                });

                if (conflicto) {
                    const confirmar = confirm(
                        `⚠️ ¡Cuidado con el tiempo!\n\nEste turno tiene una demora de aprox ${demoraNuevaEstimada} min, y coincide con otro turno tuyo que está por llegar.\n\n¿Querés anotarte igual?`
                    );
                    if (!confirmar) {
                        setLoading(false);
                        return; // Cancelamos la acción
                    }
                }
            }
            await solicitarTurno(proyecto.id);
            await refrescarTurnos();
            setStep('success');
        } catch (error: any) {
            // Capturamos el mensaje que mandamos desde el Back
            const mensaje = error.response?.data?.message || error.message;

            if (mensaje.includes("cupo")) {
                alert("⛔ ¡Cupos agotados!\n\nEste taller ya alcanzó las 35 personas. Por favor espera a que termine la ronda actual para anotarte.");
            } else {
                alert(mensaje);
            }
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
                {step === 'info' && !loading && ( // <--- AGREGAMOS !loading AQUÍ
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
                            yaEstoyEnFila ? (
                                <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed rounded-xl border-2 border-gray-200">
                                    Ya estás en la fila
                                </Button>
                            ) : (
                                // CASO B: FILA (Fucsia)
                                <Button
                                    onClick={handleUnirseFila}
                                    disabled={loading}
                                    className="bg-[#EF0886] w-full rounded-xl"
                                >
                                    {loading ? 'Procesando...' : 'Iniciar fila'}
                                </Button>
                            ))}
                    </div>
                )}

                {/* --- CONTENIDO: PASO 2 (ÉXITO) --- */}
                {step === 'success' && (
                    <div className="text-center flex flex-col items-center py-4">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 font-dm-sans leading-tight">
                            Confirmaste <br /> tu lugar en la fila
                        </h2>

                        {/* Puedes poner un icono de check o fueguito aquí si quieres */}

                        <Button
                            onClick={handleClose}
                            className="bg-[#EF0886] hover:bg-[#d00775] w-full rounded-xl"
                        >
                            Volver al Inicio
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
}