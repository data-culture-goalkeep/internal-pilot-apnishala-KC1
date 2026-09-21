import { Suspense } from "react";
import { SelAssessmentForm } from "./sel-assessment-form";

export default function Page() {
  return (
    <Suspense>
      <SelAssessmentForm />
    </Suspense>
  );
}
