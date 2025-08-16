import QuestionsForm from "@/components/welcome/questions-form";

export default function Page() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      <div className="aurora absolute -inset-1" />

      <div className="relative z-10">
        <QuestionsForm />
      </div>
    </div>
  );
}
