/**
 * Invoice Generation Utility
 * Provides functions for generating PDF and CSV invoices
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Format currency with proper Indian formatting
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  
  // Handle very large numbers by converting to string and formatting manually
  if (isNaN(num) || !isFinite(num)) {
    return '₹0.00';
  }
  
  // Format with Indian number system
  if (num >= 10000000) { // Crores
    const crores = Math.floor(num / 10000000);
    const remainder = num % 10000000;
    const lakhs = Math.floor(remainder / 100000);
    if (lakhs > 0) {
      return `₹${crores},${lakhs.toString().padStart(2, '0')},${(remainder % 100000).toLocaleString('en-IN')}`;
    } else {
      return `₹${crores},${(remainder % 10000000).toLocaleString('en-IN')}`;
    }
  } else if (num >= 100000) { // Lakhs
    const lakhs = Math.floor(num / 100000);
    const remainder = num % 100000;
    const thousands = Math.floor(remainder / 1000);
    const formattedNum = `${lakhs},${(remainder % 1000).toLocaleString('en-IN')}`;
    return `₹${formattedNum}`;
  } else { // Use standard formatting for smaller numbers
    return `₹${num.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2
    })}`;
  }
};

/**
 * Generate proper order ID in PKS_YYYY_XXXXXXXX format
 * @param {Object} orderData - Order data object
 * @returns {string} Formatted order ID
 */
