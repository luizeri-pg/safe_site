import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { solicitacoesRouter } from './routes/solicitacoes.js';
import { catsRouter } from './routes/cats.js';
import { chamadosRouter } from './routes/chamados.js';
import { cargosRouter } from './routes/cargos.js';
import { setoresGheRouter } from './routes/setores-ghe.js';
import { unidadesRouter } from './routes/unidades.js';
import { pppRouter } from './routes/ppp.js';
import { visitasRouter } from './routes/visitas.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

// CORS: aceita front em produção (Railway) e em dev (localhost)
const allowedOrigins = [
  'https://safesite-production.up.railway.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : []),
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, origin || allowedOrigins[0]);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

app.use('/auth', authRouter);
app.use('/api/solicitacoes', solicitacoesRouter);
app.use('/api/cats', catsRouter);
app.use('/api/chamados', chamadosRouter);
app.use('/api/cargos', cargosRouter);
app.use('/api/setores-ghe', setoresGheRouter);
app.use('/api/unidades', unidadesRouter);
app.use('/api/ppp', pppRouter);
app.use('/api/visitas', visitasRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Safe-Site API rodando em http://localhost:${PORT}`);
});
