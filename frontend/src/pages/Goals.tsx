// src/pages/Goals.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Target, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Trophy,
  Star,
  Award,
  Zap,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'study_time' | 'reading' | 'topic_completion' | 'sessions' | 'habit';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'overdue';
  milestones: { value: number; completed: boolean; date?: string }[];
  xpReward: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Complete Linear Algebra Course',
    description: 'Finish all chapters and exercises in the linear algebra textbook',
    type: 'topic_completion',
    target: 12,
    current: 8,
    unit: 'chapters',
    deadline: '2024-02-15',
    priority: 'high',
    status: 'active',
    milestones: [
      { value: 3, completed: true, date: '2024-01-05' },
      { value: 6, completed: true, date: '2024-01-12' },
      { value: 9, completed: false },
      { value: 12, completed: false }
    ],
    xpReward: 500
  },
  {
    id: '2',
    title: 'Study 60 Minutes Daily',
    description: 'Maintain consistent daily study habit for 30 days',
    type: 'habit',
    target: 30,
    current: 24,
    unit: 'days',
    deadline: '2024-01-31',
    priority: 'medium',
    status: 'active',
    milestones: [
      { value: 7, completed: true, date: '2024-01-07' },
      { value: 14, completed: true, date: '2024-01-14' },
      { value: 21, completed: true, date: '2024-01-21' },
      { value: 30, completed: false }
    ],
    xpReward: 300
  },
  {
    id: '3',
    title: 'Read Quantum Physics Textbook',
    description: 'Complete reading of Introduction to Quantum Mechanics',
    type: 'reading',
    target: 450,
    current: 450,
    unit: 'pages',
    deadline: '2024-01-15',
    priority: 'medium',
    status: 'completed',
    milestones: [
      { value: 112, completed: true, date: '2024-01-05' },
      { value: 225, completed: true, date: '2024-01-10' },
      { value: 337, completed: true, date: '2024-01-13' },
      { value: 450, completed: true, date: '2024-01-15' }
    ],
    xpReward: 400
  }
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Study Streak Master',
    description: 'Study for 30 consecutive days',
    icon: '🔥',
    xpReward: 200,
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: '2',
    title: 'Early Bird',
    description: 'Complete 10 morning study sessions',
    icon: '🐦',
    xpReward: 100,
    unlocked: true,
    unlockedDate: '2024-01-15',
    rarity: 'rare'
  },
  {
    id: '3',
    title: 'Speed Reader',
    description: 'Read 100 pages in a single session',
    icon: '📚',
    xpReward: 150,
    unlocked: true,
    unlockedDate: '2024-01-10',
    rarity: 'rare'
  },
  {
    id: '4',
    title: 'Perfect Focus',
    description: 'Achieve 95%+ focus score for 5 sessions',
    icon: '🎯',
    xpReward: 250,
    unlocked: false,
    rarity: 'legendary'
  }
];

interface GoalWizardStep {
  title: string;
  description: string;
  component: React.ReactNode;
}

const Goals = () => {
  const [goals] = useState(mockGoals);
  const [achievements] = useState(mockAchievements);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'study_time',
    target: 0,
    unit: 'hours',
    deadline: '',
    priority: 'medium'
  });

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    return goal.status === filter;
  });

  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    totalXP: achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0) + 
             goals.filter(g => g.status === 'completed').reduce((sum, g) => sum + g.xpReward, 0),
    level: Math.floor((achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0) + 
                      goals.filter(g => g.status === 'completed').reduce((sum, g) => sum + g.xpReward, 0)) / 500) + 1
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'overdue':
        return 'bg-destructive text-destructive-foreground';
      case 'active':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-destructive';
      case 'medium':
        return 'border-l-warning';
      case 'low':
        return 'border-l-success';
      default:
        return 'border-l-muted';
    }
  };

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      case 'epic':
        return 'from-purple-400 to-pink-500';
      case 'rare':
        return 'from-blue-400 to-cyan-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const wizardSteps: GoalWizardStep[] = [
    {
      title: 'What do you want to achieve?',
      description: 'Choose a specific, inspiring goal',
      component: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="e.g., Master Calculus II"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="What specifically will you accomplish?"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Make it Measurable',
      description: 'How will you track progress?',
      component: (
        <div className="space-y-4">
          <div>
            <Label>Goal Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { value: 'study_time', label: 'Study Time', desc: 'Hours or minutes' },
                { value: 'reading', label: 'Reading', desc: 'Pages or chapters' },
                { value: 'topic_completion', label: 'Course Progress', desc: 'Chapters or modules' },
                { value: 'habit', label: 'Daily Habit', desc: 'Consecutive days' }
              ].map((type) => (
                <div
                  key={type.value}
                  onClick={() => setNewGoal({ ...newGoal, type: type.value })}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    newGoal.type === type.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-secondary'
                  }`}
                >
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                type="number"
                value={newGoal.target}
                onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={newGoal.unit}
                onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                placeholder="hours, pages, chapters..."
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  if (showWizard) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="study-card">
          <div className="space-y-6">
            {/* Wizard Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Create New Goal</h2>
              <p className="text-muted-foreground">Step {wizardStep + 1} of {wizardSteps.length}</p>
              <Progress value={((wizardStep + 1) / wizardSteps.length) * 100} className="w-full h-2" />
            </div>

            {/* Step Content */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {wizardSteps[wizardStep].title}
                </h3>
                <p className="text-muted-foreground">
                  {wizardSteps[wizardStep].description}
                </p>
              </div>
              
              {wizardSteps[wizardStep].component}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  if (wizardStep === 0) {
                    setShowWizard(false);
                  } else {
                    setWizardStep(wizardStep - 1);
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {wizardStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              
              <Button
                onClick={() => {
                  if (wizardStep === wizardSteps.length - 1) {
                    // Create goal
                    setShowWizard(false);
                    setWizardStep(0);
                  } else {
                    setWizardStep(wizardStep + 1);
                  }
                }}
              >
                {wizardStep === wizardSteps.length - 1 ? 'Create Goal' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Gamification */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Goals & Achievements</h1>
          <p className="text-muted-foreground">
            Track your progress and unlock achievements
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-bold text-foreground">Level {stats.level}</span>
            </div>
            <p className="text-sm text-muted-foreground">{stats.totalXP} XP</p>
          </div>
          <Button onClick={() => setShowWizard(true)} className="gradient-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Goals</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.active}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalXP}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.level}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card className="study-card">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-foreground">Achievements</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white`
                    : 'border-dashed border-muted bg-muted/20'
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <h4 className={`font-medium ${achievement.unlocked ? 'text-white' : 'text-muted-foreground'}`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-xs ${achievement.unlocked ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {achievement.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Award className="h-3 w-3" />
                    <span className="text-xs">{achievement.xpReward} XP</span>
                  </div>
                  {achievement.unlocked && achievement.unlockedDate && (
                    <p className="text-xs text-white/60">
                      Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Goals
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>

      {/* Enhanced Goals List */}
      <div className="space-y-4">
        {filteredGoals.map((goal) => {
          const progress = getProgress(goal.current, goal.target);
          
          return (
            <Card key={goal.id} className={`study-card border-l-4 ${getPriorityColor(goal.priority)}`}>
              <div className="space-y-4">
                {/* Goal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{goal.title}</h3>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {goal.current} / {goal.target} {goal.unit}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Award className="h-3 w-3" />
                        <span>{goal.xpReward} XP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full h-3" />
                </div>

                {/* Milestones */}
                {goal.milestones.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Milestones</h4>
                    <div className="flex items-center gap-2">
                      {goal.milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                            milestone.completed
                              ? 'bg-success text-success-foreground'
                              : goal.current >= milestone.value
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {milestone.completed ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <span className="w-3 h-3 rounded-full border border-current" />
                          )}
                          <span>{milestone.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Goal Actions */}
                {goal.status === 'active' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Update Progress
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Extend Deadline
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;