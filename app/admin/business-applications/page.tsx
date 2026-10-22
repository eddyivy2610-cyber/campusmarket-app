"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Loader2, 
  X, 
  Eye,
  Check
} from "lucide-react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { NIGERIAN_UNIVERSITIES } from "@/lib/constants";

interface BusinessApp {
  _id: string;
  applicantId: string;
  businessName: string;
  businessCategory: string;
  campus: string;
  operatingLocation: string;
  contactPhone: string;
  contactEmail: string;
  registeredBusinessName?: string;
  cacNumber?: string;
  supportingDocuments?: string[];
  notes?: string;
  status: "pending_review" | "approved" | "rejected" | "changes_requested" | "more_info_needed";
  adminDecision?: {
    reviewedBy?: string;
    reviewedAt?: string;
    reason?: string;
    adminNotes?: string;
  };
  storeId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BusinessApplicationsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#FFC928] animate-spin" />
      </div>
    }>
      <BusinessApplicationsPage />
    </Suspense>
  );
}

function BusinessApplicationsPage() {
  const searchParams = useSearchParams();

  const [applications, setApplications] = useState<BusinessApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.get("status") || "pending_review"
  );
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Review modal state
  const [selectedApp, setSelectedApp] = useState<BusinessApp | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "request_changes" | null>(null);
  const [actionReason, setActionReason] = useState<string>("");
  const [actionNotes, setActionNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let url = "admin/business-applications";
      const params = new URLSearchParams();
      if (selectedStatus && selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      if (selectedCampus && selectedCampus !== "all") {
        params.append("campus", selectedCampus);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res: any = await apiGet(url);
      if (res?.success && Array.isArray(res?.data)) {
        setApplications(res.data);

        // Auto open if id in query
        const idParam = searchParams.get("id");
        if (idParam) {
          const match = res.data.find((a: BusinessApp) => a._id === idParam);
          if (match) setSelectedApp(match);
        }
      } else {
        setApplications([]);
      }
    } catch (err: any) {
      console.error("Failed to load business applications:", err);
      setError(err?.message || "Failed to load business applications queue.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus, selectedCampus]);

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.toLowerCase();
    return applications.filter(
      (app) =>
        app.businessName?.toLowerCase().includes(q) ||
        app.registeredBusinessName?.toLowerCase().includes(q) ||
        app.contactEmail?.toLowerCase().includes(q) ||
        app.cacNumber?.toLowerCase().includes(q) ||
        app.campus?.toLowerCase().includes(q)
    );
  }, [applications, searchQuery]);

  const handleDecisionSubmit = async () => {
    if (!selectedApp || !actionType) return;

    if (actionType === "reject" && !actionReason.trim()) {
      alert("A rejection reason is required for applicant feedback and audit trail.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res: any = await apiPatch(
        `admin/business-applications/${selectedApp._id}`,
        {
          action: actionType,
          reason: actionReason.trim(),
          adminNotes: actionNotes.trim(),
        }
      );

      if (res?.success) {
        setActionSuccessMsg(
          actionType === "approve"
            ? "Application approved! The business storefront is now live."
            : actionType === "reject"
            ? "Application rejected. Reason recorded."
            : "Changes requested from applicant."
        );

        // Update list locally
        setApplications((prev) =>
          prev.map((a) => (a._id === selectedApp._id ? res.data.application : a))
        );
        setSelectedApp(res.data.application);
        setActionType(null);
        setActionReason("");
        setActionNotes("");

        setTimeout(() => setActionSuccessMsg(null), 4000);
      } else {
        alert(res?.error || "Failed to submit decision.");
      }
    } catch (err: any) {
      alert(err?.message || "Error processing decision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusTabs = [
    { id: "pending_review", label: "Pending Review" },
    { id: "approved", label: "Approved" },
    { id: "changes_requested", label: "Changes Requested" },
    { id: "rejected", label: "Rejected" },
    { id: "all", label: "All Submissions" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFC928]" />
            <h1 className="text-2xl font-black text-[#171717] dark:text-white tracking-tight">
              Business Applications
            </h1>
          </div>
          <p className="text-sm text-muted-foreground dark:text-neutral-400 mt-1">
            Review registration submissions from off-campus vendors and local campus businesses.
          </p>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchApplications} className="underline font-bold text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-[#14161D] p-4 rounded-3xl border border-border/60 dark:border-white/10 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
                  isActive
                    ? "bg-[#171717] text-white dark:bg-[#FFC928] dark:text-[#171717] shadow-sm"
                    : "bg-[#F2F4F7] dark:bg-white/5 text-[#5B636E] dark:text-neutral-300 hover:bg-[#E5E7EB] dark:hover:bg-white/10 hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Campus Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-border/40 dark:border-white/10">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-muted-foreground dark:text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by business name, CAC number, applicant email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl bg-[#F7F8FA] dark:bg-white/5 border border-border/50 dark:border-white/10 focus:border-[#FFC928] dark:focus:border-[#FFC928] focus:outline-none text-[#171717] dark:text-white placeholder:text-muted-foreground/60 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground dark:text-neutral-400 shrink-0 hidden sm:block" />
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-xs rounded-2xl bg-[#F7F8FA] dark:bg-[#14161D] border border-border/50 dark:border-white/10 focus:border-[#FFC928] focus:outline-none text-[#171717] dark:text-white transition-colors font-medium truncate dark:[&>option]:bg-[#14161D] dark:[&>option]:text-white"
            >
              <option value="all">All Campuses</option>
              {NIGERIAN_UNIVERSITIES.slice(0, 30).map((u: string) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-white dark:bg-[#14161D] rounded-3xl border border-border/60 dark:border-white/10 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground dark:text-neutral-400">
            <Loader2 className="w-8 h-8 text-[#FFC928] animate-spin mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading verification queue...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground dark:text-neutral-400">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="text-sm font-bold text-foreground dark:text-white">No applications found</h3>
            <p className="text-xs mt-1">There are no business applications matching your current filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/40 dark:border-white/10 bg-[#FAFBFD] dark:bg-white/[0.02] text-muted-foreground dark:text-neutral-400 uppercase tracking-wider font-black text-[10px]">
                  <th className="py-3.5 px-5">Business</th>
                  <th className="py-3.5 px-4">Campus & Location</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">CAC / Documents</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 dark:divide-white/5">
                {filteredApps.map((app) => (
                  <tr
                    key={app._id}
                    className="hover:bg-[#F7F8FA] dark:hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FFC928]/15 text-[#171717] dark:text-[#FFC928] flex items-center justify-center font-black text-sm shrink-0">
                          {app.businessName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground dark:text-white truncate max-w-[180px]">
                            {app.businessName}
                          </p>
                          <p className="text-[11px] text-muted-foreground dark:text-neutral-400 truncate max-w-[180px]">
                            {app.registeredBusinessName || app.contactEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-semibold text-foreground dark:text-white truncate max-w-[200px]">
                        {app.campus}
                      </p>
                      <p className="text-[11px] text-muted-foreground dark:text-neutral-400 truncate max-w-[200px]">
                        {app.operatingLocation}
                      </p>
                    </td>

                    <td className="py-4 px-4 font-semibold text-foreground dark:text-white">
                      {app.businessCategory}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[11px] text-foreground dark:text-white font-semibold">
                          {app.cacNumber || "No CAC"}
                        </span>
                        <span className="text-[10px] text-muted-foreground dark:text-neutral-400 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-muted-foreground/60" />
                          {app.supportingDocuments?.length || 0} doc(s)
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          app.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : app.status === "pending_review"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : app.status === "changes_requested"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {app.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-muted-foreground dark:text-neutral-400 text-[11px]">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 font-bold text-[#171717] dark:text-white text-xs transition-all active:scale-95 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal / Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14161D] w-full max-w-3xl max-h-[90vh] rounded-3xl border border-border dark:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-border/50 dark:border-white/10 flex items-center justify-between bg-[#FAFBFD] dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFC928]/15 text-[#171717] dark:text-[#FFC928] flex items-center justify-center font-black text-lg">
                  {selectedApp.businessName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground dark:text-white">
                    {selectedApp.businessName}
                  </h2>
                  <p className="text-xs text-muted-foreground dark:text-neutral-400">
                    Application ID: <span className="font-mono">{selectedApp._id}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedApp(null);
                  setActionType(null);
                }}
                className="w-9 h-9 rounded-full bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 flex items-center justify-center text-foreground dark:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.04] border border-border/40 dark:border-white/10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
                    Current Application Status
                  </p>
                  <p className="text-sm font-black uppercase text-foreground dark:text-white mt-0.5">
                    {selectedApp.status.replace("_", " ")}
                  </p>
                </div>
                {selectedApp.storeId && (
                  <a
                    href={`/stores`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#FFC928] text-[#171717] font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Storefront
                  </a>
                )}
              </div>

              {/* Grid of Business Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.04] border border-border/40 dark:border-white/10 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
                    Registration Information
                  </p>
                  <div>
                    <span className="text-muted-foreground dark:text-neutral-400">CAC Reg Number: </span>
                    <span className="font-mono font-bold text-foreground dark:text-white">
                      {selectedApp.cacNumber || "None Provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground dark:text-neutral-400">Official Registered Name: </span>
                    <span className="font-bold text-foreground dark:text-white">
                      {selectedApp.registeredBusinessName || "Same as trade name"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground dark:text-neutral-400">Category: </span>
                    <span className="font-bold text-foreground dark:text-white">
                      {selectedApp.businessCategory}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.04] border border-border/40 dark:border-white/10 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
                    Campus & Location
                  </p>
                  <div>
                    <span className="text-muted-foreground dark:text-neutral-400">Serving Campus: </span>
                    <span className="font-bold text-foreground dark:text-white">
                      {selectedApp.campus}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground dark:text-neutral-400">Operating Address: </span>
                    <span className="font-bold text-foreground dark:text-white">
                      {selectedApp.operatingLocation}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.04] border border-border/40 dark:border-white/10 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
                    Contact & Applicant
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground dark:text-neutral-400" />
                    <span className="font-bold text-foreground dark:text-white">{selectedApp.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground dark:text-neutral-400" />
                    <span className="font-bold text-foreground dark:text-white">{selectedApp.contactEmail}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground dark:text-neutral-400">
                    Applicant User ID: <span className="font-mono">{selectedApp.applicantId}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.04] border border-border/40 dark:border-white/10 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
                    Submission Timestamps
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground dark:text-neutral-400" />
                    <span className="text-foreground dark:text-white">Created: {new Date(selectedApp.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground dark:text-neutral-400" />
                    <span className="text-foreground dark:text-white">Updated: {new Date(selectedApp.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Pitch / Notes */}
              {selectedApp.notes && (
                <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.04] border border-border/40 dark:border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400 mb-1">
                    Applicant Statement / Notes
                  </p>
                  <p className="text-foreground dark:text-white leading-relaxed whitespace-pre-line">
                    {selectedApp.notes}
                  </p>
                </div>
              )}

              {/* Supporting Documents Section */}
              <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.04] border border-border/40 dark:border-white/10">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#FFC928]" />
                  Uploaded Verification Documents ({selectedApp.supportingDocuments?.length || 0})
                </p>

                {(!selectedApp.supportingDocuments || selectedApp.supportingDocuments.length === 0) ? (
                  <p className="text-muted-foreground dark:text-neutral-400 italic">No document attachments were uploaded with this application.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {selectedApp.supportingDocuments.map((docUrl, idx) => (
                      <a
                        key={idx}
                        href={docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#14161D] border border-border/60 dark:border-white/10 hover:border-[#FFC928] dark:hover:border-[#FFC928] text-foreground dark:text-white transition-all group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-[#FFC928] shrink-0" />
                          <span className="font-bold truncate text-[11px]">
                            Document #{idx + 1}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground dark:text-neutral-400 group-hover:text-foreground dark:group-hover:text-white shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Previous Admin Decision Audit */}
              {selectedApp.adminDecision && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin Audit Log
                  </p>
                  <p className="text-foreground dark:text-white">
                    <span className="font-semibold text-muted-foreground dark:text-neutral-400">Reviewed By: </span>
                    {selectedApp.adminDecision.reviewedBy || "Admin"} on{" "}
                    {selectedApp.adminDecision.reviewedAt
                      ? new Date(selectedApp.adminDecision.reviewedAt).toLocaleString()
                      : "N/A"}
                  </p>
                  {selectedApp.adminDecision.reason && (
                    <p className="text-foreground dark:text-white">
                      <span className="font-semibold text-muted-foreground dark:text-neutral-400">Decision Reason: </span>
                      {selectedApp.adminDecision.reason}
                    </p>
                  )}
                  {selectedApp.adminDecision.adminNotes && (
                    <p className="text-foreground dark:text-white">
                      <span className="font-semibold text-muted-foreground dark:text-neutral-400">Internal Notes: </span>
                      {selectedApp.adminDecision.adminNotes}
                    </p>
                  )}
                </div>
              )}

              {/* Action Decision Form Section */}
              {actionType && (
                <div className="p-5 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.04] border-2 border-[#FFC928] space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-sm text-foreground dark:text-white uppercase tracking-wide">
                      {actionType === "approve"
                        ? "Approve & Activate Storefront"
                        : actionType === "reject"
                        ? "Reject Business Application"
                        : "Request Changes / Additional Information"}
                    </h3>
                    <button
                      onClick={() => setActionType(null)}
                      className="text-muted-foreground hover:text-foreground dark:text-neutral-400 dark:hover:text-white text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  {actionType === "approve" && (
                    <p className="text-muted-foreground dark:text-neutral-400">
                      Approving this application will immediately create and activate an official
                      <strong className="text-foreground dark:text-white"> Local Business Storefront</strong> for the applicant.
                    </p>
                  )}

                  {(actionType === "reject" || actionType === "request_changes") && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
                        {actionType === "reject" ? "Rejection Reason (Required)" : "Details of Requested Changes (Required)"}
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder={
                          actionType === "reject"
                            ? "e.g. CAC registration certificate could not be verified; physical address outside coverage."
                            : "e.g. Please provide a clearer scan of your CAC status report or valid utility receipt."
                        }
                        className="w-full p-3 rounded-xl bg-white dark:bg-[#0E1015] border border-border/80 dark:border-white/10 focus:border-[#FFC928] dark:focus:border-[#FFC928] focus:outline-none text-foreground dark:text-white placeholder:text-muted-foreground/50"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
                      Internal Admin Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="e.g. Verified by phone with CAC database."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0E1015] border border-border/80 dark:border-white/10 focus:border-[#FFC928] dark:focus:border-[#FFC928] focus:outline-none text-foreground dark:text-white placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <button
                    onClick={handleDecisionSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                      actionType === "approve"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : actionType === "reject"
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } disabled:opacity-50`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Confirm {actionType.replace("_", " ")}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            {!actionType && (
              <div className="p-4 border-t border-border/50 dark:border-white/10 bg-[#FAFBFD] dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 font-bold text-[#171717] dark:text-white text-xs"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActionType("request_changes");
                      setActionReason("");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 font-black text-xs uppercase tracking-wider transition-all"
                  >
                    Request Info
                  </button>

                  <button
                    onClick={() => {
                      setActionType("reject");
                      setActionReason("");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-black text-xs uppercase tracking-wider transition-all"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => {
                      setActionType("approve");
                      setActionReason("Verified and approved by admin.");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm"
                  >
                    Approve Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
