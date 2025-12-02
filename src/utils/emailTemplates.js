// Helper function to generate PO ID
const generatePOId = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `PO-${year}-${month}${day}${hours}${minutes}${seconds}`;
};

export const emailTemplates = {
    // Template: Pedido Submetido (para Aprovadores)
    submission: (request, requesterName) => {
        const poId = generatePOId(request.createdAt);
        const itemsHtml = request.items?.map(item => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; color: #333;">${item.desc}</td>
                <td style="padding: 12px; text-align: center; color: #666;">${item.qty}</td>
                <td style="padding: 12px; text-align: right; color: #333;">R$ ${parseFloat(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
        `).join('') || '';

        return {
            subject: `📋 Novo Pedido Aguardando Aprovação - ${poId}`,
            html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #2563eb; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">🔔 Novo Pedido de Compra</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">${poId}</p>
                    </div>
                    <div style="background-color: #ffffff; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <p style="margin-top: 0;">Olá,</p>
                        <p>Um novo pedido foi submetido e está aguardando sua aprovação:</p>
                        
                        <div style="background-color: #f8fafc; padding: 20px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #2563eb;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                <span style="font-weight: 600; color: #64748b;">Solicitante:</span>
                                <span style="font-weight: 500;">${requesterName}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                <span style="font-weight: 600; color: #64748b;">Descrição:</span>
                                <span style="font-weight: 500;">${request.desc}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                <span style="font-weight: 600; color: #64748b;">Departamento:</span>
                                <span style="font-weight: 500;">${request.department || 'N/A'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: none;">
                                <span style="font-weight: 600; color: #64748b;">Valor Total:</span>
                                <span style="font-size: 18px; font-weight: bold; color: #2563eb;">R$ ${request.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div style="margin: 24px 0;">
                            <h3 style="color: #4b5563; font-size: 16px; margin-bottom: 12px;">Itens do Pedido:</h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <thead>
                                    <tr style="background-color: #f1f5f9; text-align: left;">
                                        <th style="padding: 12px; border-radius: 6px 0 0 6px; color: #64748b;">Item</th>
                                        <th style="padding: 12px; text-align: center; color: #64748b;">Qtd</th>
                                        <th style="padding: 12px; text-align: right; border-radius: 0 6px 6px 0; color: #64748b;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>
                        </div>
                        
                        <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                            <p style="margin: 4px 0;">Sistema de Pedidos de Compra - Casa das Tintas</p>
                            <p style="margin: 4px 0;">Esta é uma mensagem automática, por favor não responda.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `
        };
    },

    // Template: Pedido Aprovado (para Solicitante + Comprador)
    approval: (request, requesterName, approverName) => {
        const poId = generatePOId(request.createdAt);
        const itemsHtml = request.items?.map(item => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; color: #333;">${item.desc}</td>
                <td style="padding: 12px; text-align: center; color: #666;">${item.qty}</td>
                <td style="padding: 12px; text-align: right; color: #333;">R$ ${parseFloat(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
        `).join('') || '';

        return {
            subject: `✅ Pedido Aprovado - ${poId}`,
            html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #16a34a; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">✅ Pedido Aprovado!</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">${poId}</p>
                    </div>
                    <div style="background-color: #ffffff; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="background-color: #dcfce7; padding: 20px; margin-bottom: 24px; border-radius: 8px; border-left: 4px solid #16a34a;">
                            <h3 style="margin-top: 0; color: #15803d; margin-bottom: 8px;">🎉 Boa notícia!</h3>
                            <p style="margin: 0; color: #14532d;">Seu pedido foi aprovado por <strong>${approverName}</strong> e será processado pela equipe de compras.</p>
                        </div>
                        
                        <div style="background-color: #f8fafc; padding: 20px; margin: 24px 0; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                <span style="font-weight: 600; color: #64748b;">Solicitante:</span>
                                <span style="font-weight: 500;">${requesterName}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                <span style="font-weight: 600; color: #64748b;">Descrição:</span>
                                <span style="font-weight: 500;">${request.desc}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: none;">
                                <span style="font-weight: 600; color: #64748b;">Valor Total:</span>
                                <span style="font-size: 18px; font-weight: bold; color: #16a34a;">R$ ${request.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        ${itemsHtml ? `
                        <div style="margin: 24px 0;">
                            <h3 style="color: #4b5563; font-size: 16px; margin-bottom: 12px;">Itens do Pedido:</h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <thead>
                                    <tr style="background-color: #f1f5f9; text-align: left;">
                                        <th style="padding: 12px; border-radius: 6px 0 0 6px; color: #64748b;">Item</th>
                                        <th style="padding: 12px; text-align: center; color: #64748b;">Qtd</th>
                                        <th style="padding: 12px; text-align: right; border-radius: 0 6px 6px 0; color: #64748b;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>
                        </div>
                        ` : ''}
                        
                        <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                            <p style="margin: 4px 0;">Sistema de Pedidos de Compra - Casa das Tintas</p>
                            <p style="margin: 4px 0;">Esta é uma mensagem automática, por favor não responda.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `
        };
    },

    // Template: Pedido Rejeitado (para Solicitante)
    rejection: (request, requesterName, approverName) => {
        const poId = generatePOId(request.createdAt);
        return {
            subject: `❌ Pedido Rejeitado - ${poId}`,
            html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #dc2626; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">❌ Pedido Não Aprovado</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">${poId}</p>
                    </div>
                    <div style="background-color: #ffffff; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="background-color: #fee2e2; padding: 20px; margin-bottom: 24px; border-radius: 8px; border-left: 4px solid #dc2626;">
                            <h3 style="margin-top: 0; color: #b91c1c; margin-bottom: 8px;">Pedido Rejeitado</h3>
                            <p style="margin: 0; color: #7f1d1d;">Seu pedido foi rejeitado por <strong>${approverName}</strong>.</p>
                        </div>
                        
                        <div style="background-color: #f8fafc; padding: 20px; margin: 24px 0; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                <span style="font-weight: 600; color: #64748b;">Solicitante:</span>
                                <span style="font-weight: 500;">${requesterName}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                <span style="font-weight: 600; color: #64748b;">Descrição:</span>
                                <span style="font-weight: 500;">${request.desc}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: none;">
                                <span style="font-weight: 600; color: #64748b;">Valor:</span>
                                <span style="font-size: 18px; font-weight: bold; color: #dc2626;">R$ ${request.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        
                        <p style="color: #4b5563;">Você pode revisar o pedido e submetê-lo novamente se necessário.</p>
                        
                        <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                            <p style="margin: 4px 0;">Sistema de Pedidos de Compra - Casa das Tintas</p>
                            <p style="margin: 4px 0;">Esta é uma mensagem automática, por favor não responda.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `
        };
    },

    // Template: Pedido Comprado (para Solicitante)
    purchased: (request, requesterName) => {
        const poId = generatePOId(request.createdAt);
        const itemsHtml = request.items?.map(item => {
            const deliveryDate = item.deliveryDate
                ? new Date(item.deliveryDate).toLocaleDateString('pt-BR')
                : 'A definir';

            return `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; color: #333;">${item.desc}</td>
                <td style="padding: 12px; text-align: center; color: #666;">${item.qty}</td>
                <td style="padding: 12px; text-align: center; color: #666;">${deliveryDate}</td>
            </tr>
            `;
        }).join('') || '';

        return {
            subject: `🛍️ Pedido Comprado - ${poId}`,
            html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #1e40af; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">🛍️ Pedido Comprado!</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">${poId}</p>
                    </div>
                    <div style="background-color: #ffffff; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="background-color: #dbeafe; padding: 20px; margin-bottom: 24px; border-radius: 8px; border-left: 4px solid #1e40af;">
                            <h3 style="margin-top: 0; color: #1e3a8a; margin-bottom: 8px;">Compra Realizada</h3>
                            <p style="margin: 0; color: #1e3a8a;">Seu pedido foi comprado e os itens estão a caminho.</p>
                        </div>
                        
                        <div style="background-color: #f8fafc; padding: 20px; margin: 24px 0; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                <span style="font-weight: 600; color: #64748b;">Solicitante:</span>
                                <span style="font-weight: 500;">${requesterName}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                <span style="font-weight: 600; color: #64748b;">Descrição:</span>
                                <span style="font-weight: 500;">${request.desc}</span>
                            </div>
                        </div>

                        <div style="margin: 24px 0;">
                            <h3 style="color: #4b5563; font-size: 16px; margin-bottom: 12px;">Previsão de Entrega dos Itens:</h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <thead>
                                    <tr style="background-color: #f1f5f9; text-align: left;">
                                        <th style="padding: 12px; border-radius: 6px 0 0 6px; color: #64748b;">Item</th>
                                        <th style="padding: 12px; text-align: center; color: #64748b;">Qtd</th>
                                        <th style="padding: 12px; text-align: center; border-radius: 0 6px 6px 0; color: #64748b;">Previsão</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>
                        </div>
                        
                        <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                            <p style="margin: 4px 0;">Sistema de Pedidos de Compra - Casa das Tintas</p>
                            <p style="margin: 4px 0;">Esta é uma mensagem automática, por favor não responda.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `
        };
    }
};

export default emailTemplates;
