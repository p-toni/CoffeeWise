"use client";

import * as React from "react";
import { History, Coffee, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { type BrewingSession } from "@db/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string | React.ReactNode;
  status?: React.ReactNode;
  statusColor?: string;
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
}

const SectionHeader = ({
  icon,
  title,
  status,
  statusColor = "text-[#888888]",
}: SectionHeaderProps) => (
  <div className="flex items-center gap-2 text-[#bbbbbb] py-1">
    {icon && (
      <span className="relative bottom-[1px] text-[0.75rem]">{icon}</span>
    )}
    <span className="text-sm font-normal">{title}</span>
    {status && (
      <span className={`ml-auto text-[0.7rem] ${statusColor}`}>{status}</span>
    )}
  </div>
);

const StatCard = ({ label, value, trend }: StatCardProps) => (
  <div className="bg-[#1e1e1e] rounded-md p-3 flex flex-col">
    <span className="text-[#888888] text-sm">{label}</span>
    <span className="text-[#f0f0f0] text-lg mt-1">{value}</span>
    {trend && (
      <div className={`text-xs mt-2 ${
        trend === 'up' ? 'text-[#A3E635]' : 
        trend === 'down' ? 'text-red-500' : 
        'text-[#888888]'
      }`}>
        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} vs last month
      </div>
    )}
  </div>
);

export default function BrewingHistory() {
  const { data: brewingSessions = [] } = useQuery<BrewingSession[]>({
    queryKey: ["/api/brewing/history"],
  });

  const calculateStats = React.useCallback(() => {
    if (brewingSessions.length === 0) return null;

    const thisMonth = new Date().getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;

    const thisMonthSessions = brewingSessions.filter(session => {
      const createdAt = session.createdAt ? new Date(session.createdAt) : null;
      return createdAt?.getMonth() === thisMonth;
    });

    const lastMonthSessions = brewingSessions.filter(session => {
      const createdAt = session.createdAt ? new Date(session.createdAt) : null;
      return createdAt?.getMonth() === lastMonth;
    });

    const calculateAverageRating = (sessions: BrewingSession[]) => {
      if (sessions.length === 0) return 0;
      const validRatings = sessions.filter(session => session.tasting && typeof session.tasting.overall === 'number');
      if (validRatings.length === 0) return 0;
      return validRatings.reduce((acc, session) => acc + session.tasting!.overall, 0) / validRatings.length;
    };

    const thisMonthAvg = calculateAverageRating(thisMonthSessions);
    const lastMonthAvg = calculateAverageRating(lastMonthSessions);

    const validSessions = brewingSessions.filter(
      session => session.tasting && typeof session.tasting.overall === 'number'
    );
    const successfulSessions = validSessions.filter(
      session => session.tasting!.overall >= 7
    );

    return {
      totalBrews: brewingSessions.length,
      thisMonthBrews: thisMonthSessions.length,
      lastMonthBrews: lastMonthSessions.length,
      averageRating: calculateAverageRating(brewingSessions),
      ratingTrend: thisMonthAvg > lastMonthAvg ? 'up' as const : 
                   thisMonthAvg < lastMonthAvg ? 'down' as const : 
                   'neutral' as const,
      successRate: validSessions.length > 0 ? 
        (successfulSessions.length / validSessions.length) * 100 : 0,
      brewsTrend: thisMonthSessions.length > lastMonthSessions.length ? 'up' as const :
                  thisMonthSessions.length < lastMonthSessions.length ? 'down' as const : 
                  'neutral' as const
    };
  }, [brewingSessions]);

  const prepareChartData = React.useCallback(() => {
    return brewingSessions.slice(-10).map(session => ({
      date: session.createdAt ? new Date(session.createdAt).toLocaleDateString() : '',
      rating: session.tasting && typeof session.tasting.overall === 'number' ? session.tasting.overall : null,
      waterTemp: session.settings.water_temp,
      ratio: session.settings.water_ratio,
    }));
  }, [brewingSessions]);

  const stats = calculateStats();
  const chartData = prepareChartData();

  return (
    <div className="min-h-screen bg-[#121212] text-[#f0f0f0] p-4 font-mono text-sm">
      <div className="max-w-3xl mx-auto space-y-4">
        <SectionHeader
          title="Brewing History"
          icon={<History className="w-3 h-3" />}
          status={new Date().toLocaleDateString()}
        />

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard 
            label="Total Brews"
            value={stats?.totalBrews || 0}
            trend={stats?.brewsTrend}
          />
          <StatCard 
            label="Average Rating"
            value={stats ? `${stats.averageRating.toFixed(1)}/10` : "0.0/10"}
            trend={stats?.ratingTrend}
          />
          <StatCard 
            label="Success Rate"
            value={stats ? `${stats.successRate.toFixed(0)}%` : "0%"}
            trend="up"
          />
        </div>

        {/* Recent Brews */}
        <SectionHeader
          title="Recent Brews"
          icon={<Coffee className="w-3 h-3" />}
        />

        <div className="space-y-2">
          {brewingSessions.map((session) => (
            <Card key={session.id} className="bg-[#1e1e1e] rounded-md p-3">
              <div className="grid grid-cols-[95px_1fr] gap-y-0.5">
                <div className="text-[#888888] text-sm">Method</div>
                <div className="text-sm text-right text-[#cccccc]">
                  {session.method}
                </div>

                <div className="text-[#888888] text-sm">Bean</div>
                <div className="text-sm text-right text-[#cccccc] break-all">
                  {session.bean}
                </div>

                <div className="text-[#888888] text-sm">Settings</div>
                <div className="text-sm text-right text-[#cccccc]">
                  {`${session.settings.coffee}g / ${session.settings.water_ratio}:1 / ${session.settings.grind_size} / ${session.settings.water_temp}°C`}
                </div>

                <div className="text-[#888888] text-sm">Rating</div>
                <div className="text-sm text-right text-[#cccccc]">
                  {session.tasting && typeof session.tasting.overall === 'number' ? 
                    `${session.tasting.overall}/10` : 
                    'Not rated'
                  }
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Brewing Trends */}
        <SectionHeader
          title="Brewing Trends"
          icon={<TrendingUp className="w-3 h-3" />}
        />
        <Card className="bg-[#1e1e1e] rounded-md p-3">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888888" 
                  tick={{ fill: '#888888' }} 
                />
                <YAxis 
                  stroke="#888888" 
                  tick={{ fill: '#888888' }}
                  yAxisId="left"
                />
                <YAxis 
                  stroke="#888888" 
                  tick={{ fill: '#888888' }}
                  yAxisId="right"
                  orientation="right"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e1e1e', 
                    border: '1px solid #333333',
                    borderRadius: '4px'
                  }}
                  labelStyle={{ color: '#888888' }}
                  itemStyle={{ color: '#f0f0f0' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rating"
                  stroke="#A3E635"
                  name="Rating"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="waterTemp"
                  stroke="#60A5FA"
                  name="Water Temp"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}