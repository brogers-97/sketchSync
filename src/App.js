import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client'
import './App.css';
const socket = io('http://localhost:3001')


function App() {
  const [isDrawing, setIsDrawing] = useState(false)
  const [newTool, setNewTool] = useState("draw")
  const [savedCanvas, setSavedCanvas] = useState([])
  const [dontDraw, setDontDraw] = useState(false)
  const [lineColor, setLineColor] = useState('red')
  const undoButtonRef = useRef(null)
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(isDrawing);







  //SERVER COMMUNICATION

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to backend')
    })
    socket.on('draw_action', (data) => {
      updateCanvas(data)
    })
  })

  useEffect(() => {
    const handleMouseOver = () => {
      console.log('undo button')
      setDontDraw(true)
    }
    const button = undoButtonRef.current
    if (button) {
      button.addEventListener('mouseover', handleMouseOver)
    }
    
  }, [])


  


  

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

    

    const saveCanvasState = () => {
      const canvas = canvasRef.current
      const imageDataUrl = canvas.toDataURL('image/png')
      setSavedCanvas([savedCanvas.push(imageDataUrl)])
      // console.log(savedCanvas)
    }
  
    



    //MAIN DRAW FUNCTIONS

    let lastX, lastY;

    function startDrawing(e) {
      if(newTool !== "draw") return;
        isDrawingRef.current = true
        context.strokeStyle = lineColor
        context.beginPath()
        const {x, y} = getMousePos(canvas, e)
        lastX = x
        lastY = y
    }

    function endDrawing(e) {
      if(newTool !== "draw") return;
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        if(dontDraw === false){
          saveCanvasState(); 
        }
        lastX = undefined;
        lastY = undefined;
      }
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
  
    let isDrawingSquare = false; 
    let start = {}; 

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
      isDrawingSquare = true; 
      start = getMousePos(canvas, e); 
    }
    
    function drawRect(e) {
      if (!isDrawingSquare) return; 
      const end = getMousePos(canvas, e); 
      context.clearRect(0, 0, canvas.width, canvas.height);
      const width = end.x - start.x;
      const height = end.y - start.y;
      context.beginPath();
      context.rect(start.x, start.y, width, height);
      context.stroke();
    }
  
    function endRect() {
      if (!isDrawingSquare) return;
      isDrawingSquare = false;
    }
  
    if (newTool === "square") {
      canvas.addEventListener("mousedown", startRect);
      canvas.addEventListener("mousemove", drawRect);
      window.addEventListener("mouseup", endRect);
    }
    
    
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
  // const isSquare = () => {
  //   if(newTool !== "square"){
  //     setNewTool("square")
  //   } else {
  //     setNewTool("draw")
  //   }
  // }


  const undoButton = () => {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(img, 0,0, canvas.width, canvas.height)
      }
      img.src = savedCanvas[savedCanvas.length -1]
      setDontDraw(false)
    }











  return (
    <div className='main-container'>
      <canvas ref={canvasRef} className='canvas'></canvas>
      <div className='toolbar'>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={() => setLineColor('red')}>Red</button>
        {/* <button onClick={isSquare}>Square</button> */}
        <button ref={undoButtonRef} onClick={undoButton}>Undo</button>
      </div>
    </div>
  )
}

export default App;
