import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ActivityContext = createContext();

export const useActivities = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
};

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);

  // Load activities from localStorage on mount and clean up duplicates
  useEffect(() => {
    const savedActivities = localStorage.getItem('activities');
    if (savedActivities) {
      try {
        const parsedActivities = JSON.parse(savedActivities);
        
        // Remove duplicates while loading
        const uniqueActivities = [];
        const seen = new Set();
        
        parsedActivities.forEach(activity => {
          const key = `${activity.title}-${activity.description}-${activity.type}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueActivities.push(activity);
          }
        });
        
        setActivities(uniqueActivities);
      } catch (error) {
        console.error('Error loading activities from localStorage:', error);
      }
    }
  }, []);

  // Save activities to localStorage whenever activities change
  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  const addActivity = useCallback((activity) => {
    const newActivity = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...activity
    };
    
    setActivities(prev => {
      // Check for duplicates based on title, description, and type
      const isDuplicate = prev.some(existing => {
        return existing.title === newActivity.title &&
               existing.description === newActivity.description &&
               existing.type === newActivity.type &&
               Math.abs(new Date(existing.timestamp) - new Date(newActivity.timestamp)) < 5000; // Within 5 seconds
      });
      
      if (isDuplicate) {
        console.log('Duplicate activity prevented:', newActivity.title);
        return prev;
      }
      
      // Keep only the last 50 activities to prevent localStorage from getting too large
      const updatedActivities = [newActivity, ...prev].slice(0, 50);
      return updatedActivities;
    });
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  const removeDuplicateActivities = useCallback(() => {
    setActivities(prev => {
      const uniqueActivities = [];
      const seen = new Set();
      
      prev.forEach(activity => {
        const key = `${activity.title}-${activity.description}-${activity.type}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueActivities.push(activity);
        }
      });
      
      return uniqueActivities;
    });
  }, []);

  const getRecentActivities = useCallback((limit = 10) => {
    return activities.slice(0, limit);
  }, [activities]);

  const getActivitiesByType = useCallback((type) => {
    return activities.filter(activity => activity.type === type);
  }, [activities]);

  const value = {
    activities,
    addActivity,
    clearActivities,
    removeDuplicateActivities,
    getRecentActivities,
    getActivitiesByType
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};
