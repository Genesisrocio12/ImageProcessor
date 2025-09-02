import React, { useState } from 'react';

const HelpPage = ({ onNavigate }) => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const showSection = (sectionId) => {
    setActiveSection(sectionId);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "¿Cuántas imágenes puedo procesar a la vez?",
      answer: "No hay límite establecido en la cantidad de imágenes. Puedes procesar desde una sola imagen hasta cientos simultáneamente. El único límite es la capacidad de tu dispositivo."
    },
    {
      question: "¿Por qué solo exporta en formato PNG?",
      answer: "PNG es el formato ideal para web porque soporta transparencia (crucial para fondos eliminados), mantiene alta calidad y permite optimización avanzada. Nuestro sistema optimiza automáticamente los PNG reduciendo su peso sin perder calidad."
    },
    {
      question: "¿Mis imágenes se almacenan en servidores?",
      answer: "No. Todo el procesamiento se realiza localmente. Tus imágenes nunca salen de tu dispositivo ni se almacenan en servidores externos, garantizando tu privacidad completa."
    },
    {
      question: "¿Puedo usar ambas funciones al mismo tiempo?",
      answer: "Sí, puedes activar ambos switches simultáneamente. El sistema aplicará primero la eliminación de fondo y luego el redimensionamiento, preservando la transparencia durante todo el proceso."
    },
    {
      question: "¿Qué pasa si algunas imágenes fallan al procesarse?",
      answer: "El sistema procesará exitosamente todas las imágenes válidas y te notificará sobre cualquier archivo que no pudo procesarse, proporcionando detalles sobre la causa del error."
    }
  ];

  return (
    <div className="min-h-screen app-background">
      <nav className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-box">
              <span className="logo-text">TR</span>
            </div>
            <span className="brand-name">TechResources</span>
          </div>
          <div className="navigation">
            <button 
              className="nav-link"
              onClick={() => onNavigate('home')}
            >
              Inicio
            </button>
            <button 
              className="nav-link"
              onClick={() => onNavigate('procesador')}
            >
              Procesador
            </button>
            <button className="nav-link nav-active">Ayuda</button>
            <button 
              className="nav-link"
              onClick={() => onNavigate('contacto')}
            >
              Contacto
            </button>
          </div>
        </div>
      </nav>

      <div className="main-container" style={{ marginTop: '80px', padding: '2rem 0 4rem 0' }}>
        <div className="container">
          <div className="help-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ 
              fontSize: '2.5rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #081425, #1C1C1C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>
              Centro de Ayuda
            </h1>
            <p style={{ 
              fontSize: '1.1rem',
              color: '#1C1C1C',
              opacity: 0.8,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Encuentra toda la información que necesitas para sacar el máximo provecho de ImageProcessor
            </p>
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 280px) 1fr',
            gap: '3rem',
            alignItems: 'start'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(8, 20, 37, 0.1)',
              padding: '2rem',
              position: 'sticky',
              top: '100px'
            }}>
              <div style={{ 
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#081425',
                marginBottom: '1.5rem'
              }}>
                Navegación
              </div>
              <ul style={{ listStyle: 'none' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <button
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      color: activeSection === 'getting-started' ? '#F1F3F3' : '#1C1C1C',
                      background: activeSection === 'getting-started' ? 
                        'linear-gradient(135deg, #081425, #1C1C1C)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => showSection('getting-started')}
                  >
                    Primeros Pasos
                  </button>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <button
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      color: activeSection === 'features' ? '#F1F3F3' : '#1C1C1C',
                      background: activeSection === 'features' ? 
                        'linear-gradient(135deg, #081425, #1C1C1C)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => showSection('features')}
                  >
                    Funcionalidades
                  </button>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <button
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      color: activeSection === 'formats' ? '#F1F3F3' : '#1C1C1C',
                      background: activeSection === 'formats' ? 
                        'linear-gradient(135deg, #081425, #1C1C1C)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => showSection('formats')}
                  >
                    Formatos Soportados
                  </button>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <button
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      color: activeSection === 'faq' ? '#F1F3F3' : '#1C1C1C',
                      background: activeSection === 'faq' ? 
                        'linear-gradient(135deg, #081425, #1C1C1C)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => showSection('faq')}
                  >
                    Preguntas Frecuentes
                  </button>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <button
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      color: activeSection === 'troubleshooting' ? '#F1F3F3' : '#1C1C1C',
                      background: activeSection === 'troubleshooting' ? 
                        'linear-gradient(135deg, #081425, #1C1C1C)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => showSection('troubleshooting')}
                  >
                    Solución de Problemas
                  </button>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <button
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      color: activeSection === 'tips' ? '#F1F3F3' : '#1C1C1C',
                      background: activeSection === 'tips' ? 
                        'linear-gradient(135deg, #081425, #1C1C1C)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => showSection('tips')}
                  >
                    Consejos y Trucos
                  </button>
                </li>
              </ul>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(8, 20, 37, 0.1)',
              padding: '3rem'
            }}>
              {/* Primeros Pasos */}
              {activeSection === 'getting-started' && (
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#081425', marginBottom: '1.5rem' }}>
                    Primeros Pasos
                  </h2>
                  <p style={{ marginBottom: '1.5rem', color: '#1C1C1C', opacity: 0.9 }}>
                    ImageProcessor es una herramienta web potente y fácil de usar para procesar múltiples imágenes. Sigue esta guía paso a paso para comenzar.
                  </p>

                  <div style={{ display: 'grid', gap: '1.5rem', margin: '2rem 0' }}>
                    {[
                      { num: 1, title: 'Cargar Imágenes', desc: 'Arrastra tus imágenes a la zona de carga o haz clic para seleccionarlas. Puedes subir múltiples imágenes o archivos ZIP sin límite de cantidad.' },
                      { num: 2, title: 'Configurar Opciones', desc: 'Activa los switches según tus necesidades: "Eliminar Fondo" para remover fondos automáticamente o "Redimensionar" para ajustar dimensiones.' },
                      { num: 3, title: 'Personalizar Dimensiones', desc: 'Si activaste redimensionamiento, especifica las dimensiones deseadas o usa los presets comunes como 800x600 o 1920x1080.' },
                      { num: 4, title: 'Procesar y Descargar', desc: 'Haz clic en "Procesar Imágenes" y espera a que termine. Las imágenes se descargarán automáticamente en formato PNG optimizado.' }
                    ].map((step) => (
                      <div key={step.num} style={{
                        background: 'rgba(241, 243, 243, 0.5)',
                        border: '1px solid rgba(8, 20, 37, 0.1)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '40px',
                          height: '40px',
                          background: 'linear-gradient(135deg, #081425, #1C1C1C)',
                          color: '#F1F3F3',
                          borderRadius: '50%',
                          fontWeight: '700',
                          marginBottom: '1rem'
                        }}>
                          {step.num}
                        </div>
                        <div style={{
                          fontSize: '1.2rem',
                          fontWeight: '600',
                          color: '#081425',
                          marginBottom: '0.5rem'
                        }}>
                          {step.title}
                        </div>
                        <div style={{ color: '#1C1C1C', opacity: 0.8 }}>
                          {step.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ */}
              {activeSection === 'faq' && (
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#081425', marginBottom: '1.5rem' }}>
                    Preguntas Frecuentes
                  </h2>

                  {faqData.map((faq, index) => (
                    <div key={index} style={{
                      background: 'rgba(241, 243, 243, 0.5)',
                      border: '1px solid rgba(8, 20, 37, 0.1)',
                      borderRadius: '12px',
                      marginBottom: '1rem',
                      overflow: 'hidden'
                    }}>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          width: '100%',
                          padding: '1.5rem',
                          textAlign: 'left',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#081425',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onClick={() => toggleFaq(index)}
                      >
                        {faq.question}
                        <span>{openFaqIndex === index ? '−' : '+'}</span>
                      </button>
                      {openFaqIndex === index && (
                        <div style={{
                          padding: '0 1.5rem 1.5rem 1.5rem',
                          color: '#1C1C1C',
                          opacity: 0.8
                        }}>
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Otras secciones */}
              {activeSection === 'features' && (
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#081425', marginBottom: '1.5rem' }}>
                    Funcionalidades Principales
                  </h2>
                  <p>ImageProcessor ofrece dos funciones principales que puedes usar por separado o en combinación.</p>
                </div>
              )}

              {activeSection === 'formats' && (
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#081425', marginBottom: '1.5rem' }}>
                    Formatos Soportados
                  </h2>
                  <p>ImageProcessor acepta una amplia variedad de formatos de entrada y siempre produce archivos PNG optimizados.</p>
                </div>
              )}

              {activeSection === 'troubleshooting' && (
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#081425', marginBottom: '1.5rem' }}>
                    Solución de Problemas
                  </h2>
                  <p>Encuentra soluciones a los problemas más comunes.</p>
                </div>
              )}

              {activeSection === 'tips' && (
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#081425', marginBottom: '1.5rem' }}>
                    Consejos y Trucos
                  </h2>
                  <p>Optimiza tus resultados con estos consejos profesionales.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;