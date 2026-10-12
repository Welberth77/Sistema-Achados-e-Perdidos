import { Router } from 'express';

const router = Router();

// GET /api/health -> checagem de saúde do servidor
router.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'backend', time: new Date().toISOString() });
});

export default router;
