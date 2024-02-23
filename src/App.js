import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client'
import './App.css';
const socket = io('http://localhost:3001')


function App() {
  const [isDrawing, setIsDrawing] = useState(false)
  const [newTool, setNewTool] = useState("draw")
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
      if(newTool !== "draw") return;
        isDrawingRef.current = true
        context.beginPath()
        const {x, y} = getMousePos(canvas, e)
        lastX = x
        lastY = y
    }

    function endDrawing(e) {
      if(newTool !== "draw") return;
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
      if(!isDrawingRef.current) return;
      
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
    
    if(newTool === "square"){
      window.removeEventListener("mousedown", startDrawing)
      window.removeEventListener("mouseup", endDrawing)
      window.removeEventListener("mousemove", draw)
    } else {

      window.addEventListener("mousedown", startDrawing)
      window.addEventListener("mouseup", endDrawing)
      window.addEventListener("mousemove", draw)
    }
    
  }, [newTool])



  // SQUARE TOOL

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
  
    let isDrawingSquare = false; // Track whether we're currently drawing a square
    let start = {}; // Starting point for the square

    function getMousePos(canvas, evt) {
      var rect = canvas.getBoundingClientRect(),
      scaleX = canvas.width / rect.width,
      scaleY = canvas.height / rect.height;
      
      return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
      }
    }
  
    function startRect(e) {
      isDrawingSquare = true; // Set drawing state to true
      start = getMousePos(canvas, e); // Save the start position
    }
    
    function drawRect(e) {
      if (!isDrawingSquare) return; // Only draw if isDrawingSquare is true
      const end = getMousePos(canvas, e); // Current mouse position
      
      // Clear any existing drawing on the canvas
      // Optionally, you could only clear the last drawn square instead of the whole canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
  
      // Calculate width and height of the rectangle
      const width = end.x - start.x;
      const height = end.y - start.y;
  
      // Draw the rectangle
      context.beginPath();
      context.rect(start.x, start.y, width, height);
      context.stroke();
    }
  
    function endRect() {
      if (!isDrawingSquare) return; // Exit if we weren't drawing
      isDrawingSquare = false; // Reset drawing state
    }
  
    if (newTool === "square") {
      canvas.addEventListener("mousedown", startRect);
      canvas.addEventListener("mousemove", drawRect);
      window.addEventListener("mouseup", endRect); // Use window to ensure we catch mouseup even if the mouse leaves the canvas
    }
  
    // Cleanup function to remove event listeners
    return () => {
      canvas.removeEventListener("mousedown", startRect);
      canvas.removeEventListener("mousemove", drawRect);
      window.removeEventListener("mouseup", endRect);
    };
  
  }, [newTool]);









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
    if(newTool !== "square"){
      setNewTool("square")
    } else {
      setNewTool("draw")
    }
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
