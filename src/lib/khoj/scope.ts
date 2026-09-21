import type { Grade, KhojData } from "./types";

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
