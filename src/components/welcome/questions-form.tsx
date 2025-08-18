"use client";
import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const addictionOptions = [
  { value: "ALCOHOL", label: "Alcohol" },
  { value: "TOBACCO", label: "Tobacco" },
  { value: "GAMBLING", label: "Gambling" },
  { value: "DRUGS", label: "Drugs" },
  { value: "FOOD", label: "Food" },
  { value: "PORNOGRAPHY", label: "Pornography" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "OTHER", label: "Other" },
];

export default function QuestionsForm() {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const [addictionType, setAddictionType] = useState("");
  const [otherAddiction, setOtherAddiction] = useState("");
  const [experience, setExperience] = useState("");
  const [goal, setGoal] = useState("");

  const router = useRouter();

  const totalSlides = 3;

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const isSlide1Valid = () => {
    const hasAddictionType = addictionType.trim() !== "";
    const hasOtherSpecified = addictionType !== "OTHER" || otherAddiction.trim() !== "";
    const hasExperience = experience.trim() !== "";
    return hasAddictionType && hasOtherSpecified && hasExperience;
  };

  const isSlide2Valid = () => {
    return goal.trim() !== "";
  };

  const handleNext = () => {
    if (!api) return;

    if (currentSlide === 0 && !isSlide1Valid()) {
      alert(
        "Please fill in both the addiction and experience fields before proceeding."
      );
      return;
    }
    if (currentSlide === 1 && !isSlide2Valid()) {
      alert("Please describe your primary goal before proceeding.");
      return;
    }

    api.scrollNext();
  };

  const handlePrevious = () => {
    if (!api) return;
    api.scrollPrev();
  };

  const handleSubmit = () => {
    if (!isSlide1Valid() || !isSlide2Valid()) {
      toast("Please complete all required fields before submitting.");
      return;
    }

    const fullMessage = {
      AddictionType: addictionType,
      OtherAddiction: addictionType === "OTHER" ? otherAddiction : null,
      Experience: experience,
      Goal: goal,
    };
    console.log("----------------")
    console.log("Full message to submit:", fullMessage);
    // Encode the message object as a URL-safe string
    const encodedMessage = encodeURIComponent(JSON.stringify(fullMessage));

    router.push(`/analyser/${encodedMessage}`);
  };

  const canGoNext = () => {
    if (currentSlide === 0) return isSlide1Valid();
    if (currentSlide === 1) return isSlide2Valid();
    return false;
  };

  const canGoPrevious = () => {
    return currentSlide > 0;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-white/60 backdrop-blur-sm p-6">
        <Carousel setApi={setApi} opts={{ watchDrag: false }}>
          <CarouselContent>
            {/* Slide 1 */}
            <CarouselItem>
              <div className="flex flex-col items-center justify-center h-full p-8">
                <h1 className="text-3xl font-bold mb-4 text-center text-gray-900">
                  Welcome to{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                    Detox IT
                  </span>
                </h1>
                <p className="text-lg mb-8 text-center text-gray-600">
                  Please answer the following questions to help us understand
                  your needs.
                </p>

                <div className="w-full max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-2">
                      What addiction do you want to detox from? *
                    </label>
                    <select
                      value={addictionType}
                      onChange={(e) => {
                        e.preventDefault();
                        setAddictionType(e.target.value);
                      }}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
                    >
                      <option value="">Select an addiction type...</option>
                      {addictionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {addictionType === "OTHER" && (
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-2">
                        Please specify your addiction *
                      </label>
                      <input
                        type="text"
                        value={otherAddiction}
                        onChange={(e) => setOtherAddiction(e.target.value)}
                        placeholder="Please specify your addiction..."
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-2">
                      Describe your experience with this addiction *
                    </label>
                    <textarea
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="Tell us about your relationship with this addiction..."
                      className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-4 w-full max-w-md mt-8">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handlePrevious}
                    disabled={!canGoPrevious()}
                  >
                    Previous
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleNext}
                    disabled={!canGoNext()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CarouselItem>

            {/* Slide 2 */}
            <CarouselItem>
              <div className="flex flex-col items-center justify-center h-full p-8">
                <h1 className="text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  Your Goals
                </h1>
                <p className="text-lg mb-8 text-center text-gray-600">
                  Tell us about your goals for this detox journey.
                </p>

                <div className="w-full max-w-md">
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    What is your primary goal for detox? *
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    value={goal}
                    placeholder="Describe what you hope to achieve..."
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 w-full max-w-md mt-8">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handlePrevious}
                    disabled={!canGoPrevious()}
                  >
                    Previous
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleNext}
                    disabled={!canGoNext()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CarouselItem>

            {/* Slide 3 - Summary */}
            <CarouselItem>
              <div className="flex flex-col items-center justify-center h-full p-8">
                <h1 className="text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  Review Your Answers
                </h1>
                <p className="text-lg mb-8 text-center text-gray-600">
                  Please review your information before submitting.
                </p>

                <div className="w-full max-w-md space-y-6 bg-emerald-50 rounded-lg p-6 border border-emerald-100">
                  <div>
                    <h3 className="font-semibold text-emerald-700 mb-2">
                      Addiction to Address:
                    </h3>
                    <p className="text-gray-900">
                      {addictionType ? (
                        addictionType === "OTHER" ?
                          (otherAddiction || "Not specified") :
                          (() => {
                            const foundOption = addictionOptions.find(opt => opt.value === addictionType);
                            return foundOption ? foundOption.label : addictionType;
                          })()
                      ) : "Not provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-emerald-700 mb-2">
                      Your Experience:
                    </h3>
                    <p className="text-gray-900">
                      {experience || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-emerald-700 mb-2">
                      Your Goal:
                    </h3>
                    <p className="text-gray-900">{goal || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex gap-4 w-full max-w-md mt-8">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handlePrevious}
                  >
                    Previous
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        {/* Progress indicator */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-colors ${index === currentSlide
                  ? "bg-blue-600"
                  : index < currentSlide
                    ? "bg-green-500"
                    : "bg-gray-300"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div >
  );
}
