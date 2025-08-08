/**
 * UI Components for Wiki-Based Challenges
 * Interactive components for all six challenge types
 */

import React, { useState, useEffect } from 'react';
import { WikiChallenge, WikiChallengeType, WikiQuestion, CommandChallenge } from './wikiChallenges';
import { ChallengeResult, ChallengeValidation } from './challengeTypes';

interface ChallengeUIProps {
  challenge: WikiChallenge;
  onComplete: (result: ChallengeResult) => void;
  onShare: (content: string) => void;
}

// Main Challenge Router Component
export const ChallengeUI: React.FC<ChallengeUIProps> = ({ challenge, onComplete, onShare }) => {
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit || 0);

  useEffect(() => {
    if (challenge.timeLimit) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, challenge.timeLimit! - elapsed);
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          // Auto-submit when time runs out
          handleTimeUp();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [challenge.timeLimit, startTime]);

  const handleTimeUp = () => {
    const result: ChallengeResult = {
      challengeId: challenge.id,
      completed: false,
      score: 0,
      timeSpent: challenge.timeLimit!,
      attempts: 1,
      hintsUsed: 0,
      perfectScore: false,
      medalEarned: null,
      timestamp: new Date()
    };
    onComplete(result);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="challenge-container">
      <div className="challenge-header">
        <h2 className="challenge-title">
          {challenge.name}
          <span className="challenge-type">{challenge.type.replace('-', ' ').toUpperCase()}</span>
        </h2>
        <div className="challenge-meta">
          <span className="difficulty">{'⭐'.repeat(challenge.difficulty)}</span>
          <span className="xp-reward">{challenge.xpReward} XP</span>
          <span className="social-points">{challenge.socialPoints} Social</span>
          {challenge.timeLimit && (
            <span className={`time-left ${timeLeft <= 60 ? 'urgent' : ''}`}>
              ⏱️ {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>
      
      <div className="challenge-description">
        <p>{challenge.description}</p>
      </div>

      <div className="challenge-body">
        {renderChallengeContent(challenge, onComplete, onShare, startTime)}
      </div>
    </div>
  );
};

const renderChallengeContent = (
  challenge: WikiChallenge, 
  onComplete: (result: ChallengeResult) => void,
  onShare: (content: string) => void,
  startTime: number
) => {
  switch (challenge.type) {
    case 'wiki-warrior':
      return <WikiWarriorUI challenge={challenge} onComplete={onComplete} startTime={startTime} />;
    case 'command-master':
      return <CommandMasterUI challenge={challenge} onComplete={onComplete} startTime={startTime} />;
    case 'bug-hunter':
      return <BugHunterUI challenge={challenge} onComplete={onComplete} startTime={startTime} />;
    case 'speed-run':
      return <SpeedRunUI challenge={challenge} onComplete={onComplete} startTime={startTime} />;
    case 'easter-egg-hunt':
      return <EasterEggHuntUI challenge={challenge} onComplete={onComplete} startTime={startTime} />;
    case 'meme-lord':
      return <MemeLordUI challenge={challenge} onComplete={onComplete} onShare={onShare} startTime={startTime} />;
    default:
      return <div>Unknown challenge type</div>;
  }
};

// Wiki Warrior Component
interface WikiWarriorUIProps {
  challenge: WikiChallenge;
  onComplete: (result: ChallengeResult) => void;
  startTime: number;
}

const WikiWarriorUI: React.FC<WikiWarriorUIProps> = ({ challenge, onComplete, startTime }) => {
  const questions = challenge.solution as WikiQuestion[];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correct = answers.filter((answer, index) => answer === questions[index].correctAnswer).length;
    const score = Math.round((correct / questions.length) * 100);

    const result: ChallengeResult = {
      challengeId: challenge.id,
      completed: true,
      score,
      timeSpent,
      attempts: 1,
      hintsUsed,
      perfectScore: score === 100,
      medalEarned: score >= 90 ? 'gold' : score >= 70 ? 'silver' : score >= 50 ? 'bronze' : null,
      timestamp: new Date()
    };

    onComplete(result);
  };

  const useHint = () => {
    setHintsUsed(hintsUsed + 1);
    // Show hint logic here
  };

  return (
    <div className="wiki-warrior-ui">
      <div className="question-progress">
        Question {currentQuestionIndex + 1} of {questions.length}
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="question-card">
        <h3 className="question-text">{currentQuestion.question}</h3>
        
        <div className="question-options">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${
                answers[currentQuestionIndex] === index ? 'selected' : ''
              } ${
                showExplanation 
                  ? index === currentQuestion.correctAnswer 
                    ? 'correct' 
                    : answers[currentQuestionIndex] === index 
                      ? 'incorrect' 
                      : ''
                  : ''
              }`}
              onClick={() => handleAnswerSelect(index)}
              disabled={showExplanation}
            >
              {String.fromCharCode(65 + index)}. {option}
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="explanation">
            <p><strong>Explanation:</strong> {currentQuestion.explanation}</p>
            <p><small>Reference: {currentQuestion.wikiReference}</small></p>
          </div>
        )}

        <div className="question-actions">
          {challenge.hints.length > 0 && !showExplanation && (
            <button className="hint-button" onClick={useHint}>
              💡 Hint ({hintsUsed}/{challenge.hints.length})
            </button>
          )}
          
          {showExplanation && (
            <button className="next-button" onClick={handleNext}>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Command Master Component
interface CommandMasterUIProps {
  challenge: WikiChallenge;
  onComplete: (result: ChallengeResult) => void;
  startTime: number;
}

const CommandMasterUI: React.FC<CommandMasterUIProps> = ({ challenge, onComplete, startTime }) => {
  const commandChallenge = challenge.solution as CommandChallenge;
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [commandInput, setCommandInput] = useState('');
  const [outputs, setOutputs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const currentCommand = commandChallenge.commands[currentCommandIndex];

  const executeCommand = async () => {
    setIsExecuting(true);
    
    try {
      // Simulate command execution (in real app, this would call actual MCP tools)
      const response = await simulateCommandExecution(commandInput);
      const newOutputs = [...outputs, response];
      setOutputs(newOutputs);

      if (currentCommandIndex < commandChallenge.commands.length - 1) {
        setCurrentCommandIndex(currentCommandIndex + 1);
        setCommandInput('');
      } else {
        handleComplete(newOutputs);
      }
    } catch (error) {
      const errorOutput = `Error: ${(error as Error).message}`;
      setOutputs([...outputs, errorOutput]);
    }

    setIsExecuting(false);
  };

  const simulateCommandExecution = async (command: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple command simulation
    if (command.includes('swarm_init')) {
      return 'Swarm initialized successfully with mesh topology';
    } else if (command.includes('agent_spawn')) {
      return 'Agent spawned: researcher';
    } else if (command.includes('swarm_status')) {
      return 'Swarm status: Active, 1 agent, mesh topology';
    } else {
      return 'Command executed successfully';
    }
  };

  const handleComplete = (finalOutputs: string[]) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const validation = commandChallenge.validation(finalOutputs.join('\n'));
    
    const result: ChallengeResult = {
      challengeId: challenge.id,
      completed: validation,
      score: validation ? 100 : 0,
      timeSpent,
      attempts: 1,
      hintsUsed,
      perfectScore: validation,
      medalEarned: validation ? 'gold' : null,
      timestamp: new Date()
    };

    onComplete(result);
  };

  const useHint = () => {
    if (hintsUsed < commandChallenge.hints.length) {
      setCommandInput(currentCommand);
      setHintsUsed(hintsUsed + 1);
    }
  };

  return (
    <div className="command-master-ui">
      <div className="command-progress">
        Step {currentCommandIndex + 1} of {commandChallenge.commands.length}
      </div>

      <div className="terminal-container">
        <div className="terminal-header">
          <span className="terminal-title">Claude Flow Terminal</span>
        </div>
        
        <div className="terminal-body">
          {outputs.map((output, index) => (
            <div key={index} className="terminal-output">
              <span className="prompt">$ {commandChallenge.commands[index]}</span>
              <div className="output">{output}</div>
            </div>
          ))}
          
          {currentCommandIndex < commandChallenge.commands.length && (
            <div className="terminal-input-line">
              <span className="prompt">$ </span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isExecuting && executeCommand()}
                placeholder="Enter command..."
                className="terminal-input"
                disabled={isExecuting}
              />
            </div>
          )}
        </div>
      </div>

      <div className="command-actions">
        <button 
          className="hint-button" 
          onClick={useHint}
          disabled={hintsUsed >= commandChallenge.hints.length}
        >
          💡 Show Command ({hintsUsed}/{commandChallenge.hints.length})
        </button>
        
        <button 
          className="execute-button"
          onClick={executeCommand}
          disabled={isExecuting || !commandInput.trim()}
        >
          {isExecuting ? 'Executing...' : 'Execute Command'}
        </button>
      </div>

      {hintsUsed > 0 && hintsUsed <= commandChallenge.hints.length && (
        <div className="hint-display">
          💡 {commandChallenge.hints[hintsUsed - 1]}
        </div>
      )}
    </div>
  );
};

// Bug Hunter Component  
interface BugHunterUIProps {
  challenge: WikiChallenge;
  onComplete: (result: ChallengeResult) => void;
  startTime: number;
}

const BugHunterUI: React.FC<BugHunterUIProps> = ({ challenge, onComplete, startTime }) => {
  const [solution, setSolution] = useState('');
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);

  const scenario = challenge.solution as any; // BugScenario

  const handleCauseToggle = (cause: string) => {
    setSelectedCauses(prev => 
      prev.includes(cause) 
        ? prev.filter(c => c !== cause)
        : [...prev, cause]
    );
  };

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Simple validation logic
    const solutionCorrect = solution.toLowerCase().includes(scenario.correctSolution.toLowerCase());
    const score = solutionCorrect ? 100 : 25;

    const result: ChallengeResult = {
      challengeId: challenge.id,
      completed: solutionCorrect,
      score,
      timeSpent,
      attempts: 1,
      hintsUsed: showHints ? 1 : 0,
      perfectScore: score === 100,
      medalEarned: score >= 90 ? 'gold' : score >= 70 ? 'silver' : score >= 50 ? 'bronze' : null,
      timestamp: new Date()
    };

    onComplete(result);
  };

  return (
    <div className="bug-hunter-ui">
      <div className="bug-scenario">
        <h3>🐛 {scenario.title}</h3>
        <p><strong>Description:</strong> {scenario.description}</p>
        
        <div className="error-message">
          <code>{scenario.errorMessage}</code>
        </div>

        <div className="symptoms-section">
          <h4>Symptoms:</h4>
          <ul>
            {scenario.symptoms.map((symptom: string, index: number) => (
              <li key={index}>{symptom}</li>
            ))}
          </ul>
        </div>

        <div className="possible-causes">
          <h4>What could be causing this issue?</h4>
          {scenario.possibleCauses.map((cause: string, index: number) => (
            <label key={index} className="cause-option">
              <input
                type="checkbox"
                checked={selectedCauses.includes(cause)}
                onChange={() => handleCauseToggle(cause)}
              />
              {cause}
            </label>
          ))}
        </div>

        <div className="solution-input">
          <h4>What's your solution?</h4>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Describe how you would fix this issue..."
            rows={4}
            className="solution-textarea"
          />
        </div>

        {showHints && (
          <div className="troubleshooting-steps">
            <h4>💡 Troubleshooting Steps:</h4>
            <ol>
              {scenario.troubleshootingSteps.map((step: string, index: number) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="bug-actions">
          <button 
            className="hint-button"
            onClick={() => setShowHints(true)}
            disabled={showHints}
          >
            💡 Show Troubleshooting Steps
          </button>
          
          <button 
            className="submit-button"
            onClick={handleSubmit}
            disabled={!solution.trim()}
          >
            Submit Solution
          </button>
        </div>
      </div>
    </div>
  );
};

// Speed Run Component
interface SpeedRunUIProps {
  challenge: WikiChallenge;
  onComplete: (result: ChallengeResult) => void;
  startTime: number;
}

const SpeedRunUI: React.FC<SpeedRunUIProps> = ({ challenge, onComplete, startTime }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepResults, setStepResults] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const task = challenge.solution as any; // SpeedRunTask
  const currentStep = task.steps[currentStepIndex];

  const executeStep = async () => {
    setIsExecuting(true);
    
    try {
      // Simulate step execution
      const stepResult = await simulateStepExecution(currentStep);
      const newResults = [...stepResults, stepResult];
      setStepResults(newResults);

      if (currentStepIndex < task.steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        handleComplete(newResults);
      }
    } catch (error) {
      console.error('Step execution failed:', error);
    }

    setIsExecuting(false);
  };

  const simulateStepExecution = async (step: any): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { stepId: step.id, success: true, timestamp: Date.now() };
  };

  const handleComplete = (results: any[]) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const validation = task.validation(results);
    
    let medal: 'gold' | 'silver' | 'bronze' | null = null;
    let score = 0;

    if (validation) {
      if (timeSpent <= task.goldTime) {
        medal = 'gold';
        score = 100;
      } else if (timeSpent <= task.silverTime) {
        medal = 'silver';
        score = 85;
      } else if (timeSpent <= task.bronzeTime) {
        medal = 'bronze';
        score = 70;
      } else {
        score = 50;
      }
    }

    const result: ChallengeResult = {
      challengeId: challenge.id,
      completed: validation,
      score,
      timeSpent,
      attempts: 1,
      hintsUsed: 0,
      perfectScore: score === 100,
      medalEarned: medal,
      timestamp: new Date()
    };

    onComplete(result);
  };

  const currentTime = Math.floor((Date.now() - startTime) / 1000);

  return (
    <div className="speed-run-ui">
      <div className="speed-run-header">
        <div className="timer">
          ⏱️ {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
        </div>
        <div className="target-times">
          🥇 {task.goldTime}s | 🥈 {task.silverTime}s | 🥉 {task.bronzeTime}s
        </div>
        {task.worldRecord && (
          <div className="world-record">
            🌟 WR: {task.worldRecord}s
          </div>
        )}
      </div>

      <div className="step-progress">
        Step {currentStepIndex + 1} of {task.steps.length}
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentStepIndex + 1) / task.steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="current-step">
        <h3>{currentStep.instruction}</h3>
        {currentStep.command && (
          <code className="step-command">{currentStep.command}</code>
        )}
        <div className="step-points">Points: {currentStep.points}</div>
      </div>

      <div className="completed-steps">
        {stepResults.map((result, index) => (
          <div key={index} className="completed-step">
            ✅ {task.steps[index].instruction}
          </div>
        ))}
      </div>

      <button 
        className="execute-step-button"
        onClick={executeStep}
        disabled={isExecuting}
      >
        {isExecuting ? 'Executing...' : 'Complete Step'}
      </button>
    </div>
  );
};

// Easter Egg Hunt Component
interface EasterEggHuntUIProps {
  challenge: WikiChallenge;
  onComplete: (result: ChallengeResult) => void;
  startTime: number;
}

const EasterEggHuntUI: React.FC<EasterEggHuntUIProps> = ({ challenge, onComplete, startTime }) => {
  const [searchInput, setSearchInput] = useState('');
  const [foundEggs, setFoundEggs] = useState<string[]>([]);
  const [currentHint, setCurrentHint] = useState(0);

  const easterEggs = challenge.solution as any[]; // EasterEgg[]

  const searchForEgg = () => {
    const found = easterEggs.filter(egg => {
      if (typeof egg.trigger === 'string') {
        return searchInput.toLowerCase().includes(egg.trigger.toLowerCase());
      } else {
        return egg.trigger.test(searchInput);
      }
    });

    if (found.length > 0 && !foundEggs.includes(found[0].id)) {
      setFoundEggs([...foundEggs, found[0].id]);
      
      // If all eggs found, complete challenge
      if (foundEggs.length + 1 === easterEggs.length) {
        handleComplete();
      }
    }
  };

  const handleComplete = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const completionRate = (foundEggs.length / easterEggs.length) * 100;
    const score = Math.round(completionRate);

    const result: ChallengeResult = {
      challengeId: challenge.id,
      completed: completionRate >= 80, // Need to find 80% of eggs
      score,
      timeSpent,
      attempts: 1,
      hintsUsed: currentHint,
      perfectScore: score === 100,
      medalEarned: score >= 90 ? 'gold' : score >= 70 ? 'silver' : score >= 50 ? 'bronze' : null,
      timestamp: new Date()
    };

    onComplete(result);
  };

  const showNextHint = () => {
    if (currentHint < challenge.hints.length) {
      setCurrentHint(currentHint + 1);
    }
  };

  return (
    <div className="easter-egg-hunt-ui">
      <div className="hunt-progress">
        Found: {foundEggs.length}/{easterEggs.length} eggs
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(foundEggs.length / easterEggs.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="search-area">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search for easter eggs..."
          className="search-input"
        />
        <button onClick={searchForEgg} className="search-button">
          🔍 Search
        </button>
      </div>

      <div className="found-eggs">
        {foundEggs.map(eggId => {
          const egg = easterEggs.find(e => e.id === eggId);
          return egg ? (
            <div key={eggId} className={`found-egg ${egg.rarity}`}>
              <div className="egg-icon">🥚</div>
              <div className="egg-details">
                <h4>{egg.name}</h4>
                <p>{egg.description}</p>
                <span className="egg-rarity">{egg.rarity.toUpperCase()}</span>
                <span className="egg-reward">🏆 {egg.reward}</span>
              </div>
            </div>
          ) : null;
        })}
      </div>

      <div className="hunt-actions">
        <button 
          className="hint-button"
          onClick={showNextHint}
          disabled={currentHint >= challenge.hints.length}
        >
          💡 Hint ({currentHint}/{challenge.hints.length})
        </button>
        
        <button 
          className="complete-button"
          onClick={handleComplete}
          disabled={foundEggs.length === 0}
        >
          Complete Hunt
        </button>
      </div>

      {currentHint > 0 && (
        <div className="current-hint">
          💡 {challenge.hints[currentHint - 1]}
        </div>
      )}
    </div>
  );
};

// Meme Lord Component
interface MemeLordUIProps {
  challenge: WikiChallenge;
  onComplete: (result: ChallengeResult) => void;
  onShare: (content: string) => void;
  startTime: number;
}

const MemeLordUI: React.FC<MemeLordUIProps> = ({ challenge, onComplete, onShare, startTime }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [placeholders, setPlaceholders] = useState<Record<string, string>>({});
  const [memeContent, setMemeContent] = useState('');
  
  const templates = challenge.solution as any[]; // MemeTemplate[]
  const currentTemplate = templates[selectedTemplate];

  const updatePlaceholder = (placeholder: string, value: string) => {
    setPlaceholders(prev => ({ ...prev, [placeholder]: value }));
    generateMemeContent();
  };

  const generateMemeContent = () => {
    let content = currentTemplate.template;
    currentTemplate.placeholder.forEach((placeholder: string) => {
      content = content.replace(`{${placeholder}}`, placeholders[placeholder] || `{${placeholder}}`);
    });
    setMemeContent(content);
  };

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Simple meme validation
    const allPlaceholdersFilled = currentTemplate.placeholder.every((p: string) => placeholders[p]?.trim());
    const score = allPlaceholdersFilled ? Math.min(100, 60 + currentTemplate.viralPotential * 4) : 0;

    const result: ChallengeResult = {
      challengeId: challenge.id,
      completed: allPlaceholdersFilled,
      score,
      timeSpent,
      attempts: 1,
      hintsUsed: 0,
      perfectScore: score >= 95,
      medalEarned: score >= 90 ? 'gold' : score >= 70 ? 'silver' : score >= 50 ? 'bronze' : null,
      timestamp: new Date()
    };

    onComplete(result);
  };

  const handleShare = () => {
    const shareContent = `${memeContent}\n\n#ClaudeFlow #MemeLord #ProgrammerHumor`;
    onShare(shareContent);
  };

  return (
    <div className="meme-lord-ui">
      <div className="template-selector">
        <h3>Choose Your Meme Template:</h3>
        <div className="template-options">
          {templates.map((template: any, index: number) => (
            <button
              key={index}
              className={`template-option ${selectedTemplate === index ? 'selected' : ''}`}
              onClick={() => setSelectedTemplate(index)}
            >
              <div className="template-name">{template.name}</div>
              <div className="template-popularity">
                Popularity: {template.popularityScore}% | 
                Viral: {template.viralPotential}/10
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="meme-creator">
        <div className="meme-preview">
          <div className="meme-content">
            {memeContent || currentTemplate.template}
          </div>
        </div>

        <div className="placeholder-inputs">
          {currentTemplate.placeholder.map((placeholder: string) => (
            <div key={placeholder} className="placeholder-input">
              <label>{placeholder}:</label>
              <input
                type="text"
                value={placeholders[placeholder] || ''}
                onChange={(e) => updatePlaceholder(placeholder, e.target.value)}
                placeholder={`Enter ${placeholder.toLowerCase()}...`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="meme-actions">
        <button 
          className="share-button"
          onClick={handleShare}
          disabled={!currentTemplate.placeholder.every((p: string) => placeholders[p]?.trim())}
        >
          📱 Share Meme
        </button>
        
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={!currentTemplate.placeholder.every((p: string) => placeholders[p]?.trim())}
        >
          🎭 Submit Meme
        </button>
      </div>

      <div className="meme-stats">
        <div className="stat">
          <span className="stat-label">Category:</span>
          <span className="stat-value">{currentTemplate.category}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Viral Potential:</span>
          <span className="stat-value">{currentTemplate.viralPotential}/10</span>
        </div>
        <div className="stat">
          <span className="stat-label">Popularity:</span>
          <span className="stat-value">{currentTemplate.popularityScore}%</span>
        </div>
      </div>
    </div>
  );
};

export default ChallengeUI;