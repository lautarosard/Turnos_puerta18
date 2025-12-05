import { useEffect, useState } from "react";

interface Props {
  initialMinutes: number;
}

export function TicketTimer({ initialMinutes }: Props) {
  const [minutes, setMinutes] = useState(initialMinutes);

  // 1. Sincronizar si el backend manda un dato nuevo
  useEffect(() => {
    setMinutes(initialMinutes);
  }, [initialMinutes]);

  // 2. La lógica del reloj
  useEffect(() => {
    // Si ya llegamos a 0, no seguimos restando
    if (minutes <= 0) return;

    // Creamos un intervalo que corre cada 60 segundos (60000 ms)
    const intervalId = setInterval(() => {
      setMinutes((prevMinutes) => {
        if (prevMinutes <= 1) return 0; // Si queda 1, pasamos a 0
        return prevMinutes - 1;
      });
    }, 60000);

    // Limpieza: Si el componente se desmonta (cierran el cartel), borramos el reloj
    return () => clearInterval(intervalId);
  }, [minutes]);

  // 3. Renderizado condicional
  // Si es 0, mostramos un mensaje más amigable que "0 min"
  if (minutes <= 0) {
    return <span className="text-xl font-bold animate-pulse">¡En breve!</span>;
  }

  return (
    <span className="text-2xl font-bold">
      {minutes} min
    </span>
  );
}