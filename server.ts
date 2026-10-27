/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  initJsonDatabase,
  readJsonDatabase,
  writeJsonDatabase,
  resetJsonDatabase,
  clearJsonDatabase,
  getJsonDatabaseStats,
  createJsonItem,
  updateJsonItem,
  deleteJsonItem,
  getJsonCollection,
} from './src/server/jsonDb.ts';
import { AppStateData } from './src/types/index.ts';

// Initialize JSON database
initJsonDatabase();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // API Routes: State sync
  app.get('/api/state', (_req: Request, res: Response) => {
    try {
      const data = readJsonDatabase();
      res.json({ success: true, data });
    } catch (err: any) {
      console.error('Failed to get app state from JSON database:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/state', (req: Request, res: Response) => {
    try {
      const incomingData = req.body;
      if (!incomingData) {
        return res.status(400).json({ success: false, error: 'Data tidak boleh kosong' });
      }
      writeJsonDatabase(incomingData);
      res.json({ success: true, message: 'Data berhasil disimpan ke basis data JSON (ruangmuda.json)', data: incomingData });
    } catch (err: any) {
      console.error('Failed to save data to JSON database:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/db/stats', (_req: Request, res: Response) => {
    try {
      const stats = getJsonDatabaseStats();
      res.json({ success: true, stats });
    } catch (err: any) {
      console.error('Failed to query JSON database stats:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/reset-demo', (_req: Request, res: Response) => {
    try {
      const data = resetJsonDatabase();
      res.json({ success: true, message: 'Data simulasi Karang Taruna berhasil dipulihkan di basis data JSON', data });
    } catch (err: any) {
      console.error('Failed to reset demo data in JSON database:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/clear-data', (req: Request, res: Response) => {
    try {
      const emptyState = clearJsonDatabase(req.body.user, req.body.role);
      res.json({ success: true, message: 'Data berhasil dikosongkan pada basis data JSON', data: emptyState });
    } catch (err: any) {
      console.error('Failed to clear data in JSON database:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Granular Collection CRUD API: Read, Create, Update, Delete via JSON
  app.get('/api/crud/:collection', (req: Request, res: Response) => {
    try {
      const { collection } = req.params;
      const items = getJsonCollection(collection as keyof AppStateData);
      res.json({ success: true, collection, data: items });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/crud/:collection', (req: Request, res: Response) => {
    try {
      const { collection } = req.params;
      const created = createJsonItem(collection, req.body);
      res.json({ success: true, message: `Data berhasil ditambahkan ke ${collection}`, data: created });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/crud/:collection/:id', (req: Request, res: Response) => {
    try {
      const { collection, id } = req.params;
      const updated = updateJsonItem(collection, id, req.body);
      res.json({ success: true, message: `Data ${id} berhasil diperbarui di ${collection}`, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/crud/:collection/:id', (req: Request, res: Response) => {
    try {
      const { collection, id } = req.params;
      const deleted = deleteJsonItem(collection, id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: `Item ${id} tidak ditemukan` });
      }
      res.json({ success: true, message: `Data ${id} berhasil dihapus dari ${collection}` });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Raw JSON Inspection / Download
  app.get('/api/json/raw', (_req: Request, res: Response) => {
    try {
      const data = readJsonDatabase();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="ruangmuda-backup.json"');
      res.send(JSON.stringify(data, null, 2));
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      appName: 'Ruang Muda Desa',
      storage: 'Persistent JSON Store at data/ruangmuda.json (Read/Write/CRUD)',
    });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ruang Muda Desa server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
