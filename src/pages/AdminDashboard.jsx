import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const AdminDashboard = () => {
  const [studentForm, setStudentForm] = useState({ studentId: "", name: "", sectionId: "", parentPhone: "" });
  const [sectionForm, setSectionForm] = useState({ name: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "" });
  const [teacherForm, setTeacherForm] = useState({ name: "", password: "" });
  const [assignForm, setAssignForm] = useState({ sectionId: "", teacherId: "", subjectId: "" });
  const [subjects, setSubjects] = useState([]);
  const [status, setStatus] = useState({ message: "", error: "" });
  const [loading, setLoading] = useState(false);

  const sections = useMemo(
    () => [
      { id: "students", label: "Add Student" },
      { id: "sections", label: "Create Section" },
      { id: "subjects", label: "Create Subject" },
      { id: "teachers", label: "Create Teacher" },
      { id: "assign", label: "Assign Teacher Subject" },
    ],
    []
  );

  const submitForm = async (endpoint, payload, successText) => {
    setLoading(true);
    setStatus({ message: "", error: "" });
    try {
      await api.post(endpoint, payload);
      setStatus({ message: successText, error: "" });
    } catch (error) {
      console.error("Request failed:", error);
      setStatus({ message: "", error: error.response?.data?.message || error.message || "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/admin/subjects");
      setSubjects(response.data || []);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleStudentCreate = async (event) => {
    event.preventDefault();
   await submitForm("/admin/students", {
  studentId: studentForm.studentId,   // ✅ string
  name: studentForm.name,
  sectionId: Number(studentForm.sectionId), // ✅ changed
  parentPhone: studentForm.parentPhone,
}, "Student created successfully.");
  };

  const handleSubjectCreate = async (event) => {
    event.preventDefault();
    await submitForm("/admin/create-subject", { name: subjectForm.name }, "Subject created successfully.");
    setSubjectForm({ name: "" });
    fetchSubjects(); // Refresh the list
  };

  const handleSectionCreate = async (event) => {
    event.preventDefault();
    await submitForm("/admin/create-section", { name: sectionForm.name }, "Section created successfully.");
    setSectionForm({ name: "" });
  };

  const handleTeacherCreate = async (event) => {
    event.preventDefault();
    await submitForm("/admin/create-teacher", { name: teacherForm.name, password: teacherForm.password }, "Teacher created successfully.");
  };

  const handleAssignTeacher = async (event) => {
    event.preventDefault();
    await submitForm("/admin/assign-teacher-subject", {
      teacherId: Number(assignForm.teacherId),
      sectionId: Number(assignForm.sectionId),
      subjectId: Number(assignForm.subjectId),
    }, "Teacher assigned successfully.");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-8">
        <Sidebar links={sections} />

        <main className="flex-1 space-y-6">
          <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">Manage students, sections, teachers, and assignments.</p>
          </header>

          {status.error && (
            <div className="rounded-3xl bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-200">{status.error}</div>
          )}
          {status.message && (
            <div className="rounded-3xl bg-emerald-50 p-4 text-emerald-700 ring-1 ring-emerald-200">{status.message}</div>
          )}

          <section id="students" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold">Add Student</h2>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleStudentCreate}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Student ID</span>
                <input
                  type="text"
                  value={studentForm.studentId}
                  onChange={(e) => setStudentForm((current) => ({ ...current, studentId: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm((current) => ({ ...current, name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Section ID</span>
                <input
                  type="number"
                  value={studentForm.sectionId}
                  onChange={(e) => setStudentForm((current) => ({ ...current, sectionId: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Parent Phone</span>
                <input
                  type="text"
                  value={studentForm.parentPhone}
                  onChange={(e) => setStudentForm((current) => ({ ...current, parentPhone: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  required
                />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-sky-600 px-6 py-3 text-white transition hover:bg-sky-700 disabled:bg-slate-400"
                >
                  {loading ? "Saving..." : "Create Student"}
                </button>
              </div>
            </form>
          </section>

          <section id="sections" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold">Create Section</h2>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSectionCreate}>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Section Name</span>
                <input
                  type="text"
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ name: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  required
                />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-sky-600 px-6 py-3 text-white transition hover:bg-sky-700 disabled:bg-slate-400"
                >
                  {loading ? "Saving..." : "Create Section"}
                </button>
              </div>
            </form>
          </section>

          <section id="subjects" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold">Create Subject</h2>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubjectCreate}>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Subject Name</span>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ name: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  required
                />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading || !subjectForm.name.trim()}
                  className="rounded-2xl bg-sky-600 px-6 py-3 text-white transition hover:bg-sky-700 disabled:bg-slate-400"
                >
                  {loading ? "Saving..." : "Add Subject"}
                </button>
              </div>
            </form>
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Existing Subjects</h3>
              <ul className="mt-4 space-y-2">
                {subjects.length === 0 ? (
                  <li className="text-slate-500">No subjects found</li>
                ) : (
                  subjects.map((subject) => (
                    <li key={subject.id} className="rounded-2xl bg-slate-50 p-4 text-slate-800">
                      {subject.name}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>

          <section id="teachers" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold">Create Teacher</h2>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleTeacherCreate}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm((current) => ({ ...current, name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  requiredo
                  
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  value={teacherForm.password}
                  onChange={(e) => setTeacherForm((current) => ({ ...current, password: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  required
                />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-sky-600 px-6 py-3 text-white transition hover:bg-sky-700 disabled:bg-slate-400"
                >
                  {loading ? "Saving..." : "Create Teacher"}
                </button>
              </div>
            </form>
          </section>

          <section id="assign" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold">Assign Teacher Subject</h2>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleAssignTeacher}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Section ID</span>
                <input
                  type="number"
                  value={assignForm.sectionId}
                  onChange={(e) => setAssignForm((current) => ({ ...current, sectionId: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Teacher ID</span>
                <input
                  type="number"
                  value={assignForm.teacherId}
                  onChange={(e) => setAssignForm((current) => ({ ...current, teacherId: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Subject ID</span>
                <input
                  type="number"
                  value={assignForm.subjectId}
                  onChange={(e) => setAssignForm((current) => ({ ...current, subjectId: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  required
                />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-sky-600 px-6 py-3 text-white transition hover:bg-sky-700 disabled:bg-slate-400"
                >
                  {loading ? "Saving..." : "Assign Teacher"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
