import React from 'react';

const ContactPage = ({ onNavigate }) => {
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
            <button 
              className="nav-link"
              onClick={() => onNavigate('ayuda')}
            >
              Ayuda
            </button>
            <button className="nav-link nav-active">Contacto</button>
          </div>
        </div>
      </nav>

      <div style={{ marginTop: '80px', padding: '4rem 2rem' }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '3rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #081425, #1C1C1C)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="40" height="40" fill="none" stroke="#F1F3F3" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>

          <h1 style={{ 
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #081425, #1C1C1C)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            Contáctanos
          </h1>
          
          <p style={{ 
            fontSize: '1.1rem',
            color: '#1C1C1C',
            opacity: 0.8,
            marginBottom: '2rem'
          }}>
            ¿Tienes preguntas o necesitas ayuda? Estamos aquí para ayudarte con cualquier consulta sobre ImageProcessor.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <a 
              href="https://recursos-tecnologicos.com/contactos/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #081425, #1C1C1C)',
                color: '#F1F3F3',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.3s ease',
                boxShadow: '0 4px 15px rgba(8, 20, 37, 0.3)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Ir a Página de Contactos
            </a>

            <button 
              onClick={() => onNavigate('home')}
              style={{
                background: 'transparent',
                color: '#081425',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: '2px solid #081425',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#081425';
                e.target.style.color = '#F1F3F3';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#081425';
              }}
            >
              Volver al Inicio
            </button>
          </div>

          <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(8, 20, 37, 0.05)', borderRadius: '12px' }}>
            <h3 style={{ color: '#081425', marginBottom: '1rem' }}>Información de Contacto Rápida</h3>
            <div style={{ display: 'grid', gap: '0.5rem', color: '#1C1C1C', opacity: 0.8 }}>
              <p><strong>Web:</strong> recursos-tecnologicos.com</p>
              <p><strong>Soporte técnico:</strong> Disponible 24/7</p>
              <p><strong>Respuesta promedio:</strong> Menos de 24 horas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;