
import React from 'react';
import { useTimeTracker } from '../../hooks/useTimeTracker';
import { WorkStatus } from '../../types';
import { formatDuration } from '../../utils/formatter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { PlayIcon, PauseIcon, StopIcon } from '../icons/Icons';

const HomePage: React.FC = () => {
  const { status, elapsedTime, startWork, pauseWork, resumeWork, endWork } = useTimeTracker();

  const getStatusText = () => {
    switch (status) {
      case WorkStatus.WORKING:
        return '稼働中';
      case WorkStatus.PAUSED:
        return '一時停止中';
      case WorkStatus.NOT_STARTED:
      default:
        return 'スタンバイ';
    }
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>タイムトラッカー</CardTitle>
          <CardDescription>{getStatusText()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center my-8">
            <p className="text-6xl font-mono font-bold tracking-widest text-primary">
              {formatDuration(elapsedTime)}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {status === WorkStatus.NOT_STARTED && (
              <Button onClick={startWork} size="lg" className="w-full">
                <PlayIcon className="mr-2 h-5 w-5" />
                出勤
              </Button>
            )}

            {status === WorkStatus.WORKING && (
              <div className="flex gap-4">
                <Button onClick={pauseWork} variant="outline" size="lg" className="w-full">
                  <PauseIcon className="mr-2 h-5 w-5" />
                  一時停止
                </Button>
                <Button onClick={endWork} variant="destructive" size="lg" className="w-full">
                  <StopIcon className="mr-2 h-5 w-5" />
                  退勤
                </Button>
              </div>
            )}

            {status === WorkStatus.PAUSED && (
              <div className="flex gap-4">
                <Button onClick={resumeWork} size="lg" className="w-full">
                   <PlayIcon className="mr-2 h-5 w-5" />
                   再開
                </Button>
                <Button onClick={endWork} variant="destructive" size="lg" className="w-full">
                  <StopIcon className="mr-2 h-5 w-5" />
                  退勤
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
