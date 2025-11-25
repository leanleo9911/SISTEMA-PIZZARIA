const nodemailer = require('nodemailer');

// Configuração do transportador de email
const createTransporter = () => {
  // Para Gmail (recomendado - gratuito)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Senha de app do Gmail
      }
    });
  }
  
  // Para outros serviços SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Função para gerar HTML do comprovante
const gerarComprovanteHTML = (pedido, cliente, itens) => {
  const itensHTML = itens.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.nome}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantidade}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${parseFloat(item.preco_unitario).toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${parseFloat(item.subtotal).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Comprovante de Pedido</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🍕 Pizzaria System</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Comprovante de Pedido</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #667eea; margin-top: 0;">✅ Pedido Confirmado!</h2>
          <p style="font-size: 16px; margin: 10px 0;">
            <strong>Número do Pedido:</strong> #${pedido.id}<br>
            <strong>Data:</strong> ${new Date(pedido.created_at).toLocaleString('pt-BR')}<br>
            <strong>Status:</strong> <span style="background: #ffc107; color: #000; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">PENDENTE</span>
          </p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #667eea; margin-top: 0;">👤 Dados do Cliente</h3>
          <p style="margin: 5px 0;">
            <strong>Nome:</strong> ${cliente.nome}<br>
            <strong>Telefone:</strong> ${cliente.telefone}<br>
            ${cliente.email ? `<strong>Email:</strong> ${cliente.email}<br>` : ''}
            <strong>Endereço:</strong> ${cliente.endereco}
          </p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #667eea; margin-top: 0;">🛒 Itens do Pedido</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #667eea; color: white;">
                <th style="padding: 12px; text-align: left;">Produto</th>
                <th style="padding: 12px; text-align: center;">Qtd</th>
                <th style="padding: 12px; text-align: right;">Preço Unit.</th>
                <th style="padding: 12px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itensHTML}
            </tbody>
          </table>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #667eea; margin-top: 0;">💰 Resumo do Pagamento</h3>
          <p style="margin: 5px 0;">
            <strong>Forma de Pagamento:</strong> ${pedido.forma_pagamento}<br>
            ${pedido.observacoes ? `<strong>Observações:</strong> ${pedido.observacoes}<br>` : ''}
          </p>
          <div style="background: #28a745; color: white; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">VALOR TOTAL</p>
            <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: bold;">R$ ${parseFloat(pedido.valor_total).toFixed(2)}</p>
          </div>
        </div>

        <div style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0; color: #1976D2; font-size: 14px;">
            <strong>📌 Importante:</strong><br>
            Seu pedido está sendo preparado com todo carinho! 
            Tempo estimado de entrega: 30-60 minutos.
            Qualquer dúvida, entre em contato conosco.
          </p>
        </div>

        <div style="text-align: center; padding: 20px 0; color: #666; font-size: 12px;">
          <p style="margin: 5px 0;">Este é um email automático, não responda.</p>
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} Pizzaria System - Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Função principal para enviar comprovante
const enviarComprovante = async (pedido, cliente, itens) => {
  try {
    // Verificar se email está configurado
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️  Email não configurado. Pulando envio de comprovante.');
      return { success: false, message: 'Email não configurado' };
    }

    // Verificar se cliente tem email
    if (!cliente.email) {
      console.log('ℹ️  Cliente sem email cadastrado. Pulando envio de comprovante.');
      return { success: false, message: 'Cliente sem email' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Pizzaria System" <${process.env.EMAIL_USER}>`,
      to: cliente.email,
      subject: `🍕 Comprovante de Pedido #${pedido.id} - Pizzaria System`,
      html: gerarComprovanteHTML(pedido, cliente, itens)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Comprovante enviado para: ${cliente.email}`);
    
    return { success: true, message: 'Comprovante enviado com sucesso' };
  } catch (error) {
    console.error('❌ Erro ao enviar comprovante:', error.message);
    return { success: false, message: error.message };
  }
};

module.exports = {
  enviarComprovante
};
