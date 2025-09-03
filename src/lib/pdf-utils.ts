import jsPDF from 'jspdf';

export interface AssignmentPDFData {
  title: string;
  description?: string;
  aiResponse: string;
  studentName?: string;
  usn?: string;
  subject?: string;
  course?: string;
  stream?: string;
}

export function generateAssignmentPDF(data: AssignmentPDFData): jsPDF {
  const doc = new jsPDF();
  
  // Set font and size
  doc.setFont('helvetica');
  doc.setFontSize(12);
  
  let yPosition = 20;
  const leftMargin = 20;
  const lineHeight = 8; // Increased line height for better readability
  const pageHeight = 280; // Page height limit
  
  // Header section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Assignment Response', leftMargin, yPosition);
  
  yPosition += lineHeight + 8; // More space after header
  
  // Student information section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const studentInfo = [
    `Name: ${data.studentName || '__________'}`,
    `USN: ${data.usn || '__________'}`,
    `Subject: ${data.subject || '__________'}`,
    `Course: ${data.course || '__________'}`,
    `Stream: ${data.stream || '__________'}`
  ];
  
  studentInfo.forEach(info => {
    doc.text(info, leftMargin, yPosition);
    yPosition += lineHeight + 2; // Add small spacing between fields
  });
  
  yPosition += lineHeight; // Space before title
  
  // Assignment title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(data.title, leftMargin, yPosition);
  
  yPosition += lineHeight + 8; // More space after title
  
  // AI-generated response
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  // Function to split text into lines that fit the page width and handle markdown formatting
  const splitTextIntoLines = (text: string, maxWidth: number): string[] => {
    const lines: string[] = [];
    
    // First, split by double line breaks to preserve paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    
    paragraphs.forEach((paragraph, paragraphIndex) => {
      if (paragraph.trim() === '') {
        lines.push(''); // Empty line for paragraph spacing
        return;
      }
      
      // Check if this paragraph is a heading
      const isHeading = paragraph.trim().startsWith('#');
      
      if (isHeading) {
        lines.push(paragraph.trim());
      } else {
        // For regular paragraphs, split into sentences first
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        
        sentences.forEach(sentence => {
          if (sentence.trim() === '') return;
          
          // Process markdown bold formatting within the sentence
          const processedSentence = processMarkdownBold(sentence);
          
          const words = processedSentence.split(' ');
          let currentLine = '';
          
          words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = doc.getTextWidth(testLine);
            
            if (testWidth > maxWidth) {
              if (currentLine) {
                lines.push(currentLine.trim());
                currentLine = word;
              } else {
                // Word is too long, force break it
                if (word.length > 20) {
                  // For very long words, break them
                  const chunks = word.match(/.{1,20}/g) || [word];
                  chunks.forEach(chunk => lines.push(chunk));
                } else {
                  lines.push(word);
                }
              }
            } else {
              currentLine = testLine;
            }
          });
          
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
        });
      }
      
      // Add paragraph spacing (except for the last paragraph)
      if (paragraphIndex < paragraphs.length - 1) {
        lines.push('');
      }
    });
    
    return lines;
  };
  
  // Function to render text with bold formatting
  const renderTextWithBoldFormatting = (doc: jsPDF, text: string, x: number, y: number) => {
    if (!text.includes('BOLD_START')) {
      // No bold formatting, render normally
      doc.text(text, x, y);
      return;
    }
    
    // Split text by bold markers
    const parts = text.split(/(BOLD_START|BOLD_END)/);
    let currentX = x;
    
    parts.forEach((part, index) => {
      if (part === 'BOLD_START') {
        // Switch to bold font
        doc.setFont('helvetica', 'bold');
      } else if (part === 'BOLD_END') {
        // Switch back to normal font
        doc.setFont('helvetica', 'normal');
      } else if (part.trim() !== '') {
        // Render the actual text
        doc.text(part, currentX, y);
        // Move cursor position for next part
        currentX += doc.getTextWidth(part);
      }
    });
  };
  
  // Function to process markdown bold formatting
  const processMarkdownBold = (text: string): string => {
    // Replace **text** with a special marker that we can process later
    return text.replace(/\*\*(.*?)\*\*/g, 'BOLD_START$1BOLD_END');
  };
  
  const maxWidth = 170; // Page width minus margins
  const lines = splitTextIntoLines(data.aiResponse, maxWidth);
  
  lines.forEach((line, _index) => {
    if (yPosition > pageHeight) {
      doc.addPage();
      yPosition = 20;
    }
    
    if (line.trim() === '') {
      yPosition += lineHeight / 2;
      return;
    }
    
    if (line.startsWith('##')) {
      yPosition += lineHeight / 2;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(line.replace('##', '').trim(), leftMargin, yPosition);
      yPosition += lineHeight + 3;
      
      // Reset to normal text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
    } else if (line.startsWith('#')) {
      yPosition += lineHeight / 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(line.replace('#', '').trim(), leftMargin, yPosition);
      yPosition += lineHeight + 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
    } else {
      renderTextWithBoldFormatting(doc, line, leftMargin, yPosition);
      yPosition += lineHeight + 2;
    }
  });
  
  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}

export function getPDFDataURL(doc: jsPDF): string {
  return doc.output('datauristring');
}
