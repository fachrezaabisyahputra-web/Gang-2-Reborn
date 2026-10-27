/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'pengunjung' | 'anggota' | 'pengurus' | 'bendahara' | 'admin';

export interface Transaction {
  id: string;
  code: string;
  date: string;
  type: 'pemasukan' | 'pengeluaran';
  category: string;
  amount: number;
  description: string;
  sourceOrRecipient: string;
  proofInfo: string;
  createdBy: string;
  updatedAt?: string;
  notes?: string;
}

export interface CashSummary {
  initialBalance: number;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
}

/**
 * Calculates cash summary from initial balance and list of transactions.
 */
export function calculateCashSummary(
  initialBalance: number,
  transactions: Transaction[],
  currentYearMonth?: string // format: YYYY-MM
): CashSummary {
  const ym = currentYearMonth || new Date().toISOString().slice(0, 7);

  let totalIncome = 0;
  let totalExpense = 0;
  let thisMonthIncome = 0;
  let thisMonthExpense = 0;

  for (const t of transactions) {
    const isThisMonth = t.date.startsWith(ym);
    if (t.type === 'pemasukan') {
      totalIncome += t.amount;
      if (isThisMonth) {
        thisMonthIncome += t.amount;
      }
    } else if (t.type === 'pengeluaran') {
      totalExpense += t.amount;
      if (isThisMonth) {
        thisMonthExpense += t.amount;
      }
    }
  }

  const currentBalance = initialBalance + totalIncome - totalExpense;

  return {
    initialBalance,
    totalIncome,
    totalExpense,
    currentBalance,
    thisMonthIncome,
    thisMonthExpense,
  };
}

/**
 * Mask sensitive national identity or family card number.
 * Example: "3201012345678901" -> "320101******8901"
 */
export function maskSensitiveId(idNumber: string): string {
  if (!idNumber) return '-';
  const clean = idNumber.replace(/\s+/g, '');
  if (clean.length <= 6) return '******';
  const start = clean.slice(0, 6);
  const end = clean.slice(-4);
  return `${start}******${end}`;
}

/**
 * Check authorization permissions based on user role.
 */
export function checkPermission(
  role: UserRole,
  action: 'manage_finance' | 'manage_members' | 'manage_events' | 'manage_admin' | 'view_sensitive_family'
): boolean {
  switch (action) {
    case 'manage_finance':
      return role === 'bendahara' || role === 'admin';
    case 'manage_members':
      return role === 'pengurus' || role === 'admin';
    case 'manage_events':
      return role === 'pengurus' || role === 'admin';
    case 'manage_admin':
      return role === 'admin';
    case 'view_sensitive_family':
      return role === 'pengurus' || role === 'bendahara' || role === 'admin';
    default:
      return false;
  }
}

/**
 * Format currency to Indonesian Rupiah (Rp)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate attendance rate percentage
 */
export function calculateAttendanceRate(totalExpected: number, totalPresent: number): number {
  if (totalExpected <= 0) return 0;
  const rate = Math.round((totalPresent / totalExpected) * 100);
  return Math.min(100, Math.max(0, rate));
}

/**
 * Format transactions into standard CSV string
 */
export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = ['Kode Transaksi', 'Tanggal', 'Jenis', 'Kategori', 'Nominal (Rp)', 'Keterangan', 'Pihak Terkait', 'Bukti'];
  const rows = transactions.map(t => [
    `"${t.code}"`,
    `"${t.date}"`,
    `"${t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}"`,
    `"${t.category}"`,
    t.amount,
    `"${t.description.replace(/"/g, '""')}"`,
    `"${t.sourceOrRecipient.replace(/"/g, '""')}"`,
    `"${(t.proofInfo || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
