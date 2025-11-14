import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

interface InvoiceData {
  orderId: string;
  invoiceNumber: string;
  billingName: string;
  billingAddress: {
    address: string;
    city: string;
    zip: string;
    country: string;
  };
  taxId?: string;
  amount: number;
  currency: string;
  issuedAt: Date;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

/**
 * Generate a unique invoice number
 */
export function generateInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `INV-${timestamp}-${random}`;
}

/**
 * Generate PDF invoice document
 */
export async function generateInvoicePdf(
  invoiceData: InvoiceData
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Ensure public/invoices directory exists
      const invoicesDir = path.join(process.cwd(), 'public', 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      // Generate filename
      const filename = `${invoiceData.invoiceNumber}.pdf`;
      const filepath = path.join(invoicesDir, filename);
      const publicUrl = `/invoices/${filename}`;

      // Create PDF document
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      // Pipe to file
      const writeStream = fs.createWriteStream(filepath);
      doc.pipe(writeStream);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('3D PRINTHUB', 50, 50)
        .fontSize(10)
        .font('Helvetica')
        .text('Custom 3D Printing Platform', 50, 75)
        .text('Email: support@3dprinthub.com', 50, 90)
        .text('Website: www.3dprinthub.com', 50, 105);

      // Invoice Title
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('INVOICE', 400, 50, { align: 'right' });

      // Invoice Details
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Invoice Number: ${invoiceData.invoiceNumber}`, 400, 80, {
          align: 'right',
        })
        .text(
          `Invoice Date: ${new Date(invoiceData.issuedAt).toLocaleDateString()}`,
          400,
          95,
          { align: 'right' }
        )
        .text(`Order ID: ${invoiceData.orderId.substring(0, 8)}...`, 400, 110, {
          align: 'right',
        });

      // Bill To Section
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Bill To:', 50, 150)
        .fontSize(10)
        .font('Helvetica')
        .text(invoiceData.billingName, 50, 170)
        .text(invoiceData.billingAddress.address, 50, 185)
        .text(
          `${invoiceData.billingAddress.city}, ${invoiceData.billingAddress.zip}`,
          50,
          200
        )
        .text(invoiceData.billingAddress.country, 50, 215);

      if (invoiceData.taxId) {
        doc.text(`Tax ID: ${invoiceData.taxId}`, 50, 235);
      }

      // Items Table Header
      const tableTop = 280;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Item', 50, tableTop)
        .text('Quantity', 280, tableTop, { width: 80, align: 'center' })
        .text('Unit Price', 360, tableTop, { width: 80, align: 'right' })
        .text('Subtotal', 440, tableTop, { width: 100, align: 'right' });

      // Draw line under header
      doc
        .strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Items
      let yPosition = tableTop + 25;
      invoiceData.items.forEach((item) => {
        doc
          .fontSize(9)
          .font('Helvetica')
          .text(item.name, 50, yPosition, { width: 220 })
          .text(item.quantity.toString(), 280, yPosition, {
            width: 80,
            align: 'center',
          })
          .text(`${invoiceData.currency} ${item.unitPrice.toFixed(2)}`, 360, yPosition, {
            width: 80,
            align: 'right',
          })
          .text(`${invoiceData.currency} ${item.subtotal.toFixed(2)}`, 440, yPosition, {
            width: 100,
            align: 'right',
          });

        yPosition += 20;
      });

      // Draw line before total
      yPosition += 10;
      doc
        .strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, yPosition)
        .lineTo(550, yPosition)
        .stroke();

      // Total
      yPosition += 15;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Total Amount:', 360, yPosition)
        .text(`${invoiceData.currency} ${invoiceData.amount.toFixed(2)}`, 440, yPosition, {
          width: 100,
          align: 'right',
        });

      // Footer
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          'Thank you for your business!',
          50,
          yPosition + 60,
          { align: 'center', width: 500 }
        )
        .text(
          'For questions about this invoice, please contact support@3dprinthub.com',
          50,
          yPosition + 75,
          { align: 'center', width: 500 }
        );

      // Finalize PDF
      doc.end();

      writeStream.on('finish', () => {
        resolve(publicUrl);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Create invoice for a paid order
 */
export async function createInvoiceForOrder(orderId: string): Promise<any> {
  try {
    // Fetch order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            customization: {
              include: {
                model: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { orderId },
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();

    // Prepare invoice data
    const shippingInfo = order.shippingInfo as any;
    const invoiceData: InvoiceData = {
      orderId: order.id,
      invoiceNumber,
      billingName: shippingInfo.name || order.user.name || 'N/A',
      billingAddress: {
        address: shippingInfo.address || '',
        city: shippingInfo.city || '',
        zip: shippingInfo.zip || shippingInfo.zipCode || '',
        country: shippingInfo.country || '',
      },
      amount: Number(order.totalAmount),
      currency: 'USD',
      issuedAt: new Date(),
      items: order.items.map((item) => ({
        name: item.customization.model.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
    };

    // Generate PDF
    const pdfUrl = await generateInvoicePdf(invoiceData);

    // Save invoice to database
    const invoice = await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber,
        billingName: invoiceData.billingName,
        billingAddress: invoiceData.billingAddress,
        amount: order.totalAmount,
        currency: invoiceData.currency,
        issuedAt: invoiceData.issuedAt,
        pdfUrl,
      },
    });

    console.log(`✅ Invoice ${invoiceNumber} created for order ${orderId}`);

    return invoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}
