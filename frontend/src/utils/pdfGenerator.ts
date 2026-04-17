// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

export const generateSimplePDF = () => {
  try {
    console.log("Creating basic PDF...");
    const doc = new jsPDF();
    
    // Add simple content
    doc.setFontSize(14);
    doc.text("Test PDF Document", 105, 20, { align: "center" });
    
    // Add a simple table
    autoTable(doc, {
      head: [["Name", "Email", "Country"]],
      body: [
        ["John", "john@example.com", "United States"],
        ["Mary", "mary@example.com", "Canada"]
      ]
    });
    
    // Save the PDF
    doc.save("test-document.pdf");
    console.log("Basic PDF created successfully");
    return true;
  } catch (error) {
    console.error("Error in basic PDF generation:", error);
    return false;
  }
};
