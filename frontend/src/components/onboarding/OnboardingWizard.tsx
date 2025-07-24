import React, { useState } from 'react';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useUserStore } from '../../store/userStore';

const steps = [
  'Set Preferences',
  'Create First Topic',
  'Upload First PDF',
  'Set First Goal',
  'Customize Notifications',
];

export default function OnboardingWizard() {
  const { showOnboarding, step, nextStep, prevStep, setShowOnboarding } = useOnboardingStore();
  const { setProfile, profile } = useUserStore();
  const [form, setForm] = useState({
    theme: 'light',
    language: 'en',
    topic: '',
    pdf: null as File | null,
    goal: '',
    notifications: true,
  });

  if (!showOnboarding) return null;

  const handleNext = () => {
    if (step === steps.length - 1) {
      setShowOnboarding(false);
      setProfile({ ...(profile || { id: 'local', name: 'User', onboardingComplete: false, preferencesSet: false, firstTime: false }), onboardingComplete: true, preferencesSet: true, firstTime: false });
    } else {
      nextStep();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Welcome to StudySprint 4.0</h2>
        <div className="mb-6">
          <p className="font-semibold mb-2">Step {step + 1} of {steps.length}: {steps[step]}</p>
          {/* Render step-specific UI here (simplified for scaffold) */}
          <div className="my-4">
            {step === 0 && (
              <div>
                <label>Theme: <select value={form.theme} onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}><option value="light">Light</option><option value="dark">Dark</option></select></label>
                <label className="ml-4">Language: <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}><option value="en">English</option><option value="es">Spanish</option></select></label>
              </div>
            )}
            {step === 1 && (
              <input className="input" placeholder="First Topic Name" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} />
            )}
            {step === 2 && (
              <input type="file" onChange={e => setForm(f => ({ ...f, pdf: e.target.files?.[0] || null }))} />
            )}
            {step === 3 && (
              <input className="input" placeholder="First Goal (e.g. Study 5 hours)" value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} />
            )}
            {step === 4 && (
              <label><input type="checkbox" checked={form.notifications} onChange={e => setForm(f => ({ ...f, notifications: e.target.checked }))} /> Enable streak notifications</label>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <button className="btn" onClick={prevStep} disabled={step === 0}>Back</button>
          <button className="btn btn-primary" onClick={handleNext}>{step === steps.length - 1 ? 'Finish' : 'Next'}</button>
        </div>
      </div>
    </div>
  );
} 