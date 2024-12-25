import React from 'react';
import { AuthForm } from '../../components/auth/AuthForm';

export function AuthPage() {
  const [mode, setMode] = React.useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-4xl font-bold text-red-600 mb-2">FriendFlix</h1>
        <p className="text-gray-400">Share your memories with friends</p>
      </div>

      <AuthForm mode={mode} />

      <p className="mt-6 text-gray-400">
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <button
              onClick={() => setMode('register')}
              className="text-red-500 hover:underline"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-red-500 hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}