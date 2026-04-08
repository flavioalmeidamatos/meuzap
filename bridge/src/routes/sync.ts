import { Router } from 'express';

const router = Router();

router.post('/trigger', (req, res) => {
  // Rota auxiliar caso queiram triggerar sync forçado
  res.json({ status: 'Not implemented in this MVP' });
});

export default router;
