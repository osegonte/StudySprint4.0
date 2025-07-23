// src/pages/Exercises.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Clock, 
  Target, 
  Zap, 
  BookOpen,
  CheckCircle,
  XCircle,
  RotateCcw,
  Lightbulb,
  TrendingUp,
  Award
} from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  question: string;
  answer: string;
  explanation: string;
  topic: string;
  type: 'multiple-choice' | 'short-answer' | 'calculation' | 'proof';
  difficulty: number; // 1-5
  estimatedTime: number; // minutes
  successRate: number;
  lastAttempted?: string;
  isDue: boolean;
}

interface PracticeSession {
  exercises: Exercise[];
  currentIndex: number;
  startTime: Date;
  answers: { exerciseId: string; answer: string; correct: boolean; timeSpent: number }[];
}

const mockExercises: Exercise[] = [
  {
    id: '1',
    title: 'Matrix Eigenvalues',
    question: `Find the eigenvalues of the matrix:

A = [ 3  -2 ]
    [ 1   0 ]

Enter your answers as λ₁, λ₂ (separated by comma):`,
    answer: '2, 1',
    explanation: `To find eigenvalues, solve det(A - λI) = 0:

det([ 3-λ  -2 ]) = (3-λ)(-λ) - (-2)(1) = λ² - 3λ + 2 = 0
   [ 1   -λ ])

Factoring: (λ-2)(λ-1) = 0
Therefore: λ₁ = 2, λ₂ = 1`,
    topic: 'Linear Algebra',
    type: 'calculation',
    difficulty: 3,
    estimatedTime: 5,
    successRate: 78,
    isDue: true
  },
  {
    id: '2',
    title: 'Derivative Chain Rule',
    question: `Find the derivative of f(x) = sin(2x³ + 1)

f'(x) = ?`,
    answer: '6x²cos(2x³ + 1)',
    explanation: `Using the chain rule: d/dx[sin(u)] = cos(u) · du/dx

Where u = 2x³ + 1
du/dx = 6x²

Therefore: f'(x) = cos(2x³ + 1) · 6x² = 6x²cos(2x³ + 1)`,
    topic: 'Calculus',
    type: 'calculation',
    difficulty: 2,
    estimatedTime: 3,
    successRate: 92,
    isDue: true
  },
  {
    id: '3',
    title: 'Vector Space Properties',
    question: `Which of the following is NOT a requirement for a vector space?

A) Closure under addition
B) Existence of zero vector  
C) Finite dimension
D) Distributivity of scalar multiplication`,
    answer: 'C',
    explanation: `Vector spaces can be finite or infinite dimensional. Examples of infinite dimensional vector spaces include polynomial spaces and function spaces. All other properties (A, B, D) are fundamental axioms that must be satisfied.`,
    topic: 'Linear Algebra',
    type: 'multiple-choice',
    difficulty: 2,
    estimatedTime: 2,
    successRate: 85,
    isDue: false
  }
];

