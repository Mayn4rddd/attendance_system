import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCode } from "react-qr-code";
import api from "../api/axios";
import { onReceiveAttendanceUpdate, startSignalRConnection, stopSignalRConnection } from "../signalr/connection";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [session, setSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [status, setStatus] = useState({ message: "", error: "" });
  const [loading, setLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  const links = useMemo(
    () => [
      { id: "class-list", label: "My Sections" },
      { id: "qr-generator", label: "Generate QR" },
      { id: "attendance-log", label: "Attendance" },
    ],
    []
  );

  useEffect(() => {
    const fetchSections = async () => {
      if (!user?.userId) return;
      setSectionsLoading(true);
      try {
        const response = await api.get(`/teacher/my-sections?userId=${user.userId}`);
        setSections(response.data || []);
        if (!selectedSectionId && response.data?.length) {
          setSelectedSectionId(response.data[0].id ?? response.data[0].sectionId ?? null);
        }
        setStatus({ message: "", error: "" });
      } catch (error) {
        setStatus({ message: "", error: "Unable to fetch sections." });
      } finally {
        setSectionsLoading(false);
      }
    };
    fetchSections();
  }, [user]);


  useEffect(() => {
    let intervalId;

    if (session?.expiresAt) {
      const updateCountdown = () => {
        const expiresAt = new Date(session.expiryAt).getTime();
        const seconds = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        setCountdown(seconds);
        if (seconds <= 0) {
          clearInterval(intervalId);
        }
      };

      updateCountdown();
      intervalId = window.setInterval(updateCountdown, 1000);
    }

    return () => clearInterval(intervalId);
  }, [session]);

  // TEMP: SignalR disabled 
  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    setStatus({ message: "", error: "" });
    try {
      const response = await api.post("/qr/generate", {
        userId: user.userId,
        sectionId: selectedSectionId,
      });
      setSession(response.data);
      setStatus({ message: "QR session generated successfully.", error: "" });
    } catch (error) {
      setStatus({ message: "", error: "Failed to generate QR session." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-8">
        <Sidebar links={links} />

        <main className="flex-1 space-y-6">
          <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h1 className="text-3xl font-semibold">Teacher Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">Generate QR sessions and monitor attendance in real time.</p>
          </header>

          {status.error && <div className="rounded-3xl bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-200">{status.error}</div>}
          {status.message && <div className="rounded-3xl bg-emerald-50 p-4 text-emerald-700 ring-1 ring-emerald-200">{status.message}</div>}

          <section id="class-list" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">My Sections</h2>
                <p className="mt-1 text-sm text-slate-600">Choose a section to view attendance.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sectionsLoading ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">Loading sections...</div>
              ) : sections.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">No sections available.</div>
              ) : (
                sections.map((section) => {
                  const id = section.id ?? section.sectionId;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedSectionId(id);
                        navigate(`/section/${id}`);
                      }}
                      className={`rounded-3xl border p-6 text-left transition ${selectedSectionId?.toString() === id?.toString() ? "border-sky-600 bg-sky-50" : "border-slate-200 bg-white hover:border-slate-400"}`}
                    >
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Section</p>
                      <h3 className="mt-3 text-xl font-semibold text-slate-900">{section.name ?? `Section ${id}`}</h3>
                      <p className="mt-2 text-sm text-slate-600">Subject: {section.subject ?? 'N/A'}</p>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section id="qr-generator" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Generate QR Session</h2>
                <p className="mt-1 text-sm text-slate-600">Create a one-time login token for students to scan.</p>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={handleGenerate}
                className="rounded-2xl bg-sky-600 px-6 py-3 text-white transition hover:bg-sky-700 disabled:bg-slate-400"
              >
                {loading ? "Generating..." : "Generate QR"}
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                {session ? (
                  <div className="space-y-4 text-center">
                    <QRCode value={JSON.stringify({ sessionId: session.sessionId, token: session.token })} size={240} />
                    <div className="rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200">
                      <p className="text-sm text-slate-500">Session ID</p>
                      <p className="mt-1 break-all text-sm font-medium text-slate-900">{session.sessionId}</p>
                      <p className="mt-4 text-sm text-slate-500">Token</p>
                      <p className="mt-1 break-all text-sm font-medium text-slate-900">{session.token}</p>
                      <p className="mt-4 text-sm text-slate-500">Expiry</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{new Date(session.expiresAt).toLocaleString()}</p>
                      <p className="mt-2 text-sm text-slate-600">Expires in {countdown !== null ? `${countdown}s` : "--"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                    No active session yet. Click Generate QR to begin.
                  </div>
                )}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold">Instructions</h3>
                <p className="mt-3 text-sm text-slate-600">Copy the session data to share with students, or let them scan the rendered QR code using the student app.</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li>1. Generate a QR session.</li>
                  <li>2. Share the session ID and token with students.</li>
                  <li>3. Watch attendance update in real time.</li>
                </ul>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
