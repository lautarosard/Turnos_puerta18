import { useState } from 'react'
import Navbar from './components/Navbar.tsx'
import Footer from './components/Footer.tsx'
function App() {

  const [count, setCount] = useState(0)
  

  return (
    <>
      <Navbar count={count} setCount={setCount} />
      <Footer />
    </>
  )
}

export default App
