import { useState, useEffect } from 'react';
import { OnboardingData } from '@/types/onboarding';

const ONBOARDING_KEY = 'dali-onboarding-completed';
const ONBOARDING_DATA_KEY = 'dali-onboarding-data';

export function useOnboarding() {
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  });

  const [data, setData] = useState<Partial<OnboardingData>>(() => {
    const stored = localStorage.getItem(ONBOARDING_DATA_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  const saveData = (newData: Partial<OnboardingData>) => {
    const updated = { ...data, ...newData };
    setData(updated);
    localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(updated));
  };

  const completeOnboarding = (finalData: OnboardingData) => {
    localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(finalData));
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsCompleted(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(ONBOARDING_DATA_KEY);
    setIsCompleted(false);
    setData({});
  };

  return {
    isCompleted,
    data,
    saveData,
    completeOnboarding,
    resetOnboarding,
  };
}
