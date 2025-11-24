# Configuração do Supabase para Reset de Senha

Para que a funcionalidade de reset de senha funcione corretamente, você precisa configurar algumas opções no Supabase Dashboard.

## 1. Configurar URLs de Redirecionamento

### Passo a Passo:

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Authentication** > **URL Configuration**
4. Em **Redirect URLs**, adicione as seguintes URLs:

**Para desenvolvimento local:**
```
http://localhost:5173/reset-password
```

**Para produção (substitua pelo seu domínio):**
```
https://seu-site.vercel.app/reset-password
```

5. Clique em **Save**

---

## 2. Personalizar Email de Recuperação (Opcional)

Se quiser personalizar o email que os usuários recebem:

1. No Supabase Dashboard, vá em **Authentication** > **Email Templates**
2. Selecione **Reset Password**
3. Personalize o template em português (pt-BR)

**Exemplo de template:**

```html
<h2>Redefinir Senha - Pedido de Compra</h2>
<p>Olá,</p>
<p>Você solicitou a redefinição de senha para sua conta.</p>
<p>Clique no botão abaixo para criar uma nova senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
<p>Se você não solicitou esta alteração, ignore este email.</p>
<p>Este link expira em 1 hora.</p>
```

---

## 3. Verificar Configuração de Email

Certifique-se de que o envio de emails está configurado:

1. Vá em **Project Settings** > **Auth**
2. Verifique se **Enable email confirmations** está habilitado (pode ser desabilitado se não quiser confirmar novos cadastros, mas é necessário para reset)
3. Opcionalmente, configure SMTP customizado se quiser usar seu próprio servidor de email

---

## Testar a Funcionalidade

### Fluxo de Teste:

1. **Acesse** `http://localhost:5173` (ou sua URL de produção)
2. **Clique** em "Esqueci minha senha"
3. **Digite** um email de usuário existente
4. **Clique** em "Enviar Link de Recuperação"
5. **Verifique** sua caixa de entrada (pode ir para spam)
6. **Clique** no link do email
7. **Digite** uma nova senha
8. **Faça login** com a nova senha

---

## Troubleshooting

### Email não chega
- Verifique a pasta de spam
- Confirme que o email existe no Supabase Auth
- Verifique os logs de email no Supabase Dashboard

### Link expirado
- Links expiram em 1 hora (padrão)
- Solicite um novo link

### Erro ao redefinir
- Verifique se o link foi aberto no mesmo navegador
- Tente limpar cache ou usar modo anônimo
- Verifique se a URL de redirect está correta

---

## Notas Importantes

- ✅ O sistema **não** revela se o email existe ou não (por segurança)
- ✅ Mesmo que o email não exista, a mensagem de sucesso aparece
- ✅ Links de reset expiram após 1 hora
- ✅ Apenas um link de reset é válido por vez (novos invalidam os anteriores)
