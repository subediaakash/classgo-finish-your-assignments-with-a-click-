"use client";

import { useState } from "react";
import { Button } from "./button";
import { FileTextIcon, LoaderIcon } from "lucide-react";
import { generateAssignmentPDF, AssignmentPDFData } from "@/lib/pdf-utils";
import type { jsPDF } from "jspdf";

interface GeneratedAssignmentData {
  success: boolean;
  aiResponse: string;
  assignmentTitle: string;
  assignmentDescription?: string;
  materialsCount: number;
  pdfDoc: jsPDF;
  pdfData: AssignmentPDFData;
}

interface AssignmentPreparerProps {
  assignmentId: string;
  courseId: string;
  description?: string;
  onAssignmentGenerated: (assignmentData: GeneratedAssignmentData) => void;
}

export function AssignmentPreparer({ assignmentId, courseId, description, onAssignmentGenerated }: AssignmentPreparerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrepareAssignment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/assignments/${assignmentId}/prepare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to prepare assignment");
      }

      // Generate PDF
      const pdfData: AssignmentPDFData = {
        title: data.assignmentTitle,
        description,
        aiResponse: data.aiResponse,
      };

      const doc = generateAssignmentPDF(pdfData);
      
      // Call the callback to pass the generated assignment data
      onAssignmentGenerated({
        ...data,
        pdfDoc: doc,
        pdfData,
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-3">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handlePrepareAssignment}
          disabled={isProcessing}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          {isProcessing ? (
            <>
              <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
              Generating Assignment...
            </>
          ) : (
            <>
              <FileTextIcon className="w-4 h-4 mr-2" />
              Prepare Assignment
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