const generateOrderId = (orderData) => {
  // First try to get existing orderId
  const existingOrderId = safeGet(orderData, 'orderId');
  if (existingOrderId && existingOrderId !== 'N/A') {
    return existingOrderId;
  }
  
  // Generate new order ID
  const currentYear = new Date().getFullYear();
  let uniqueId;
  
  // Try to get ID from various sources
  const idSources = [
    safeGet(orderData, '_id'),
    safeGet(orderData, 'sessionId'),
    safeGet(orderData, 'paymentIntentId'),
    Date.now().toString()
  ];
  
  for (const source of idSources) {
    if (source && source !== 'N/A') {
      // Extract last 8 characters and make uppercase
      uniqueId = source.toString().slice(-8).toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (uniqueId.length >= 6) {
        break;
      }
    }
  }
  
  // Fallback if no valid ID found
  if (!uniqueId || uniqueId.length < 6) {
    uniqueId = Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  
  return `PKS_${currentYear}_${uniqueId}`;
};

/**
 * Safely extract nested property value
 * @param {Object} obj - Object to extract from
 * @param {string} path - Dot notation path
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Extracted value
 */
const safeGet = (obj, path, defaultValue = 'N/A') => {
  try {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }
    return result !== undefined && result !== null ? result : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Generate a professional PDF invoice
 * @param {Object} orderData - Order data object
 * @returns {void}
 */
export const generatePDFInvoice = async (orderData) => {
  if (!orderData) {
    console.error('No order data provided for PDF generation');
    return;
  }

  try {
    console.log('Generating PDF with order data:', orderData);
    
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
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Brand Logo - try to load it
    let logoLoaded = false;
    try {
      const response = await fetch('/logo/brand_logo.png');
      if (response.ok) {
        const blob = await response.blob();
        const reader = new FileReader();
        await new Promise((resolve, reject) => {
          reader.onload = resolve;
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const dataUrl = reader.result;
        doc.addImage(dataUrl, 'PNG', 15, 8, 20, 20);
        logoLoaded = true;
      }
    } catch (error) {
      console.log('Brand logo not available, using text fallback');
    }

    if (!logoLoaded) {
      // Company Logo/Title fallback
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('PKS', 15, 18);
    }

    // Invoice Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', logoLoaded ? 45 : 45, 18);

    // Order ID and Date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const formattedOrderId = generateOrderId(orderData);
    
    doc.text(
      `Order #${formattedOrderId}`,
      pageWidth - 15,
      15,
      { align: 'right' }
    );
    doc.text(
      `Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      pageWidth - 15,
      25,
      { align: 'right' }
    );

    yPosition = 50;

    // Billing Information Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', 15, yPosition);

    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const customerName = safeGet(orderData, 'shippingAddress.name');
    const address = safeGet(orderData, 'shippingAddress.address');
    const city = safeGet(orderData, 'shippingAddress.city');
    const state = safeGet(orderData, 'shippingAddress.state');
    const postalCode = safeGet(orderData, 'shippingAddress.postalCode');
    const phone = safeGet(orderData, 'shippingAddress.phone');
    const email = safeGet(orderData, 'shippingAddress.email');

    doc.text(customerName, 15, yPosition);
    yPosition += 7;
    doc.setFontSize(9);

    // Address with wrapping
    if (address !== 'N/A') {
      const addressLines = doc.splitTextToSize(address, 70);
      doc.text(addressLines, 15, yPosition);
      yPosition += addressLines.length * 5;
    }

    if (city !== 'N/A' || state !== 'N/A' || postalCode !== 'N/A') {
      doc.text(`${city}, ${state} ${postalCode}`, 15, yPosition);
      yPosition += 7;
    }
    
    if (phone !== 'N/A') {
      doc.text(`Phone: ${phone}`, 15, yPosition);
      yPosition += 7;
    }
    
    if (email !== 'N/A') {
      doc.text(`Email: ${email}`, 15, yPosition);
      yPosition += 7;
    }

    yPosition += 10;

    // Items Table Header
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPosition - 5, pageWidth - 30, 10, 'F');

    doc.text('Product', 15, yPosition);
    doc.text('Qty', 110, yPosition);
    doc.text('Price', 135, yPosition);
    doc.text('Total', 165, yPosition);

    yPosition += 12;

    // Items Table Body
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    let itemStartY = yPosition;
    const orderItems = safeGet(orderData, 'orderItems', []);

    if (orderItems.length === 0) {
      doc.setTextColor(150, 150, 150);
      doc.text('No items found in this order', 15, yPosition);
    } else {
      orderItems.forEach((item, index) => {
        if (yPosition > pageHeight - 60) {
          // Add new page if needed
          doc.addPage();
          yPosition = 15;
          itemStartY = yPosition;
          // Repeat header on new page
          doc.setFont(undefined, 'bold');
          doc.setFillColor(240, 240, 240);
          doc.rect(15, yPosition - 5, pageWidth - 30, 10, 'F');
          doc.text('Product', 15, yPosition);
          doc.text('Qty', 110, yPosition);
          doc.text('Price', 135, yPosition);
          doc.text('Total', 165, yPosition);
          yPosition += 12;
          doc.setFont(undefined, 'normal');
          itemStartY = yPosition;
        }

        // Item details
        const itemName = safeGet(item, 'name', 'Unknown Product');
        const itemQuantity = parseInt(safeGet(item, 'quantity', 0)) || 0;
        const itemPrice = parseFloat(safeGet(item, 'price', 0)) || 0;
        const itemTotal = itemPrice * itemQuantity;
        const sellerName = safeGet(item, 'sellerName') || safeGet(item, 'sellerBusinessName', 'N/A');
        
        console.log(`PDF Item: ${itemName}, Price: ${itemPrice}, Qty: ${itemQuantity}, Total: ${itemTotal}`);
        
        // Item name (with wrapping if needed)
        const nameLines = doc.splitTextToSize(itemName, 70);
        doc.text(nameLines, 15, yPosition);
        yPosition += nameLines.length * 4;

        // Seller info if available
        if (sellerName && sellerName !== 'N/A') {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`Sold by: ${sellerName}`, 15, yPosition);
          yPosition += 4;
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(9);
        }

        // Quantity, Price, Total
        doc.text(itemQuantity.toString(), 110, itemStartY);
        doc.text(formatCurrency(itemPrice), 135, itemStartY);
        doc.text(formatCurrency(itemTotal), 165, itemStartY);

        itemStartY = yPosition + 3;
        yPosition += 8;
      });
    }

    yPosition += 5;

    // Totals Section - with page break check
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Calculate totals properly
    const itemsForTotal = safeGet(orderData, 'orderItems', []);
    const subtotal = itemsForTotal.reduce((sum, item) => {
      const itemPrice = parseFloat(safeGet(item, 'price', 0)) || 0;
      const quantity = parseInt(safeGet(item, 'quantity', 0)) || 0;
      return sum + (itemPrice * quantity);
    }, 0);
    
    const taxPrice = parseFloat(safeGet(orderData, 'taxPrice', 0)) || 0;
    const shippingPrice = parseFloat(safeGet(orderData, 'shippingPrice', 0)) || 0;
    const totalAmount = parseFloat(safeGet(orderData, 'totalPrice', 0)) || (subtotal + taxPrice + shippingPrice);
    
    console.log('📊 Invoice Totals Calculation:', {
      subtotal: subtotal,
      taxPrice: taxPrice,
      shippingPrice: shippingPrice,
      totalAmount: totalAmount,
      formattedSubtotal: formatCurrency(subtotal),
      formattedTotal: formatCurrency(totalAmount)
    });
    
    // Subtotal
    doc.text('Subtotal:', 15, yPosition);
    doc.text(formatCurrency(subtotal), pageWidth - 25, yPosition, { align: 'right' });
    yPosition += 7;

    // Tax
    if (taxPrice > 0) {
      doc.text('Tax:', 15, yPosition);
      doc.text(formatCurrency(taxPrice), pageWidth - 25, yPosition, { align: 'right' });
      yPosition += 7;
    }

    // Shipping
    doc.text('Shipping:', 15, yPosition);
    if (shippingPrice > 0) {
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.text(formatCurrency(shippingPrice), pageWidth - 25, yPosition, { align: 'right' });
    } else {
      doc.setTextColor(22, 163, 74);
      doc.setFont(undefined, 'bold');
      doc.text('FREE', pageWidth - 25, yPosition, { align: 'right' });
    }
    yPosition += 7;

    // Discount if any
    const discount = parseFloat(safeGet(orderData, 'discount', 0)) || 0;
    if (discount > 0) {
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.text('Discount:', 15, yPosition);
      doc.text(`-₹${discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 25, yPosition, { align: 'right' });
      yPosition += 7;
    }

    // Total Line
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 10;

    doc.setTextColor(102, 126, 234);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(13);
    doc.text('TOTAL:', 15, yPosition);
    const totalAmountText = formatCurrency(totalAmount);
    doc.text(totalAmountText, pageWidth - 25, yPosition, { align: 'right' });

    yPosition += 12;

    // Payment Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Details:', 15, yPosition);

    yPosition += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(`Payment Method: ${safeGet(orderData, 'paymentMethod', 'Not specified')}`, 15, yPosition);
    yPosition += 5;
    doc.text(`Payment Status: ${safeGet(orderData, 'paymentStatus', 'Pending')}`, 15, yPosition);
    yPosition += 5;
    doc.text(
      `Transaction ID: ${safeGet(orderData, 'paymentIntentId', '').slice(-16) || 'N/A'}`,
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
    const filename = `Invoice_${formattedOrderId}.pdf`;
    doc.save(filename);
    console.log(`PDF generated successfully: ${filename}`);
    return true;
  } catch (err) {
    console.error('Error generating PDF invoice:', err);
    throw new Error('Failed to generate PDF invoice. Please try again.');
  }
};

/**
 * Generate a professional CSV invoice with proper formatting
 * @param {Object} orderData - Order data object
 * @returns {void}
 */
export const generateCSVInvoice = (orderData) => {
  if (!orderData) {
    console.error('No order data provided for CSV generation');
    return;
  }

  try {
    console.log('Generating CSV with order data:', orderData);
    
    // Use the orderId field or generate fallback
    const formattedOrderId = safeGet(orderData, 'orderId') || (() => {
      const currentYear = new Date().getFullYear();
      const orderId = safeGet(orderData, '_id', '').slice(-8).toUpperCase();
      return `PKS_${currentYear}_${orderId}`;
    })();
    
    // Extract data safely
    const items = safeGet(orderData, 'orderItems', []);
    const customerName = safeGet(orderData, 'shippingAddress.name');
    const email = safeGet(orderData, 'shippingAddress.email');
    const phone = safeGet(orderData, 'shippingAddress.phone');
    const address = safeGet(orderData, 'shippingAddress.address');
    const city = safeGet(orderData, 'shippingAddress.city');
    const state = safeGet(orderData, 'shippingAddress.state');
    const postalCode = safeGet(orderData, 'shippingAddress.postalCode');
    const paymentMethod = safeGet(orderData, 'paymentMethod');
    const isPaid = safeGet(orderData, 'isPaid', false);
    const orderDate = safeGet(orderData, 'createdAt') || safeGet(orderData, 'paidAt');
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = parseFloat(safeGet(item, 'price', 0)) || 0;
      const quantity = parseInt(safeGet(item, 'quantity', 0)) || 0;
      return sum + (itemPrice * quantity);
    }, 0);
    
    const taxPrice = parseFloat(safeGet(orderData, 'taxPrice', 0)) || 0;
    const shippingPrice = parseFloat(safeGet(orderData, 'shippingPrice', 0)) || 0;
    const totalAmount = parseFloat(safeGet(orderData, 'totalPrice', 0)) || (subtotal + taxPrice + shippingPrice);
    
    console.log('📊 CSV Totals Calculation:', {
      subtotal: subtotal,
      taxPrice: taxPrice,
      shippingPrice: shippingPrice,
      totalAmount: totalAmount,
      formattedSubtotal: formatCurrency(subtotal),
      formattedTotal: formatCurrency(totalAmount)
    });

    // Build CSV content with professional formatting
    let csvContent = '';
    
    // Add BOM for proper UTF-8 support in Excel
    csvContent = '\uFEFF';
    
    // Header Section
    csvContent += '================================================================================\n';
    csvContent += '                           INVOICE REPORT\n';
    csvContent += '================================================================================\n';
    csvContent += `Generated on: ${new Date().toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} at ${new Date().toLocaleTimeString('en-IN')}\n`;
    csvContent += `Order ID: ${formattedOrderId}\n`;
    csvContent += '================================================================================\n\n';
    
    // Order Information Section
    csvContent += 'ORDER INFORMATION\n';
    csvContent += '────────────────────────────────────────────────────────────────────────────────────\n';
    csvContent += `"Order ID","${formattedOrderId}"\n`;
    csvContent += `"Payment Method","${paymentMethod}"\n`;
    csvContent += `"Payment Status","${isPaid ? 'PAID' : 'PENDING'}"\n`;
    csvContent += `"Order Date","${orderDate ? new Date(orderDate).toLocaleDateString('en-IN') : 'N/A'}"\n`;
    csvContent += '────────────────────────────────────────────────────────────────────────────────────\n\n';
    
    // Customer Details Section
    csvContent += 'CUSTOMER DETAILS\n';
    csvContent += '────────────────────────────────────────────────────────────────────────────\n';
    csvContent += `"Customer Name","${customerName}"\n`;
    csvContent += `"Email Address","${email}"\n`;
    csvContent += `"Phone Number","${phone}"\n`;
    csvContent += `"Billing Address","${address}"\n`;
    csvContent += `"City","${city}"\n`;
    csvContent += `"State","${state}"\n`;
    csvContent += `"PIN Code","${postalCode}"\n`;
    csvContent += '────────────────────────────────────────────────────────────────────────────────────\n\n';
    
    // Order Items Section
    csvContent += 'ORDER ITEMS\n';
    csvContent += '────────────────────────────────────────────────────────────────────────────\n';
    csvContent += '"S.No.","Product Name","Quantity","Unit Price (₹)","Total Price (₹)"\n';
    csvContent += '────────────────────────────────────────────────────────────────────────────\n';
    
    if (items.length === 0) {
      csvContent += '"No items found in this order"\n';
    } else {
      items.forEach((item, index) => {
        const itemName = safeGet(item, 'name', 'Unknown Product');
        const quantity = parseInt(safeGet(item, 'quantity', 0)) || 0;
        const price = parseFloat(safeGet(item, 'price', 0)) || 0;
        const total = price * quantity;
        const sellerName = safeGet(item, 'sellerName') || safeGet(item, 'sellerBusinessName', 'N/A');
        
        // Escape quotes and commas in product name
        const escapedName = itemName.replace(/"/g, '""').replace(/\n/g, ' ');
        const escapedSeller = sellerName.replace(/"/g, '""').replace(/\n/g, ' ');
        
        csvContent += `"${index + 1}","${escapedName}","${quantity}","${price.toFixed(2)}","${total.toFixed(2)}"\n`;
        
        // Add seller info on next line if available
        if (sellerName !== 'N/A') {
          csvContent += `" ,"Sold by: ${escapedSeller}"," "," "," "\n`;
        }
      });
    }
    
    csvContent += '────────────────────────────────────────────────────────────────────────────\n\n';
    
    // Order Summary Section
    csvContent += 'ORDER SUMMARY\n';
    csvContent += '────────────────────────────────────────────────────────────────────────────\n';
    csvContent += `"Subtotal","₹${subtotal.toFixed(2)}"\n`;
    csvContent += `"Tax","₹${taxPrice.toFixed(2)}"\n`;
    csvContent += `"Shipping","${shippingPrice > 0 ? `₹${shippingPrice.toFixed(2)}` : 'FREE'}"\n`;
    csvContent += `"Total Amount","₹${totalAmount.toFixed(2)}"\n`;
    csvContent += '────────────────────────────────────────────────────────────────────────────\n\n';
    
    // Footer Section
    csvContent += 'PAYMENT INFORMATION\n';
    csvContent += '────────────────────────────────────────────────────────────────────────────\n';
    csvContent += `"Transaction ID","${safeGet(orderData, 'paymentIntentId', '').slice(-16) || 'N/A'}"\n`;
    csvContent += `"Payment Status","${isPaid ? 'COMPLETED' : 'PENDING'}"\n`;
    csvContent += '────────────────────────────────────────────────────────────────────────────\n\n';
    
    csvContent += '================================================================================\n';
    csvContent += '                    END OF INVOICE\n';
    csvContent += '================================================================================\n';

    // Create a blob and trigger download
    const element = document.createElement('a');
    const file = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    element.href = URL.createObjectURL(file);
    element.download = `Invoice_${formattedOrderId}.csv`;
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    // Clean up the URL
    setTimeout(() => URL.revokeObjectURL(element.href), 100);
    
    console.log(`CSV generated successfully: Invoice_${formattedOrderId}.csv`);
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
