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
    
    const [mensajeExito, setMensajeExito] = useState('');
    
    // Referencia para volver a enfocar el input después de agregar
    const inputRef = useRef<HTMLInputElement>(null);
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;

        setLoading(true);
        setMensajeExito('');
        try {
            // 1. Crear el Visitante (usamos el servicio público, no importa)
            // Esto nos devuelve el ID del nuevo visitante
            const dataVisitante = await ingresarVisitante(nombre);

            // 2. Sacar turno A NOMBRE DE ese visitante
            // Como estamos logueados como ADMIN, el backend nos deja pasar el 'visitanteId'
            await solicitarTurno(proyectoId, dataVisitante.visitante.id);

            setMensajeExito(`✓ ${nombre} agregado`);
            setNombre('');

            // D. Mantenemos el foco en el input para seguir escribiendo sin usar el mouse
            setTimeout(() => {
                inputRef.current?.focus();
                // Opcional: Borrar el mensaje de éxito después de 2 segundos
                setTimeout(() => setMensajeExito(''), 2000);
            }, 100);

            onClose();

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
                        ¿Agregar una <br /> persona a la fila?
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Nombre y Apellido"
                        required
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#D29C3C] font-medium"
                    />

                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#D29C3C] hover:bg-yellow-600 text-white font-bold py-3 rounded-xl shadow-lg"
                        >
                            {loading ? '...' : 'Confirmar'}
                        </Button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white border-2 border-[#D29C3C] text-[#D29C3C] font-bold py-3 rounded-xl hover:bg-yellow-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}