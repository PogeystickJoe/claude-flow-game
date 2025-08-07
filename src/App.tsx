import React, { useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import GameUI from './components/GameUI';
import './App.css';

// Loading screen component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold text-white mb-2">Claude Flow: The Ascension</h2>
      <p className="text-gray-400">Initializing your journey...</p>
    </div>
  </div>
);

// Error boundary component
class GameErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-400 mb-4">Game Error</h1>
            <p className="text-gray-300 mb-4">
              Something went wrong while loading Claude Flow: The Ascension
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Reload Game
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="text-gray-400 cursor-pointer">Error Details</summary>
                <pre className="text-xs text-red-300 mt-2 overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App component
const App: React.FC = () => {
  const { initializeGame, player } = useGameStore();
  const [isLoading, setIsLoading] = React.useState(true);

  // Initialize the game when the app loads
  useEffect(() => {
    const init = async () => {
      try {
        // Simulate loading time for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Initialize the game store
        initializeGame();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setIsLoading(false);
      }
    };

    init();
  }, [initializeGame]);

  // Show loading screen while initializing
  if (isLoading || !player) {
    return <LoadingScreen />;
  }

  return (
    <GameErrorBoundary>
      <div className="App">
        <GameUI />
      </div>
    </GameErrorBoundary>
  );
};

export default App;