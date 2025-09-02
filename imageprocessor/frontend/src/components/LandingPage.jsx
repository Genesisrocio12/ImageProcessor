import React from 'react';

const LandingPage = ({ onNavigate }) => {
  const handleStartProcessing = () => {
    onNavigate('procesador');
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
            <button onClick={() => onNavigate('home')} className="nav-link nav-active">
              Inicio
            </button>
            <button onClick={() => onNavigate('procesador')} className="nav-link">
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-text">
            <h1 className="hero-title">
              Procesamiento
              <br />
              <span className="hero-highlight">inteligente</span> de
              <br />
              imágenes
            </h1>
            <p className="hero-description">
              Elimina fondos y redimensiona tus imágenes de manera automática y profesional. 
              Procesa múltiples archivos simultáneamente con nuestra tecnología avanzada.
            </p>
            <button onClick={handleStartProcessing} className="cta-button">
              <span>Comenzar ahora</span>
              <svg className="cta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="hero-preview">
            <div className="preview-card">
              <h3 className="preview-title">Procesamiento rápido y sencillo</h3>
              <div className="preview-content">
                <div className="preview-placeholder">
                  <svg className="preview-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="preview-text">Vista previa de procesamiento</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {/* Eliminador de Fondo */}
            <div className="feature-card">
              <div className="feature-icon blue">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="feature-title">Eliminador de Fondo</h3>
              <p className="feature-description">
                Remueve automáticamente el fondo de cualquier imagen usando inteligencia artificial. 
                Perfecto para productos, retratos y diseños profesionales.
              </p>
              <ul className="feature-list">
                <li>• Procesamiento automático</li>
                <li>• Alta precisión en bordes</li>
                <li>• Preserva transparencia</li>
              </ul>
            </div>

            {/* Redimensionador */}
            <div className="feature-card">
              <div className="feature-icon green">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <h3 className="feature-title">Redimensionador Inteligente</h3>
              <p className="feature-description">
                Cambia el tamaño de tus imágenes a cualquier dimensión manteniendo la calidad. 
                Ideal para web, redes sociales y impresión.
              </p>
              <ul className="feature-list">
                <li>• Dimensiones personalizables</li>
                <li>• Preserva calidad de imagen</li>
                <li>• Formatos cuadrados y rectangulares</li>
              </ul>
            </div>

            {/* Procesamiento Masivo */}
            <div className="feature-card">
              <div className="feature-icon purple">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="feature-title">Procesamiento Masivo</h3>
              <p className="feature-description">
                Procesa múltiples imágenes simultáneamente. Carga archivos ZIP y descarga 
                todos los resultados en un solo archivo comprimido.
              </p>
              <ul className="feature-list">
                <li>• Carga múltiple de archivos</li>
                <li>• Soporte para archivos ZIP</li>
                <li>• Descarga masiva optimizada</li>
              </ul>
            </div>

            {/* Optimización Automática */}
            <div className="feature-card">
              <div className="feature-icon orange">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="feature-title">Optimización Automática</h3>
              <p className="feature-description">
                Reduce automáticamente el peso de las imágenes hasta un 60% sin perder calidad visual. 
                Perfecto para mejorar la velocidad de tu sitio web.
              </p>
              <ul className="feature-list">
                <li>• Compresión inteligente</li>
                <li>• Mejora Core Web Vitals</li>
                <li>• Mantiene calidad visual</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;