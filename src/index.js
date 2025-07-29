import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/**
 * Speed Reading Platform - Main Application Entry Point
 */

// Basic App component
const App = () => {
  return (
    <div className="app">
      <header className="app-header">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>Speed Reading Platform</h1>
          </div>
          <div className="nav-menu">
            <a href="/" className="nav-link">Ana Sayfa</a>
            <a href="/practice" className="nav-link">Alıştırmalar</a>
            <a href="/progress" className="nav-link">İlerleme</a>
            <a href="/profile" className="nav-link">Profil</a>
          </div>
        </nav>
      </header>
      
      <main className="main-content">
        <section className="hero">
          <div className="hero-content">
            <h1>Hızlı Okuma Becerilerinizi Geliştirin</h1>
            <p>
              Etkileşimli alıştırmalar ve kişiselleştirilmiş antrenmanlarla 
              okuma hızınızı artırın, anlama yetinizi geliştirin.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary">Hemen Başla</button>
              <button className="btn btn-secondary">Daha Fazla Bilgi</button>
            </div>
          </div>
        </section>
        
        <section className="features">
          <div className="container">
            <h2>Özellikler</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>📖 Etkileşimli Okuma</h3>
                <p>Çeşitli zorluk seviyelerinde metinlerle okuma pratiği yapın.</p>
              </div>
              <div className="feature-card">
                <h3>📊 İlerleme Takibi</h3>
                <p>Okuma hızınızı ve anlama oranınızı detaylı grafiklerle takip edin.</p>
              </div>
              <div className="feature-card">
                <h3>🎯 Kişisel Hedefler</h3>
                <p>Kendinize hedefler belirleyin ve bu hedeflere ulaşmak için çalışın.</p>
              </div>
              <div className="feature-card">
                <h3>📈 Analitik</h3>
                <p>Detaylı analizlerle güçlü ve zayıf yönlerinizi keşfedin.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="stats">
          <div className="container">
            <h2>İstatistikler</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Aktif Kullanıcı</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Tamamlanan Alıştırma</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">300%</div>
                <div className="stat-label">Ortalama Hız Artışı</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Kullanıcı Memnuniyeti</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Speed Reading Platform</h3>
              <p>Hızlı okuma becerilerinizi geliştirmek için en iyi platform.</p>
            </div>
            <div className="footer-section">
              <h4>Bağlantılar</h4>
              <ul>
                <li><a href="/about">Hakkımızda</a></li>
                <li><a href="/contact">İletişim</a></li>
                <li><a href="/privacy">Gizlilik</a></li>
                <li><a href="/terms">Kullanım Şartları</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Destek</h4>
              <ul>
                <li><a href="/help">Yardım</a></li>
                <li><a href="/faq">SSS</a></li>
                <li><a href="/feedback">Geri Bildirim</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Speed Reading Platform. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Check for service worker support
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hot module replacement
if (module.hot) {
  module.hot.accept();
}