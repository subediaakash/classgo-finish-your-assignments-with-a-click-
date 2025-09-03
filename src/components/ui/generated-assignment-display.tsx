"use client";

import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { FileTextIcon, DownloadIcon, EyeIcon, CheckCircleIcon, FileIcon } from "lucide-react";
import { downloadPDF, getPDFDataURL, AssignmentPDFData } from "@/lib/pdf-utils";
import type { jsPDF } from "jspdf";
import { Streamdown } from "streamdown";

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

  const handleDownload = () => {
    if (assignmentData.pdfDoc) {
      downloadPDF(assignmentData.pdfDoc, `${assignmentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_assignment.pdf`);
    }
  };

  const handlePreview = () => {
    if (assignmentData.pdfDoc) {
      setShowPreview(true);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  if (showPreview && assignmentData.pdfDoc) {
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
                src={getPDFDataURL(assignmentData.pdfDoc)}
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
          <div className="flex items-center gap-2 mb-4">
            <FileIcon className="w-5 h-5 text-foreground" />
            <h4 className="text-lg font-semibold text-foreground">Generated Response</h4>
          </div>
          
          <div className="bg-muted/50 rounded-lg border border-border p-6">
            <Streamdown className="prose prose-gray max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-pre:text-foreground prose-blockquote:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground">
              {assignmentData.aiResponse}
            </Streamdown>
          </div>
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
