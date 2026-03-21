import posthog from 'posthog-js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

posthog.init('phc_GZwTxzMsbs9ggCpdMU837wp5NKWAWTRV4pQRDv7vbiH', {
  api_host: 'https://us.i.posthog.com',
})

const params = new URLSearchParams(window.location.search);
const ref = params.get('ref');

if (ref) {
posthog.register({
  referrer: ref,
});

posthog.capture('referral_detected', {
  referrer: ref,
});  
}

posthog.capture('beta_app_opened')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)