import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client'
import './App.css';
const socket = io('http://localhost:3001')


function App() {


  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to backend')
    })
    socket.on('draw_action', (data) => {
      console.log('Drawing action received:',data)
    })
  })


  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(isDrawing);
  

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')



    //PIXEL CONTROL

    const resizeCanvas = () => {
      const container = document.querySelector('.main-container')
      const {width, height} = container.getBoundingClientRect()

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      context.scale(dpr, dpr)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)




    //MAIN DRAW FUNCTIONS

    function startDrawing(e) {
      console.log('start')
      
      isDrawingRef.current = true
      context.beginPath()
    }
    function endDrawing(e) {
      console.log('end')
      
      isDrawingRef.current = false
    }
    function getMousePos(canvas, evt) {
      var rect = canvas.getBoundingClientRect(),
      scaleX = canvas.width / rect.width,
      scaleY = canvas.height / rect.height;
      
      return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
      }
    }
    function draw(e) {
      if(!isDrawingRef.current) return;
      console.log('drawing')
      let {x,y} = getMousePos(canvas, e)
      context.lineTo(x,y)
      context.stroke()
    }
    
    window.addEventListener("mousedown", startDrawing)
    window.addEventListener("mouseup", endDrawing)
    window.addEventListener("mousemove", draw)
    
  }, [])






  //TOOLBAR FUNCTIONS

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')
    context.clearRect(0,0,canvas.width,canvas.height)
  }
  const drawRect = () => {
    console.log('click')
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')
    context.rect(20,20,100,100)
    context.fill()
  }
  const Click = () => {
    console.log('click')
  }


  return (
    <div className='main-container'>
      <canvas ref={canvasRef} className='canvas'></canvas>
      <div className='toolbar'>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={drawRect}>draw</button>
        <button onClick={Click}>Click me</button>
      </div>
    </div>
  )
}

export default App;
