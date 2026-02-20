/**
 * Invoice Generation Utility
 * Provides functions for generating PDF and CSV invoices
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate a professional PDF invoice
 * @param {Object} orderData - Order data object
 * @returns {void}
 */
export const generatePDFInvoice = (orderData) => {
  if (!orderData) return;

  try {
    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Header Background
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageWidth, 30, 'F');

    // Company Logo/Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', 15, 18);

    // Order ID and Date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(
      `Order #${orderData._id?.slice(-8).toUpperCase()}`,
      pageWidth - 15,
      15,
      { align: 'right' }
    );
    doc.text(
      `Date: ${new Date().toLocaleDateString('en-IN')}`,
      pageWidth - 15,
      22,
      { align: 'right' }
    );

    yPosition = 45;

    // Billing Information Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', 15, yPosition);

    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const customerName = orderData.shippingAddress?.name || 'N/A';
    const address = orderData.shippingAddress?.address || 'N/A';
    const city = orderData.shippingAddress?.city || '';
    const state = orderData.shippingAddress?.state || '';
    const postalCode = orderData.shippingAddress?.postalCode || '';
    const phone = orderData.shippingAddress?.phone || 'N/A';
    const email = orderData.shippingAddress?.email || 'N/A';

    doc.text(customerName, 15, yPosition);
    yPosition += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    // Address with wrapping
    const addressLines = doc.splitTextToSize(address, 60);
    doc.text(addressLines, 15, yPosition);
    yPosition += addressLines.length * 5;

    doc.text(`${city}, ${state} ${postalCode}`, 15, yPosition);
    yPosition += 7;
    doc.text(`Phone: ${phone}`, 15, yPosition);
    yPosition += 7;
    doc.text(`Email: ${email}`, 15, yPosition);

    yPosition += 15;

    // Items Table Header
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');

    doc.text('Product', 15, yPosition);
    doc.text('Qty', 100, yPosition);
    doc.text('Price', 125, yPosition);
    doc.text('Total', 155, yPosition);

    yPosition += 10;

    // Items Table Body
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    let itemStartY = yPosition;

    orderData.orderItems?.forEach((item) => {
      if (yPosition > pageHeight - 60) {
        // Add new page if needed
        doc.addPage();
        yPosition = 15;
        itemStartY = yPosition;
      }

      // Item name (with wrapping if needed)
      const itemName = doc.splitTextToSize(item.name, 70);
      doc.text(itemName, 15, yPosition);
      yPosition += itemName.length * 4;

      // Seller info if available
      if (item.sellerName || item.sellerLocation?.city) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const sellerInfo = `by ${item.sellerName || item.sellerBusinessName || 'Seller'} (${
          item.sellerLocation?.city || 'N/A'
        })`;
        doc.text(sellerInfo, 15, yPosition);
        yPosition += 4;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
      }

      // Quantity, Price, Total
      doc.text(item.quantity.toString(), 100, itemStartY);
      doc.text(`₹${item.price?.toLocaleString('en-IN')}`, 125, itemStartY);
      doc.text(`₹${(item.price * item.quantity)?.toLocaleString('en-IN')}`, 155, itemStartY);

      // Delivery estimate if available
      if (item.deliveryDaysEstimate) {
        doc.setFontSize(7);
        doc.setTextColor(76, 175, 80);
        doc.text(
          `📦 Delivery: ${item.deliveryDaysEstimate.min}-${item.deliveryDaysEstimate.max} days`,
          15,
          yPosition
        );
        yPosition += 3;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
      }

      itemStartY = yPosition + 3;
      yPosition += 6;
    });

    yPosition += 5;

    // Totals Section
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    // Subtotal
    doc.text('Subtotal:', 130, yPosition);
    doc.text(`₹${orderData.totalPrice?.toLocaleString('en-IN')}`, 155, yPosition);
    yPosition += 7;

    // Shipping
    doc.text('Shipping:', 130, yPosition);
    doc.setTextColor(22, 163, 74);
    doc.setFont(undefined, 'bold');
    doc.text('FREE', 155, yPosition);
    yPosition += 7;

    // Discount if any
    if (orderData.discount) {
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.text('Discount:', 130, yPosition);
      doc.text(`-₹${orderData.discount?.toLocaleString('en-IN')}`, 155, yPosition);
      yPosition += 7;
    }

    // Total Line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    doc.setTextColor(102, 126, 234);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', 130, yPosition);
    doc.text(`₹${orderData.totalPrice?.toLocaleString('en-IN')}`, 155, yPosition);

    yPosition += 12;

    // Payment Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Details:', 15, yPosition);

    yPosition += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(`Payment Method: ${orderData.paymentMethod || 'Not specified'}`, 15, yPosition);
    yPosition += 5;
    doc.text(`Payment Status: ${orderData.paymentStatus || 'Pending'}`, 15, yPosition);
    yPosition += 5;
    doc.text(
      `Transaction ID: ${orderData.paymentIntentId?.slice(-16) || 'N/A'}`,
      15,
      yPosition
    );

    yPosition += 10;

    // Thank You Note
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('Thank you for your purchase!', 15, yPosition);

    yPosition += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const thankYouText = doc.splitTextToSize(
      'Your order will be processed within 24 hours. You will receive an email confirmation with tracking details.',
      pageWidth - 30
    );
    doc.text(thankYouText, 15, yPosition);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is an automatically generated invoice. Please retain for your records.', 15, pageHeight - 10);
    doc.text(
      `Generated on ${new Date().toLocaleString('en-IN')}`,
      pageWidth - 15,
      pageHeight - 10,
      { align: 'right' }
    );

    // Save PDF
    doc.save(`Invoice_${orderData._id?.slice(-8).toUpperCase()}.pdf`);
    return true;
  } catch (err) {
    console.error('Error generating PDF invoice:', err);
    throw new Error('Failed to generate PDF invoice. Please try again.');
  }
};

