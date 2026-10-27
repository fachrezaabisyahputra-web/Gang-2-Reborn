import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCashSummary,
  maskSensitiveId,
  checkPermission,
  calculateAttendanceRate,
  exportTransactionsToCSV,
  Transaction,
} from './finance';

test('calculateCashSummary computes accurate balance and monthly totals', () => {
  const initialBalance = 5_000_000;
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      code: 'TRX-001',
      date: '2026-10-01',
      type: 'pemasukan',
      category: 'Iuran',
      amount: 1_200_000,
      description: 'Iuran bulanan',
      sourceOrRecipient: 'Warga',
      proofInfo: 'Kwitansi 01',
      createdBy: 'Bendahara',
    },
    {
      id: '2',
      code: 'TRX-002',
      date: '2026-10-05',
      type: 'pengeluaran',
      category: 'Konsumsi',
      amount: 350_000,
      description: 'Snack rapat',
      sourceOrRecipient: 'Warung Bu Siti',
      proofInfo: 'Nota 12',
      createdBy: 'Bendahara',
    },
    {
      id: '3',
      code: 'TRX-003',
      date: '2026-09-15',
      type: 'pemasukan',
      category: 'Donasi',
      amount: 500_000,
      description: 'Donasi alumni',
      sourceOrRecipient: 'H. Ahmad',
      proofInfo: 'Transfer',
      createdBy: 'Bendahara',
    },
  ];

  const summary = calculateCashSummary(initialBalance, mockTransactions, '2026-10');

  assert.equal(summary.initialBalance, 5_000_000);
  assert.equal(summary.totalIncome, 1_700_000);
  assert.equal(summary.totalExpense, 350_000);
  assert.equal(summary.currentBalance, 6_350_000);
  assert.equal(summary.thisMonthIncome, 1_200_000);
  assert.equal(summary.thisMonthExpense, 350_000);
});

test('maskSensitiveId correctly masks middle digits of KK or NIK', () => {
  assert.equal(maskSensitiveId('3201012345678901'), '320101******8901');
  assert.equal(maskSensitiveId('3201 0123 4567 8901'), '320101******8901');
  assert.equal(maskSensitiveId('1234'), '******');
  assert.equal(maskSensitiveId(''), '-');
});

test('checkPermission strictly enforces role-based access control', () => {
  // manage_finance: only bendahara and admin
  assert.equal(checkPermission('admin', 'manage_finance'), true);
  assert.equal(checkPermission('bendahara', 'manage_finance'), true);
  assert.equal(checkPermission('pengurus', 'manage_finance'), false);
  assert.equal(checkPermission('anggota', 'manage_finance'), false);
  assert.equal(checkPermission('pengunjung', 'manage_finance'), false);

  // manage_members: pengurus and admin
  assert.equal(checkPermission('pengurus', 'manage_members'), true);
  assert.equal(checkPermission('admin', 'manage_members'), true);
  assert.equal(checkPermission('bendahara', 'manage_members'), false);

  // manage_admin: admin only
  assert.equal(checkPermission('admin', 'manage_admin'), true);
  assert.equal(checkPermission('pengurus', 'manage_admin'), false);
});

test('calculateAttendanceRate computes percentage within bounds', () => {
  assert.equal(calculateAttendanceRate(40, 30), 75);
  assert.equal(calculateAttendanceRate(0, 0), 0);
  assert.equal(calculateAttendanceRate(10, 10), 100);
});

test('exportTransactionsToCSV produces valid CSV header and rows', () => {
  const transactions: Transaction[] = [
    {
      id: '1',
      code: 'TRX-001',
      date: '2026-10-01',
      type: 'pemasukan',
      category: 'Iuran',
      amount: 100000,
      description: 'Iuran Kas, Kas Warga',
      sourceOrRecipient: 'Pemuda RT 02',
      proofInfo: 'Kwitansi #10',
      createdBy: 'Bendahara',
    },
  ];
  const csv = exportTransactionsToCSV(transactions);
  assert.ok(csv.includes('Kode Transaksi,Tanggal,Jenis'));
  assert.ok(csv.includes('"TRX-001"'));
  assert.ok(csv.includes('100000'));
});
