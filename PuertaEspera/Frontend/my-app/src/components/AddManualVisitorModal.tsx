import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { ingresarVisitante } from '../services/visitanteService';
import { solicitarTurno } from '../services/turnoService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    proyectoId: string;
}

export function AddManualVisitorModal({ isOpen, onClose, proyectoId }: Props) {
    const [nombre, setNombre] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Estado para el mensaje verde. Si no lo usas en el return, da error.
    const [mensajeExito, setMensajeExito] = useState(''); 
    
    // Referencia para volver a enfocar el input
    const inputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;

        setLoading(true);
        setMensajeExito(''); 

        try {
            // 1. Crear el Visitante
            const dataVisitante = await ingresarVisitante(nombre);

            // 2. Sacar turno
            await solicitarTurno(proyectoId, dataVisitante.visitante.id);

            // Asignamos el mensaje
            setMensajeExito(`✓ ${nombre} agregado`);
            setNombre('');

            // Devolvemos el foco al input
            setTimeout(() => {
                inputRef.current?.focus();
                // Borramos el mensaje a los 2 segundos
                setTimeout(() => setMensajeExito(''), 2000);
            }, 100);

        } catch (error: any) {
            console.error(error);
            alert("Error al agregar manual: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white rounded-[21px] w-full max-w-xs p-6 shadow-2xl animate-in zoom-in duration-200">

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-brand-dark font-dm-sans uppercase leading-tight">
                        Agregar Manualmente
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Nombre y Apellido"
                        required
                        autoFocus
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#D29C3C] font-medium transition-all"
                    />

                    {/* --- AQUÍ ES DONDE SE USA LA VARIABLE --- */}
                    {/* Si te falta este bloque, Vercel te tira error porque creaste la variable y no la usaste */}
                    {mensajeExito && (
                        <p className="text-green-600 text-sm font-bold text-center animate-in fade-in slide-in-from-top-1">
                            {mensajeExito}
                        </p>
                    )}

                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#D29C3C] hover:bg-yellow-600 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95"
                        >
                            {loading ? '...' : 'Confirmar'}
                        </Button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white border-2 border-[#D29C3C] text-[#D29C3C] font-bold py-3 rounded-xl hover:bg-yellow-50 transition-colors"
                        >
                            Listo
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}