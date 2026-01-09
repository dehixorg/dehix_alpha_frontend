'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Award, Trophy, Star, Target, Zap, Shield } from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import Header from '@/components/header/header';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface Level {
  id: string;
  name: string;
  level: number;
  description: string;
  requiredPoints: number;
  currentPoints: number;
  benefits: string[];
  icon: string;
}

export default function BadgesAndLevels() {
  const user = useSelector((state: RootState) => state.user);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBadgesAndLevels = async () => {
    setLoading(true);
    try {
      // Fetch badges
      const badgesResponse = await axiosInstance.get(
        '/freelancer/gamification/badges',
      );
      if (badgesResponse.status === 200 && badgesResponse.data?.data) {
        setBadges(badgesResponse.data.data);
      }

      // Fetch levels
      const levelsResponse = await axiosInstance.get(
        '/freelancer/gamification/levels',
      );
      if (levelsResponse.status === 200 && levelsResponse.data?.data) {
        const levelsData = levelsResponse.data.data;
        setLevels(levelsData.levels || []);
        setCurrentLevel(levelsData.currentLevel || null);
      }
    } catch (error) {
      console.error('Error fetching badges and levels:', error);
      // Set dummy data for now
      setBadges([
        {
          id: '1',
          name: 'First Project',
          description: 'Complete your first project',
          icon: 'target',
          earned: true,
          earnedAt: '2024-01-15',
        },
        {
          id: '2',
          name: 'Rising Star',
          description: 'Maintain a 4.5+ rating for 10 projects',
          icon: 'star',
          earned: false,
          progress: 7,
          maxProgress: 10,
        },
        {
          id: '3',
          name: 'Speed Demon',
          description: 'Complete 5 projects ahead of deadline',
          icon: 'zap',
          earned: false,
          progress: 3,
          maxProgress: 5,
        },
      ]);

      setLevels([
        {
          id: '1',
          name: 'Beginner',
          level: 1,
          description: 'Just starting your freelance journey',
          requiredPoints: 0,
          currentPoints: 150,
          benefits: [
            'Basic profile visibility',
            'Access to entry-level projects',
          ],
          icon: 'shield',
        },
        {
          id: '2',
          name: 'Intermediate',
          level: 2,
          description: 'Building your reputation',
          requiredPoints: 500,
          currentPoints: 150,
          benefits: [
            'Enhanced profile visibility',
            'Priority project access',
            'Verified badge',
          ],
          icon: 'award',
        },
        {
          id: '3',
          name: 'Expert',
          level: 3,
          description: 'Established professional',
          requiredPoints: 1500,
          currentPoints: 150,
          benefits: [
            'Premium profile placement',
            'Direct client access',
            'Advanced analytics',
          ],
          icon: 'trophy',
        },
      ]);

      setCurrentLevel({
        id: '1',
        name: 'Beginner',
        level: 1,
        description: 'Just starting your freelance journey',
        requiredPoints: 0,
        currentPoints: 150,
        benefits: [
          'Basic profile visibility',
          'Access to entry-level projects',
        ],
        icon: 'shield',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchBadgesAndLevels();
    }
  }, [user]);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'target':
        return <Target className="h-6 w-6" />;
      case 'star':
        return <Star className="h-6 w-6" />;
      case 'zap':
        return <Zap className="h-6 w-6" />;
      case 'shield':
        return <Shield className="h-6 w-6" />;
      case 'award':
        return <Award className="h-6 w-6" />;
      case 'trophy':
        return <Trophy className="h-6 w-6" />;
      default:
        return <Award className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <SidebarMenu
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          active="Badges & Levels"
          isKycCheck={true}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            activeMenu="Badges & Levels"
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Badges & Levels"
        isKycCheck={true}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Badges & Levels"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Badges & Levels
              </h1>
              <p className="text-gray-600">
                Track your achievements and progress as a freelancer
              </p>
            </div>

            {/* Current Level Section */}
            {currentLevel && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getIconComponent(currentLevel.icon)}
                    {currentLevel.name} - Level {currentLevel.level}
                  </CardTitle>
                  <CardDescription>{currentLevel.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to Next Level</span>
                        <span>{currentLevel.currentPoints} points</span>
                      </div>
                      {levels.length > currentLevel.level && (
                        <Progress
                          value={
                            (currentLevel.currentPoints /
                              levels[currentLevel.level].requiredPoints) *
                            100
                          }
                          className="h-2"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Current Benefits:</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentLevel.benefits.map((benefit, index) => (
                          <Badge key={index} variant="secondary">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Badges Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Badges
                  </CardTitle>
                  <CardDescription>
                    Earn badges by completing various achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center space-x-4 p-3 rounded-lg border"
                      >
                        <div
                          className={`p-2 rounded-full ${badge.earned ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {getIconComponent(badge.icon)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{badge.name}</h4>
                          <p className="text-sm text-gray-600">
                            {badge.description}
                          </p>
                          {badge.earned && badge.earnedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Earned on {badge.earnedAt}
                            </p>
                          )}
                          {!badge.earned &&
                            badge.progress !== undefined &&
                            badge.maxProgress !== undefined && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>
                                    {badge.progress}/{badge.maxProgress}
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    (badge.progress / badge.maxProgress) * 100
                                  }
                                  className="h-1"
                                />
                              </div>
                            )}
                        </div>
                        {badge.earned && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            Earned
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Levels Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Levels
                  </CardTitle>
                  <CardDescription>
                    Unlock new benefits as you level up
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {levels.map((level) => (
                      <div
                        key={level.id}
                        className={`p-3 rounded-lg border ${
                          level.id === currentLevel?.id
                            ? 'border-blue-500 bg-blue-50'
                            : level.level < (currentLevel?.level || 0)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-full ${
                              level.id === currentLevel?.id
                                ? 'bg-blue-100 text-blue-600'
                                : level.level < (currentLevel?.level || 0)
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {getIconComponent(level.icon)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {level.name} - Level {level.level}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {level.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {level.requiredPoints} points required
                            </p>
                          </div>
                          {level.level < (currentLevel?.level || 0) && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              Completed
                            </Badge>
                          )}
                          {level.id === currentLevel?.id && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800"
                            >
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
