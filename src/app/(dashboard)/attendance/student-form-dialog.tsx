"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { enrollStudent, getStudentGradeHistory, updateStudent } from "@/lib/khoj/actions";
import type { Grade, MinorityGroup, SocialCategory, Student, StudentFormInput } from "@/lib/khoj/types";

const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const SOCIAL_CATEGORIES: SocialCategory[] = ["General", "OBC", "SC", "ST", "EWS"];
const MINORITY_GROUPS: MinorityGroup[] = ["None", "Muslim", "Christian", "Sikh", "Buddhist", "Other"];

function academicYears(): string[] {
  const y = new Date().getFullYear();
  return [y, y - 1, y - 2].map((year) => `AY ${year}-${String(year + 1).slice(2)}`);
}

function emptyDraft(gradeId: string): StudentFormInput {
  return {
    gradeId,
    rollNo: "",
    name: "",
    gender: "M",
    dateOfBirth: "",
    section: "",
    fatherName: "",
    motherName: "",
    socialCategory: "General",
    minorityGroup: "None",
    bplBeneficiary: false,
    cwsn: false,
    impairmentType: "",
    repeaterThisYear: false,
    studentPen: "",
    aadhaarNumber: "",
    apaarId: "",
    mobileNumber: "",
    address: "",
    gradeHistory: {},
  };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-muted-foreground first:mt-0">
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}

