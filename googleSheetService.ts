import { LeaveRequest, LeaveType, LEAVE_TYPES } from '../types.ts';

// Helper to get dates relative to today for dynamic mock data
function getTodayPlusDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

// --- MOCK DATABASE ---
let mockLeaveRequests: LeaveRequest[] = [
  { id: '1', date: getTodayPlusDays(2), employeeName: '佐藤', type: LEAVE_TYPES.PAID_LEAVE },
  { id: '2', date: getTodayPlusDays(2), employeeName: '鈴木', type: LEAVE_TYPES.AM_OFF },
  { id: '3', date: getTodayPlusDays(5), employeeName: '高橋', type: LEAVE_TYPES.DAY_OFF },
  { id: '4', date: getTodayPlusDays(10), employeeName: '田中', type: LEAVE_TYPES.PM_PAID_LEAVE },
  { id: '5', date: getTodayPlusDays(10), employeeName: '伊藤', type: LEAVE_TYPES.COMMENT, comment: 'リモートワーク' },
  { id: '6', date: getTodayPlusDays(-1), employeeName: '渡辺', type: LEAVE_TYPES.PAID_LEAVE },
];

/**
 * Simulates fetching all leave requests from a Google Sheet.
 * @returns A Promise that resolves to an array of LeaveRequest objects.
 */
export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  console.log('Fetching leave requests from mock service...');
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Fetched:', mockLeaveRequests);
  return [...mockLeaveRequests];
};

/**
 * Simulates adding a new leave entry to a Google Sheet.
 */
export const addLeaveEntry = async (
  date: string,
  employeeName: string,
  type: LeaveType,
  comment?: string
): Promise<LeaveRequest> => {
  console.log(`Adding leave entry for ${employeeName} on ${date}...`);
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!employeeName.trim()) {
    throw new Error('従業員の名前は空にできません。');
  }

  const newRequest: LeaveRequest = {
    id: new Date().getTime().toString(),
    date,
    employeeName,
    type,
    ...(comment && { comment }),
  };

  mockLeaveRequests.push(newRequest);
  // Sort by date after adding
  mockLeaveRequests.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  console.log('Added new request:', newRequest);
  return newRequest;
};

/**
 * Simulates deleting a leave entry from a Google Sheet.
 */
export const deleteLeaveEntry = async (id: string): Promise<{ id: string }> => {
    console.log(`Deleting leave entry with id ${id}...`);
    await new Promise(resolve => setTimeout(resolve, 300));

    const initialLength = mockLeaveRequests.length;
    mockLeaveRequests = mockLeaveRequests.filter(req => req.id !== id);

    if (mockLeaveRequests.length === initialLength) {
        throw new Error('削除対象の予定が見つかりませんでした。');
    }

    console.log(`Deleted entry. Remaining:`, mockLeaveRequests);
    return { id };
}