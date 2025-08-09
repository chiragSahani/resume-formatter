'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

type ApiStatus = 'checking' | 'connected' | 'error' | 'disconnected';

export default function ApiStatus() {
  const [status, setStatus] = useState<ApiStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkApiStatus = async () => {
    setStatus('checking');
    try {
      const response = await fetch('https://resume-formatter-7rc4.onrender.com/api/cv/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setStatus('connected');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('API status check failed:', error);
      setStatus('disconnected');
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: Loader2,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          text: 'Checking...',
          animate: true,
        };
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          text: 'Connected',
          animate: false,
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          text: 'API Error',
          animate: false,
        };
      case 'disconnected':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          text: 'Disconnected',
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${config.bgColor} shadow-lg`}>
        <Icon 
          className={`h-4 w-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} 
        />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
        {lastChecked && status !== 'checking' && (
          <span className="text-xs text-slate-500">
            {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>
    </motion.div>
  );
}