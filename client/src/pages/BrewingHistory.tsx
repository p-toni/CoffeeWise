"use client";

import * as React from "react";
import { History, BarChart3, Coffee } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string | React.ReactNode;
  status?: React.ReactNode;
}

const SectionHeader = ({
  icon,
  title,
  status,
}: SectionHeaderProps) => (
  <div className="flex items-center gap-2 text-[#bbbbbb] py-1">
    {icon && (
      <span className="relative bottom-[1px] text-[0.75rem]">{icon}</span>
    )}
    <span className="text-sm font-normal">{title}</span>
    {status && (
      <span className="ml-auto text-[0.7rem] text-[#888888]">{status}</span>
    )}
  </div>
);

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
}

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
  const { data: brewingSessions } = useQuery({
    queryKey: ["/api/brewing/history"],
  });

  const calculateStats = () => {
    if (!brewingSessions) return null;

    return {
      totalBrews: brewingSessions.length,
      averageRating: brewingSessions.reduce(
        (acc: number, session: any) => 
          acc + (session.tasting?.overall || 0), 0
      ) / brewingSessions.length,
      successRate: brewingSessions.filter(
        (session: any) => session.tasting?.overall >= 7
      ).length / brewingSessions.length * 100,
    };
  };

  const stats = calculateStats();

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
            trend="up"
          />
          <StatCard 
            label="Average Rating"
            value={stats ? `${stats.averageRating.toFixed(1)}/10` : "N/A"}
            trend="neutral"
          />
          <StatCard 
            label="Success Rate"
            value={stats ? `${stats.successRate.toFixed(0)}%` : "N/A"}
            trend="up"
          />
        </div>

        {/* Recent Brews */}
        <SectionHeader
          title="Recent Brews"
          icon={<Coffee className="w-3 h-3" />}
        />

        <div className="space-y-2">
          {brewingSessions?.map((session: any) => (
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
                  {session.tasting?.overall ? 
                    `${session.tasting.overall}/10` : 
                    'Not rated'
                  }
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trends */}
        <SectionHeader
          title="Trends"
          icon={<BarChart3 className="w-3 h-3" />}
        />
        <Card className="bg-[#1e1e1e] rounded-md p-3">
          <div className="text-center text-[#888888] py-8">
            Brewing parameter trends coming soon
          </div>
        </Card>
      </div>
    </div>
  );
}
