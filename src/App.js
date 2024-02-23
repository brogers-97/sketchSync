import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client'
import './App.css';
const socket = io('http://localhost:3001')


function App() {
  const [isDrawing, setIsDrawing] = useState(false)
  const [square, setSquare] = useState(false)
  const [newTool, setNewTool] = useState(false)
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(isDrawing);







  //SERVER COMMUNICATION

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to backend')
    })
    socket.on('draw_action', (data) => {
      console.log('Drawing action received:',data)
      updateCanvas(data)
    })
  })


  


  

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

    let lastX, lastY;

    function startDrawing(e) {
        isDrawingRef.current = true
        context.beginPath()
        const {x, y} = getMousePos(canvas, e)
        lastX = x
        lastY = y
    }

    function endDrawing(e) {
      isDrawingRef.current = false
      lastX = undefined
      lastY = undefined
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
      if(!isDrawingRef.current || square) return;
      
        //data sent to server
        let {x,y} = getMousePos(canvas, e)
        if (lastX !== undefined && lastY !== undefined) {
          const drawingData = {x,y, prevX: lastX, prevY: lastY}
          socket.emit('draw_action', drawingData)
        }

      lastX = x
      lastY = y

      context.lineTo(x,y)
      context.stroke()
    }
    
    if(square === true){
      window.removeEventListener("mousedown", startDrawing)
      window.removeEventListener("mouseup", endDrawing)
      window.removeEventListener("mousemove", draw)
    } else {

      window.addEventListener("mousedown", startDrawing)
      window.addEventListener("mouseup", endDrawing)
      window.addEventListener("mousemove", draw)
    }
    
  }, [newTool])

  useEffect (() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')

    function getMousePos(canvas, evt) {
      var rect = canvas.getBoundingClientRect(),
      scaleX = canvas.width / rect.width,
      scaleY = canvas.height / rect.height;
      
      return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
      }
    }

    if(square === true){
      
      let start ={}
      
      function startRect(e) {
        start = getMousePos(canvas, e)
      }
      
      function endRect(e) {
        let {x,y} = getMousePos(canvas, e)
        context.fillRect(start.x, start.y, x - start.x, y - start.y)
      }
      
      window.addEventListener("mousedown", startRect)
      window.addEventListener("mousemove", endRect)
    }

  }, [newTool])









  function updateCanvas(data) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d')
    context.beginPath()
    context.moveTo(data.prevX, data.prevY)
    context.lineTo(data.x, data.y)
    context.stroke()
  }






  //TOOLBAR FUNCTIONS

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')
    context.clearRect(0,0,canvas.width,canvas.height)
  }
  const isSquare = () => {
    if(square == false){
      setSquare(true)
      setNewTool(!newTool)
    } else {
      setSquare(false)
      setNewTool(!newTool)
    }
    console.log(square)
  }











  return (
    <div className='main-container'>
      <canvas ref={canvasRef} className='canvas'></canvas>
      <div className='toolbar'>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={isSquare}>Square</button>
      </div>
    </div>
  )
}

export default App;