const Exercises = () => {
  const [exercises] = useState(mockExercises);
  const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState(3);
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
    averageTime: 0,
    streak: 5
  });

  const dueExercises = exercises.filter(ex => ex.isDue);
  const topicStats = exercises.reduce((acc, ex) => {
    acc[ex.topic] = (acc[ex.topic] || 0) + (ex.isDue ? 1 : 0);
    return acc;
  }, {} as Record<string, number>);

  const startQuickPractice = () => {
    const session: PracticeSession = {
      exercises: dueExercises.slice(0, 5),
      currentIndex: 0,
      startTime: new Date(),
      answers: []
    };
    setPracticeSession(session);
    setCurrentAnswer('');
    setConfidenceLevel(3);
    setShowExplanation(false);
  };

  const submitAnswer = () => {
    if (!practiceSession) return;

    const currentExercise = practiceSession.exercises[practiceSession.currentIndex];
    const timeSpent = Math.floor((Date.now() - practiceSession.startTime.getTime()) / 1000);
    const isCorrect = currentAnswer.toLowerCase().trim() === currentExercise.answer.toLowerCase().trim();

    const newAnswer = {
      exerciseId: currentExercise.id,
      answer: currentAnswer,
      correct: isCorrect,
      timeSpent
    };

    const updatedSession = {
      ...practiceSession,
      answers: [...practiceSession.answers, newAnswer]
    };

    setPracticeSession(updatedSession);
    setShowExplanation(true);

    // Update stats
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const nextExercise = () => {
    if (!practiceSession) return;

    const nextIndex = practiceSession.currentIndex + 1;
    if (nextIndex >= practiceSession.exercises.length) {
      // Session complete
      setPracticeSession(null);
      setCurrentAnswer('');
      setShowExplanation(false);
      return;
    }

    setPracticeSession({
      ...practiceSession,
      currentIndex: nextIndex,
      startTime: new Date()
    });
    setCurrentAnswer('');
    setConfidenceLevel(3);
    setShowExplanation(false);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-success';
    if (difficulty <= 3) return 'text-warning';
    return 'text-destructive';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 3) return 'Medium';
    return 'Hard';
  };

  if (practiceSession) {
    const currentExercise = practiceSession.exercises[practiceSession.currentIndex];
    const progress = ((practiceSession.currentIndex + 1) / practiceSession.exercises.length) * 100;

    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Session Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Practice Session</h1>
            <p className="text-muted-foreground">
              Question {practiceSession.currentIndex + 1} of {practiceSession.exercises.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Est. {currentExercise.estimatedTime} min
              </span>
            </div>
            <Badge className={`${getDifficultyColor(currentExercise.difficulty)}`}>
              {getDifficultyLabel(currentExercise.difficulty)}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{currentExercise.topic}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Question */}
        <Card className="study-card">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {currentExercise.title}
              </h3>
              <div className="text-foreground whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                {currentExercise.question}
              </div>
            </div>

            {!showExplanation ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Your Answer:
                  </label>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Enter your answer here..."
                    className="min-h-20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Confidence Level:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => setConfidenceLevel(level)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          level <= confidenceLevel
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {confidenceLevel === 1 ? 'Not sure' : 
                       confidenceLevel === 5 ? 'Very confident' : 'Somewhat confident'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={submitAnswer}
                    disabled={!currentAnswer.trim()}
                    className="flex-1"
                  >
                    Submit Answer
                  </Button>
                  <Button variant="outline">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Hint
                  </Button>
                  <Button variant="outline">Skip</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Result */}
                <div className={`p-4 rounded-lg border-2 ${
                  practiceSession.answers[practiceSession.answers.length - 1]?.correct
                    ? 'border-success bg-success-muted'
                    : 'border-destructive bg-destructive/10'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {practiceSession.answers[practiceSession.answers.length - 1]?.correct ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className="font-medium">
                      {practiceSession.answers[practiceSession.answers.length - 1]?.correct
                        ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-sm">
                    <strong>Correct answer:</strong> {currentExercise.answer}
                  </p>
                  {currentAnswer !== currentExercise.answer && (
                    <p className="text-sm">
                      <strong>Your answer:</strong> {currentAnswer}
                    </p>
                  )}
                </div>

                {/* Explanation */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Explanation:</h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {currentExercise.explanation}
                  </div>
                </div>

                <Button onClick={nextExercise} className="w-full">
                  {practiceSession.currentIndex + 1 >= practiceSession.exercises.length
                    ? 'Complete Session'
                    : 'Next Question'
                  }
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Exercise Center</h1>
        <p className="text-muted-foreground">
          Practice problems with spaced repetition and performance tracking
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto">
              <Target className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-xl font-bold text-foreground">{dueExercises.length}</p>
            <p className="text-xs text-muted-foreground">Due Today</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <p className="text-xl font-bold text-foreground">{sessionStats.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <p className="text-xl font-bold text-foreground">87%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">156</p>
            <p className="text-xs text-muted-foreground">XP Earned</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="study-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Quick Practice</h3>
                <p className="text-sm text-muted-foreground">5-minute focused session</p>
              </div>
            </div>
            <Button onClick={startQuickPractice} className="w-full">
              Start Practice
            </Button>
          </div>
        </Card>

        <Card className="study-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-focus/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-focus" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Topic Review</h3>
                <p className="text-sm text-muted-foreground">Focused topic practice</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Choose Topic
            </Button>
          </div>
        </Card>

        <Card className="study-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Challenge Mode</h3>
                <p className="text-sm text-muted-foreground">Harder problems</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Start Challenge
            </Button>
          </div>
        </Card>
      </div>

      {/* Due Exercises by Topic */}
      <Card className="study-card">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Due Today</h3>
          
          <div className="space-y-3">
            {Object.entries(topicStats).map(([topic, count]) => (
              <div key={topic} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    count > 5 ? 'bg-destructive' : count > 2 ? 'bg-warning' : 'bg-success'
                  }`} />
                  <span className="font-medium text-foreground">{topic}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">
                    {count} exercise{count !== 1 ? 's' : ''}
                  </Badge>
                  <Button size="sm" variant="outline">
                    Practice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Exercises;