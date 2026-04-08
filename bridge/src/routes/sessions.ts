import { Router } from 'express';
import QRCode from 'qrcode';
import { globalSocket, globalQr } from '../adapters/whatsmeow-adapter';
import { setActiveInstanceId, getActiveInstanceId } from '../lib/instance-state';

const router = Router();

router.get('/status', async (req, res) => {
  const requestedInstanceId =
    typeof req.query.instanceId === 'string' ? req.query.instanceId : null;

  if (requestedInstanceId) {
    setActiveInstanceId(requestedInstanceId);
  }

  if (!globalSocket) {
    return res.json({
      status: 'loading',
      instanceId: getActiveInstanceId(),
    });
  }

  if (globalQr && !globalSocket.authState.creds.me) {
    const qrDataUrl = await QRCode.toDataURL(globalQr, {
      width: 280,
      margin: 1,
    });

    return res.json({
      status: 'pairing',
      qr: qrDataUrl,
      instanceId: getActiveInstanceId(),
    });
  }

  if (globalSocket.authState.creds.me) {
    return res.json({
      status: 'connected',
      user: globalSocket.authState.creds.me,
      instanceId: getActiveInstanceId(),
    });
  }

  return res.json({
    status: 'loading',
    instanceId: getActiveInstanceId(),
  });
});

export default router;
