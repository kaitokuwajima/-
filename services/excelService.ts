import * as XLSX from 'xlsx';
import { Employee, LeaveRequest, Task, LEAVE_TYPES } from '../types.ts';

// ---- 従業員一覧シート ----
function buildEmployeeSheet(employees: Employee[]): XLSX.WorkSheet {
  const headers = [
    '社員番号', '氏名', 'フリガナ', '部署', '役職',
    '雇用形態', '入社日', '生年月日', '電話番号', 'メールアドレス',
    '付与有給日数', '使用有給日数', '残有給日数', '状態', '備考',
  ];

  const rows = employees.map(e => [
    e.employeeCode,
    e.name,
    e.nameKana,
    e.department,
    e.position,
    e.employmentType,
    e.hireDate,
    e.birthDate ?? '',
    e.phone ?? '',
    e.email ?? '',
    e.paidLeaveDays,
    e.usedLeaveDays,
    e.paidLeaveDays - e.usedLeaveDays,
    e.status,
    e.notes ?? '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // 列幅の設定
  ws['!cols'] = [
    { wch: 10 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 12 },
    { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 26 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 20 },
  ];

  return ws;
}

// ---- 休暇申請シート ----
function buildLeaveSheet(leaves: LeaveRequest[]): XLSX.WorkSheet {
  const headers = ['日付', '氏名', '区分', 'コメント'];

  const typeLabel: Record<string, string> = {
    [LEAVE_TYPES.DAY_OFF]: '休み',
    [LEAVE_TYPES.AM_OFF]: '午前休み',
    [LEAVE_TYPES.PM_OFF]: '午後休み',
    [LEAVE_TYPES.PAID_LEAVE]: '有給',
    [LEAVE_TYPES.AM_PAID_LEAVE]: '午前有給',
    [LEAVE_TYPES.PM_PAID_LEAVE]: '午後有給',
    [LEAVE_TYPES.COMMENT]: '共有コメント',
  };

  const rows = leaves.map(l => [
    l.date,
    l.employeeName,
    typeLabel[l.type] ?? l.type,
    l.comment ?? '',
  ]);

  const sorted = [headers, ...rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])))];
  const ws = XLSX.utils.aoa_to_sheet(sorted);

  ws['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 30 }];

  return ws;
}

// ---- タスク一覧シート ----
function buildTaskSheet(tasks: Task[]): XLSX.WorkSheet {
  const headers = ['タイトル', '状態', '優先度', '担当者', '期限日', '説明'];

  const statusLabel: Record<string, string> = {
    todo: '未着手',
    in_progress: '進行中',
    done: '完了',
  };
  const priorityLabel: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
  };

  const rows = tasks.map(t => [
    t.title,
    statusLabel[t.status] ?? t.status,
    priorityLabel[t.priority] ?? t.priority,
    t.assignee ?? '',
    t.dueDate ?? '',
    t.description ?? '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [{ wch: 24 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 40 }];

  return ws;
}

// ---- Excelダウンロード ----
export function downloadEmployeeExcel(
  employees: Employee[],
  leaves: LeaveRequest[],
  tasks: Task[],
): void {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, buildEmployeeSheet(employees), '従業員一覧');
  XLSX.utils.book_append_sheet(wb, buildLeaveSheet(leaves), '休暇申請一覧');
  XLSX.utils.book_append_sheet(wb, buildTaskSheet(tasks), 'タスク一覧');

  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  XLSX.writeFile(wb, `従業員管理_${today}.xlsx`);
}
