interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button 
      className={`w-full bg-brand-purple hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}