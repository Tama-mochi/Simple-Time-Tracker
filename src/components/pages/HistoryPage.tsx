
import React, { useState, useEffect, useMemo } from 'react';
import { getLogs, clearLogs, updateLog, deleteLog } from '../../services/timeLogService';
import type { TimeLog } from '../../types';
import { formatDuration, formatDate, formatToDateTimeLocal, parseDuration, formatYearMonth } from '../../utils/formatter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Button } from '../ui/Button';
import { DownloadIcon, TrashIcon, PencilIcon } from '../icons/Icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

// Let TypeScript know that XLSX is available globally from the script added to index.html
declare const XLSX: any;

interface EditFormState {
  startTime: string;
  endTime: string;
  pausedDuration: string;
}

const HistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ startTime: '', endTime: '', pausedDuration: '' });
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'YYYY-MM' or 'all'

  const availableMonths = useMemo(() => {
    const allLogs = getLogs();
    const months = [...new Set(allLogs.map(log => log.startTime.substring(0, 7)))];
    return months;
  }, [logs]);

  const displayedLogs = useMemo(() => {
    if (selectedMonth === 'all') {
      return logs;
    }
    return logs.filter(log => log.startTime.startsWith(selectedMonth));
  }, [logs, selectedMonth]);

  const refreshLogs = () => {
    setLogs(getLogs());
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  useEffect(() => {
    if (editingLog) {
      setEditForm({
        startTime: formatToDateTimeLocal(editingLog.startTime),
        endTime: formatToDateTimeLocal(editingLog.endTime),
        pausedDuration: formatDuration(editingLog.pausedDuration),
      });
    }
  }, [editingLog]);

  const handleClearHistory = () => {
    if (window.confirm('本当にすべての履歴を削除しますか？この操作は取り消せません。')) {
      clearLogs();
      refreshLogs();
      setSelectedMonth('all');
    }
  };

  const handleDeleteLog = (logId: string) => {
    if (window.confirm('この記録を削除しますか？')) {
      deleteLog(logId);
      refreshLogs();
    }
  };

  const handleEdit = (log: TimeLog) => {
    setEditingLog(log);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!editingLog) return;

    const startTime = new Date(editForm.startTime);
    const endTime = new Date(editForm.endTime);
    const pausedDuration = parseDuration(editForm.pausedDuration);

    if (startTime >= endTime) {
      alert('終了日時は開始日時より後に設定してください。');
      return;
    }

    const duration = endTime.getTime() - startTime.getTime() - pausedDuration;

    if (duration < 0) {
      alert('稼働時間がマイナスになっています。休憩時間を確認してください。');
      return;
    }

    const updatedLog: TimeLog = {
      ...editingLog,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      pausedDuration: pausedDuration,
      duration: duration,
    };

    updateLog(updatedLog);
    refreshLogs();
    setEditingLog(null);
  };

  const handleExportExcel = () => {
    if (typeof XLSX === 'undefined') {
        alert('Excel出力ライブラリが読み込まれていません。');
        return;
    }
    const dataToExport = displayedLogs.map(log => ({
      '開始日時': formatDate(log.startTime),
      '終了日時': formatDate(log.endTime),
      '稼働時間': formatDuration(log.duration),
      '休憩時間': formatDuration(log.pausedDuration),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    const cols = [
      { wch: 20 }, // 開始日時
      { wch: 20 }, // 終了日時
      { wch: 15 }, // 稼働時間
      { wch: 15 }, // 休憩時間
    ];
    worksheet['!cols'] = cols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '稼働実績');

    const fileName = `time_log_${selectedMonth === 'all' ? 'all' : selectedMonth}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>稼働実績</CardTitle>
            <CardDescription>
              {selectedMonth === 'all' ? 'すべての' : formatYearMonth(selectedMonth)}
              実績を表示しています。
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 px-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">すべての月</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>{formatYearMonth(month)}</option>
              ))}
            </select>
            <Button onClick={handleExportExcel} disabled={displayedLogs.length === 0} variant="outline">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Excel出力
            </Button>
            <Button onClick={handleClearHistory} disabled={logs.length === 0} variant="destructive">
              <TrashIcon className="mr-2 h-4 w-4" />
              全削除
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>開始日時</TableHead>
              <TableHead>終了日時</TableHead>
              <TableHead>稼働時間</TableHead>
              <TableHead>休憩時間</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedLogs.length > 0 ? (
              displayedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="min-w-[180px]">{formatDate(log.startTime)}</TableCell>
                  <TableCell className="min-w-[180px]">{formatDate(log.endTime)}</TableCell>
                  <TableCell>{formatDuration(log.duration)}</TableCell>
                  <TableCell>{formatDuration(log.pausedDuration)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(log)}>
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">編集</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteLog(log.id)}>
                      <TrashIcon className="h-4 w-4 text-destructive" />
                      <span className="sr-only">削除</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  表示する記録がありません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {editingLog && (
        <Dialog open={!!editingLog} onOpenChange={(open) => !open && setEditingLog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>実績の編集</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right">開始日時</Label>
                <Input id="startTime" name="startTime" type="datetime-local" value={editForm.startTime} onChange={handleEditFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right">終了日時</Label>
                <Input id="endTime" name="endTime" type="datetime-local" value={editForm.endTime} onChange={handleEditFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pausedDuration" className="text-right">休憩時間</Label>
                <Input id="pausedDuration" name="pausedDuration" placeholder="HH:MM:SS" value={editForm.pausedDuration} onChange={handleEditFormChange} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">キャンセル</Button>
              </DialogClose>
              <Button type="button" onClick={handleSave}>変更を保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default HistoryPage;
