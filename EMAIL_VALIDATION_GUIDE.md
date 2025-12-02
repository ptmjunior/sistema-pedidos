# Validação do Sistema de Envio de Emails

## 📋 Status Atual

✅ **Código está correto e funcional**
✅ **Templates de email atualizados** (botões removidos)
✅ **Edge Function do Supabase configurada**

## ⚙️ Pré-requisitos de Configuração

### Opção 1: Supabase Edge Function (Recomendada)

Esta é a opção mais fácil e já está configurada no código.

#### 1. Verificar se a Edge Function está deployada

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Linkar ao projeto
supabase link --project-ref iwtssbwfmtdzfcbfoheq

# Listar funções deployadas
supabase functions list
```

Se a função `send-notification-email` NÃO aparecer, você precisa fazer o deploy:

```bash
# Configurar secrets (credenciais do Gmail)
supabase secrets set GMAIL_USER=naoresponda@casadastintas-al.com
supabase secrets set GMAIL_APP_PASSWORD=sua-senha-de-app-16-caracteres

# Deploy da função
supabase functions deploy send-notification-email
```

#### 2. Obter Senha de App do Google

1. Acesse https://myaccount.google.com/apppasswords
2. Crie uma nova senha de app
3. Use essa senha de 16 caracteres no comando acima

#### 3. Verificar Migration

No **Supabase SQL Editor**, verifique se o trigger está ativo:

```sql
SELECT 
    tgname as trigger_name,
    tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_notification_created';
```

### Opção 2: API Route Vercel (Alternativa)

Esta opção requer configuração de variáveis de ambiente no Vercel.

Crie as seguintes variáveis:
- `SMTP_HOST` = smtp.gmail.com
- `SMTP_PORT` = 587
- `SMTP_USER` = naoresponda@casadastintas-al.com
- `SMTP_PASS` = senha-de-app-16-caracteres
- `SMTP_FROM_NAME` = Casa das Tintas

## 🧪 Testes

### Teste 1: Verificar se a Edge Function responde

```bash
# Obtenha sua ANON_KEY em Supabase > Settings > API
curl -i --location --request POST \
  'https://iwtssbwfmtdzfcbfoheq.supabase.co/functions/v1/send-notification-email' \
  --header 'Authorization: Bearer SUA_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "to": "seu-email@gmail.com",
    "subject": "Teste - Sistema Casa das Tintas",
    "message": "<p>Este é um email de teste.</p><p><strong>Funcionou!</strong></p>"
  }'
```

### Teste 2: Criar um pedido no sistema

A forma mais prática de testar é:

1. **Faça login** como um usuário solicitante
2. **Crie um pedido** de compra
3. **Submeta** o pedido
4. **Verifique** se o aprovador recebeu o email

### Teste 3: Aprovar/Rejeitar pedido

1. **Faça login** como aprovador
2. **Aprove ou Rejeite** um pedido
3. **Verifique** se o solicitante recebeu o email

## 📊 Verificar Logs

### Logs da Edge Function

```bash
supabase functions logs send-notification-email --limit 50
```

### Logs do Trigger no Banco

```sql
-- Ver últimas notificações criadas
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

## ⚠️ Troubleshooting

### Email não chegou

1. **Verifique a pasta de SPAM**
2. **Verifique os logs**: `supabase functions logs send-notification-email`
3. **Confirme** que o trigger está ativo (query acima)
4. **Verifique** se a notificação foi criada na tabela `notifications`

### Erro "Invalid login"

- A senha de app do Google está errada
- Confirme que a verificação em 2 etapas está ativa na conta Google

### Emails indo para SPAM

- Configure SPF/DKIM no Google Workspace
- Use um domínio verificado (@casadastintas-al.com)

## ✅ Checklist de Validação

- [ ] Edge Function `send-notification-email` está deployada
- [ ] Secrets `GMAIL_USER` e `GMAIL_APP_PASSWORD` configurados
- [ ] Trigger `on_notification_created` está ativo no banco
- [ ] Teste de envio manual funcionou (curl)
- [ ] Criação de pedido envia email para aprovador
- [ ] Aprovação de pedido envia email para solicitante e comprador
- [ ] Rejeição de pedido envia email para solicitante
- [ ] Compra de pedido envia email para solicitante

## 📝 Notas

- Os emails usam templates HTML responsivos
- Botões foram removidos conforme solicitado
- Sistema envia notificações automaticamente via triggers
- Não precisa configurar nada no código frontend
