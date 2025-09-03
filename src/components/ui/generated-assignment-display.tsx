"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { FileTextIcon, DownloadIcon, EyeIcon, CheckCircleIcon, FileIcon, EditIcon } from "lucide-react";
import { downloadPDF, getPDFDataURL, AssignmentPDFData, generateAssignmentPDF } from "@/lib/pdf-utils";
import type { jsPDF } from "jspdf";
import { Streamdown } from "streamdown";
import dynamic from "next/dynamic";

const TipTapEditor = dynamic(() => import("./tiptap-editor").then(mod => ({ default: mod.TipTapEditor })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-32">
      <div className="text-muted-foreground">Loading editor...</div>
    </div>
  ),
});
import ConfettiExplosion from "react-confetti-explosion";

function markdownToHtml(markdown: string): string {
  // Convert markdown to HTML
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/^### (.*$)/gim, '<h3>$1</h3>') // H3
    .replace(/^## (.*$)/gim, '<h2>$1</h2>') // H2
    .replace(/^# (.*$)/gim, '<h1>$1</h1>') // H1
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>') // Blockquote
    .replace(/\n\n/g, '</p><p>') // Paragraphs
    .replace(/^(.+)$/gm, '<p>$1</p>') // Wrap lines in paragraphs
    .replace(/<\/p><p><\/p>/g, '</p><p>') // Clean up empty paragraphs
    .replace(/^<p><\/p>/g, '') // Remove leading empty paragraph
    .replace(/<\/p>$/g, '') // Remove trailing empty paragraph
    .replace(/<p><\/p>/g, ''); // Remove any remaining empty paragraphs
}

// Function to convert HTML back to markdown for PDF generation
function htmlToMarkdown(html: string): string {
  // Convert HTML back to markdown
  return html
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**') // Bold
    .replace(/<em>(.*?)<\/em>/g, '*$1*') // Italic
    .replace(/<h3>(.*?)<\/h3>/g, '### $1') // H3
    .replace(/<h2>(.*?)<\/h2>/g, '## $1') // H2
    .replace(/<h1>(.*?)<\/h1>/g, '# $1') // H1
    .replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1') // Blockquote
    .replace(/<p>(.*?)<\/p>/g, '$1\n\n') // Paragraphs
    .replace(/<br\s*\/?>/g, '\n') // Line breaks
    .replace(/\n\n\n+/g, '\n\n') // Clean up multiple newlines
    .trim(); // Remove leading/trailing whitespace
}

interface GeneratedAssignmentData {
  success: boolean;
  aiResponse: string;
  assignmentTitle: string;
  assignmentDescription?: string;
  materialsCount: number;
  pdfDoc: jsPDF;
  pdfData: AssignmentPDFData;
}

interface GeneratedAssignmentDisplayProps {
  assignmentData: GeneratedAssignmentData;
  assignmentTitle: string;
}

export function GeneratedAssignmentDisplay({ assignmentData, assignmentTitle }: GeneratedAssignmentDisplayProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(markdownToHtml(assignmentData.aiResponse));
  const [currentPdfDoc, setCurrentPdfDoc] = useState<jsPDF>(assignmentData.pdfDoc);
  const [showConfetti, setShowConfetti] = useState(true); // Show confetti when component first appears
  const [isClient, setIsClient] = useState(false);
  const [displayContent, setDisplayContent] = useState(assignmentData.aiResponse);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Hide confetti after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    if (currentPdfDoc) {
      downloadPDF(currentPdfDoc, `${assignmentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_assignment.pdf`);
    }
  };

  const handlePreview = () => {
    if (currentPdfDoc) {
      setShowPreview(true);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(markdownToHtml(assignmentData.aiResponse));
    setDisplayContent(assignmentData.aiResponse);
  };

  const handleSave = async (content: string) => {
    setEditedContent(content);
    
    // Convert HTML back to markdown for PDF generation
    const markdownContent = htmlToMarkdown(content);
    
    // Generate new PDF with edited content
    const pdfData: AssignmentPDFData = {
      title: assignmentData.assignmentTitle,
      description: assignmentData.assignmentDescription,
      aiResponse: markdownContent,
    };
    
    const newPdfDoc = generateAssignmentPDF(pdfData);
    setCurrentPdfDoc(newPdfDoc);
    
    // Update the assignment data and display content
    assignmentData.aiResponse = markdownContent;
    assignmentData.pdfDoc = newPdfDoc;
    setDisplayContent(markdownContent);
    
    // Don't exit edit mode automatically - let user decide when to finish
  };

  const handlePreviewUpdated = () => {
    if (currentPdfDoc) {
      setShowPreview(true);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  // Don't render until we're on the client side
  if (!isClient) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showPreview && currentPdfDoc) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-background border border-border rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <FileTextIcon className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">PDF Preview</h3>
              <Badge variant="outline" className="border-border text-foreground">
                {assignmentData.assignmentTitle}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClosePreview}
              className="border-border text-foreground hover:bg-accent"
            >
              Close
            </Button>
          </div>
          
          {/* PDF Content */}
          <div className="relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button 
                onClick={handleDownload} 
                size="sm" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            <div className="border-0 rounded-none h-[calc(95vh-120px)] bg-white">
              <iframe
                src={getPDFDataURL(currentPdfDoc)}
                width="100%"
                height="100%"
                title="PDF Preview"
                className="rounded-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-border bg-card">
      {/* Confetti Celebration */}
      {showConfetti && (
        <div className="flex justify-center py-4">
          <ConfettiExplosion
            particleCount={300}
            particleSize={12}
            duration={3000}
            colors={['#FFC700', '#FF0000', '#2E3191', '#41BBC7', '#00FF00', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD700', '#FF69B4']}
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-foreground">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              <CardTitle className="text-xl font-semibold text-foreground">
                AI-Generated Assignment Response
              </CardTitle>
            </div>
            <Badge variant="outline" className="border-border text-foreground">
              Ready
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handlePreview} variant="outline" size="sm" className="border-border text-foreground hover:bg-accent">
              <EyeIcon className="w-4 h-4 mr-2" />
              Preview PDF
            </Button>
            <Button onClick={handleDownload} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Student Information */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Name</div>
            <div className="text-lg font-semibold text-foreground">__________</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">USN</div>
            <div className="text-lg font-semibold text-foreground">__________</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Subject</div>
            <div className="text-lg font-semibold text-foreground">__________</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Course</div>
            <div className="text-lg font-semibold text-foreground">__________</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Stream</div>
            <div className="text-lg font-semibold text-foreground">__________</div>
          </div>
        </div>

        {/* Assignment Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Assignment</div>
            <div className="text-lg font-semibold text-foreground">{assignmentData.assignmentTitle}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Materials Used</div>
            <div className="text-lg font-semibold text-foreground">{assignmentData.materialsCount} attachments</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Status</div>
            <div className="text-lg font-semibold text-foreground">Generated</div>
          </div>
        </div>

        {/* AI Response */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileIcon className="w-5 h-5 text-foreground" />
              <h4 className="text-lg font-semibold text-foreground">Generated Response</h4>
            </div>
            <Button
              onClick={handleEdit}
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-accent"
            >
              <EditIcon className="w-4 h-4 mr-2" />
              Edit Response
            </Button>
          </div>
          
          {isEditing ? (
            <TipTapEditor
              content={editedContent}
              onSave={handleSave}
              onPreview={handlePreviewUpdated}
              onCancelEdit={handleCancelEdit}
            />
          ) : (
            <div className="bg-muted/50 rounded-lg border border-border p-6">
              <Streamdown className="prose prose-gray max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-pre:text-foreground prose-blockquote:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground">
                {displayContent}
              </Streamdown>
            </div>
          )}
        </div>

        {/* PDF Actions */}
        <div className="bg-muted/50 p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-3">
            <FileTextIcon className="w-5 h-5 text-foreground" />
            <h5 className="font-medium text-foreground">PDF Document Ready</h5>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your assignment has been formatted as a professional PDF document with proper structure and formatting.
          </p>
          <div className="flex gap-3">
            <Button onClick={handlePreview} variant="outline" className="border-border text-foreground hover:bg-accent">
              <EyeIcon className="w-4 h-4 mr-2" />
              Preview PDF
            </Button>
            <Button onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
