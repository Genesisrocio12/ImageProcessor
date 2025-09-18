import React, { useState, useCallback, useRef, useEffect } from 'react';
import logoImage from './image/TechResources.png';

const ImageProcessor = ({ onNavigate }) => {
  const [backgroundRemoval, setBackgroundRemoval] = useState(false);
  const [resize, setResize] = useState(false);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedResults, setProcessedResults] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [switchProcessing, setSwitchProcessing] = useState(false); // Para controlar el loading de switches

  const fileInputRef = useRef(null);
  const API_BASE_URL = 'http://localhost:5000/api';

  // Auto-procesar cuando se activan switches con archivos ya cargados
  useEffect(() => {
    if (uploadedFiles.length > 0 && sessionId && (backgroundRemoval || resize) && !loading && !processing && !switchProcessing) {
      setSwitchProcessing(true);
      const timer = setTimeout(() => {
        handleProcess().finally(() => {
          setSwitchProcessing(false);
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    // Limpiar resultados cuando se desactivan todos los switches
    if (!backgroundRemoval && !resize) {
      setProcessedResults([]);
      setSuccess('');
    }
  }, [backgroundRemoval, resize]);

  // Manejar drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Manejar drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  // Manejar input de archivos
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Procesar archivos cargados
  const handleFiles = async (files) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error subiendo archivos');
      }

      const data = await response.json();
      
      setUploadedFiles(prev => [...prev, ...data.files]);
      setSessionId(data.session_id);
      
      // Auto-procesar si hay switches activos
      if (backgroundRemoval || resize) {
        setTimeout(() => {
          handleProcessWithSession(data.session_id);
        }, 500);
      }
      
      if (data.errors && data.errors.length > 0) {
        setError(`Advertencias: ${data.errors.join(', ')}`);
      }

    } catch (err) {
      setError(err.message);
      console.error('Error uploading files:', err);
    } finally {
      setLoading(false);
    }
  };

  // Procesar imágenes
  const handleProcess = async () => {
    if (!sessionId || uploadedFiles.length === 0) {
      setError('No hay archivos para procesar');
      return;
    }

    if (!backgroundRemoval && !resize) {
      setError('Debe activar al menos una opción de procesamiento');
      return;
    }

    return await handleProcessWithSession(sessionId);
  };

  // Procesar con session específica
  const handleProcessWithSession = async (currentSessionId) => {
    setError('');
    setProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          background_removal: backgroundRemoval,
          resize: resize,
          width: customWidth ? parseInt(customWidth) : null,
          height: customHeight ? parseInt(customHeight) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error procesando imágenes');
      }

      const data = await response.json();
      setProcessedResults(data.results);
      setSuccess(`${data.stats.successful} de ${data.stats.total} imágenes procesadas exitosamente`);
      
    } catch (err) {
      setError(err.message);
      console.error('Error processing images:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Descargar resultados
  const handleDownload = async () => {
    if (!sessionId) {
      setError('No hay archivos para descargar');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/download/${sessionId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error descargando archivos');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `imagenes_procesadas_${Date.now()}.zip`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Descarga completada');

    } catch (err) {
      setError(err.message);
      console.error('Error downloading files:', err);
    }
  };

  // Abrir selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Limpiar archivos
  const clearFiles = () => {
    setUploadedFiles([]);
    setProcessedResults([]);
    setSessionId(null);
    setError('');
    setSuccess('');
    setSwitchProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Verificar si debe mostrar sección de resultados
  const shouldShowResults = (backgroundRemoval || resize) && processedResults.length > 0;

  // Función para manejar toggle de background removal
  const handleBackgroundRemovalToggle = () => {
    if (!processing && !switchProcessing) {
      setBackgroundRemoval(!backgroundRemoval);
    }
  };

  // Función para manejar toggle de resize
  const handleResizeToggle = () => {
    if (!processing && !switchProcessing) {
      setResize(!resize);
    }
  };

  return (
    <div className="min-h-screen app-background">
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo-section">
            <img 
              src={logoImage}
              alt="TechResources Logo"
              className="logo-image"
            />
          </div>
          <nav className="navigation">
            <button onClick={() => onNavigate('home')} className="nav-link">
              Inicio
            </button>
            <button onClick={() => onNavigate('procesador')} className="nav-link nav-active">
              Procesador
            </button>
            <button onClick={() => onNavigate('ayuda')} className="nav-link">
              Ayuda
            </button>
            <button onClick={() => onNavigate('contacto')} className="nav-link">
              Contacto
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="processor-main">
        <div className="processor-container">
          <div className="processor-page-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="245" height="39" fill="none" viewBox="0 0 245 39">
              <path fill="url(#a)" d="M5.636 7.727V31H2.818V7.727h2.818ZM10.923 31V13.546h2.591v2.727h.228c.363-.932.95-1.656 1.76-2.17.811-.524 1.785-.785 2.921-.785 1.152 0 2.11.261 2.875.784.773.515 1.375 1.239 1.807 2.17h.182a5.085 5.085 0 0 1 2.011-2.147c.894-.538 1.966-.807 3.216-.807 1.56 0 2.837.489 3.83 1.466.992.97 1.488 2.481 1.488 4.534V31h-2.681V19.318c0-1.288-.353-2.208-1.057-2.761-.705-.553-1.534-.83-2.489-.83-1.227 0-2.178.372-2.852 1.114-.674.735-1.012 1.667-1.012 2.795V31h-2.727V19.046c0-.993-.322-1.792-.966-2.398-.644-.614-1.473-.92-2.488-.92-.697 0-1.349.185-1.955.556a4.205 4.205 0 0 0-1.454 1.546c-.364.651-.546 1.405-.546 2.26V31h-2.682Zm32.95.41c-1.107 0-2.11-.21-3.012-.626a5.168 5.168 0 0 1-2.148-1.83c-.53-.803-.795-1.772-.795-2.909 0-1 .197-1.81.59-2.431a4.17 4.17 0 0 1 1.58-1.478 8.301 8.301 0 0 1 2.182-.795c.803-.182 1.61-.326 2.42-.432 1.06-.136 1.92-.238 2.58-.307.667-.076 1.151-.2 1.454-.375.311-.174.466-.477.466-.909v-.09c0-1.122-.306-1.993-.92-2.614-.606-.622-1.527-.932-2.762-.932-1.28 0-2.284.28-3.01.84-.728.561-1.24 1.16-1.535 1.796l-2.545-.909c.454-1.06 1.06-1.886 1.818-2.477a6.814 6.814 0 0 1 2.5-1.25 10.38 10.38 0 0 1 2.682-.364c.56 0 1.204.068 1.931.205a6.184 6.184 0 0 1 2.125.806c.69.41 1.262 1.027 1.716 1.853.455.826.682 1.932.682 3.318V31H49.19v-2.364h-.136c-.182.38-.485.785-.91 1.216-.423.432-.988.8-1.692 1.102-.705.304-1.565.455-2.58.455ZM44.28 29c1.06 0 1.955-.208 2.682-.625.735-.417 1.288-.954 1.66-1.614a4.118 4.118 0 0 0 .567-2.08v-2.454c-.113.137-.363.262-.75.375-.378.106-.818.201-1.318.284-.492.076-.973.144-1.443.205-.462.053-.837.098-1.125.136a10.22 10.22 0 0 0-1.955.444c-.598.196-1.083.496-1.454.897-.364.394-.546.932-.546 1.614 0 .932.345 1.636 1.035 2.114.697.47 1.58.704 2.647.704Zm19.532 8.91c-1.296 0-2.41-.168-3.341-.5-.932-.327-1.709-.758-2.33-1.296a7.088 7.088 0 0 1-1.466-1.705l2.136-1.5c.243.318.55.682.921 1.091.371.417.879.776 1.523 1.08.651.31 1.504.465 2.556.465 1.41 0 2.573-.34 3.49-1.022.916-.682 1.374-1.75 1.374-3.205v-3.545h-.227c-.197.318-.477.712-.841 1.181-.356.463-.871.875-1.546 1.24-.666.355-1.568.533-2.704.533-1.41 0-2.674-.333-3.795-1-1.114-.666-1.997-1.636-2.648-2.909-.644-1.273-.966-2.818-.966-4.636 0-1.788.314-3.345.943-4.67.629-1.334 1.504-2.364 2.625-3.091 1.121-.735 2.417-1.103 3.886-1.103 1.137 0 2.038.19 2.705.568.674.372 1.19.796 1.545 1.273.364.47.644.856.841 1.16h.273v-2.773h2.591V31.5c0 1.5-.341 2.72-1.023 3.66-.674.946-1.583 1.64-2.727 2.079-1.136.447-2.402.67-3.796.67Zm-.091-9.592c1.075 0 1.984-.246 2.727-.739.742-.492 1.307-1.2 1.693-2.125.386-.924.58-2.03.58-3.318 0-1.257-.19-2.367-.569-3.33-.378-.961-.939-1.715-1.681-2.26-.743-.546-1.66-.819-2.75-.819-1.137 0-2.084.288-2.841.864-.75.576-1.315 1.348-1.694 2.318-.37.97-.556 2.046-.556 3.227 0 1.213.19 2.285.568 3.216.386.924.954 1.652 1.704 2.182.758.523 1.697.784 2.819.784Zm19.863 3.046c-1.682 0-3.132-.372-4.352-1.114-1.212-.75-2.148-1.796-2.807-3.136-.651-1.349-.977-2.917-.977-4.705 0-1.788.326-3.363.977-4.727.66-1.371 1.576-2.44 2.75-3.205 1.182-.773 2.56-1.159 4.136-1.159.91 0 1.807.152 2.694.455a6.674 6.674 0 0 1 2.42 1.477c.727.674 1.307 1.568 1.739 2.682.432 1.114.647 2.485.647 4.114v1.136H77.358v-2.318h10.727c0-.985-.197-1.864-.59-2.637a4.452 4.452 0 0 0-1.66-1.83c-.712-.446-1.553-.67-2.522-.67-1.069 0-1.993.265-2.773.796a5.232 5.232 0 0 0-1.784 2.045 6.008 6.008 0 0 0-.625 2.705v1.545c0 1.318.227 2.436.681 3.352.463.91 1.103 1.603 1.921 2.08.818.47 1.769.704 2.852.704.705 0 1.341-.098 1.91-.295a4.088 4.088 0 0 0 1.488-.909c.417-.41.739-.917.966-1.523l2.59.727a5.745 5.745 0 0 1-1.374 2.319c-.644.659-1.44 1.174-2.387 1.545-.947.364-2.011.546-3.193.546ZM95.255 31V7.727h7.864c1.826 0 3.319.33 4.478.989 1.166.651 2.03 1.534 2.591 2.648.56 1.113.84 2.356.84 3.727s-.28 2.617-.84 3.739c-.554 1.12-1.41 2.015-2.569 2.681-1.159.66-2.644.989-4.454.989h-5.637V20h5.546c1.25 0 2.254-.216 3.011-.648.758-.431 1.307-1.015 1.648-1.75.348-.742.523-1.58.523-2.511 0-.932-.175-1.765-.523-2.5-.341-.735-.894-1.31-1.659-1.727-.765-.425-1.78-.637-3.046-.637h-4.954V31h-2.818Zm19.95 0V13.546h2.59v2.636h.182c.318-.864.894-1.565 1.728-2.102.833-.538 1.772-.807 2.818-.807.197 0 .443.004.738.011.296.008.519.019.671.034v2.728a7.878 7.878 0 0 0-.625-.103 6.152 6.152 0 0 0-1.012-.08c-.848 0-1.606.179-2.272.535a4.027 4.027 0 0 0-1.568 1.454c-.379.614-.569 1.315-.569 2.102V31h-2.681Zm18.465.364c-1.575 0-2.958-.375-4.147-1.125-1.182-.75-2.106-1.8-2.773-3.148-.659-1.349-.989-2.924-.989-4.727 0-1.819.33-3.406.989-4.762.667-1.356 1.591-2.409 2.773-3.159 1.189-.75 2.572-1.125 4.147-1.125 1.576 0 2.955.375 4.137 1.125 1.189.75 2.113 1.803 2.773 3.16.666 1.355 1 2.942 1 4.76 0 1.804-.334 3.38-1 4.728-.66 1.348-1.584 2.398-2.773 3.148-1.182.75-2.561 1.125-4.137 1.125Zm0-2.41c1.197 0 2.182-.306 2.955-.92.773-.613 1.345-1.42 1.716-2.42s.557-2.084.557-3.25c0-1.167-.186-2.254-.557-3.262-.371-1.007-.943-1.822-1.716-2.443s-1.758-.932-2.955-.932-2.181.31-2.954.932c-.773.621-1.345 1.436-1.716 2.443-.371 1.008-.557 2.095-.557 3.262 0 1.166.186 2.25.557 3.25.371 1 .943 1.806 1.716 2.42.773.614 1.757.92 2.954.92Zm19.094 2.41c-1.636 0-3.045-.387-4.227-1.16-1.182-.772-2.091-1.837-2.727-3.193-.637-1.356-.955-2.905-.955-4.647 0-1.773.326-3.338.977-4.694.659-1.363 1.576-2.428 2.75-3.193 1.182-.773 2.561-1.159 4.137-1.159 1.227 0 2.333.228 3.318.682a6.345 6.345 0 0 1 2.42 1.91c.629.817 1.019 1.772 1.171 2.863h-2.682c-.205-.796-.659-1.5-1.364-2.114-.697-.621-1.636-.932-2.818-.932-1.045 0-1.962.273-2.75.819-.78.537-1.39 1.299-1.829 2.284-.432.977-.648 2.125-.648 3.443 0 1.348.212 2.523.636 3.523.432 1 1.038 1.776 1.818 2.329.788.553 1.713.83 2.773.83.697 0 1.33-.122 1.898-.364a3.916 3.916 0 0 0 1.443-1.046c.394-.454.674-1 .841-1.636h2.682a6.224 6.224 0 0 1-1.125 2.784c-.591.818-1.375 1.47-2.352 1.955-.97.477-2.099.716-3.387.716Zm18.102 0c-1.681 0-3.132-.372-4.352-1.114-1.212-.75-2.148-1.796-2.807-3.136-.651-1.349-.977-2.917-.977-4.705 0-1.788.326-3.363.977-4.727.659-1.371 1.576-2.44 2.75-3.205 1.182-.773 2.561-1.159 4.137-1.159.909 0 1.807.152 2.693.455a6.673 6.673 0 0 1 2.42 1.477c.728.674 1.307 1.568 1.739 2.682.432 1.114.648 2.485.648 4.114v1.136h-13.455v-2.318h10.727c0-.985-.196-1.864-.59-2.637a4.457 4.457 0 0 0-1.66-1.83c-.712-.446-1.553-.67-2.522-.67-1.068 0-1.993.265-2.773.796a5.233 5.233 0 0 0-1.784 2.045 6.005 6.005 0 0 0-.625 2.705v1.545c0 1.318.227 2.436.682 3.352.462.91 1.102 1.603 1.92 2.08.818.47 1.769.704 2.852.704.705 0 1.341-.098 1.91-.295a4.086 4.086 0 0 0 1.488-.909c.417-.41.739-.917.966-1.523l2.591.727a5.747 5.747 0 0 1-1.375 2.319c-.644.659-1.439 1.174-2.386 1.545-.947.364-2.012.546-3.194.546Zm23.671-13.91-2.409.682a4.475 4.475 0 0 0-.671-1.17c-.287-.387-.681-.705-1.181-.955s-1.141-.375-1.921-.375c-1.068 0-1.958.247-2.67.739-.705.485-1.057 1.102-1.057 1.852 0 .667.242 1.194.727 1.58.485.386 1.243.708 2.273.966l2.591.636c1.56.379 2.723.958 3.488 1.739.766.773 1.148 1.769 1.148 2.988 0 1-.288 1.894-.864 2.682-.568.788-1.363 1.41-2.386 1.864-1.023.454-2.212.682-3.568.682-1.78 0-3.254-.387-4.421-1.16-1.166-.772-1.905-1.901-2.215-3.386l2.545-.636c.242.94.701 1.644 1.375 2.114.682.47 1.572.704 2.67.704 1.25 0 2.243-.265 2.978-.796.742-.537 1.113-1.181 1.113-1.931a2.03 2.03 0 0 0-.636-1.523c-.424-.417-1.076-.727-1.955-.932l-2.909-.682c-1.598-.378-2.772-.965-3.522-1.761-.743-.803-1.114-1.807-1.114-3.011 0-.985.277-1.856.83-2.614.56-.758 1.322-1.352 2.284-1.784.969-.432 2.068-.648 3.295-.648 1.727 0 3.083.379 4.068 1.136.993.758 1.697 1.758 2.114 3Zm16.719 0-2.409.682a4.475 4.475 0 0 0-.671-1.17c-.288-.387-.682-.705-1.182-.955-.5-.25-1.14-.375-1.92-.375-1.068 0-1.958.247-2.671.739-.704.485-1.056 1.102-1.056 1.852 0 .667.242 1.194.727 1.58.485.386 1.242.708 2.273.966l2.591.636c1.56.379 2.723.958 3.488 1.739.765.773 1.148 1.769 1.148 2.988 0 1-.288 1.894-.864 2.682-.568.788-1.363 1.41-2.386 1.864-1.023.454-2.212.682-3.568.682-1.781 0-3.254-.387-4.421-1.16-1.166-.772-1.905-1.901-2.216-3.386l2.546-.636c.242.94.701 1.644 1.375 2.114.682.47 1.572.704 2.67.704 1.25 0 2.243-.265 2.978-.796.742-.537 1.113-1.181 1.113-1.931a2.03 2.03 0 0 0-.636-1.523c-.424-.417-1.076-.727-1.955-.932l-2.909-.682c-1.598-.378-2.773-.965-3.523-1.761-.742-.803-1.113-1.807-1.113-3.011 0-.985.276-1.856.829-2.614.561-.758 1.322-1.352 2.284-1.784.97-.432 2.069-.648 3.296-.648 1.727 0 3.083.379 4.068 1.136.992.758 1.697 1.758 2.114 3Zm11.446 13.91c-1.576 0-2.959-.375-4.148-1.125-1.182-.75-2.106-1.8-2.773-3.148-.659-1.349-.988-2.924-.988-4.727 0-1.819.329-3.406.988-4.762.667-1.356 1.591-2.409 2.773-3.159 1.189-.75 2.572-1.125 4.148-1.125 1.575 0 2.954.375 4.136 1.125 1.189.75 2.114 1.803 2.773 3.16.666 1.355 1 2.942 1 4.76 0 1.804-.334 3.38-1 4.728-.659 1.348-1.584 2.398-2.773 3.148-1.182.75-2.561 1.125-4.136 1.125Zm0-2.41c1.197 0 2.182-.306 2.954-.92.773-.613 1.345-1.42 1.716-2.42s.557-2.084.557-3.25c0-1.167-.186-2.254-.557-3.262-.371-1.007-.943-1.822-1.716-2.443-.772-.621-1.757-.932-2.954-.932-1.197 0-2.182.31-2.955.932-.773.621-1.345 1.436-1.716 2.443-.371 1.008-.557 2.095-.557 3.262 0 1.166.186 2.25.557 3.25.371 1 .943 1.806 1.716 2.42.773.614 1.758.92 2.955.92ZM234.705 31V13.546h2.59v2.636h.182c.318-.864.894-1.565 1.728-2.102.833-.538 1.772-.807 2.818-.807.197 0 .443.004.738.011.296.008.519.019.671.034v2.728a7.878 7.878 0 0 0-.625-.103 6.152 6.152 0 0 0-1.012-.08c-.848 0-1.606.179-2.272.535a4.027 4.027 0 0 0-1.568 1.454c-.379.614-.569 1.315-.569 2.102V31h-2.681Z"/>
              <defs>
                <linearGradient id="a" x1="0" x2="245" y1="19.5" y2="19.5" gradientUnits="userSpaceOnUse">
                  <stop offset=".139" stop-color="#0B1425"/>
                  <stop offset=".779" stop-color="#294B8B"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="processor-title-section">
            <h2 className="processor-main-title">Procesador de Imágenes</h2>
            <p className="processor-main-subtitle">
              Sube múltiples imágenes o archivos ZIP y configura las opciones de procesamiento
            </p>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="message-error">
              {error}
            </div>
          )}

          {/* Cuadrícula de Contenido */}
          <div className="processor-content-grid">
          
            <div className="processor-upload-section">
              <div 
                className={`processor-upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="processor-upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="98" fill="none" viewBox="0 0 120 98">
                    <g clip-path="url(#a)">
                      <path fill="#000" fill-rule="evenodd" d="M112.5 85.75c0 3.381-3.36 6.125-7.5 6.125H85.62L57.99 69.013 90 42.872l22.5 18.375V85.75ZM15 91.875c-4.14 0-7.5-2.744-7.5-6.125v-2.876l29.794-21.792 37.71 30.793H15ZM30 12.25c8.284 0 15 5.485 15 12.25s-6.716 12.25-15 12.25c-8.284 0-15-5.485-15-12.25s6.716-12.25 15-12.25ZM105 0H15C6.716 0 0 5.485 0 12.25v73.5C0 92.515 6.716 98 15 98h90c8.284 0 15-5.485 15-12.25v-73.5C120 5.485 113.284 0 105 0ZM30 30.625c4.14 0 7.5-2.744 7.5-6.125s-3.36-6.125-7.5-6.125c-4.14 0-7.5 2.744-7.5 6.125s3.36 6.125 7.5 6.125Z" clip-rule="evenodd"/>
                    </g>
                    <defs>
                      <clipPath id="a">
                        <path fill="#fff" d="M0 0h120v98H0z"/>
                      </clipPath>
                    </defs>
                  </svg>
                  {loading ? (
                    <div className="loading-icon">⏳ Cargando...</div>
                  ) : (
                    <div className="folder-icon"></div>
                  )}
                </div>
                <h3 className="processor-upload-title">
                  {uploadedFiles.length > 0 
                    ? `${uploadedFiles.length} archivos cargados`
                    : 'Arrastra tus imágenes aquí'
                  }
                </h3>
                <p className="processor-upload-subtitle">
                  {uploadedFiles.length > 0 
                    ? 'Puedes agregar más archivos o resetear'
                    : 'o haz clic para seleccionar archivos'
                  }
                </p>
                
                <div className="upload-buttons">
                  <button 
                    className="processor-select-files-btn"
                    onClick={openFileSelector}
                    disabled={loading}
                  >
                    {uploadedFiles.length > 0 ? 'Agregar Más' : 'Seleccionar Archivos'}
                  </button>
                  
                  {uploadedFiles.length > 0 && (
                    <button 
                      className="processor-clear-btn"
                      onClick={clearFiles}
                      disabled={loading || processing || switchProcessing}
                    >
                      Resetear
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.zip"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Sección de opciones */}
            <div className="processor-options-section">
              <h3 className="processor-options-title">Opciones de Procesamiento</h3>
              
              <div className={`processor-option-card ${backgroundRemoval ? 'active' : ''}`}>
                <div className="processor-option-content">
                  <div className="processor-option-text">
                    <h4 className="processor-option-title">
                      Eliminar Fondo
                      {switchProcessing && backgroundRemoval && (
                        <span className="processing-indicator"> ⏳</span>
                      )}
                    </h4>
                    <p className="processor-option-description">
                      Remueve automáticamente el fondo
                    </p>
                  </div>
                  <div className="processor-option-toggle">
                    <div 
                      className={`processor-toggle ${backgroundRemoval ? 'processor-toggle-active' : ''} ${(processing || switchProcessing) ? 'disabled' : ''}`}
                      onClick={handleBackgroundRemovalToggle}
                    >
                      <div className="processor-toggle-slider"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`processor-option-card ${resize ? 'active' : ''}`}>
                <div className="processor-option-content">
                  <div className="processor-option-text">
                    <h4 className="processor-option-title">
                      Redimensionar
                      {switchProcessing && resize && (
                        <span className="processing-indicator"> ⏳</span>
                      )}
                    </h4>
                    <p className="processor-option-description">
                      Ajusta las dimensiones de la imagen
                    </p>
                  </div>
                  <div className="processor-option-toggle">
                    <div 
                      className={`processor-toggle ${resize ? 'processor-toggle-active' : ''} ${(processing || switchProcessing) ? 'disabled' : ''}`}
                      onClick={handleResizeToggle}
                    >
                      <div className="processor-toggle-slider"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimensiones personalizadas - Solo aparece cuando resize está ON */}
              {resize && (
                <div className="processor-dimensions-card">
                  <h4 className="processor-dimensions-title">Dimensiones personalizadas</h4>
                  <div className="processor-dimensions-inputs">
                    <div className="processor-input-group">
                      <label className="processor-input-label">Ancho (px):</label>
                      <input
                        type="number"
                        className="processor-dimension-input"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        placeholder="800"
                        disabled={processing || switchProcessing}
                      />
                    </div>
                    <div className="processor-input-group">
                      <label className="processor-input-label">Altura (px):</label>
                      <input
                        type="number"
                        className="processor-dimension-input"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        placeholder="600"
                        disabled={processing || switchProcessing}
                      />
                    </div>
                  </div>
                  
                  {/* Botón de procesamiento manual para resize */}
                  {uploadedFiles.length > 0 && !switchProcessing && (
                    <button 
                      className="processor-process-btn"
                      onClick={handleProcess}
                      disabled={processing || loading}
                      style={{ marginTop: '15px' }}
                    >
                      {processing ? 'Procesando...' : 'Procesar Imágenes'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sección de Resultados - Solo aparece cuando hay switches activos y resultados */}
          {shouldShowResults && (
             <div className="processor-results-section">
              <div className="processor-results-header">
                <div className="processor-results-header-left">
                  <div className="processor-results-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="84" height="70" fill="none" viewBox="0 0 84 70">
                    <path fill="#fff" d="M54.25 11.667 75.075 14l-17.15 14.292-3.675-16.625Zm-24.5 46.666L8.925 56l17.15-14.292 3.675 16.625ZM14 24.792l2.8-17.355L33.95 21.73 14 24.792Z"/>
                    <path fill="#fff" d="m16.275 30.917-7.35 1.166C8.75 33.104 8.75 33.98 8.75 35c0 6.708 2.8 13.125 8.05 18.083l5.25-3.791c-4.025-3.938-6.3-9.042-6.3-14.292 0-1.313.175-2.77.525-4.083ZM42 7.292c-9.45 0-17.85 3.354-23.975 8.604l4.9 4.083c4.9-4.229 11.55-6.854 19.075-6.854 1.575 0 3.325.146 4.9.438l1.225-5.688C46.2 7.438 44.1 7.292 42 7.292Zm25.725 31.791 7.35-1.166c.175-1.021.175-1.896.175-2.917 0-6.417-2.625-12.688-7.525-17.646L62.3 21c3.85 3.938 5.95 8.896 5.95 13.854 0 1.459-.175 2.917-.525 4.23Zm-6.65 10.938c-4.9 4.229-11.55 6.854-19.075 6.854a27.82 27.82 0 0 1-4.9-.438l-1.225 5.688c2.1.292 4.2.438 6.125.438 9.45 0 17.85-3.355 23.975-8.605l-4.9-3.937Z"/>
                    <path fill="#fff" d="m70 45.208-2.8 17.355L50.05 48.27 70 45.208Z"/>
                  </svg>
                  </div>
                  <h3 className="processor-results-title">Imágenes Procesadas</h3>
                </div>
                <p className="processor-results-stats">
                  {processedResults.filter(r => r.success).length} de {processedResults.length} procesadas exitosamente
                </p>
              </div>
              
              <div className="processor-results-content">
                <div className="results-grid">
                  {processedResults.map((result, index) => (
                    <div key={result.id} className={`result-item ${result.success ? 'success' : 'error'}`}>
                      <div className="result-preview">
                        {/* Mostrar preview de la imagen si está disponible */}
                        {result.success && result.preview_url ? (
                          <div className="result-image-preview">
                            <img 
                              src={result.preview_url} 
                              alt={result.original_name}
                              className="preview-image"
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid #e5e7eb'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="result-icon">
                            {result.success ? '✅' : '❌'}
                          </div>
                        )}
                        
                        <div className="result-info">
                          <h5 className="result-name">{result.original_name}</h5>
                          <p className="result-status">{result.message}</p>
                          
                          {result.success && (
                            <div className="result-details">
                              {result.final_size && (
                                <div className="size-info">
                                  <span className="size-label">Tamaño final:</span>
                                  <span className="size-value">{(result.final_size / 1024).toFixed(1)} KB</span>
                                </div>
                              )}
                              
                              {result.size_reduction !== null && result.size_reduction > 0 && (
                                <div className="size-info">
                                  <span className="size-label">Reducción:</span>
                                  <span className="size-value" style={{ color: '#10b981' }}>
                                    -{result.size_reduction.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                              
                              {result.operations && result.operations.length > 0 && (
                                <div className="result-operations">
                                  {result.operations.map((op, i) => (
                                    <small key={i} className="operation-detail">{op}</small>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="processor-download-section">
                <div className="download-info">
                  <span className="download-count">
                    {processedResults.filter(r => r.success).length} archivos listos para descargar
                  </span>
                </div>
                <button 
                  className="processor-download-btn"
                  onClick={handleDownload}
                  disabled={!processedResults.some(r => r.success)}
                >
                  {processedResults.filter(r => r.success).length === 1 
                    ? 'Descargar Imagen' 
                    : 'Descargar ZIP'
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ImageProcessor;