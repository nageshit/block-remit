import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Send Money Across the World. Fast. Cheap. Easy.</h1>
        <p>BlockRemit - The future of international money transfers powered by blockchain</p>
        <Link to="/register" className="btn-primary">Get Started</Link>
      </div>

      <div className="features">
        <div className="feature">
          <h3>⚡ Lightning Fast</h3>
          <p>Transfers complete in seconds, not days</p>
        </div>
        <div className="feature">
          <h3>💰 Low Fees</h3>
          <p>Only 0.5% fee - Much cheaper than banks</p>
        </div>
        <div className="feature">
          <h3>🔒 Secure</h3>
          <p>Blockchain-powered security and transparency</p>
        </div>
        <div className="feature">
          <h3>🌍 Global</h3>
          <p>Send to 140+ countries</p>
        </div>
      </div>
    </div>
  )
}