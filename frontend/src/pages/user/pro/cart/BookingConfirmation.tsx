import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../../../components/user/MainHeader";
import MainFooter from "../../../../components/user/MainFooter";
import Loader from "../../../../components/loader";
import { motion, AnimatePresence } from "framer-motion";
// Direct import with require to avoid TypeScript issues
// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

interface ConfirmationData {
  booking_id: string;
  transaction: any;
  order: any;
}

// Add helper function for formatting duration strings
const formatDurationString = (duration: string | null): string => {
  if (!duration) return "1 day (default)";
  
  const [type, value] = duration.split("-");
  const numValue = parseInt(value);
  
  switch (type) {
    case "Daily":
      return `${numValue} day${numValue > 1 ? 's' : ''}`;
    case "Weekly":
      return `${numValue} week${numValue > 1 ? 's' : ''} (${numValue * 7} days)`;
    case "Monthly":
      return `${numValue} month${numValue > 1 ? 's' : ''} (${numValue * 30} days)`;
    default:
      return duration;
  }
};

const BookingConfirmation: React.FC = () => {
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch confirmation data from localStorage
    const storedConfirmation = localStorage.getItem("booking_confirmation");
    let parsedData: ConfirmationData | null = null;
    
    if (storedConfirmation) {
      try {
        parsedData = JSON.parse(storedConfirmation) as ConfirmationData;
        setConfirmationData(parsedData);
        
        // Get user ID to use in email sent tracking
        const userId = parsedData.order.user_id || localStorage.getItem("token") || "unknown";
        
        // Create a specific key for tracking sent emails that includes user ID and booking ID
        const emailSentKey = `receipt_email_sent_${parsedData.booking_id}_${userId}`;
        const alreadySent = localStorage.getItem(emailSentKey);
        
        // Check if email has been tagged as already sent
        if (alreadySent === "true") {
          console.log(`Receipt already sent for booking ${parsedData.booking_id}`);
          setEmailSent(true);
          return;
        }
        
        // Priority order for finding email: 
        // 1. Order data email (from user profile during checkout)
        // 2. LocalStorage userEmail
        let targetEmail = parsedData.order.user_email;
        
        if (!targetEmail || !targetEmail.includes('@')) {
          targetEmail = localStorage.getItem("userEmail");
        }
        
        if (targetEmail && targetEmail.includes('@')) {
          console.log(`Found valid email for auto-sending: ${targetEmail}`);
          setUserEmail(targetEmail);
          
          // Auto-send email if configured and not already sent
          if (parsedData.order.send_email_once && !alreadySent) {
            console.log(`Auto-sending receipt to ${targetEmail}`);
            // Set a small delay to ensure component is fully mounted
            setTimeout(() => {
              sendReceiptWithEmail(parsedData, targetEmail);
            }, 1000);
          }
        } else {
          console.log("No valid email found for auto-sending receipt");
        }
      } catch (err) {
        console.error("Failed to parse confirmation data", err);
      }
    }
    
    // Keep showing loader for 5 seconds regardless of how quickly the data loads
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    
    // Clean up the timer if component unmounts
    return () => clearTimeout(timer);
  }, []);

  const handleContinueShopping = () => {
    // Clear the confirmation data from localStorage
    localStorage.removeItem("booking_confirmation");
    
    // Navigate to cart page instead of home page
    navigate("/cart");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const downloadReceipt = () => {
    if (!confirmationData) return;
    
    setDownloadingPdf(true);
    
    try {
      console.log("Starting PDF generation...");
      
      // Create a new PDF document with simpler constructor
      const doc = new jsPDF();
      
      // Add company logo/header
      doc.setFontSize(20);
      doc.setTextColor(0, 128, 128);
      doc.text("Furniture Renting System", 105, 20, { align: "center" });
      
      // Add receipt title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("BOOKING RECEIPT", 105, 30, { align: "center" });
      
      // Add booking details with simplified approach
      doc.setFontSize(12);
      doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 20, 45);
      doc.text(`Booking ID: ${confirmationData.booking_id}`, 20, 52);
      doc.text(`Transaction ID: ${confirmationData.transaction.id}`, 20, 59);
      doc.text(`Payment Date: ${formatDate(new Date().toISOString())}`, 20, 66);
      
      // Add order type
      doc.text(
        `Order Type: ${confirmationData.order.is_buying ? "Purchase" : "Rental"}`,
        20, 
        73
      );
      
      // Improve duration display in receipt - add a dedicated section for rental details
      if (!confirmationData.order.is_buying && confirmationData.order.duration) {
        const formattedDuration = formatDurationString(confirmationData.order.duration);
        doc.text(`Rental Duration: ${formattedDuration}`, 20, 80);
      }
      
      // Add shipping details
      doc.setFontSize(14);
      doc.text("Shipping Address", 20, 90);
      doc.setFontSize(12);
      const address = confirmationData.order.delivery_address;

      // Add name and phone number to the receipt
      const userName = confirmationData.order.user_name || "Not provided";
      const userPhone = confirmationData.order.user_phone || "Not provided";
      doc.text(`Name: ${userName}`, 20, 97);
      doc.text(`Phone: ${userPhone}`, 20, 104);

      // Combine address into a single line
      const fullAddress = `${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.zipcode}`;
      doc.text(fullAddress, 20, 111);

      // Adjust starting Y position for items table
      doc.setFontSize(14);
      doc.text("Items", 20, 125);

      // Create the item table data - improve duration display in the table
      const tableColumn = ["Item", "Category", "Price", "Quantity", "Duration", "Total"];
      const tableRows: any[] = [];
      
      confirmationData.order.items.forEach((item: any) => {
        const formattedDuration = item.is_for_rent ? 
          formatDurationString(item.duration) : "N/A";
          
        const itemData = [
          item.title,
          item.category || "Not specified",
          `$${item.price.toFixed(2)}`,
          item.quantity,
          formattedDuration,
          `$${(item.price * item.quantity).toFixed(2)}`
        ];
        tableRows.push(itemData);
      });
      
      // Add a total row to the table
      const totalRow = ["Total Amount", "", "", "", "", `$${confirmationData.order.total_price.toFixed(2)}`];
      tableRows.push(totalRow);
      
      console.log("Adding table to PDF...");
      
      // Use autoTable with adjusted position
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 130,
        theme: 'striped',
        headStyles: { fillColor: [0, 128, 128] },
        margin: { top: 130 },
        // Style the total row differently
        didParseCell: function(data) {
          if (data.row.index === tableRows.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 240, 240];
          }
        }
      });
      
      // Get the final Y position after the table
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      // Footer remains at the same position relative to the table end
      doc.setFontSize(10);
      doc.text("Thank you for your business!", 105, finalY + 10, { align: "center" });
      doc.text("For support, please contact support@furniturerenting.com", 105, finalY + 15, { align: "center" });
      
      console.log("PDF generation completed, saving file...");
      
      // Save the PDF directly without timeout
      const filename = `Booking_Receipt_${confirmationData.booking_id}_${Date.now()}.pdf`;
      doc.save(filename);
      console.log("PDF saved successfully as", filename);
      
      setDownloadingPdf(false);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      // Show more detailed error message
      let errorMessage = "Failed to generate receipt. ";
      
      if (error instanceof Error) {
        errorMessage += error.message;
        console.error("Error stack:", error.stack);
      }
      
      alert(errorMessage + " Please check console for details.");
      setDownloadingPdf(false);
    }
  };

  // New function to send receipt with a specific email
  const sendReceiptWithEmail = async (data: ConfirmationData | null = null, email: string) => {
    // Use provided data or fall back to state
    const confirmData = data || confirmationData;
    if (!confirmData || !email) return;
    
    // Get user ID for tracking sent emails
    const userId = confirmData.order.user_id || localStorage.getItem("token") || "unknown";
    
    // Create a specific key for tracking sent emails
    const emailSentKey = `receipt_email_sent_${confirmData.booking_id}_${userId}`;
    
    // Check one more time if already sent
    if (localStorage.getItem(emailSentKey) === "true") {
      console.log(`Receipt already sent for booking ${confirmData.booking_id}, skipping`);
      setEmailSent(true);
      return;
    }
    
    try {
      setSendingEmail(true);
      setEmailError(null);
      
      console.log(`Generating PDF receipt for ${email}...`);
      
      // Create a new PDF document with simpler constructor
      const doc = new jsPDF();
      
      // Add company logo/header
      doc.setFontSize(20);
      doc.setTextColor(0, 128, 128);
      doc.text("Furniture Renting System", 105, 20, { align: "center" });
      
      // Add receipt title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("BOOKING RECEIPT", 105, 30, { align: "center" });
      
      // Add booking details with simplified approach
      doc.setFontSize(12);
      doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 20, 45);
      doc.text(`Booking ID: ${confirmData.booking_id}`, 20, 52);
      doc.text(`Transaction ID: ${confirmData.transaction.id}`, 20, 59);
      doc.text(`Payment Date: ${formatDate(new Date().toISOString())}`, 20, 66);
      
      // Add order type
      doc.text(
        `Order Type: ${confirmData.order.is_buying ? "Purchase" : "Rental"}`,
        20, 
        73
      );
      
      // Improve duration display in receipt - add a dedicated section for rental details
      if (!confirmData.order.is_buying && confirmData.order.duration) {
        const formattedDuration = formatDurationString(confirmData.order.duration);
        doc.text(`Rental Duration: ${formattedDuration}`, 20, 80);
      }
      
      // Add shipping details
      doc.setFontSize(14);
      doc.text("Shipping Address", 20, 90);
      doc.setFontSize(12);
      const address = confirmData.order.delivery_address;

      // Add name and phone number to the receipt
      const userName = confirmData.order.user_name || "Not provided";
      const userPhone = confirmData.order.user_phone || "Not provided";
      doc.text(`Name: ${userName}`, 20, 97);
      doc.text(`Phone: ${userPhone}`, 20, 104);
      // Add email to the receipt too
      doc.text(`Email: ${email}`, 20, 111);

      // Combine address into a single line
      const fullAddress = `${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.zipcode}`;
      doc.text(fullAddress, 20, 118);

      // Adjust starting Y position for items table
      doc.setFontSize(14);
      doc.text("Items", 20, 130);

      // Create the item table data - improve duration display in the table
      const tableColumn = ["Item", "Category", "Price", "Quantity", "Duration", "Total"];
      const tableRows: any[] = [];
      
      confirmData.order.items.forEach((item: any) => {
        const formattedDuration = item.is_for_rent ? 
          formatDurationString(item.duration) : "N/A";
          
        const itemData = [
          item.title,
          item.category || "Not specified",
          `$${item.price.toFixed(2)}`,
          item.quantity,
          formattedDuration,
          `$${(item.price * item.quantity).toFixed(2)}`
        ];
        tableRows.push(itemData);
      });
      
      // Add a total row to the table
      const totalRow = ["Total Amount", "", "", "", "", `$${confirmData.order.total_price.toFixed(2)}`];
      tableRows.push(totalRow);
      
      console.log("Adding table to PDF...");
      
      // Use autoTable with adjusted position
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 135,
        theme: 'striped',
        headStyles: { fillColor: [0, 128, 128] },
        margin: { top: 135 },
        // Style the total row differently
        didParseCell: function(data) {
          if (data.row.index === tableRows.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 240, 240];
          }
        }
      });
      
      // Get the final Y position after the table
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      // Footer remains at the same position relative to the table end
      doc.setFontSize(10);
      doc.text("Thank you for your business!", 105, finalY + 10, { align: "center" });
      doc.text("For support, please contact support@furniturerenting.com", 105, finalY + 15, { align: "center" });
      
      // Use base64 format instead of datauristring for better compatibility
      const dataUri = doc.output('datauristring');
      const pdfBase64 = dataUri.split(',')[1];
      console.log("PDF generated in base64 format, first 50 chars:", pdfBase64.substring(0, 50));
      
      try {
        // Send to API with better error handling
        console.log(`Sending receipt to email: ${email}`);
        const response = await fetch('http://localhost:10007/api/v1/mail/send-receipt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            pdf_data: pdfBase64,
            booking_id: confirmData.booking_id
          }),
        });
        
        if (!response.ok) {
          let errorDetail = "Failed to send email";
          try {
            const errorJson = await response.json();
            errorDetail = errorJson.detail || errorJson.message || errorDetail;
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
          }
          throw new Error(errorDetail);
        }
        
     
        
        // Mark as sent to prevent duplicates - use the specific key
        localStorage.setItem(emailSentKey, "true");
        
        // Update confirmation data to mark email as sent
        const updatedConfirmation = {
          ...confirmData,
          order: {
            ...confirmData.order,
            email_sent: true
          }
        };
        localStorage.setItem("booking_confirmation", JSON.stringify(updatedConfirmation));
        
        setEmailSent(true);
        setUserEmail(email);
        console.log("Receipt email sent successfully");
      } catch (apiError) {
        console.error("API Error:", apiError);
        
        const shouldDownload = window.confirm(
          "We encountered an issue sending the receipt to your email. Would you like to download it instead?"
        );
        
        if (shouldDownload) {
          const filename = `Booking_Receipt_${confirmData.booking_id}_${Date.now()}.pdf`;
          doc.save(filename);
          console.log("PDF saved as fallback:", filename);
        }
        
        throw apiError;
      }
      
    } catch (error) {
      console.error("Error sending receipt:", error);
      setEmailError(error instanceof Error ? error.message : 'Failed to send receipt email');
    } finally {
      setSendingEmail(false);
    }
  };

  const sendReceipt = async () => {
    if (!confirmationData) return;
    
    try {
      let email = userEmail;
      if (!email) {
        email = localStorage.getItem("userEmail");
        
        if (!email || !email.includes('@')) {
          email = prompt("Please enter your email address to receive the receipt:");
          if (!email || !email.includes('@')) {
            throw new Error("Please enter a valid email address");
          }
          
          localStorage.setItem("userEmail", email);
        }
        
        setUserEmail(email);
      }
      
      await sendReceiptWithEmail(confirmationData, email);
      
    } catch (error) {
      console.error("Error in manual sendReceipt:", error);
      setEmailError(error instanceof Error ? error.message : 'Failed to send receipt email');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="p-8 rounded-lg shadow-lg bg-white max-w-md w-full flex flex-col items-center">
          <Loader />
          <h2 className="mt-8 text-xl font-semibold text-gray-800 animate-pulse">Processing your payment...</h2>
          <p className="mt-3 text-gray-600 text-center">Please wait while we confirm your booking</p>
          <div className="mt-6 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-400 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 5 }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!confirmationData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full"
        >
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">No confirmation data found</h2>
          <p className="mt-2 text-gray-600 mb-6">We couldn't find your booking details. Please return to cart and try again.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => navigate("/cart")}
          >
            Return to Cart
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // const rentItems = confirmationData ? 
  //   confirmationData.order.items.filter((item: any) => item.is_for_rent) : [];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 shadow-lg">
        <MainHeader logoText="Furniture Store" onSearch={() => {}} />
      </div>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 sm:px-8 pt-24 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 mx-auto bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-3xl font-bold mt-6 text-gray-800"
            >
              Booking Confirmed!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-gray-600 mt-3"
            >
              Your booking has been successfully completed and is now being processed.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-50 rounded-xl p-6 mb-8 shadow-inner"
          >
            <h2 className="text-xl font-semibold mb-5 pb-3 border-b border-gray-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Booking Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                <p className="font-medium text-gray-800">{confirmationData.booking_id}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                <p className="font-medium text-gray-800">{confirmationData.transaction.id}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                <p className="font-medium text-gray-800">${confirmationData.order.total_price.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Date</p>
                <p className="font-medium text-gray-800">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Type</p>
              <div className="flex items-center">
                <p className="font-medium text-gray-800">
                  {confirmationData.order.is_buying ? "Purchase" : "Rental"}
                </p>
                {!confirmationData.order.is_buying && confirmationData.order.duration && (
                  <div className="ml-4 px-3 py-1 bg-blue-50 rounded-full text-blue-700 text-sm font-medium">
                    {formatDurationString(confirmationData.order.duration)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8"
          >
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Items
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {confirmationData.order.items.map((item: any, index: number) => (
                <div key={index} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-3 sm:mb-0">
                      <h3 className="font-semibold text-gray-800">{item.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Qty: {item.quantity}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {item.category || "Not specified"}
                        </span>
                        {item.is_for_rent && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {formatDurationString(item.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-5 bg-gray-50 border-t-2 border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">Total Amount</h3>
                <span className="font-bold text-xl text-gray-800">${confirmationData.order.total_price.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
              whileTap={{ scale: 0.95 }}
              className={`py-3 px-6 rounded-full text-white shadow-md flex items-center justify-center ${downloadingPdf ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-all duration-300`}
              onClick={downloadReceipt}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Receipt
                </>
              )}
            </motion.button>
            
            <motion.button
              whileHover={!emailSent ? { scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" } : {}}
              whileTap={!emailSent ? { scale: 0.95 } : {}}
              className={`py-3 px-6 rounded-full text-white shadow-md flex items-center justify-center transition-all duration-300 ${
                emailSent ? 'bg-green-500' : sendingEmail ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={sendReceipt}
              disabled={sendingEmail || emailSent}
            >
              {sendingEmail ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Email...
                </>
              ) : emailSent ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Email Sent
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Receipt
                </>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
              whileTap={{ scale: 0.95 }}
              className="py-3 px-6 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-700 transition-all duration-300 flex items-center justify-center"
              onClick={handleContinueShopping}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Continue Shopping
            </motion.button>
          </motion.div>
          
          <AnimatePresence>
            {emailError && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 text-red-600 text-center p-4 bg-red-50 rounded-lg border border-red-100 shadow-sm"
              >
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{emailError}</p>
                </div>
              </motion.div>
            )}
            
            {emailSent && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 text-green-600 text-center p-4 bg-green-50 rounded-lg border border-green-100 shadow-sm"
              >
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Receipt has been sent to <span className="font-semibold">{userEmail}</span></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <MainFooter />
    </>
  );
};

export default BookingConfirmation;
