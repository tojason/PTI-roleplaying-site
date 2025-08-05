'use client';

import { useState } from 'react';

export function PositionTest() {
  const [showTest, setShowTest] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setShowTest(!showTest)}
        className="fixed top-4 right-4 z-[9999] bg-purple-600 text-white px-2 py-1 rounded text-xs"
      >
        Toggle Position Test
      </button>

      {showTest && (
        <>
          {/* Test various positioning approaches */}
          <div className="fixed left-2 bottom-[100px] z-[45] bg-green-500 text-white p-1 rounded text-[10px] max-w-[80px] leading-tight">
            bottom-[100px]
          </div>

          <div className="fixed left-2 z-[45] bg-blue-500 text-white p-1 rounded text-[10px] max-w-[80px] leading-tight test-90">
            test-90
          </div>

          <div className="fixed left-2 z-[45] bg-red-500 text-white p-1 rounded text-[10px] max-w-[80px] leading-tight mobile-above-nav">
            mobile-above-nav
          </div>

          <div className="fixed left-2 z-[45] bg-purple-500 text-white p-1 rounded text-[10px] max-w-[80px] leading-tight fixed-above-nav">
            fixed-above-nav
          </div>

          {/* Second column */}
          <div className="fixed left-24 z-[45] bg-yellow-500 text-black p-1 rounded text-[10px] max-w-[80px] leading-tight above-nav-test">
            above-nav-test
          </div>

          <div 
            className="fixed left-24 z-[45] bg-orange-500 text-white p-1 rounded text-[10px] max-w-[80px] leading-tight"
            style={{ bottom: 'var(--mobile-bottom-safe, 95px)' }}
          >
            CSS var direct
          </div>

          {/* Info panel */}
          <div className="fixed top-4 left-4 z-[45] bg-gray-800 text-white p-2 rounded text-[10px] max-w-[220px] leading-tight">
            <div className="font-bold mb-1">CSS Variable Values:</div>
            <div>--navigation-height: {typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--navigation-height') : 'loading'}</div>
            <div>--navigation-clearance: {typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--navigation-clearance') : 'loading'}</div>
            <div>--mobile-bottom-safe: {typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--mobile-bottom-safe') : 'loading'}</div>
            <div className="mt-1 font-bold">Window size: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'loading'}</div>
          </div>
        </>
      )}
    </>
  );
}