"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { FileTextIcon, LoaderIcon } from "lucide-react";
import { generateAssignmentPDF, AssignmentPDFData } from "@/lib/pdf-utils";
import type { jsPDF } from "jspdf";
import ConfettiExplosion from "react-confetti-explosion";
import axios from "axios";

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePrepareAssignment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await axios.post(`/api/assignments/${assignmentId}/prepare`, {
        courseId,
      });

      const data = response.data;

      if (response.status !== 200) {
        throw new Error(data.error || "Failed to prepare assignment");
      }

      // Generate PDF
      const pdfData: AssignmentPDFData = {
        title: data.assignmentTitle,
        description,
        aiResponse: data.aiResponse,
      };

      const doc = generateAssignmentPDF(pdfData);
      
      // Save to database immediately after generation
      try {
        const saveResponse = await axios.post(`/api/assignments/${assignmentId}/save`, {
          courseId,
          assignmentId,
          assignmentTitle: data.assignmentTitle,
          assignmentDescription: description,
          aiResponse: data.aiResponse,
          studentName: '__________',
          usn: '__________',
          subject: '__________',
          course: '__________',
          stream: '__________',
          materialsCount: data.materialsCount,
        });

        if (saveResponse.status !== 200) {
          console.error('Failed to save assignment to database');
        } else {
          const saveData = saveResponse.data;
          console.log('Initial assignment saved:', saveData.message);
        }
      } catch (error) {
        console.error('Error saving initial assignment:', error);
      }
      
      // Call the callback to pass the generated assignment data
      onAssignmentGenerated({
        ...data,
        courseId,
        assignmentId,
        pdfDoc: doc,
        pdfData,
      });
      
      // Trigger confetti celebration!
      setShowConfetti(true);
      
      // Reset confetti after animation completes
      setTimeout(() => setShowConfetti(false), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

    // Don't render until we're on the client side
  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="h-12 w-32 bg-muted animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="flex justify-center">
          <ConfettiExplosion
            particleCount={200}
            particleSize={10}
            duration={3000}
            colors={['#FFC700', '#FF0000', '#2E3191', '#41BBC7', '#00FF00', '#FF6B6B', '#4ECDC4', '#45B7D1']}
          />
        </div>
      )}
      
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
