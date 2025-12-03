import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { getProyectos } from '../services/proyectoService';
import { updateProyecto } from '../services/proyectoService'; // Necesario para "Eliminar" admin
import { getTurnosDeProyecto, llamarTurno, finalizarTurno, cancelarTurno } from '../services/turnoService';
import type { Proyecto, Turno } from '../types';
import logo from '../assets/logoPuerta.svg';
import flameLogo from '../assets/flame-icon.svg';

const SOCKET_URL = import.meta.env.VITE_API_URL.replace('/api', '');
const socket = io(SOCKET_URL);

export function StandAdminPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [proyecto, setProyecto] = useState<Proyecto | null>(null);
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS PARA SUPER ADMIN ---
    const [userRole, setUserRole] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal de confirmación

    // 1. Detectar Rol y Usuario al cargar
    useEffect(() => {
        const userStr = localStorage.getItem('user_admin');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserRole(user.rol);
            setCurrentUserId(user.id);
        }
    }, []);

    // 2. Definir color de fondo según el ROL
    // Super Admin = Violeta (#5A416B), Encargado = Dorado (#D29C3C)
    const bgClass = userRole === 'SUPER_ADMIN' ? 'bg-[#5A416B]' : 'bg-[#D29C3C]';

    // 3. Cargar Datos
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                // Traemos TODOS para filtrar (o usa getById si ya actualizaste el servicio para usar el endpoint específico)
                // NOTA: Para que aparezca el nombre del encargado, asegúrate que tu backend responda con 'adminEncargado'
                // Si usas getProyectos() (getAll), el repositorio ya lo incluye.
                const todos = await getProyectos();
                const actual = todos.find(p => p.id === id);
                if (actual) setProyecto(actual);

                const listaTurnos = await getTurnosDeProyecto(id);
                setTurnos(listaTurnos);
            } catch (error) {
                console.error("Error cargando datos", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        socket.emit('unirse-proyecto', id);
        // ... (Listeners de socket igual que antes) ...
        const handleNuevoTurno = (turno: Turno) => setTurnos(prev => [...prev, turno]);
        const handleUpdateTurno = (turnoActualizado: Turno) => {
            setTurnos(prev => {
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

    // --- ACCIONES DE TURNO (Igual que antes) ---
    const handleLlamar = async (turnoId: string) => { if (id) await llamarTurno(turnoId, id); };
    const handleFinalizar = async (turnoId: string) => { if (id) await finalizarTurno(turnoId, id); };
    const handleCancelar = async (turnoId: string) => { if (id && confirm("¿Cancelar turno?")) await cancelarTurno(turnoId, id); };

    // --- ACCIÓN SUPER ADMIN: ELIMINAR ENCARGADO ---
    const handleEliminarEncargado = async () => {
        if (!proyecto || !currentUserId) return;
        try {
            // Lógica: Asignamos el proyecto al Super Admin (Tú) para "sacar" al otro
            await updateProyecto(proyecto.id, {
                adminEncargadoId: currentUserId
            });

            alert("Encargado eliminado. Ahora tú estás a cargo.");
            setShowDeleteModal(false);

            // Actualizamos la UI localmente
            setProyecto({
                ...proyecto,
                adminEncargado: { id: currentUserId, nombre: "Mí (Super Admin)", username: "yo" }
            });

        } catch (error) {
            alert("Error al eliminar encargado");
        }
    };

    // Filtros visuales
    const turnoActual = turnos.find(t => t.estado === 'LLAMADO');
    const filaEspera = turnos
        .filter(t => t.estado === 'PENDIENTE')
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    if (loading) return <div className="text-white text-center mt-20">Cargando...</div>;

    return (
        <div className={`min-h-screen ${bgClass} px-6 py-8 flex flex-col items-center relative overflow-x-hidden transition-colors duration-500`}>

            {/* Header */}
            <div className="w-full flex justify-between items-center mb-6 max-w-md">
                <button onClick={() => navigate(-1)} className="text-white text-3xl">←</button>
                <img src={logo} alt="Puerta 18" className="w-24" />
                <div className="w-8"></div>
            </div>

            {/* Título */}
            <div className="text-center mb-6">
                <h2 className="text-white font-dm-sans text-sm md:text-base uppercase tracking-widest opacity-80 mb-1">
                    ADMINISTRANDO
                </h2>
                <h1 className="text-white font-dm-sans text-2xl font-bold leading-tight">
                    {proyecto?.nombre}
                </h1>
            </div>

            <div className="w-full max-w-md flex flex-col gap-6 pb-20">

                {/* --- SECCIÓN EXCLUSIVA SUPER ADMIN: GESTIÓN DE ENCARGADO --- */}
                {userRole === 'SUPER_ADMIN' && proyecto?.adminEncargado && (
                    <div className="w-full">
                        <label className="text-white/80 text-xs font-bold uppercase mb-2 block">
                            ADMIN “Desbloqueá tu primer trabajo”
                        </label>

                        <div className="bg-white/90 rounded-xl p-3 flex justify-between items-center shadow-md">
                            <span className="font-bold text-gray-800 ml-2">
                                {proyecto.adminEncargado.nombre}
                            </span>

                            {/* Botón X para eliminar (Solo si no soy yo mismo) */}
                            {proyecto.adminEncargado.id !== currentUserId && (
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="text-gray-500 hover:text-red-500 font-bold px-2 text-xl"
                                >
                                    ✕
                                </button>
                            )}
                            {proyecto.adminEncargado.id === currentUserId && (
                                <span className="text-xs text-brand-purple font-bold px-2 uppercase">Yo</span>
                            )}
                        </div>
                    </div>
                )}

                {/* --- SECCIÓN: EN CURSO --- */}
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        En curso
                    </h3>

                    {turnoActual ? (
                        <div className="bg-white rounded-2xl p-4 shadow-lg">
                            {/* ... Datos del turno actual (igual que antes) ... */}
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xl font-bold text-gray-900">{turnoActual.visitanteNombre}</span>
                                <span className="text-xl font-bold text-brand-purple">#{turnoActual.numero}</span>
                            </div>
                            <button
                                onClick={() => handleFinalizar(turnoActual.id)}
                                className="w-full bg-brand-purple hover:bg-pink-700 text-white font-bold py-3 rounded-xl"
                            >
                                Finalizar Atención
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-white/50 border-2 border-dashed border-white/20 rounded-2xl text-sm">
                            Nadie está siendo atendido
                        </div>
                    )}
                </div>

                {/* --- SECCIÓN: FILA DE ESPERA --- */}
                <div>
                    <h3 className="text-white font-bold mb-3 px-2 text-sm uppercase">
                        Fila de espera ({filaEspera.length})
                    </h3>
                    <div className="flex flex-col gap-3">
                        {filaEspera.length === 0 && (
                            <p className="text-white/40 text-center italic mt-2 text-sm">No hay nadie en la fila.</p>
                        )}
                        {filaEspera.map((turno) => (
                            <div key={turno.id} className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm">
                                        {turno.numero}
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm">{turno.visitanteNombre}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleLlamar(turno.id)}
                                        disabled={!!turnoActual}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${!!turnoActual ? 'bg-gray-200 text-gray-400' : 'bg-green-100 text-green-600'}`}
                                    >
                                        ▶
                                    </button>
                                    <button
                                        onClick={() => handleCancelar(turno.id)}
                                        className="w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center"
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

            {/* --- MODAL CONFIRMACIÓN ELIMINAR ADMIN --- */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-white rounded-[21px] p-6 text-center max-w-xs w-full shadow-2xl animate-in zoom-in">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute top-4 right-4 text-gray-400"
                        >✕</button>

                        <h3 className="text-lg font-bold text-brand-dark mb-6 font-dm-sans uppercase leading-tight">
                            ¿Querés eliminar <br /> a este admin?
                        </h3>

                        <button
                            onClick={handleEliminarEncargado}
                            className="w-full bg-[#A822E5] hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg mb-0"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}