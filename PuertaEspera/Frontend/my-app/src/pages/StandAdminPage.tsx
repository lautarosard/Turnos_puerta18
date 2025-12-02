import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { getProyectos } from '../services/proyectoService'; // Usaremos esto para sacar el nombre, o getById si lo tienes
import { getTurnosDeProyecto, llamarTurno, finalizarTurno, cancelarTurno } from '../services/turnoService';
import type { Proyecto, Turno } from '../types';
import logo from '../assets/logoPuerta.svg';
import flameLogo from '../assets/flame-icon.svg';

// Conexión al Socket (Reutilizamos la URL del env)
const SOCKET_URL = import.meta.env.VITE_API_URL.replace('/api', '');
const socket = io(SOCKET_URL);

export function StandAdminPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [proyecto, setProyecto] = useState<Proyecto | null>(null);
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Cargar Datos Iniciales
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                // A. Buscamos info del proyecto (Nombre, etc.)
                // (Si tienes un getById úsalo, si no, traemos todos y filtramos rápido)
                const todos = await getProyectos();
                const actual = todos.find(p => p.id === id);
                if (actual) setProyecto(actual);

                // B. Buscamos los turnos actuales
                const listaTurnos = await getTurnosDeProyecto(id);
                setTurnos(listaTurnos);
            } catch (error) {
                console.error("Error cargando datos", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // 2. Conexión WebSocket
        socket.emit('unirse-proyecto', id);

        const handleNuevoTurno = (turno: Turno) => {
            setTurnos(prev => [...prev, turno]);
        };

        const handleUpdateTurno = (turnoActualizado: Turno) => {
            setTurnos(prev => {
                // Si el estado es FINALIZADO o CANCELADO, lo sacamos de la lista visual?
                // O lo dejamos un ratito? Por ahora, actualizamos el estado.
                // Si quisieras historial, lo dejas. Si quieres limpiar la pantalla:
                if (turnoActualizado.estado === 'FINALIZADO' || turnoActualizado.estado === 'CANCELADO') {
                    return prev.filter(t => t.id !== turnoActualizado.id);
                }
                return prev.map(t => t.id === turnoActualizado.id ? turnoActualizado : t);
            });
        };

        socket.on('nuevo-turno', handleNuevoTurno);
        socket.on('turno-actualizado', handleUpdateTurno);

        return () => {
            socket.off('nuevo-turno', handleNuevoTurno);
            socket.off('turno-actualizado', handleUpdateTurno);
        };
    }, [id]);

    // --- ACCIONES ---

    const handleLlamar = async (turnoId: string) => {
        if (!id) return;
        try {
            await llamarTurno(turnoId, id);
            // El socket actualizará la UI, pero podemos hacer optimistic update si queremos
        } catch (error) {
            alert("Error al llamar");
        }
    };

    const handleFinalizar = async (turnoId: string) => {
        if (!id) return;
        try {
            await finalizarTurno(turnoId, id);
        } catch (error) {
            alert("Error al finalizar");
        }
    };

    const handleCancelar = async (turnoId: string) => {
        if (!id) return;
        if (!confirm("¿Seguro querés cancelar a esta persona?")) return;
        try {
            await cancelarTurno(turnoId, id);
        } catch (error) {
            alert("Error al cancelar");
        }
    };

    // --- FILTROS VISUALES ---
    // Turno Actual: El que está "LLAMADO"
    const turnoActual = turnos.find(t => t.estado === 'LLAMADO');
    // Fila de Espera: Los que están "PENDIENTE", ordenados por número o fecha
    const filaEspera = turnos
        .filter(t => t.estado === 'PENDIENTE')
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    if (loading) return <div className="text-white text-center mt-20">Cargando control...</div>;

    return (
        <div className="min-h-screen bg-brand-background-dashboard px-6 py-8 flex flex-col items-center relative overflow-x-hidden">

            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8 max-w-md">
                <button onClick={() => navigate(-1)} className="text-white text-3xl">←</button>
                <img src={logo} alt="Puerta 18" className="w-24" />
                <div className="w-8"></div> {/* Espaciador para centrar logo */}
            </div>

            {/* Título del Stand */}
            <div className="text-center mb-8">
                <h2 className="text-white font-dm-sans text-xl uppercase tracking-widest opacity-80 mb-1">
                    ADMINISTRANDO
                </h2>
                <h1 className="text-white font-dm-sans text-2xl font-bold">
                    {proyecto?.nombre || "Cargando..."}
                </h1>
            </div>

            <div className="w-full max-w-md flex flex-col gap-6 pb-20">

                {/* 1. SECCIÓN: EN CURSO (ATENDIENDO AHORA) */}
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        EN CURSO
                    </h3>

                    {turnoActual ? (
                        <div className="bg-white rounded-2xl p-4 shadow-lg animate-in zoom-in duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Visitante</p>
                                    <p className="text-xl font-bold text-gray-900">{turnoActual.visitanteNombre}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-bold uppercase">Turno</p>
                                    <p className="text-xl font-bold text-brand-purple">#{turnoActual.numero}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleFinalizar(turnoActual.id)}
                                className="w-full bg-brand-purple hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Finalizar Atención
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-white/50 border-2 border-dashed border-white/20 rounded-2xl">
                            Nadie está siendo atendido
                        </div>
                    )}
                </div>

                {/* 2. SECCIÓN: FILA DE ESPERA */}
                <div>
                    <h3 className="text-white font-bold mb-4 px-2">
                        FILA DE ESPERA ({filaEspera.length})
                    </h3>

                    <div className="flex flex-col gap-3">
                        {filaEspera.length === 0 && (
                            <p className="text-white/40 text-center italic mt-4">No hay nadie en la fila.</p>
                        )}

                        {filaEspera.map((turno) => (
                            <div key={turno.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-md">

                                {/* Info Visitante */}
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-600">
                                        {turno.numero}
                                    </div>
                                    <span className="font-bold text-gray-800">{turno.visitanteNombre}</span>
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-2">
                                    {/* Botón LLAMAR (Check/Play) */}
                                    <button
                                        onClick={() => handleLlamar(turno.id)}
                                        disabled={!!turnoActual} // Deshabilitar si ya hay alguien (opcional)
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${!!turnoActual
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                                            }`}
                                        title={!!turnoActual ? "Finaliza el actual antes de llamar" : "Llamar"}
                                    >
                                        ▶
                                    </button>

                                    {/* Botón CANCELAR (X) */}
                                    <button
                                        onClick={() => handleCancelar(turno.id)}
                                        className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="mt-auto opacity-60">
                <img src={flameLogo} alt="" className="w-10" />
            </div>
        </div>
    );
}