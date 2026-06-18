import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './teleport/teleport-global.css'
import './teleport-nav.css'
import './user-avatar.css'
import './trip-card-meta.css'
import './home-search-filters.css'
import './home-trip-cards.css'
import './trip-detail-page.css'
import './booking-page.css'
import './home-testimonials.css'
import './articles-pagination.css'
import './home-latest-articles.css'
import './kinhnghim-articles.css'
import './kinhnghim-article-detail.css'
import './kinhnghim-page.css'
import './calendar-page.css'
import './history-page.css'
import './account-sidebar-icons.css'
import './account-page.css'
import './tickets-page.css'
import './site-footer.css'
import './intro-page.css'
import './auth-page.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BookingProvider>
        <App />
      </BookingProvider>
    </AuthProvider>
  </StrictMode>,
)
