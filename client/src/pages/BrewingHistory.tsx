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

const DetailRow = ({
  label,
  value,
  valueClass = "text-[#cccccc]",
}: DetailRowProps) => (
  <div className="grid grid-cols-[95px_1fr] gap-y-0.5">
    <div className="text-[#888888] text-sm">{label}</div>
    <div className={`text-sm text-right ${valueClass}`}>{value}</div>
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

const calculateOverallRating = (tasting: { aroma: number; body: number; aftertaste: number; } | null): number | null => {
  if (!tasting || 
      typeof tasting.aroma !== 'number' || 
      typeof tasting.body !== 'number' || 
      typeof tasting.aftertaste !== 'number') {
    return null;
  }
  return Math.round((tasting.aroma + tasting.body + tasting.aftertaste) / 3);
};

export default function BrewingHistory() {
  const { data: brewingSessions = [] } = useQuery<BrewingSession[]>({
    queryKey: ["/api/brewing/history"],
  });

  const calculateStats = React.useCallback(() => {
    if (!brewingSessions?.length) return null;

    const thisMonth = new Date().getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;

    // Filter out sessions without valid tasting data and ensure completed status
    const validSessions = brewingSessions.filter(session => {
      return session.status === 'completed' && session.tasting !== null;
    });

    const thisMonthSessions = validSessions.filter(session => {
      const createdAt = new Date(session.createdAt);
      return createdAt.getMonth() === thisMonth;
    });

    const lastMonthSessions = validSessions.filter(session => {
      const createdAt = new Date(session.createdAt);
      return createdAt.getMonth() === lastMonth;
    });

    const calculateAverageRating = (sessions: BrewingSession[]) => {
      if (!sessions.length) return 0;
      const sum = sessions.reduce((acc, session) => {
        const rating = calculateOverallRating(session.tasting);
        return acc + (rating ?? 0);
      }, 0);
      return sum / sessions.length;
    };

    const thisMonthAvg = calculateAverageRating(thisMonthSessions);
    const lastMonthAvg = calculateAverageRating(lastMonthSessions);

    const completedSessions = brewingSessions.filter(session => session.status === 'completed');
    const successfulSessions = completedSessions.filter(session => {
      const rating = calculateOverallRating(session.tasting);
      return rating !== null && rating >= 7;
    });

    const successRate = completedSessions.length > 0 
      ? (successfulSessions.length / completedSessions.length) * 100 
      : 0;

    return {
      totalBrews: brewingSessions.length,
      averageRating: calculateAverageRating(validSessions),
      ratingTrend: thisMonthAvg > lastMonthAvg ? 'up' :
        thisMonthAvg < lastMonthAvg ? 'down' : 'neutral',
      successRate,
      brewsTrend: thisMonthSessions.length > lastMonthSessions.length ? 'up' :
        thisMonthSessions.length < lastMonthSessions.length ? 'down' : 'neutral'
    };
  }, [brewingSessions]);

  const prepareChartData = React.useCallback(() => {
    if (!brewingSessions?.length) return [];

    // Filter completed sessions with valid ratings
    const completedSessions = brewingSessions
      .filter(session => session.status === 'completed' && session.tasting !== null)
      .slice(-10);

    return completedSessions.map(session => ({
      date: new Date(session.createdAt).toLocaleDateString(),
      rating: calculateOverallRating(session.tasting),
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Total Brews"
            value={stats?.totalBrews || 0}
            trend={stats?.brewsTrend}
          />
          <StatCard
            label="Average Rating"
            value={`${(stats?.averageRating || 0).toFixed(1)}/10`}
            trend={stats?.ratingTrend}
          />
          <StatCard
            label="Success Rate"
            value={`${Math.round(stats?.successRate || 0)}%`}
            trend={stats?.brewsTrend}
          />
        </div>

        <SectionHeader
          title="Recent Brews"
          icon={<Coffee className="w-3 h-3" />}
        />

        <div className="space-y-2">
          {brewingSessions.map((session) => {
            const rating = session.status === 'completed' ? calculateOverallRating(session.tasting) : null;
            return (
              <Card key={session.id} className="bg-[#1e1e1e] rounded-md p-3">
                <DetailRow
                  label="Method"
                  value={session.method}
                />
                <DetailRow
                  label="Bean"
                  value={session.bean}
                />
                <DetailRow
                  label="Settings"
                  value={`${session.settings.coffee}g / ${session.settings.water_ratio}:1 / ${session.settings.grind_size} / ${session.settings.water_temp}°C`}
                />
                <DetailRow
                  label="Rating"
                  value={rating !== null ? `${rating}/10` : 'Not rated'}
                />
              </Card>
            );
          })}
        </div>

        <SectionHeader
          title="Brewing Trends"
          icon={<TrendingUp className="w-3 h-3" />}
        />

        {chartData.length > 0 ? (
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
                    domain={[0, 10]}
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
        ) : (
          <Card className="bg-[#1e1e1e] rounded-md p-3">
            <p className="text-center text-[#888888]">No rating data available for chart</p>
          </Card>
        )}
      </div>
    </div>
  );
}