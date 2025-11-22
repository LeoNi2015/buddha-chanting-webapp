import { useState, useEffect, useCallback } from 'react'
import Counter from './components/Counter'
import WoodenFish from './components/WoodenFish'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import './index.css'

function App() {
  // Initialize count from localStorage if available
  const [count, setCount] = useState(() => {
    const savedCount = localStorage.getItem('nianfo-count')
    return savedCount ? parseInt(savedCount, 10) : 0
  })

  // Persist count to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nianfo-count', count.toString())
  }, [count])

  const incrementCount = useCallback(() => {
    setCount(prev => prev + 1)
  }, [])

  const resetCount = useCallback(() => {
    if (confirm('Reset count to 0?')) {
      setCount(0)
    }
  }, [])

  // Speech Recognition Hook (Strict Mode Only)
  const {
    isListening,
    startListening,
    stopListening,
    error
  } = useSpeechRecognition({
    onMatch: incrementCount
  });

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  // Keyboard support (Spacebar)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault() // Prevent scrolling
        incrementCount()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [incrementCount])

  return (
    <div className="app-container">
      <header style={{ marginBottom: '2rem', paddingTop: '2rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>

          <button
            onClick={toggleListening}
            style={{
              fontSize: '0.9rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '30px',
              background: isListening ? 'var(--accent-color)' : 'transparent',
              color: isListening ? 'var(--bg-color)' : 'var(--text-color)',
              border: '1px solid var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 'bold',
              boxShadow: isListening ? '0 0 15px var(--ripple-color)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {isListening ? 'Listening...' : 'Start Chanting (Mic)'}
            {isListening && (
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-color)',
                animation: 'pulse 1.5s infinite'
              }} />
            )}
          </button>
          {error && <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
        </div>
      </header>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Counter count={count} />

        <div style={{ marginTop: '2rem' }}>
          <WoodenFish onHit={incrementCount} />
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <p style={{
            opacity: 0.5,
            fontSize: '0.9rem',
            textAlign: 'center',
            maxWidth: '300px',
            lineHeight: '1.6'
          }}>
            Tap the Wooden Fish, press Spacebar,<br />
            or use Mic for automatic counting.
          </p>

          <button
            onClick={resetCount}
            style={{
              fontSize: '0.8rem',
              padding: '0.4rem 0.8rem',
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.2)'; e.target.style.color = '#ff6b6b'; e.target.style.borderColor = '#ff6b6b'; }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = 'rgba(255,255,255,0.8)'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
          >
            Reset Count
          </button>
        </div>
      </main>
    </div>
  )
}

export default App
