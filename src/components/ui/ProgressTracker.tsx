'use client';

import { cn, getAccuracyBgColor } from '@/lib/utils';
import { ProgressTrackerProps } from '@/types';
import { Card, CardContent, CardTitle } from './Card';

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  overallAccuracy,
  totalCorrect,
  totalTime,
  level,
  categoryBreakdown,
  weeklyData,
  recentActivity,
}) => {
  return (
    <div className="space-y-6">
        {/* Overall Stats Card */}
        <Card variant="progress" padding="lg">
          <CardTitle className="text-primary-900 mb-4">Overall Stats</CardTitle>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-800">{overallAccuracy}%</div>
              <div className="text-sm text-primary-700">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-800">{totalCorrect}</div>
              <div className="text-sm text-primary-700">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-800">{totalTime}</div>
              <div className="text-sm text-primary-700">Total</div>
            </div>
          </div>
        </Card>

        {/* Performance Trends */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-4">Performance Trends</CardTitle>
            <div className="h-40 flex items-end justify-between px-4">
              {weeklyData.map((day, index) => {
                const height = Math.max((day.accuracy / 100) * 120, 8); // Minimum height of 8px
                
                return (
                  <div key={day.day} className="flex flex-col items-center">
                    <div 
                      className={cn(
                        'w-8 rounded-t-sm mb-2 transition-all duration-500',
                        getAccuracyBgColor(day.accuracy)
                      )}
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-xs text-gray-600">{day.day}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-4">Category Breakdown</CardTitle>
            <div className="space-y-4">
              {categoryBreakdown.map((category) => (
                <div key={category.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {category.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {category.accuracy}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${category.accuracy}%`, 
                        backgroundColor: category.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-4">Recent Activity</CardTitle>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-3" role="img" aria-hidden="true">
                      {activity.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type}
                      </p>
                      <p className="text-xs text-gray-600">
                        {activity.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={cn(
                      'text-sm font-semibold px-2 py-1 rounded-full',
                      activity.accuracy >= 90 ? 'bg-success-100 text-success-800' :
                      activity.accuracy >= 80 ? 'bg-primary-100 text-primary-800' :
                      activity.accuracy >= 70 ? 'bg-warning-100 text-warning-800' :
                      'bg-error-100 text-error-800'
                    )}>
                      {activity.accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export { ProgressTracker };