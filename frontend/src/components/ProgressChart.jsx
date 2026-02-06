import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTasks } from '../context/TaskContext.jsx';

const COLORS = {
  todo: '#6b7280',
  inprogress: '#3b82f6',
  done: '#22c55e',
};

const COLUMN_LABELS = {
  todo: 'To Do',
  inprogress: 'In Progress',
  done: 'Done',
};

function ProgressChart() {
  const { getTaskCounts } = useTasks();
  const counts = getTaskCounts();

  const barData = [
    { name: 'To Do', count: counts.todo, fill: COLORS.todo },
    { name: 'In Progress', count: counts.inprogress, fill: COLORS.inprogress },
    { name: 'Done', count: counts.done, fill: COLORS.done },
  ];

  const pieData = [
    { name: 'To Do', value: counts.todo, color: COLORS.todo },
    { name: 'In Progress', value: counts.inprogress, color: COLORS.inprogress },
    { name: 'Done', value: counts.done, color: COLORS.done },
  ].filter((item) => item.value > 0);

  const completionRate = counts.total > 0 
    ? Math.round((counts.done / counts.total) * 100) 
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6" data-testid="progress-chart">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Task Progress
        </h2>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Tasks: <span className="font-medium text-gray-800 dark:text-white">{counts.total}</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Completion: <span className="font-medium text-green-600 dark:text-green-400">{completionRate}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="h-64" data-testid="bar-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'currentColor' }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: 'currentColor' }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid var(--tooltip-border, #e5e7eb)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar 
                dataKey="count" 
                name="Tasks"
                radius={[4, 4, 0, 0]}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="h-64" data-testid="pie-chart">
          {counts.total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: '1px solid var(--tooltip-border, #e5e7eb)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <p>No tasks to display</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {Object.entries(COLUMN_LABELS).map(([key, label]) => (
          <div
            key={key}
            className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            data-testid={`stat-${key}`}
          >
            <div
              className="text-2xl font-bold"
              style={{ color: COLORS[key] }}
            >
              {counts[key]}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressChart;
