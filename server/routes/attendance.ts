import { RequestHandler } from "express";

export const postStudent: RequestHandler = async (req, res) => {
  const { student, schoolId } = req.body || {};
  if (!student || !schoolId)
    return res
      .status(400)
      .json({ ok: false, error: "Missing student or schoolId" });
  // In a real setup, persist to DB (Neon/Supabase). Here we just acknowledge.
  console.log("[API] new student", {
    schoolId,
    name: student?.name,
    roll: student?.roll,
  });
  res.json({ ok: true });
};

export const putStudent: RequestHandler = async (req, res) => {
  const { student } = req.body || {};
  if (!student)
    return res.status(400).json({ ok: false, error: "Missing student" });
  console.log("[API] update student", {
    name: student?.name,
    roll: student?.roll,
  });
  res.json({ ok: true });
};

export const postAttendance: RequestHandler = async (req, res) => {
  const { event } = req.body || {};
  if (!event)
    return res.status(400).json({ ok: false, error: "Missing event" });
  console.log("[API] attendance", event);
  res.json({ ok: true });
};
