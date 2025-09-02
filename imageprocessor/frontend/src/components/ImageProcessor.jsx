import React, { useState, useCallback } from 'react';

const ImageProcessor = ({ onNavigate }) => {
  const [removeBackground, setRemoveBackground] = useState(false);
  const [resize, setResize] = useState(false);
  const [width, setWidth] = useState('400');
  const [height, setHeight] = useState('400');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Toggle switches
  const handleRemoveBackgroundToggle = () => {
    setRemoveBackground(!removeBackground);
  };

  const handleResizeToggle = () => {
    setResize(!resize);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  // Handle file input change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  // Process files
  const handleFiles = (files) => {
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      file.name.endsWith('.zip')
    );

    imageFiles.forEach(file => {
      if (file.name.endsWith('.zip')) {
        // Handle ZIP file (placeholder)
        console.log('ZIP file detected:', file.name);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            url: e.target.result,
            file: file
          };
          setUploadedImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Process images
  const processImages = async () => {
    if (uploadedImages.length === 0) return;
    
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      const processed = uploadedImages.map(img => ({
        ...img,
        id: 'processed_' + img.id,
        processed: true,
        operations: {
          backgroundRemoved: removeBackground,
          resized: resize,
          dimensions: resize ? `${width}x${height}` : 'original'
        }
      }));
      
      setProcessedImages(processed);
      setIsProcessing(false);
    }, 2000);
  };

  // Download all images
  const downloadAll = () => {
    // Simulate download
    alert('Descargando archivo ZIP con todas las imágenes procesadas...');
  };

  return (
    <div className="min-h-screen app-background">
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo-section">
            <div className="logo-box">
              <span className="logo-text">TR</span>
            </div>
            <span className="brand-name">TechResources</span>
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

      {/* Main Content */}
      <div className="processor-container">
        <div className="processor-grid">
          
          {/* Left Column - Upload and Controls */}
          <div className="processor-main">
            {/* Title */}
            <h1 className="processor-title">Procesador de Imágenes</h1>
            <p className="processor-subtitle">Sube múltiples imágenes para procesar o archivos ZIP de imágenes</p>

            {/* Upload Area */}
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <div className="upload-content">
                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="upload-title">Arrastra tus imágenes aquí</h3>
                  <p className="upload-description">o haz clic para seleccionar archivos</p>
                  <button className="upload-button">
                    Seleccionar Archivos
                  </button>
                </div>
              </div>
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*,.zip"
                onChange={handleFileChange}
                className="hidden-input"
              />
            </div>

            {/* Control Switches */}
            <div className="controls-panel">
              <h3 className="controls-title">Métodos de Procesamiento</h3>
              
              {/* Remove Background Switch */}
              <div className="control-row">
                <span className="control-label">Eliminar Fondo</span>
                <button
                  onClick={handleRemoveBackgroundToggle}
                  className={`toggle-switch ${removeBackground ? 'active' : ''}`}
                >
                  <div className="toggle-slider" />
                </button>
              </div>

              {/* Resize Switch */}
              <div className="control-row">
                <span className="control-label">Redimensionar</span>
                <button
                  onClick={handleResizeToggle}
                  className={`toggle-switch ${resize ? 'active' : ''}`}
                >
                  <div className="toggle-slider" />
                </button>
              </div>
            </div>

            {/* Uploaded Images List */}
            {uploadedImages.length > 0 && (
              <div className="images-panel">
                <h3 className="panel-title">
                  Imágenes Cargadas ({uploadedImages.length})
                </h3>
                <div className="images-grid">
                  {uploadedImages.map((img) => (
                    <div key={img.id} className="image-item">
                      <img 
                        src={img.url} 
                        alt={img.name}
                        className="image-thumbnail"
                      />
                      <p className="image-name">{img.name}</p>
                      <p className="image-size">{(img.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Process Button */}
            {uploadedImages.length > 0 && (
              <button
                onClick={processImages}
                disabled={isProcessing}
                className={`process-button ${isProcessing ? 'processing' : ''}`}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>Procesar Imágenes</span>
                )}
              </button>
            )}
          </div>

          {/* Right Column - Dimension Controls */}
          <div className="processor-sidebar">
            {/* Dimension Controls - Only visible when resize is ON */}
            {resize && (
              <div className="dimensions-panel">
                <h3 className="panel-title">Dimensiones personalizadas</h3>
                
                <div className="dimensions-form">
                  <div className="input-group">
                    <label className="input-label">Ancho</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="dimension-input"
                      placeholder="400"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Alto</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="dimension-input"
                      placeholder="400"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const size = Math.max(parseInt(width) || 400, parseInt(height) || 400);
                      setWidth(size.toString());
                      setHeight(size.toString());
                    }}
                    className="square-button"
                  >
                    Procesar Imágenes
                  </button>
                  
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Processed Images Section */}
      {processedImages.length > 0 && (
        <div className="results-container">
          <div className="results-panel">
            <div className="results-header">
              <h2 className="results-title">
                <svg className="results-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.586 2.586a2 2 0 010 2.828l-6.586 6.586a2 2 0 01-2.828 0L3 14l4.586-4.586a2 2 0 012.828 0L13 12.586z" />
                </svg>
                <span>Imágenes Procesadas</span>
              </h2>
              
              <button
                onClick={downloadAll}
                className="download-button"
              >
                Descargar ZIP
              </button>
            </div>

            <div className="results-grid">
              {processedImages.map((img) => (
                <div key={img.id} className="result-item">
                  <img 
                    src={img.url} 
                    alt={img.name}
                    className="result-thumbnail"
                  />
                  <p className="result-name">{img.name}</p>
                  <div className="result-operations">
                    {img.operations.backgroundRemoved && (
                      <div className="operation-tag blue">
                        <div className="operation-dot"></div>
                        <span>Fondo eliminado</span>
                      </div>
                    )}
                    {img.operations.resized && (
                      <div className="operation-tag green">
                        <div className="operation-dot"></div>
                        <span>{img.operations.dimensions}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageProcessor;