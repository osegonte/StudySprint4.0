// src/pages/Settings.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bell, 
  Shield, 
  Download, 
  Upload,
  Trash2,
  Settings as SettingsIcon,
  Moon,
  Sun
} from 'lucide-react';

// Simple Switch component since we don't have it imported
const Switch: React.FC<{
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}> = ({ id, checked, onCheckedChange }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-primary' : 'bg-muted'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// Simple Textarea component
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ 
  className, 
  ...props 
}) => (
  <textarea
    className={`flex min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Simple Tabs implementation
const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`flex bg-muted rounded-lg p-1 ${className}`}>{children}</div>
);

const TabsTrigger: React.FC<{ value: string; children: React.ReactNode; isActive?: boolean; onClick?: () => void }> = ({ 
  children, 
  isActive, 
  onClick 
}) => (
  <button
    onClick={onClick}
    className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
      isActive 
        ? 'bg-background text-foreground shadow-sm' 
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    {children}
  </button>
);

const TabsContent: React.FC<{ value: string; activeTab: string; children: React.ReactNode; className?: string }> = ({ 
  value, 
  activeTab, 
  children, 
  className 
}) => {
  if (value !== activeTab) return null;
  return <div className={className}>{children}</div>;
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    studyReminders: true,
    goalDeadlines: true,
    weeklyReports: false,
    achievements: true
  });

  const [profile, setProfile] = useState({
    name: 'Study User',
    email: 'user@studysprint.com',
    studyLevel: 'Intermediate',
    timezone: 'UTC-5'
  });

  const [privacy, setPrivacy] = useState({
    shareProgress: false,
    dataCollection: true,
    analytics: true
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Customize your StudySprint experience
        </p>
      </div>

      <div className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger 
            value="profile" 
            isActive={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            isActive={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="privacy" 
            isActive={activeTab === 'privacy'}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy
          </TabsTrigger>
          <TabsTrigger 
            value="data" 
            isActive={activeTab === 'data'}
            onClick={() => setActiveTab('data')}
          >
            Data
          </TabsTrigger>
          <TabsTrigger 
            value="advanced" 
            isActive={activeTab === 'advanced'}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" activeTab={activeTab} className="space-y-6 mt-6">
          <Card className="study-card">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{profile.name}</h3>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <Badge variant="secondary" className="mt-1">Level 12 Scholar</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Study Level</Label>
                  <Input
                    id="level"
                    value={profile.studyLevel}
                    onChange={(e) => setProfile({ ...profile, studyLevel: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button>Save Changes</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" activeTab={activeTab} className="space-y-6 mt-6">
          <Card className="study-card">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="study-reminders">Study Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded to start your study sessions</p>
                  </div>
                  <Switch
                    id="study-reminders"
                    checked={notifications.studyReminders}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, studyReminders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="goal-deadlines">Goal Deadlines</Label>
                    <p className="text-sm text-muted-foreground">Notifications for approaching goal deadlines</p>
                  </div>
                  <Switch
                    id="goal-deadlines"
                    checked={notifications.goalDeadlines}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, goalDeadlines: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly study progress summaries</p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, weeklyReports: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="achievements">Achievement Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when you unlock achievements</p>
                  </div>
                  <Switch
                    id="achievements"
                    checked={notifications.achievements}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, achievements: checked })
                    }
                  />
                </div>
              </div>

              <Button>Save Notification Settings</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" activeTab={activeTab} className="space-y-6 mt-6">
          <Card className="study-card">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Privacy & Security</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="share-progress">Share Progress</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your study progress</p>
                  </div>
                  <Switch
                    id="share-progress"
                    checked={privacy.shareProgress}
                    onCheckedChange={(checked) => 
                      setPrivacy({ ...privacy, shareProgress: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-collection">Data Collection</Label>
                    <p className="text-sm text-muted-foreground">Help improve StudySprint with usage data</p>
                  </div>
                  <Switch
                    id="data-collection"
                    checked={privacy.dataCollection}
                    onCheckedChange={(checked) => 
                      setPrivacy({ ...privacy, dataCollection: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Analytics</Label>
                    <p className="text-sm text-muted-foreground">Enable detailed study analytics</p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={privacy.analytics}
                    onCheckedChange={(checked) => 
                      setPrivacy({ ...privacy, analytics: checked })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full">
                  Two-Factor Authentication
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data" activeTab={activeTab} className="space-y-6 mt-6">
          <Card className="study-card">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Data Management</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Study Data
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import Data
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Storage Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>PDFs</span>
                      <span>2.1 GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Notes</span>
                      <span>45 MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Session Data</span>
                      <span>12 MB</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-medium">
                      <span>Total</span>
                      <span>2.16 GB</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete all your data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete All Data
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" activeTab={activeTab} className="space-y-6 mt-6">
          <Card className="study-card">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <SettingsIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Advanced Settings</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme Preference</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                    <Button variant="default" size="sm">
                      System
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    defaultValue="30"
                    min="5"
                    max="120"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto-backup">Auto-backup Frequency</Label>
                  <select className="w-full p-2 border border-border rounded-md bg-background">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Disabled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdf-quality">PDF Processing Quality</Label>
                  <select className="w-full p-2 border border-border rounded-md bg-background">
                    <option>High (Slower)</option>
                    <option>Medium (Balanced)</option>
                    <option>Low (Faster)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>StudySprint Version</span>
                  <Badge variant="outline">v4.0.1</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                  <span>Last Updated</span>
                  <span>January 20, 2024</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </div>
    </div>
  );
};

export default Settings;