export function StudentFormDialog({
  open,
  onOpenChange,
  grades,
  gradeId,
  existingStudents,
  student,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grades: Grade[];
  gradeId: string;
  existingStudents: Student[];
  /** Present -> edit mode; absent -> enroll mode. */
  student?: Student;
  onSaved: () => Promise<void>;
}) {
  const [draft, setDraft] = React.useState<StudentFormInput>(() => emptyDraft(gradeId));
  const [pending, setPending] = React.useState(false);
  const years = academicYears();

  // Reset the draft synchronously during render on the closed->open
  // transition (React's recommended "adjust state when a prop changes"
  // pattern, using state rather than a ref since refs can't be read/written
  // during render), rather than in an effect — avoids an extra render pass.
  const [wasOpen, setWasOpen] = React.useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
  }
  if (open && !wasOpen) {
    if (student) {
      setDraft({
        gradeId: student.grade_id,
        rollNo: student.roll_no,
        name: student.name,
        gender: student.gender === "Other" ? "M" : student.gender,
        dateOfBirth: student.date_of_birth ?? "",
        section: student.section ?? "",
        fatherName: student.father_name ?? "",
        motherName: student.mother_name ?? "",
        socialCategory: student.social_category,
        minorityGroup: student.minority_group,
        bplBeneficiary: student.bpl_beneficiary,
        cwsn: student.cwsn,
        impairmentType: student.impairment_type ?? "",
        repeaterThisYear: student.repeater_this_year,
        studentPen: student.student_pen ?? "",
        aadhaarNumber: student.aadhaar_number ?? "",
        apaarId: student.apaar_id ?? "",
        mobileNumber: student.mobile_number ?? "",
        address: student.address ?? "",
        gradeHistory: {},
      });
    } else {
      const count = existingStudents.filter((s) => s.grade_id === gradeId).length;
      setDraft({ ...emptyDraft(gradeId), rollNo: String(count + 1).padStart(2, "0"), gradeHistory: { [years[0]]: gradeId } });
    }
  }

  React.useEffect(() => {
    if (!open || !student) return;
    getStudentGradeHistory(student.id).then((rows) => {
      setDraft((d) => ({
        ...d,
        gradeHistory: Object.fromEntries(rows.map((r) => [r.academic_year, r.grade_id])),
      }));
    });
  }, [open, student]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      if (student) {
        await updateStudent(student.id, draft);
      } else {
        await enrollStudent(draft);
      }
      // Optimistic: close as soon as the write succeeds; the background
      // views pick up the refreshed data once it lands rather than holding
      // the dialog open for it.
      onOpenChange(false);
      void onSaved();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{student ? "Edit student info" : `Enroll new student — Grade ${grades.find((g) => g.id === gradeId)?.label ?? ""}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1">
          <SectionLabel>Basic Info</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name">
              <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} required />
            </Field>
            <Field label="Gender">
              <Select value={draft.gender} onChange={(e) => setDraft((d) => ({ ...d, gender: e.target.value as "M" | "F" }))}>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </Select>
            </Field>
            <Field label="Date Of Birth">
              <Input type="date" value={draft.dateOfBirth ?? ""} onChange={(e) => setDraft((d) => ({ ...d, dateOfBirth: e.target.value }))} />
            </Field>
            <Field label="Section">
              <Select value={draft.section ?? ""} onChange={(e) => setDraft((d) => ({ ...d, section: e.target.value }))}>
                <option value="">—</option>
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="mt-1 text-xs font-semibold text-muted-foreground">Grade History</div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-1.5 text-left">Academic Year</th>
                  <th className="px-3 py-1.5 text-left">Grade</th>
                </tr>
              </thead>
              <tbody>
                {years.map((ay) => (
                  <tr key={ay} className="border-t border-border">
                    <td className="px-3 py-1.5">{ay}</td>
                    <td className="px-3 py-1.5">
                      <Select
                        className="h-8 w-full"
                        value={draft.gradeHistory[ay] ?? ""}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, gradeHistory: { ...d.gradeHistory, [ay]: e.target.value || null } }))
                        }
                      >
                        <option value="">—</option>
                        {grades.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.label}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SectionLabel>Family</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Father's Name">
              <Input value={draft.fatherName ?? ""} onChange={(e) => setDraft((d) => ({ ...d, fatherName: e.target.value }))} />
            </Field>
            <Field label="Mother's Name">
              <Input value={draft.motherName ?? ""} onChange={(e) => setDraft((d) => ({ ...d, motherName: e.target.value }))} />
            </Field>
          </div>

          <SectionLabel>Category &amp; Support</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Social Category">
              <Select value={draft.socialCategory} onChange={(e) => setDraft((d) => ({ ...d, socialCategory: e.target.value as SocialCategory }))}>
                {SOCIAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Minority Group">
              <Select value={draft.minorityGroup} onChange={(e) => setDraft((d) => ({ ...d, minorityGroup: e.target.value as MinorityGroup }))}>
                {MINORITY_GROUPS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="BPL Beneficiary">
              <Select
                value={draft.bplBeneficiary ? "Yes" : "No"}
                onChange={(e) => setDraft((d) => ({ ...d, bplBeneficiary: e.target.value === "Yes" }))}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Select>
            </Field>
            <Field label="CWSN">
              <Select value={draft.cwsn ? "Yes" : "No"} onChange={(e) => setDraft((d) => ({ ...d, cwsn: e.target.value === "Yes" }))}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Select>
            </Field>
            {draft.cwsn && (
              <Field label="Type Of Impairment">
                <Input value={draft.impairmentType ?? ""} onChange={(e) => setDraft((d) => ({ ...d, impairmentType: e.target.value }))} />
              </Field>
            )}
            <Field label="Repeater This Year">
              <Select
                value={draft.repeaterThisYear ? "Yes" : "No"}
                onChange={(e) => setDraft((d) => ({ ...d, repeaterThisYear: e.target.value === "Yes" }))}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Select>
            </Field>
          </div>

          <SectionLabel>IDs &amp; Contact</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Student PEN">
              <Input value={draft.studentPen ?? ""} onChange={(e) => setDraft((d) => ({ ...d, studentPen: e.target.value }))} />
            </Field>
            <Field label="Aadhaar Number">
              <Input value={draft.aadhaarNumber ?? ""} onChange={(e) => setDraft((d) => ({ ...d, aadhaarNumber: e.target.value }))} />
            </Field>
            <Field label="APAAR ID">
              <Input value={draft.apaarId ?? ""} onChange={(e) => setDraft((d) => ({ ...d, apaarId: e.target.value }))} />
            </Field>
            <Field label="Mobile Number">
              <Input value={draft.mobileNumber ?? ""} onChange={(e) => setDraft((d) => ({ ...d, mobileNumber: e.target.value }))} />
            </Field>
            <label className="col-span-2 flex flex-col gap-1.5 text-sm font-semibold">
              Address
              <textarea
                rows={2}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={draft.address ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
              />
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : student ? "Save changes" : "Enroll student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
