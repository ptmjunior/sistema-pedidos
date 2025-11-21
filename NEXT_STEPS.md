# Configuração do Ambiente - Próximos Passos

## ✅ Concluído

1. ✅ Instalado `@supabase/supabase-js`
2. ✅ Criado `src/lib/supabase.js` - Cliente Supabase
3. ✅ Criado `.env` e `.env.example`
4. ✅ Atualizado `.gitignore`
5. ✅ Migrado `Login.jsx` para Supabase Auth

## 🔧 Você precisa fazer AGORA

### Passo 1: Configurar variáveis de ambiente

Abra o arquivo `.env` e preencha com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...sua-chave-aqui
```

**Onde encontrar:**
1. Acesse seu projeto no Supabase
2. Vá em **Settings** > **API**
3. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Passo 2: Reiniciar o servidor de desenvolvimento

Após configurar o `.env`, você DEVE reiniciar o servidor:

```bash
# Pare o servidor atual (Ctrl+C)
# Depois inicie novamente:
npm run dev
```

> **IMPORTANTE:** O Vite só carrega variáveis de ambiente na inicialização!

## 📋 Próximos passos (após configurar .env)

1. Migrar `PurchaseContext.jsx` para usar Supabase
2. Atualizar operações de CRUD
3. Implementar real-time subscriptions
4. Testar fluxo completo

---

**Me avise quando terminar de configurar o .env para continuarmos!**
