import React, {useEffect, useRef, useState} from 'react';
import './App.css';


function App() {
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef(null)
  

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')


    const resizeCanvas = () => {
      const {width, height} = canvas.getBoundingClientRect()

      const dpr = window.devicePixelRatio.devicePixelRatio || 1;
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      context.scale(dpr, dpr)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)



    const startDrawing = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      console.log(x,y)
      context.beginPath()
      context.moveTo(x,y)
      setIsDrawing(true)
    }

    const draw = (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      console.log(x,y)
      context.lineTo(x,y)
      context.stroke()
    }

    const stopDrawing = () => {
      context.closePath()
      setIsDrawing(false)
    }

    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('mouseleave', stopDrawing)
    
  }, [])


  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')
    context.clearRect(0,0,canvas.width,canvas.height)
  }
  const drawRect = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')
    context.rect(20,20,100,100)
    context.fill()
  }


  return (
    <div className='main-container'>
      <canvas ref={canvasRef} className='canvas'></canvas>
      <div className='toolbar'>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={drawRect}>draw</button>
      </div>
    </div>
  )
}

export default App;
