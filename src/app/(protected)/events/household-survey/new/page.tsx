import UnitEventEntryForm from "@/components/events/UnitEventEntryForm";

export default function HouseholdSurveyNewEntryPage() {
  return (
    <UnitEventEntryForm
      unitCode="HOUSEHOLD_SURVEY_SIRD"
      unitLabel="Household Survey & SIRD"
      backHref="/events/household-survey"
    />
  );
}
