import type { Grade, KhojData, Student } from "./types";

export type StudentSortBy = "roll" | "name";

/** Shared sort for the student lists in data-entry forms (score entry,
 * take-attendance roster, SEL roster) — roll_no compared numerically since
 * it's stored zero-padded as text. */
export function sortStudents(students: Student[], sortBy: StudentSortBy): Student[] {
  return [...students].sort((a, b) =>
    sortBy === "roll"
      ? a.roll_no.localeCompare(b.roll_no, undefined, { numeric: true })
      : a.name.localeCompare(b.name)
  );
}

/** Resolves the currently selected grade ("All" -> undefined) plus the
 * grade-scoped subsets every view needs — the single place the
 * grade-selector's "All" semantics (page-level scope vs. cross-grade
 * aggregate) are implemented. */
export function useGradeScope(data: KhojData, gradeCode: string) {
  const grade: Grade | undefined = gradeCode === "All" ? undefined : data.grades.find((g) => g.code === gradeCode);
  const isAll = !grade;

  const students = grade ? data.students.filter((s) => s.grade_id === grade.id) : data.students;

  return { grade, isAll, students };
}