/**
 * Generate a CSV invoice
 * @param {Object} orderData - Order data object
 * @returns {void}
 */
export const generateCSVInvoice = (orderData) => {
  if (!orderData) return;

  try {
    // Generate CSV invoice content
    let csvContent = 'Invoice Report\n';
    csvContent += `Generated on,${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString(
      'en-IN'
    )}\n\n`;

    csvContent += 'ORDER INFORMATION\n';
    csvContent += `Order ID,${orderData._id}\n`;
    csvContent += `Payment Method,${orderData.paymentMethod || 'N/A'}\n`;
    csvContent += `Payment Status,${orderData.paymentStatus || 'N/A'}\n`;
    csvContent += `Order Date,${orderData.paidAt || 'N/A'}\n\n`;

    csvContent += 'CUSTOMER DETAILS\n';
    csvContent += `Name,${orderData.shippingAddress?.name || 'N/A'}\n`;
    csvContent += `Email,${orderData.shippingAddress?.email || 'N/A'}\n`;
    csvContent += `Phone,${orderData.shippingAddress?.phone || 'N/A'}\n`;
    csvContent += `Address,${orderData.shippingAddress?.address || 'N/A'}\n`;
    csvContent += `City,${orderData.shippingAddress?.city || 'N/A'}\n`;
    csvContent += `State,${orderData.shippingAddress?.state || 'N/A'}\n`;
    csvContent += `PIN Code,${orderData.shippingAddress?.postalCode || 'N/A'}\n\n`;

    csvContent += 'ORDER ITEMS\n';
    csvContent += 'Product Name,Quantity,Unit Price,Total Price\n';

    orderData.orderItems?.forEach((item) => {
      const productName = `"${item.name.replace(/"/g, '""')}"`;
      const quantity = item.quantity;
      const price = item.price;
      const total = item.price * item.quantity;
      csvContent += `${productName},${quantity},${price},${total}\n`;
    });

    csvContent += '\nORDER SUMMARY\n';
    csvContent += `Subtotal,₹${orderData.totalPrice?.toLocaleString('en-IN')}\n`;
    csvContent += 'Shipping,FREE\n';
    csvContent += `Total Amount,₹${orderData.totalPrice?.toLocaleString('en-IN')}\n`;

    // Create a blob and trigger download
    const element = document.createElement('a');
    const file = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    element.href = URL.createObjectURL(file);
    element.download = `Invoice_${orderData._id?.slice(-8).toUpperCase()}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    return true;
  } catch (err) {
    console.error('Error generating CSV invoice:', err);
    throw new Error('Failed to generate CSV invoice. Please try again.');
  }
};

/**
 * Convert HTML element to canvas and download as image
 * @param {HTMLElement} element - HTML element to convert
 * @param {string} filename - Filename for download
 * @returns {Promise}
 */
export const downloadElementAsImage = async (element, filename) => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();

    return true;
  } catch (err) {
    console.error('Error converting element to image:', err);
    throw new Error('Failed to download invoice as image.');
  }
};

const invoiceUtils = {
  generatePDFInvoice,
  generateCSVInvoice,
  downloadElementAsImage
};

export default invoiceUtils;
