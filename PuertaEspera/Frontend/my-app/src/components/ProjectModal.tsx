import { useState } from 'react';
import type { Proyecto } from './../types/index';
import { Button } from './ui/button';
import { solicitarTurno, getTurnosDeProyecto } from './../services/turnoService';
import { useTurnos } from './../context/TurnoContext';

interface ProjectModalProps {
    proyecto: Proyecto;
    isOpen: boolean;
    onClose: () => void;
}

// Agregamos un paso 'warning' para el conflicto de horarios
export function ProjectModal({ proyecto, isOpen, onClose }: ProjectModalProps) {
    const [step, setStep] = useState<'info' | 'warning' | 'success'>('info');
    const [loading, setLoading] = useState(false);

    // Guardamos la demora estimada para mostrarla en el warning
    const [demoraConflicto, setDemoraConflicto] = useState(0);

    const { refrescarTurnos, turnosActivos } = useTurnos();

    if (!isOpen) return null;

    const yaEstoyEnFila = turnosActivos.some(t => t.proyectoId === proyecto.id);
    const esInformativo = !proyecto.duracionEstimada || proyecto.duracionEstimada <= 0;

    // --- LÓGICA DE VALIDACIÓN ---
    const validarYProcesar = async (ignorarConflicto = false) => {
        setLoading(true);
        try {
            // Si NO estamos ignorando el conflicto (primera vez que toca el botón)
            if (!ignorarConflicto && proyecto.capacidadMaxima === 1) {
                // 1. Consultar fila
                const turnosDelProyecto = await getTurnosDeProyecto(proyecto.id);
                const cantidadEnEspera = turnosDelProyecto.filter(t => t.estado === 'PENDIENTE' || t.estado === 'LLAMADO').length;
                const demoraNuevaEstimada = cantidadEnEspera * (proyecto.duracionEstimada || 5);

                const ahora = new Date().getTime();
                const BUFFER_MINUTOS = 10;

                // 2. Buscar conflicto
                const conflicto = turnosActivos.find(miTurno => {
                    const fechaCreacion = new Date(miTurno.fecha).getTime();
                    const minutosPasados = (ahora - fechaCreacion) / 60000;
                    let tiempoRestanteMio = (miTurno.tiempoDeEspera || 0) - minutosPasados;
                    if (tiempoRestanteMio < 0) tiempoRestanteMio = 0;

                    const diferencia = Math.abs(tiempoRestanteMio - demoraNuevaEstimada);
                    return diferencia < BUFFER_MINUTOS;
                });

                if (conflicto) {
                    // ¡HAY CONFLICTO!
                    setDemoraConflicto(demoraNuevaEstimada);
                    setStep('warning'); // Cambiamos a la pantalla de advertencia
                    setLoading(false);
                    return; // Cortamos aquí
                }
            }

            // Si llegamos acá, o no hubo conflicto o el usuario confirmó en el warning
            await executeSolicitud();

        } catch (error: any) {
            handleError(error);
        }
    };

    // Función auxiliar para crear el turno
    const executeSolicitud = async () => {
        try {
            setLoading(true);
            await solicitarTurno(proyecto.id);
            await refrescarTurnos();
            setStep('success');
        } catch (error: any) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleError = (error: any) => {
        const mensaje = error.response?.data?.message || error.message;
        if (mensaje.includes("cupo")) {
            alert("⛔ ¡Cupos agotados!\n\nEste taller ya alcanzó su capacidad máxima.");
        } else {
            alert(mensaje);
        }
        onClose();
        setLoading(false);
    };

    const handleClose = () => {
        setStep('info');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-brand-dark/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[21px] p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Botón Cerrar (Solo si no está cargando) */}
                {!loading && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl transition-colors"
                    >
                        ✕
                    </button>
                )}

                {/* ================================================== */}
                {/* PASO 1: INFORMACIÓN DEL PROYECTO                   */}
                {/* ================================================== */}
                {step === 'info' && (
                    <div className="text-center flex flex-col items-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 font-dm-sans leading-tight">
                            {proyecto.nombre}
                        </h2>
                        <p className="text-gray-600 mb-8 text-sm leading-relaxed px-2 font-medium">
                            {proyecto.descripcion || "Disfruta de esta experiencia increíble en Puerta 18."}
                        </p>

                        {esInformativo ? (
                            <button
                                onClick={onClose}
                                className="w-full bg-[#EFB654] hover:bg-[#d9a54b] text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95"
                            >
                                Te esperamos
                            </button>
                        ) : (
                            yaEstoyEnFila ? (
                                <Button disabled className="w-full bg-gray-300 !text-gray-600 cursor-not-allowed rounded-xl border-2 border-gray-200">
                                    Ya estás en la fila
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => validarYProcesar(false)} // false = chequear conflicto
                                    disabled={loading}
                                    className="bg-[#EF0886] hover:bg-pink-600 w-full rounded-xl shadow-lg active:scale-95 transition-all"
                                >
                                    {loading ? 'Procesando...' : 'Iniciar fila'}
                                </Button>
                            )
                        )}
                    </div>
                )}

                {/* ================================================== */}
                {/* PASO WARNING: CONFIRMACIÓN DE CHOQUE HORARIO       */}
                {/* ================================================== */}
                {step === 'warning' && (
                    <div className="text-center flex flex-col items-center animate-in slide-in-from-right duration-300">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-3xl">
                            ⚠️
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 font-dm-sans">
                            ¡Cuidado con el tiempo!
                        </h3>

                        <p className="text-gray-600 text-sm mb-6 leading-relaxed px-1">
                            Este turno tiene una demora de aprox. <strong className="text-gray-900">{demoraConflicto} min</strong> y coincide con otra actividad tuya que está por llegar.
                        </p>

                        <div className="flex flex-col gap-3 w-full">
                            <Button
                                onClick={() => executeSolicitud()} // Confirmamos e ignoramos el aviso
                                disabled={loading}
                                className="bg-[#EF0886] hover:bg-pink-600 w-full rounded-xl"
                            >
                                {loading ? 'Anotando...' : 'Anotarme igual'}
                            </Button>

                            <button
                                onClick={onClose}
                                className="w-full bg-white text-gray-500 font-bold py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Mejor no
                            </button>
                        </div>
                    </div>
                )}

                {/* ================================================== */}
                {/* PASO 2: ÉXITO                                      */}
                {/* ================================================== */}
                {step === 'success' && (
                    <div className="text-center flex flex-col items-center py-4 animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl shadow-sm">
                            ✓
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-dm-sans leading-tight">
                            Confirmaste <br /> tu lugar en la fila
                        </h2>

                        <Button
                            onClick={handleClose}
                            className="bg-[#EF0886] w-full rounded-xl shadow-lg"
                        >
                            Volver al Inicio
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
}