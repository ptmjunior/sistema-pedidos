export const emailTemplates = {
    // Template: Pedido Submetido (para Aprovadores)
    submission: (request, requesterName) => ({
        subject: `📋 Novo Pedido Aguardando Aprovação - ${request.id}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .info-box { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
                    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: 600; color: #6b7280; }
                    .value { font-weight: 500; }
                    .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
                    .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 Novo Pedido de Compra</h1>
                    </div>
                    <div class="content">
                        <p>Olá,</p>
                        <p>Um novo pedido foi submetido e está aguardando sua aprovação:</p>
                        
                        <div class="info-box">
                            <div class="info-row">
                                <span class="label">Solicitante:</span>
                                <span class="value">${requesterName}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Descrição:</span>
                                <span class="value">${request.desc}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Departamento:</span>
                                <span class="value">${request.department || 'N/A'}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Itens:</span>
                                <span class="value">${request.items?.length || 0} item(ns)</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Valor Total:</span>
                                <span class="amount">R$ ${request.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        
                        <p style="text-align: center;">
                            <a href="${process.env.VERCEL_URL || 'https://sistema-pedidos-six.vercel.app'}" class="button">
                                Ver Detalhes e Aprovar
                            </a>
                        </p>
                        
                        <div class="footer">
                            <p>Sistema de Pedidos de Compra - Casa das Tintas</p>
                            <p>Esta é uma mensagem automática, por favor não responda.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    // Template: Pedido Aprovado (para Solicitante + Comprador)
    approval: (request, requesterName, approverName) => ({
        subject: `✅ Pedido Aprovado - ${request.id}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .success-box { background-color: #dcfce7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #16a34a; }
                    .info-box { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
                    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: 600; color: #6b7280; }
                    .value { font-weight: 500; }
                    .amount { font-size: 24px; font-weight: bold; color: #16a34a; }
                    .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Pedido Aprovado!</h1>
                    </div>
                    <div class="content">
                        <div class="success-box">
                            <h3 style="margin-top: 0; color: #15803d;">🎉 Boa notícia!</h3>
                            <p style="margin-bottom: 0;">Seu pedido foi aprovado por <strong>${approverName}</strong> e será processado pela equipe de compras.</p>
                        </div>
                        
                        <div class="info-box">
                            <div class="info-row">
                                <span class="label">Solicitante:</span>
                                <span class="value">${requesterName}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Descrição:</span>
                                <span class="value">${request.desc}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Valor Total:</span>
                                <span class="amount">R$ ${request.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        
                        <p style="text-align: center;">
                            <a href="${process.env.VERCEL_URL || 'https://sistema-pedidos-six.vercel.app'}" class="button">
                                Acessar Sistema
                            </a>
                        </p>
                        
                        <div class="footer">
                            <p>Sistema de Pedidos de Compra - Casa das Tintas</p>
                            <p>Esta é uma mensagem automática, por favor não responda.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    // Template: Pedido Rejeitado (para Solicitante)
    rejection: (request, requesterName, approverName) => ({
        subject: `❌ Pedido Rejeitado - ${request.id}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .warning-box { background-color: #fee2e2; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
                    .info-box { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
                    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: 600; color: #6b7280; }
                    .value { font-weight: 500; }
                    .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>❌ Pedido Não Aprovado</h1>
                    </div>
                    <div class="content">
                        <div class="warning-box">
                            <h3 style="margin-top: 0; color: #b91c1c;">Pedido Rejeitado</h3>
                            <p style="margin-bottom: 0;">Seu pedido foi rejeitado por <strong>${approverName}</strong>. Entre em contato com o aprovador para mais detalhes.</p>
                        </div>
                        
                        <div class="info-box">
                            <div class="info-row">
                                <span class="label">Solicitante:</span>
                                <span class="value">${requesterName}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Descrição:</span>
                                <span class="value">${request.desc}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Valor:</span>
                                <span class="value">R$ ${request.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        
                        <p>Você pode revisar o pedido e submetê-lo novamente se necessário.</p>
                        
                        <p style="text-align: center;">
                            <a href="${process.env.VERCEL_URL || 'https://sistema-pedidos-six.vercel.app'}" class="button">
                                Acessar Sistema
                            </a>
                        </p>
                        
                        <div class="footer">
                            <p>Sistema de Pedidos de Compra - Casa das Tintas</p>
                            <p>Esta é uma mensagem automática, por favor não responda.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    })
};

export default emailTemplates;
