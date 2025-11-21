# Supabase Edge Functions - Deployment Guide

## Pré-requisitos

1. Instalar Supabase CLI:
```bash
npm install -g supabase
```

2. Login no Supabase:
```bash
supabase login
```

## Configurar Secrets

Antes de fazer deploy, configure as credenciais do Gmail:

```bash
# Link ao seu projeto
supabase link --project-ref seu-project-ref

# Configurar email do Google Workspace
supabase secrets set GMAIL_USER=naoresponda@casadastintas-al.com

# Configurar senha de app (16 caracteres gerada no Google)
supabase secrets set GMAIL_APP_PASSWORD=sua-senha-de-16-caracteres
```

## Deploy da Edge Function

```bash
# Deploy da função
supabase functions deploy send-notification-email

# Verificar se foi deployada
supabase functions list
```

## Testar a Edge Function

Após o deploy, teste se está funcionando:

```bash
# Obtenha a URL da função
# Formato: https://seu-project-ref.supabase.co/functions/v1/send-notification-email

# Teste com curl
curl -i --location --request POST \
  'https://seu-project-ref.supabase.co/functions/v1/send-notification-email' \
  --header 'Authorization: Bearer SEU_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "to": "seu-email-teste@gmail.com",
    "subject": "Teste - Sistema Casa das Tintas",
    "message": "<p>Este é um email de teste do sistema de pedidos.</p><p><strong>Funcionou!</strong></p>"
  }'
```

## Configurar Database Settings

Após o deploy, configure as settings do banco:

```sql
-- No SQL Editor do Supabase, execute:

-- Configurar URL do projeto
ALTER DATABASE postgres 
SET app.settings.project_url = 'https://seu-project-ref.supabase.co';

-- Configurar service role key (encontre em Settings > API)
ALTER DATABASE postgres 
SET app.settings.service_role_key = 'seu-service-role-key';
```

## Executar Migration de Email

Agora execute o script `004_email_notifications.sql` no SQL Editor.

## Verificar Logs

Para ver os logs da função:

```bash
supabase functions logs send-notification-email
```

## Troubleshooting

### Erro: "Invalid login"
- Verifique se a senha de app está correta
- Confirme que a verificação em 2 etapas está ativa no Google

### Erro: "Function not found"
- Execute `supabase functions list` para verificar
- Faça deploy novamente

### Emails não chegam
- Verifique os logs: `supabase functions logs send-notification-email`
- Teste manualmente com curl
- Verifique a pasta de spam

---

**Status:** ✅ Pronto para integração com o frontend
