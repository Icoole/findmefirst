export const DEGREE_CLASSES = [
  "First Class",
  "Second Class Upper",
  "Second Class Lower",
  "Third Class",
  "Pass",
  "Distinction",
  "Upper Credit",
  "Lower Credit",
] as const;

export const INSTITUTION_TYPES = ["University", "Polytechnic", "College of Education"] as const;

export const QUALIFICATIONS = ["B.Sc", "B.A", "B.Eng", "B.Tech", "LL.B", "MBBS", "HND", "OND", "NCE", "M.Sc", "MBA"] as const;

export const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
] as const;

export const NYSC_STATUS = ["Completed", "Ongoing", "Exempted", "Not yet"] as const;

export const DOC_KINDS = ["Degree certificate", "Statement of result", "Transcript", "NYSC certificate", "Professional certificate", "CV", "Other"] as const;

export function ageFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

/** Latest date of birth that still makes someone at least `age` years old today. */
export function dobForAge(age: number, now = new Date()): string {
  const d = new Date(now.getFullYear() - age, now.getMonth(), now.getDate());
  return d.toISOString().slice(0, 10);
}
