
// 1. Definimos la interfaz (el contrato de qué datos van a entrar)
interface NavbarProps {
  count: number;
  // Este es el tipo exacto que usa React para el setCount de un useState<number>
  setCount: React.Dispatch<React.SetStateAction<number>>;
}
function Navbar({ count, setCount }: NavbarProps) {
  return (
    <div>{count}</div>
  )
}

export default Navbar