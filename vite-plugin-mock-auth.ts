import type { Plugin } from 'vite';

/** Gera um token fake para testes locais */
function fakeAccessToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      unique_name: 'safemais',
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    })
  );
  const signature = btoa('mock-signature-' + Date.now());
  return `${header}.${payload}.${signature}`;
}

/** Resposta mock do POST /auth/login. role admin = acesso ao painel de acompanhamento. */
function mockLoginResponse(isAdmin: boolean) {
  return {
    sucesso: true,
    mensagem: null,
    tempoProcessamento: Math.round(Math.random() * 50) + 50,
    requisicaoId: crypto.randomUUID(),
    resultado: {
      expires_in: 3600,
      access_token: fakeAccessToken(),
      token_type: 'Bearer',
      role: isAdmin ? 'admin' : 'client',
    },
  };
}

export function mockAuthPlugin(): Plugin {
  return {
    name: 'mock-auth',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/auth/login' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const parsed = body ? JSON.parse(body) : {};
              const username = parsed.username ?? '';
              const password = parsed.password ?? '';

              // Aceita qualquer credencial em dev; pode restringir se quiser
              if (!username || !password) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    sucesso: false,
                    mensagem: 'Usuário e senha são obrigatórios',
                    tempoProcessamento: 0,
                    requisicaoId: crypto.randomUUID(),
                    resultado: null,
                  })
                );
                return;
              }

              const isAdmin = String(username).toLowerCase() === 'admin';
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(mockLoginResponse(isAdmin)));
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  sucesso: false,
                  mensagem: 'Corpo da requisição inválido',
                  tempoProcessamento: 0,
                  requisicaoId: crypto.randomUUID(),
                  resultado: null,
                })
              );
            }
          });
        } else {
          next();
        }
      });
    },
  };
}
