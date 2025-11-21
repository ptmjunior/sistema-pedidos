# Supabase Setup Guide - Casa das Tintas

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha:
   - **Name:** casa-das-tintas-pedidos
   - **Database Password:** (escolha uma senha forte e guarde)
   - **Region:** South America (São Paulo) - mais próximo de Alagoas
4. Clique em "Create new project"
5. Aguarde ~2 minutos para o projeto ser criado

## Passo 2: Executar Migrations SQL

Após o projeto ser criado:

1. No painel do Supabase, vá em **SQL Editor** (ícone de banco de dados na lateral)
2. Clique em "New query"
3. Execute os scripts na ordem:

### Script 1: Schema Inicial
Copie e cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
- Clique em "Run" ou pressione `Ctrl+Enter`
- Aguarde confirmação de sucesso

### Script 2: RLS Policies
Copie e cole o conteúdo de `supabase/migrations/002_rls_policies.sql`
- Clique em "Run"
- Aguarde confirmação de sucesso

### Script 3: Seed Data
Copie e cole o conteúdo de `supabase/migrations/003_seed_data.sql`
- Clique em "Run"
- Aguarde confirmação de sucesso

### Script 4: Email Notifications (executar depois)
Este será executado após configurar a Edge Function

## Passo 3: Configurar Autenticação

1. Vá em **Authentication** > **Providers**
2. Configure **Email** provider:
   - Enable "Email"
   - **Confirm email:** Desabilite por enquanto (para facilitar testes)
   - Salve

## Passo 4: Criar Usuários Iniciais

1. Vá em **Authentication** > **Users**
2. Clique em "Add user" > "Create new user"
3. Crie 3 usuários:

**Usuário 1 - Requisitante:**
- Email: `joao.silva@casadastintas-al.com`
- Password: `senha123` (ou outra de sua escolha)
- Auto Confirm User: ✅ (marque)

**Usuário 2 - Aprovador:**
- Email: `maria.santos@casadastintas-al.com`
- Password: `senha123`
- Auto Confirm User: ✅

**Usuário 3 - Comprador:**
- Email: `pedro.oliveira@casadastintas-al.com`
- Password: `senha123`
- Auto Confirm User: ✅

## Passo 5: Vincular Auth Users com Profiles

Após criar os usuários no Auth, você precisa vincular com a tabela `users`:

1. Vá em **SQL Editor**
2. Execute este script (substitua os UUIDs pelos IDs reais dos usuários criados):

```sql
-- Primeiro, veja os IDs dos usuários criados
SELECT id, email FROM auth.users;

-- Depois, atualize a tabela users com os IDs corretos
-- Substitua os UUIDs abaixo pelos IDs reais

UPDATE users SET id = 'd0712fe9-aa74-4bf2-a1ae-69ca5cfda5fd' WHERE email = 'joao.silva@casadastintas-al.com';
UPDATE users SET id = 'da9452d1-3446-47da-b7cf-63a29c0edb8d' WHERE email = 'maria.santos@casadastintas-al.com';
UPDATE users SET id = '4aa2970b-c00b-410d-843d-a96ab7dab9a2' WHERE email = 'pedro.oliveira@casadastintas-al.com';
```

## Passo 6: Obter Credenciais do Projeto

1. Vá em **Settings** > **API**
2. Anote as seguintes informações:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGc...
service_role key: eyJhbGc... (mantenha secreto!)
```

## Passo 7: Verificar Instalação

1. Vá em **Table Editor**
2. Verifique se as tabelas foram criadas:
   - ✅ users (3 registros)
   - ✅ vendors (5 registros)
   - ✅ purchase_requests (vazia)
   - ✅ request_items (vazia)
   - ✅ notifications (vazia)

## Próximos Passos

Após completar estes passos:
1. ✅ Configurar variáveis de ambiente no projeto
2. ✅ Instalar Supabase client
3. ✅ Atualizar código para usar Supabase
4. ✅ Configurar Edge Function para emails

---

## Troubleshooting

### Erro ao executar SQL
- Verifique se não há erros de sintaxe
- Execute os scripts na ordem correta
- Verifique se as extensões foram habilitadas

### Usuários não aparecem
- Certifique-se de marcar "Auto Confirm User"
- Verifique em Authentication > Users

### Tabelas vazias
- Execute novamente o script de seed data
- Verifique se não há erros no console SQL

---

**Status:** ✅ Pronto para continuar com a integração frontend
