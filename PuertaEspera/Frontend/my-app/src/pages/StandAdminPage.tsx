import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { getProyectos, eliminarProyecto, updateProyecto } from '../services/proyectoService';
import { getTurnosDeProyecto, llamarTurno, finalizarTurno, cancelarTurno, accionTaller } from '../services/turnoService';
import type { Proyecto, Turno } from '../types';
import logo from '../assets/logoPuerta.svg';
import QRCode from "react-qr-code";
import flameLogo from '../assets/flame-icon.svg';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { AddManualVisitorModal } from '../components/AddManualVisitorModal';

const SOCKET_URL = import.meta.env.VITE_API_URL.replace('/api', '');
const socket = io(SOCKET_URL);

export function StandAdminPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [proyecto, setProyecto] = useState<Proyecto | null>(null);
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados Super Admin
    const [userRole, setUserRole] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isManualAddOpen, setIsManualAddOpen] = useState(false);

    const [showQRModal, setShowQRModal] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user_admin');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserRole(user.rol);
            setCurrentUserId(user.id);
        }
    }, []);

    const bgClass = userRole === 'SUPER_ADMIN' ? 'bg-[#5A416B]' : 'bg-[#D29C3C]';

    const fetchData = async () => {
        if (!id) return;
        try {
            const todos = await getProyectos();
            const actual = todos.find(p => p.id === id);
            if (actual) setProyecto(actual);

            const listaTurnos = await getTurnosDeProyecto(id);
            setTurnos(listaTurnos);
        } catch (error) {
            console.error("Error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        socket.emit('unirse-proyecto', id);

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

        // ESCUCHAR UPDATE MASIVO (IMPORTANTE)
        socket.on('batch-update', () => {
            fetchData(); // Recargamos todo para asegurar consistencia
        });

        return () => {
            socket.off('nuevo-turno', handleNuevoTurno);
            socket.off('turno-actualizado', handleUpdateTurno);
            socket.off('batch-update');
        };
    }, [id]);

    const handleLlamar = async (turnoId: string) => { if (id) await llamarTurno(turnoId, id); };
    const handleFinalizar = async (turnoId: string) => { if (id) await finalizarTurno(turnoId, id); };
    const handleCancelar = async (turnoId: string) => { if (id && confirm("¿Cancelar turno?")) await cancelarTurno(turnoId, id); };

    const handleEliminarEncargado = async () => {
        if (!proyecto || !currentUserId) return;
        try {
            await updateProyecto(proyecto.id, { adminEncargadoId: currentUserId });
            alert("Encargado eliminado. Ahora tú estás a cargo.");
            setShowDeleteModal(false);
            setProyecto({ ...proyecto, adminEncargado: { id: currentUserId, nombre: "Mí (Super Admin)", username: "yo" } });
        } catch (error) {
            alert("Error al eliminar encargado");
        }
    };

    const handleDeleteProject = async () => {
        if (!id) return;
        if (!confirm("⚠️ ¿ESTÁS SEGURO?\n\nVas a eliminar el stand completo y su historial. Esta acción no se puede deshacer.")) return;
        try {
            await eliminarProyecto(id);
            alert("Proyecto eliminado.");
            navigate('/admin/dashboard');
        } catch (error) {
            alert("Error al eliminar proyecto.");
        }
    };


    const handleDescargarQR = () => {
        const svg = document.getElementById("StandQR");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        // Convertimos SVG a base64
        img.src = "data:image/svg+xml;base64," + btoa(svgData);

        img.onload = () => {
            // Damos margen blanco extra para que sea fácil de imprimir
            canvas.width = img.width + 60;
            canvas.height = img.height + 60;

            if (ctx) {
                // Fondo blanco
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Dibujar QR
                ctx.drawImage(img, 30, 30);

                // Descargar
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `QR_${proyecto?.nombre || 'Stand'}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };
    };
    // --- VARIABLES DE TALLER ---
    const turnoActual = turnos.find(t => t.estado === 'LLAMADO');
    const filaEspera = turnos.filter(t => t.estado === 'PENDIENTE').sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    // Detectamos si es taller
    const esTaller = (proyecto?.capacidadMaxima || 1) > 1;
    const capacidad = proyecto?.capacidadMaxima || 35;
    const ocupados = turnos.filter(t => t.estado === 'PENDIENTE' || t.estado === 'LLAMADO').length;

    // --- HANDLERS MASIVOS ---
    const handleLlamarTodos = async () => {
        if (!id) return;
        if (confirm(`¿Estás seguro?\n\nVas a llamar a ${filaEspera.length} personas al mismo tiempo. Sus celulares vibrarán ahora.`)) {
            await accionTaller(id, 'LLAMAR_TODOS');
        }
    };

    const handleFinalizarTodos = async () => {
        if (!id) return;
        if (confirm("¿Finalizar la actividad?\n\nEsto liberará TODOS los cupos y permitirá que nuevas personas se anoten.")) {
            await accionTaller(id, 'FINALIZAR_TODOS');
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Cargando...</div>;

    // Generamos la URL a la que debe apuntar el QR
    // window.location.origin da "https://tu-app.vercel.app"
    const qrTargetUrl = `${window.location.origin}/proyectos?stand=${id}`;

    return (
        <div className={`min-h-screen ${bgClass} px-6 py-8 flex flex-col items-center relative overflow-x-hidden transition-colors duration-500`}>

            {/* Header */}
            <div className="w-full flex justify-between items-center mb-6 max-w-md">
                <button onClick={() => navigate(-1)} className="text-white text-3xl">←</button>
                <img src={logo} alt="Puerta 18" className="w-28 md:w-32" />
                <button
                    onClick={() => setIsManualAddOpen(true)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center text-2xl shadow-lg border border-white/10 transition-colors"
                >
                    +
                </button>
            </div>

            {/* Título y Estado */}
            <div className="text-center mb-6 w-full max-w-md relative">
                <h2 className="text-white font-dm-sans text-sm uppercase tracking-widest opacity-80 mb-1">
                    ADMINISTRANDO
                </h2>
                <h1 className="text-white font-dm-sans text-2xl font-bold leading-tight mb-2">
                    {proyecto?.nombre}
                </h1>

                {userRole === 'SUPER_ADMIN' && (
                    <div className="flex justify-center gap-3 mt-2">
                        <button onClick={() => setIsEditModalOpen(true)} className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                            ✏️ Editar Info
                        </button>
                        <button onClick={handleDeleteProject} className="bg-red-500/20 hover:bg-red-500/40 text-red-200 text-xs font-bold px-3 py-1 rounded-full border border-red-500/30">
                            🗑️ Eliminar
                        </button>

                    </div>
                )}

                {(userRole === 'SUPER_ADMIN' || proyecto?.adminEncargado?.id === currentUserId) && (
                    <button
                        onClick={() => setShowQRModal(true)}
                        className="bg-blue-500/30 hover:bg-blue-500/50 text-blue-100 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30 flex items-center gap-1"
                    >
                        📱 Ver QR
                    </button>
                )}

                {/* --- INDICADOR DE CUPOS TALLER --- */}
                {esTaller && (
                    <div className="mt-6 bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10 inline-block animate-in zoom-in">
                        <p className="text-[10px] text-white/80 uppercase tracking-widest mb-1">Ocupación Actual</p>
                        <div className="text-3xl font-bold text-white font-dm-sans leading-none">
                            {ocupados} <span className="text-white/40 text-xl font-normal">/ {capacidad}</span>
                        </div>
                        {ocupados >= capacidad && (
                            <div className="mt-2 text-xs bg-red-500 text-white px-3 py-1 rounded-full font-bold shadow-md animate-pulse">
                                ⛔ AGOTADO
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="w-full max-w-md flex flex-col gap-6 pb-20">

                {/* --- SECCIÓN EXCLUSIVA TALLER: BOTONERA MASIVA --- */}
                {esTaller && (
                    <div className="bg-[#EF0886]/10 p-4 rounded-2xl shadow-xl border border-[#EF0886]/50 mb-2">
                        <h3 className="text-white font-bold mb-3 text-center uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                            <span>⚡</span> Panel de Control Taller <span>⚡</span>
                        </h3>
                        <div className="flex gap-3">
                            <button
                                onClick={handleLlamarTodos}
                                disabled={filaEspera.length === 0}
                                className="flex-1 bg-[#EF0886] hover:bg-pink-600 disabled:opacity-50 disabled:bg-gray-500 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-lg active:scale-95"
                            >
                                📢 Llamar Grupo <br />
                                <span className="text-xs font-normal opacity-80">(Entran {filaEspera.length})</span>
                            </button>
                            <button
                                onClick={handleFinalizarTodos}
                                // Habilitado si hay alguien en curso (LLAMADO)
                                disabled={turnos.filter(t => t.estado === 'LLAMADO').length === 0}
                                className="flex-1 bg-white text-[#EF0886] hover:bg-gray-100 disabled:opacity-50 disabled:text-gray-400 font-bold py-4 rounded-xl text-sm transition-all border border-[#EF0886] shadow-lg active:scale-95"
                            >
                                🏁 Finalizar <br />
                                <span className="text-xs font-normal opacity-80">Actividad</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- SECCIÓN: EN CURSO (Solo visible si NO es taller o si queremos ver detalle) --- */}
                {/* En Taller, quizás no interesa ver uno por uno, pero lo dejamos por si acaso */}
                <div className={`bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 ${esTaller ? 'opacity-80' : ''}`}>
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        {esTaller ? `Adentro del Taller (${turnos.filter(t => t.estado === 'LLAMADO').length})` : 'En curso'}
                    </h3>

                    {/* Si es taller, mostramos lista compacta. Si es normal, tarjeta grande */}
                    {esTaller ? (
                        <div className="flex flex-wrap gap-2">
                            {turnos.filter(t => t.estado === 'LLAMADO').map(t => (
                                <span key={t.id} className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-md">
                                    {t.visitanteNombre}
                                </span>
                            ))}
                            {turnos.filter(t => t.estado === 'LLAMADO').length === 0 && (
                                <span className="text-white/40 text-sm italic">Sala vacía</span>
                            )}
                        </div>
                    ) : (
                        turnoActual ? (
                            <div className="bg-white rounded-2xl p-4 shadow-lg">
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
                        )
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
                                    {/* En modo Taller, ocultamos el botón individual de llamar para no confundir, o lo dejamos opcional */}
                                    {!esTaller && (
                                        <button
                                            onClick={() => handleLlamar(turno.id)}
                                            disabled={!!turnoActual}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${!!turnoActual ? 'bg-gray-200 text-gray-400' : 'bg-green-100 text-green-600'}`}
                                        >
                                            ▶
                                        </button>
                                    )}
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

            {/* Footer y Modales... */}
            <div className="mt-auto opacity-60">
                <img src={flameLogo} alt="" className="w-10" />
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-white rounded-[21px] p-6 text-center max-w-xs w-full shadow-2xl animate-in zoom-in">
                        <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-gray-400">✕</button>
                        <h3 className="text-lg font-bold text-brand-dark mb-6 font-dm-sans uppercase leading-tight">
                            ¿Querés eliminar <br /> a este admin?
                        </h3>
                        <button onClick={handleEliminarEncargado} className="w-full bg-[#A822E5] hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg mb-0">
                            Confirmar
                        </button>
                    </div>
                </div>
            )}

            {isEditModalOpen && proyecto && (
                <CreateProjectModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        fetchData();
                    }}
                    projectToEdit={proyecto}
                />
            )}

            {id && (
                <AddManualVisitorModal
                    isOpen={isManualAddOpen}
                    onClose={() => setIsManualAddOpen(false)}
                    proyectoId={id}
                />
            )}
            {showQRModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-xs flex flex-col items-center shadow-2xl relative animate-in zoom-in duration-300">
                        {/* Botón cerrar */}
                        <button
                            onClick={() => setShowQRModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center"
                        >
                            ✕
                        </button>

                        <h3 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">Código QR</h3>
                        <p className="text-xs text-gray-500 mb-6 text-center px-4">
                            Imprimí esto y pegalo en el stand para que la gente se anote sola.
                        </p>

                        {/* El QR Generado por código (NO IMAGEN) */}
                        <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl mb-6 bg-white">
                            <QRCode
                                id="StandQR" // ID IMPORTANTE PARA LA DESCARGA
                                value={qrTargetUrl}
                                size={200}
                                level="H" // High Error Correction
                            />
                        </div>

                        {/* Botón de descarga */}
                        <button
                            onClick={handleDescargarQR}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                            <span>📥</span> Descargar PNG
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}