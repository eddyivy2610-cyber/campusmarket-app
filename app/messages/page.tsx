"use client";

import React, {
  Suspense,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Search,
  Check,
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  AlertCircle,
  RotateCcw,
  X,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Store,
  MapPin,
  Package,
  SlidersHorizontal,
  PanelRightOpen,
  PanelRightClose,
  ChevronDown,
  ChevronUp,
  Handshake,
  Star,
  Bell,
  Info,
  Calendar,
} from "lucide-react";

import { RebrandHeader } from "../components/header/RebrandHeader";
import {
  subscribeToConversation,
  sendTypingIndicator,
  getRealtimeClient,
} from "../lib/realtimeClient";
import type {
  ChatMessageDTO,
  ChatParticipantProfile,
  CheckInResponseChoice,
  ContextWorkflowStatus,
  ConversationDTO,
  DealStatus,
} from "../models/ChatModels";

function getParticipantProfileHref(participant: ChatParticipantProfile): string {
  const n = participant.name.toLowerCase();
  if (n.includes("campus closet")) return "/profile/campus-closet";
  if (n.includes("tech corner")) return "/profile/tech-corner";
  if (n.includes("print hub")) return "/profile/the-print-hub";
  if (n.includes("kongo")) return "/profile/kongo-scholars";
  return "/profile/tundebello";
}

function formatMessageTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatSidebarTime(iso: string): string {
  try {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getContextStatusStyle(status: ContextWorkflowStatus): string {
  switch (status) {
    case "Sold":
    case "Closed":
      return "bg-[#F1F3F6] text-[#5B636E] border-[#E2E6EC]";
    case "Deal completed":
    case "Accepted":
      return "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]";
    case "Offer pending":
    case "Pending":
      return "bg-[#FFF3C4] text-[#92400E] border-[#FDE68A]";
    case "Available":
    case "Open request":
    case "Open today":
    default:
      return "bg-[#ECFDF3] text-[#15803D] border-[#ABEFC6]";
  }
}

function getDealStatusBadgeStyle(status: DealStatus): string {
  switch (status) {
    case "Completed":
      return "bg-[#DCFCE7] text-[#15803D]";
    case "Needs confirmation":
      return "bg-[#FFF3C4] text-[#92400E]";
    case "Needs clarification":
      return "bg-amber-100 text-amber-800";
    case "Didn't happen / Cancelled":
      return "bg-[#F1F3F6] text-[#5B636E]";
    case "In progress":
    default:
      return "bg-[#EFF6FF] text-[#1D4ED8]";
  }
}

interface PendingOutgoingMessage {
  tempId: string;
  conversationId: string;
  text: string;
  attachment?: {
    url: string;
    fileName: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    sizeBytes: number;
  };
  createdAt: string;
  status: "sending" | "failed";
  errorMessage?: string;
}

const REVIEW_TAG_OPTIONS = [
  "On time",
  "Item as described",
  "Easy campus meetup",
  "Fair communication",
];

function MessagesWorkspace() {
  const searchParams = useSearchParams();

  // Current user identity & optional role switcher for testing both sides of check-ins
  const [currentUser, setCurrentUser] = useState<ChatParticipantProfile>({
    id: "user-current-student",
    name: "Usman Ibrahim",
    subtitle: "Student · Ribadu Hall",
    isVerified: true,
    accountType: "student",
  });
  const [actAsOtherParticipant, setActAsOtherParticipant] = useState(false);

  // Left Column: Conversation List State
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | "unanswered" | "offers"
  >("all");
  const [showEmptyDemo, setShowEmptyDemo] = useState<boolean>(false);

  // Centre Column: Active Conversation & Message History State
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    "conv-tunde-calculator"
  );
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [activeConv, setActiveConv] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [messagePage, setMessagePage] = useState(1);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);

  // Right Column / Details Drawer & Card Collapse State
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [isContextCardCollapsed, setIsContextCardCollapsed] = useState(false);

  // Composer & Pending/Failed Queue
  const [composerText, setComposerText] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<{
    url: string;
    fileName: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    sizeBytes: number;
  } | null>(null);
  const [outgoingQueue, setOutgoingQueue] = useState<PendingOutgoingMessage[]>(
    []
  );

  // Optional Deal Tracking Form State
  const [showTrackDealForm, setShowTrackDealForm] = useState(false);
  const [dealPriceInput, setDealPriceInput] = useState("");
  const [dealTermsInput, setDealTermsInput] = useState("");
  const [dealMeetupDateInput, setDealMeetupDateInput] = useState("");
  const [isSavingDeal, setIsSavingDeal] = useState(false);

  // Optional Post-Exchange Review Form State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTags, setReviewTags] = useState<string[]>([
    "Item as described",
    "Easy campus meetup",
  ]);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Lightbox & Toast
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const entryContextProcessedRef = useRef<string | null>(null);

  const [isCounterpartTyping, setIsCounterpartTyping] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesRef = useRef<ChatMessageDTO[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const getAuthHeaders = useCallback((extra: Record<string, string> = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("campus_token") : null;
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  }, []);

  const effectiveActorId = useMemo(() => {
    if (actAsOtherParticipant && activeConv?.otherParticipant) {
      return activeConv.otherParticipant.id;
    }
    return currentUser.id;
  }, [actAsOtherParticipant, activeConv, currentUser.id]);

  // Fetch Conversation List
  const fetchConversations = useCallback(async () => {
    try {
      setListError(null);
      const apiFilter =
        activeFilter === "unanswered" ? "all" : activeFilter;
      const params = new URLSearchParams({
        q: searchQuery,
        filter: apiFilter,
      });
      const res = await fetch(
        `/api/messages/conversations?${params.toString()}`,
        {
          headers: getAuthHeaders({
            "x-campus-user-id": currentUser.id,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      if (data.currentUser) {
        setCurrentUser(data.currentUser);
      }
      const rawList: ConversationDTO[] = data.conversations || [];
      if (activeFilter === "unanswered") {
        setConversations(
          rawList.filter(
            (c) =>
              c.lastMessage &&
              c.lastMessage.senderId !== currentUser.id &&
              c.unreadCount > 0
          )
        );
      } else {
        setConversations(rawList);
      }
    } catch {
      setListError("Could not load conversations.");
    } finally {
      setIsLoadingList(false);
    }
  }, [searchQuery, activeFilter, currentUser.id, getAuthHeaders]);

  // Fetch Single Conversation + Messages
  const fetchConversationDetails = useCallback(
    async (convId: string, pageNum = 1, appendOlder = false) => {
      try {
        if (!appendOlder) setIsLoadingThread(true);
        setThreadError(null);

        const res = await fetch(
          `/api/messages/conversations/${encodeURIComponent(
            convId
          )}?page=${pageNum}&limit=50`,
          {
            headers: getAuthHeaders({
              "x-campus-user-id": currentUser.id,
            }),
          }
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to load conversation");
        }
        const data = await res.json();
        setActiveConv(data.conversation);
        setHasOlderMessages(Boolean(data.hasOlderMessages));
        setMessagePage(pageNum);

        if (appendOlder) {
          setMessages((prev) => [...(data.messages || []), ...prev]);
        } else {
          setMessages(data.messages || []);
        }

        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? data.conversation : c))
        );
      } catch (err: unknown) {
        setThreadError(
          err instanceof Error
            ? err.message
            : "Could not load conversation messages."
        );
      } finally {
        setIsLoadingThread(false);
      }
    },
    [currentUser.id]
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle Entry Points (Product, Service, Wanted/Radar, Store)
  useEffect(() => {
    const contextType = searchParams.get("contextType");
    const participantId = searchParams.get("participantId");
    const participantName = searchParams.get("participantName");
    const title = searchParams.get("title");

    if (!participantId || !participantName) return;

    const signature = `${participantId}:${contextType || ""}:${
      searchParams.get("contextId") || ""
    }`;
    if (entryContextProcessedRef.current === signature) return;
    entryContextProcessedRef.current = signature;

    const initiateContextualChat = async () => {
      try {
        setShowEmptyDemo(false);
        setIsLoadingThread(true);
        const res = await fetch("/api/messages/conversations", {
          method: "POST",
          headers: getAuthHeaders({
            "Content-Type": "application/json",
            "x-campus-user-id": currentUser.id,
          }),
          body: JSON.stringify({
            participantId,
            participantName,
            participantSubtitle:
              searchParams.get("participantSubtitle") || "Student · Campus",
            participantAvatar:
              searchParams.get("participantAvatar") || undefined,
            participantVerified:
              searchParams.get("participantVerified") !== "false",
            accountType:
              contextType === "store" ? "student_store" : "student",
            context: title
              ? {
                  contextType: contextType || "product",
                  contextId:
                    searchParams.get("contextId") || `ctx-${Date.now()}`,
                  title,
                  priceFormatted:
                    searchParams.get("price") || "Contact for price",
                  numericPrice: searchParams.get("numericPrice")
                    ? Number(searchParams.get("numericPrice"))
                    : undefined,
                  image: searchParams.get("image") || undefined,
                  status: searchParams.get("status") || "Available",
                  href: searchParams.get("href") || "/explore",
                }
              : undefined,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const conv: ConversationDTO = data.conversation;
          setSelectedConvId(conv.id);
          setMobileShowThread(true);
          await fetchConversations();
          await fetchConversationDetails(conv.id, 1, false);

          if (data.secondaryContextAttached) {
            showToast(
              `Attached "${title}" to your conversation with ${participantName} without replacing original context.`
            );
          }
        }
      } catch {
        showToast("Could not open contextual conversation.");
      } finally {
        setIsLoadingThread(false);
      }
    };

    initiateContextualChat();
  }, [
    searchParams,
    currentUser.id,
    fetchConversations,
    fetchConversationDetails,
    showToast,
    getAuthHeaders,
  ]);

  useEffect(() => {
    if (selectedConvId) {
      fetchConversationDetails(selectedConvId, 1, false);
      setActAsOtherParticipant(false);
      setShowTrackDealForm(false);
    } else {
      setActiveConv(null);
      setMessages([]);
    }
  }, [selectedConvId, fetchConversationDetails]);

  // Realtime subscription for incoming messages, typing events, and deal updates
  useEffect(() => {
    if (!activeConv?.id) return;

    const unsubscribe = subscribeToConversation(activeConv.id, {
      onMessage: ({ message, conversation }) => {
        setMessages((prev) => {
          // Deduplicate by message ID or clientMessageId
          if (
            prev.some(
              (m) =>
                m.id === message.id ||
                (m.clientMessageId &&
                  message.clientMessageId &&
                  m.clientMessageId === message.clientMessageId)
            )
          ) {
            return prev;
          }
          return [...prev, message];
        });

        if (conversation) {
          setActiveConv(conversation);
          setConversations((prev) => {
            const others = prev.filter((c) => c.id !== conversation.id);
            return [conversation, ...others];
          });
        }
      },
      onTyping: ({ userId, name, isTyping }) => {
        if (userId === currentUser.id) return;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        if (isTyping) {
          setIsCounterpartTyping(name || "Counterpart");
          typingTimeoutRef.current = setTimeout(() => {
            setIsCounterpartTyping(null);
          }, 3000);
        } else {
          setIsCounterpartTyping(null);
        }
      },
      onDealUpdate: (deal) => {
        if (deal) {
          setActiveConv((prev) => (prev ? { ...prev, activeDeal: deal } : prev));
        }
      },
      onOfferUpdate: (offer) => {
        if (offer) {
          setActiveConv((prev) => (prev ? { ...prev, activeOffer: offer } : prev));
        }
      },
    });

    return () => {
      unsubscribe();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [activeConv?.id, currentUser.id]);

  // Reconnect Recovery: Fetch any missed messages when socket reconnects
  useEffect(() => {
    const pusher = getRealtimeClient();
    if (!pusher || !activeConv?.id) return;

    const handleConnected = async () => {
      const currentList = messagesRef.current;
      const last = currentList[currentList.length - 1];
      if (last?.id) {
        try {
          const res = await fetch(
            `/api/messages/conversations/${encodeURIComponent(
              activeConv.id
            )}/messages?sinceId=${encodeURIComponent(last.id)}`,
            {
              headers: getAuthHeaders(),
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.messages) && data.messages.length > 0) {
              setMessages((prev) => {
                const existing = new Set(prev.map((m) => m.id));
                const additions = data.messages.filter(
                  (m: ChatMessageDTO) => !existing.has(m.id)
                );
                return additions.length > 0 ? [...prev, ...additions] : prev;
              });
            }
          }
        } catch {
          // Reconnect catch-up fallback
        }
      }
    };

    pusher.connection.bind("connected", handleConnected);
    return () => {
      pusher.connection.unbind("connected", handleConnected);
    };
  }, [activeConv?.id, getAuthHeaders]);

  useEffect(() => {
    if (messagePage === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, outgoingQueue.length, messagePage]);

  // Update Context Status (Available | Sold | Closed | Deal completed)
  const handleUpdateContextStatus = async (status: ContextWorkflowStatus) => {
    if (!activeConv) return;
    try {
      const res = await fetch(
        `/api/messages/conversations/${encodeURIComponent(activeConv.id)}`,
        {
          method: "PATCH",
          headers: getAuthHeaders({
            "Content-Type": "application/json",
            "x-campus-user-id": effectiveActorId,
          }),
          body: JSON.stringify({
            collapsed: activeConv.isBannerCollapsed,
            contextStatus: status,
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setActiveConv(data.conversation);
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConv.id ? data.conversation : c))
        );
        showToast(`Listing context updated to "${status}".`);
      }
    } catch {
      showToast("Could not update context status.");
    }
  };

  // Validate & Attach Image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      showToast("Only JPEG, PNG, WEBP, and GIF images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image exceeds the 5 MB limit.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPendingAttachment({
          url: reader.result,
          fileName: file.name,
          mimeType: file.type as
            | "image/jpeg"
            | "image/png"
            | "image/webp"
            | "image/gif",
          sizeBytes: file.size,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Send Message
  const sendMessagePayload = async (payload: {
    tempId: string;
    conversationId: string;
    text: string;
    attachment?: PendingOutgoingMessage["attachment"];
  }) => {
    try {
      const res = await fetch(
        `/api/messages/conversations/${encodeURIComponent(
          payload.conversationId
        )}/messages`,
        {
          method: "POST",
          headers: getAuthHeaders({
            "Content-Type": "application/json",
            "x-campus-user-id": effectiveActorId,
          }),
          body: JSON.stringify({
            text: payload.text,
            clientMessageId: payload.tempId,
            attachment: payload.attachment,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setOutgoingQueue((prev) =>
        prev.filter((item) => item.tempId !== payload.tempId)
      );
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
      if (data.conversation) {
        setActiveConv(data.conversation);
        setConversations((prev) => {
          const others = prev.filter((c) => c.id !== data.conversation.id);
          return [data.conversation, ...others];
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Delivery failed";
      setOutgoingQueue((prev) =>
        prev.map((item) =>
          item.tempId === payload.tempId
            ? { ...item, status: "failed", errorMessage }
            : item
        )
      );
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConv) return;

    const trimmed = composerText.trim();
    if (!trimmed && !pendingAttachment) return;

    const tempId = `client-msg-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const attachmentToSend = pendingAttachment || undefined;

    setComposerText("");
    setPendingAttachment(null);

    const pendingItem: PendingOutgoingMessage = {
      tempId,
      conversationId: activeConv.id,
      text: trimmed,
      attachment: attachmentToSend,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    setOutgoingQueue((prev) => [...prev, pendingItem]);

    await sendMessagePayload({
      tempId,
      conversationId: activeConv.id,
      text: trimmed,
      attachment: attachmentToSend,
    });
  };

  const handleRetryFailedMessage = async (item: PendingOutgoingMessage) => {
    setOutgoingQueue((prev) =>
      prev.map((q) =>
        q.tempId === item.tempId
          ? { ...q, status: "sending", errorMessage: undefined }
          : q
      )
    );
    await sendMessagePayload({
      tempId: item.tempId,
      conversationId: item.conversationId,
      text: item.text,
      attachment: item.attachment,
    });
  };

  const handleComposerKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Start Optional Deal Tracking
  const handleStartDealTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv) return;
    setIsSavingDeal(true);
    try {
      const res = await fetch(
        `/api/messages/conversations/${encodeURIComponent(
          activeConv.id
        )}/deal`,
        {
          method: "POST",
          headers: getAuthHeaders({
            "Content-Type": "application/json",
            "x-campus-user-id": effectiveActorId,
          }),
          body: JSON.stringify({
            agreedPriceFormatted:
              dealPriceInput || activeConv.context?.priceFormatted || "Agreed price",
            agreedTerms:
              dealTermsInput || "Meet on campus and inspect item",
            expectedMeetupDate: dealMeetupDateInput || "Today on campus",
          }),
        }
      );
      if (res.ok) {
        await fetchConversationDetails(activeConv.id, 1, false);
        await fetchConversations();
        setShowTrackDealForm(false);
        showToast("Deal tracking started! You can update progress anytime.");
      }
    } catch {
      showToast("Failed to start deal tracking.");
    } finally {
      setIsSavingDeal(false);
    }
  };

  // One-Tap Deal Tracking Response via Icons ("Completed" | "Didn't happen")
  const handleCheckInChoice = async (choice: CheckInResponseChoice) => {
    if (!activeConv) return;
    try {
      const res = await fetch(
        `/api/messages/conversations/${encodeURIComponent(
          activeConv.id
        )}/deal`,
        {
          method: "PATCH",
          headers: getAuthHeaders({
            "Content-Type": "application/json",
            "x-campus-user-id": effectiveActorId,
          }),
          body: JSON.stringify({ choice }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setActiveConv(data.conversation);
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConv.id ? data.conversation : c))
        );
        if (data.systemMessage) {
          setMessages((prev) => [...prev, data.systemMessage]);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }
      }
    } catch {
      showToast("Could not update deal status.");
    }
  };

  const activeConvQueue = useMemo(
    () =>
      outgoingQueue.filter(
        (item) => item.conversationId === activeConv?.id
      ),
    [outgoingQueue, activeConv?.id]
  );

  // Render Minimal Right Sidebar Content: Section Title + Collapse Button + Single Compact Card (Product Preview + Visit Icon + 2-Icon Deal Tracking)
  const renderContextSidebarContent = () => {
    if (!activeConv) return null;

    const ctx = activeConv.context;
    const deal = activeConv.trackedDeal;
    const myResponse = deal?.participantResponses?.[effectiveActorId];
    const isCompleted = myResponse === "Completed";
    const isIncomplete = myResponse === "Didn't happen";

    return (
      <div className="flex flex-col h-full">
        {/* Sidebar Section Header with Title + Collapse Sidebar Button */}
        <div className="hidden lg:flex px-4 py-3.5 border-b border-[#ECEEF2] dark:border-white/10 items-center justify-between shrink-0">
          <h3 className="text-[13.5px] font-extrabold text-[#171717] dark:text-white tracking-[-0.01em]">
            Deal context
          </h3>
          <button
            type="button"
            onClick={() => setIsRightSidebarCollapsed(true)}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="radius-native w-7 h-7 rounded-lg text-[#68707A] hover:text-[#171717] hover:bg-[#F7F8FA] dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>

        {/* Single Compact Card: Product Preview + Visit Icon + 2-Icon Deal Tracking */}
        <div className="p-3.5">
          <div className="radius-native rounded-xl bg-[#F7F8FA] dark:bg-white/[0.03] border border-[#ECEEF2] dark:border-white/10 p-3 space-y-2.5">
            {/* Top Row: Compact Product / Context Preview + Visit Icon Link */}
            <div className="flex items-center justify-between gap-2">
              {ctx ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  {ctx.image ? (
                    <img
                      src={ctx.image}
                      alt={ctx.title}
                      className="w-10 h-10 rounded-lg object-cover border border-[#E8E8E8] dark:border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-white/5 border border-[#E8E8E8] dark:border-white/10 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-[#68707A]" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <Link
                      href={ctx.href}
                      className="block text-[12.5px] font-bold text-[#171717] dark:text-white hover:underline truncate"
                    >
                      {ctx.title}
                    </Link>
                    <p className="text-[11.5px] font-extrabold text-[#68707A] dark:text-neutral-300 truncate">
                      {ctx.priceFormatted}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-[12px] font-semibold text-[#68707A]">
                  Direct chat
                </div>
              )}

              {ctx && (
                <Link
                  href={ctx.href}
                  title="View listing"
                  aria-label="View listing"
                  className="radius-native w-7 h-7 rounded-lg bg-white dark:bg-white/5 border border-[#E2E6EC] dark:border-white/10 hover:border-[#171717] flex items-center justify-center text-[#5B636E] hover:text-[#171717] dark:text-neutral-300 dark:hover:text-white shrink-0 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Bottom Row (Inside the Same Card): Minimal 2-Icon Deal Tracking */}
            <div className="pt-2.5 border-t border-[#ECEEF2] dark:border-white/10 flex items-center justify-between gap-2">
              <span className="text-[12px] font-bold text-[#171717] dark:text-white">
                Deal tracking
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCheckInChoice("Completed")}
                  title="Completed"
                  aria-label="Mark deal as completed"
                  className={`radius-native w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                    isCompleted
                      ? "bg-[#22C55E] border-[#22C55E] text-white"
                      : "bg-white dark:bg-[#14161D] border-[#E2E6EC] dark:border-white/10 text-[#5B636E] dark:text-neutral-300 hover:border-[#22C55E] hover:text-[#22C55E]"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleCheckInChoice("Didn't happen")}
                  title="Incomplete"
                  aria-label="Mark deal as incomplete"
                  className={`radius-native w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                    isIncomplete
                      ? "bg-[#171717] border-[#171717] text-white dark:bg-white dark:border-white dark:text-[#171717]"
                      : "bg-white dark:bg-[#14161D] border-[#E2E6EC] dark:border-white/10 text-[#5B636E] dark:text-neutral-300 hover:border-rose-500 hover:text-rose-500"
                  }`}
                >
                  <X className="w-3.5 h-3.5 stroke-[2.8]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased overflow-hidden"
    >
      {/* Global Campus Hive Top Navigation */}
      <RebrandHeader />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 radius-native bg-[#171717] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-[12.5px] font-semibold border border-white/10"
        >
          <Sparkles className="w-4 h-4 text-[#FFC928] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* FRAMED MESSENGER WORKSPACE (Maintains Consistent App Container Gap) */}
      {/* =================================================================== */}
      <div className="flex-1 w-full max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-5 sm:py-6 flex overflow-hidden">
        <div className="flex-1 flex w-full overflow-hidden rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 shadow-[0_2px_18px_rgba(15,23,42,0.04)] relative">
          {/* --------------------------------------------------------------- */}
          {/* COLUMN 1 (LEFT): STATIONARY CONVERSATIONS LIST                  */}
          {/* --------------------------------------------------------------- */}
          <aside
            aria-label="Conversations"
            className={`w-full lg:w-[320px] xl:w-[350px] shrink-0 flex flex-col border-r border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] h-full ${
              mobileShowThread ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Sidebar Header & Search */}
            <div className="px-5 pt-4 pb-0 shrink-0">
              <header className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-[18px] font-bold tracking-[-0.02em] text-[#171717] dark:text-white">
                    My messages
                  </h1>
                  {!showEmptyDemo &&
                    conversations.some((c) => c.unreadCount > 0) && (
                      <span className="radius-native px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#FFC928] text-[#171717]">
                        {conversations.reduce(
                          (acc, c) => acc + c.unreadCount,
                          0
                        )}
                      </span>
                    )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmptyDemo((prev) => {
                      const next = !prev;
                      if (next) {
                        setSelectedConvId(null);
                      }
                      return next;
                    });
                  }}
                  className="text-[11px] font-semibold text-[#68707A] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white underline cursor-pointer"
                >
                  {showEmptyDemo
                    ? `Sample chats (${conversations.length})`
                    : "Empty view"}
                </button>
              </header>

              {/* Rounded Search Input with Right Icon */}
              <div className="mt-3 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (showEmptyDemo && e.target.value.trim()) {
                      setShowEmptyDemo(false);
                    }
                  }}
                  placeholder="Search"
                  aria-label="Search conversations"
                  className="radius-native w-full pl-3.5 pr-9 py-2 rounded-xl bg-white dark:bg-white/5 border border-[#DCE1E7] dark:border-white/15 text-[13px] text-[#171717] dark:text-white placeholder:text-[#8C929C] focus:outline-none focus:border-[#FFC928]"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C929C] hover:text-[#171717]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <Search className="w-4 h-4 text-[#6C8EA0] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>

              {/* Status Tabs with Bottom Active Indicator */}
              <div className="mt-3.5 flex items-center gap-5 overflow-x-auto scrollbar-none border-b border-[#ECEEF2] dark:border-white/10">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "unread", label: "Unread" },
                    { id: "unanswered", label: "Unanswered" },
                    { id: "offers", label: "Tracked" },
                  ] as const
                ).map((tab) => {
                  const isActive = activeFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFilter(tab.id)}
                      className={`pb-2.5 text-[12.5px] font-semibold transition-colors relative shrink-0 cursor-pointer ${
                        isActive
                          ? "text-[#171717] dark:text-[#FFC928]"
                          : "text-[#68707A] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
                      }`}
                    >
                      <span>{tab.label}</span>
                      {isActive && (
                        <span className="absolute left-0 right-0 bottom-0 h-[2.5px] rounded-full bg-[#FFC928]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Conversations List or Empty State */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#F2F4F7] dark:divide-white/5 flex flex-col">
              {isLoadingList ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#ECEEF2] dark:bg-white/10 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/2 rounded bg-[#ECEEF2] dark:bg-white/10" />
                        <div className="h-2.5 w-3/4 rounded bg-[#ECEEF2] dark:bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : listError ? (
                <div className="p-6 text-center space-y-2 m-auto">
                  <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
                  <p className="text-[12.5px] font-semibold">{listError}</p>
                  <button
                    type="button"
                    onClick={fetchConversations}
                    className="px-3 py-1 rounded-lg bg-[#FFC928] text-[#171717] text-[11.5px] font-bold"
                  >
                    Retry
                  </button>
                </div>
              ) : showEmptyDemo || conversations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  {/* Layered Speech Bubbles Illustration */}
                  <div className="w-[176px] h-[176px] rounded-full bg-[#F1F5F8] dark:bg-white/[0.04] flex items-center justify-center relative">
                    <svg
                      viewBox="0 0 180 180"
                      className="w-[150px] h-[150px]"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      {/* Back Speech Bubble */}
                      <rect
                        x="22"
                        y="38"
                        width="96"
                        height="68"
                        rx="18"
                        className="fill-[#CBD8E3] dark:fill-white/15"
                      />
                      <path
                        d="M38 104L28 122L54 106H38Z"
                        className="fill-[#CBD8E3] dark:fill-white/15"
                      />
                      <rect
                        x="38"
                        y="56"
                        width="62"
                        height="6"
                        rx="3"
                        className="fill-white/90 dark:fill-white/60"
                      />
                      <rect
                        x="38"
                        y="69"
                        width="50"
                        height="6"
                        rx="3"
                        className="fill-white/90 dark:fill-white/60"
                      />
                      <rect
                        x="38"
                        y="82"
                        width="38"
                        height="6"
                        rx="3"
                        className="fill-white/90 dark:fill-white/60"
                      />

                      {/* Front Speech Bubble */}
                      <rect
                        x="78"
                        y="76"
                        width="80"
                        height="54"
                        rx="16"
                        className="fill-[#AEBECB] dark:fill-white/25"
                      />
                      <path
                        d="M142 128L152 142L128 128H142Z"
                        className="fill-[#AEBECB] dark:fill-white/25"
                      />
                      <circle cx="101" cy="103" r="5.5" fill="white" />
                      <circle cx="118" cy="103" r="5.5" fill="white" />
                      <circle cx="135" cy="103" r="5.5" fill="white" />
                    </svg>
                  </div>

                  <p className="mt-4 max-w-[205px] text-[14px] font-medium text-[#3B4148] dark:text-neutral-300 leading-snug">
                    Here you&apos;ll find all your chats with Campus Hive users
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = conv.id === selectedConvId;
                  const other = conv.otherParticipant;
                  const hasUnread = conv.unreadCount > 0;

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => {
                        setSelectedConvId(conv.id);
                        setMobileShowThread(true);
                      }}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#FFFBEB] dark:bg-[#FFC928]/10 border-l-[3px] border-l-[#FFC928]"
                          : "hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03]"
                      }`}
                    >
                      {other.avatar ? (
                        <img
                          src={other.avatar}
                          alt={other.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#E8E8E8] dark:border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#FFE182] text-[#171717] font-extrabold text-[13.5px] flex items-center justify-center shrink-0">
                          {other.name.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 min-w-0">
                            <span
                              className={`text-[13px] truncate ${
                                hasUnread
                                  ? "font-extrabold text-[#171717] dark:text-white"
                                  : "font-bold text-[#171717] dark:text-white"
                              }`}
                            >
                              {other.name}
                            </span>
                            {other.isVerified &&
                              (other.accountType === "student" ||
                                other.accountType === "student_store") && (
                                <BadgeCheck
                                  className="w-4 h-4 text-[#171717] fill-[#FFC928] shrink-0"
                                  aria-label="Verified student seller"
                                />
                              )}
                          </div>

                          <span className="text-[10.5px] text-[#8C929C] shrink-0">
                            {conv.lastMessage
                              ? formatSidebarTime(conv.lastMessage.createdAt)
                              : ""}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p
                            className={`text-[11.5px] truncate ${
                              hasUnread
                                ? "font-bold text-[#171717] dark:text-white"
                                : "text-[#68707A] dark:text-neutral-400"
                            }`}
                          >
                            {conv.lastMessage?.text || "No messages yet"}
                          </p>

                          {hasUnread && (
                            <span className="radius-native min-w-[17px] h-[17px] px-1 rounded-full bg-[#FFC928] text-[#171717] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* --------------------------------------------------------------- */}
          {/* COLUMN 2 (CENTRE): ACTIVE CONVERSATION OR EMPTY/UNSELECTED VIEW */}
          {/* --------------------------------------------------------------- */}
          <section
            aria-label="Active conversation"
            className={`flex-1 flex flex-col min-w-0 h-full bg-[#F2F4F7] dark:bg-[#101218] ${
              mobileShowThread ? "flex" : "hidden lg:flex"
            }`}
          >
            {!activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="max-w-sm">
                  <div className="text-[15px] text-[#3B4148] dark:text-neutral-200 leading-relaxed">
                    <div>
                      {showEmptyDemo || conversations.length === 0
                        ? "You have no messages yet."
                        : "Select a conversation to start messaging."}
                    </div>
                    <div className="mt-0.5">
                      <Link
                        href="/explore"
                        className="font-bold text-[#B45309] dark:text-[#FFC928] hover:underline"
                      >
                        Find things
                      </Link>{" "}
                      to discuss or sell something
                    </div>
                  </div>

                  <div className="mt-7">
                    <Link
                      href="/sell"
                      className="radius-native inline-flex items-center justify-center min-w-[190px] px-6 py-2.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-extrabold text-[13.5px] shadow-xs transition-colors"
                    >
                      List your product
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
            <>
              {/* 1. Participant Header */}
              <div className="px-4 sm:px-5 py-3 border-b border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileShowThread(false)}
                    aria-label="Back to conversation list"
                    className="lg:hidden p-1.5 -ml-1 rounded-full text-[#171717] dark:text-white hover:bg-[#F7F8FA]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <Link
                    href={getParticipantProfileHref(activeConv.otherParticipant)}
                    className="shrink-0"
                  >
                    {activeConv.otherParticipant.avatar ? (
                      <img
                        src={activeConv.otherParticipant.avatar}
                        alt={activeConv.otherParticipant.name}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-[#E8E8E8]"
                      />
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFE182] text-[#171717] font-extrabold text-[14px] flex items-center justify-center">
                        {activeConv.otherParticipant.name.charAt(0)}
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={getParticipantProfileHref(activeConv.otherParticipant)}
                        className="text-[14.5px] sm:text-[15px] font-extrabold text-[#171717] dark:text-white hover:underline truncate"
                      >
                        {activeConv.otherParticipant.name}
                      </Link>
                      {activeConv.otherParticipant.isVerified &&
                        (activeConv.otherParticipant.accountType ===
                          "student" ||
                          activeConv.otherParticipant.accountType ===
                            "student_store") && (
                          <BadgeCheck
                            className="w-4 h-4 text-[#171717] fill-[#FFC928] shrink-0"
                            aria-label="Verified student seller"
                          />
                        )}
                    </div>
                    <p className="text-[11.5px] text-[#68707A] dark:text-neutral-400 truncate">
                      {activeConv.otherParticipant.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Header Controls: Perspective Switcher + Context Drawer Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActAsOtherParticipant((prev) => !prev);
                      showToast(
                        !actAsOtherParticipant
                          ? `Switched to ${activeConv.otherParticipant.name}'s view for testing`
                          : `Switched back to your view (${currentUser.name})`
                      );
                    }}
                    className={`radius-native px-2.5 py-1.5 rounded-xl border text-[11.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      actAsOtherParticipant
                        ? "bg-[#171717] text-[#FFC928] border-[#171717]"
                        : "bg-[#F7F8FA] dark:bg-white/5 border-[#E8E8E8] dark:border-white/10 text-[#4A5058] dark:text-neutral-300 hover:border-[#171717]"
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {actAsOtherParticipant
                        ? `Viewing as ${
                            activeConv.otherParticipant.name.split(" ")[0]
                          }`
                        : `Simulate ${
                            activeConv.otherParticipant.name.split(" ")[0]
                          }`}
                    </span>
                  </button>

                  {/* Toggle Right Context Sidebar on Desktop (lg+) */}
                  <button
                    type="button"
                    onClick={() => setIsRightSidebarCollapsed((prev) => !prev)}
                    title={
                      isRightSidebarCollapsed
                        ? "Expand context sidebar"
                        : "Collapse context sidebar"
                    }
                    aria-label={
                      isRightSidebarCollapsed
                        ? "Expand context sidebar"
                        : "Collapse context sidebar"
                    }
                    className="hidden lg:flex radius-native w-8 h-8 rounded-xl border border-[#E8E8E8] dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#171717] text-[#171717] dark:text-white items-center justify-center transition-colors cursor-pointer"
                  >
                    {isRightSidebarCollapsed ? (
                      <PanelRightOpen className="w-4 h-4" />
                    ) : (
                      <PanelRightClose className="w-4 h-4" />
                    )}
                  </button>

                  {/* Toggle Context Details Drawer on Mobile / Tablet (<lg) */}
                  <button
                    type="button"
                    onClick={() => setIsDetailsDrawerOpen((prev) => !prev)}
                    aria-label="Toggle context details panel"
                    className="lg:hidden radius-native px-2.5 py-1.5 rounded-xl border border-[#E8E8E8] dark:border-white/10 bg-white dark:bg-white/5 text-[11.5px] font-bold text-[#171717] dark:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    {isDetailsDrawerOpen ? (
                      <PanelRightClose className="w-4 h-4" />
                    ) : (
                      <PanelRightOpen className="w-4 h-4" />
                    )}
                    <span>Details</span>
                  </button>
                </div>
              </div>

              {/* 2. Mobile-Only Compact Contextual Reference Banner */}
              {activeConv.context && (
                <div className="lg:hidden px-4 sm:px-5 py-2.5 border-b border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#161922] flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {activeConv.context.image ? (
                      <img
                        src={activeConv.context.image}
                        alt={activeConv.context.title}
                        className="w-9 h-9 rounded-lg object-cover border border-[#E8E8E8] shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-[#F7F8FA] dark:bg-white/5 border border-[#E8E8E8] flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-[#68707A]" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link
                          href={activeConv.context.href}
                          className="text-[12.5px] font-bold text-[#171717] dark:text-white hover:underline truncate"
                        >
                          {activeConv.context.title}
                        </Link>
                        <span className="text-[12px] font-extrabold text-[#68707A] dark:text-neutral-300 shrink-0">
                          · {activeConv.context.priceFormatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={activeConv.context.href}
                    aria-label="View listing"
                    className="radius-native w-7 h-7 rounded-lg bg-[#F7F8FA] dark:bg-white/5 border border-[#E2E6EC] flex items-center justify-center text-[#5B636E] shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* 3. Independently Scrollable Message History */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3.5">
                {hasOlderMessages && (
                  <div className="text-center pb-2">
                    <button
                      type="button"
                      onClick={() =>
                        fetchConversationDetails(
                          activeConv.id,
                          messagePage + 1,
                          true
                        )
                      }
                      className="radius-native px-3.5 py-1 rounded-full bg-white dark:bg-white/5 border border-[#E8E8E8] text-[11.5px] font-semibold text-[#5B636E] cursor-pointer"
                    >
                      Load earlier messages
                    </button>
                  </div>
                )}

                {isLoadingThread ? (
                  <div className="py-12 text-center text-[13px] text-[#8C929C]">
                    Loading messages...
                  </div>
                ) : threadError ? (
                  <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2">
                    <p className="text-[12.5px] font-bold text-rose-700">
                      {threadError}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        fetchConversationDetails(activeConv.id, 1, false)
                      }
                      className="px-3 py-1 rounded-lg bg-rose-600 text-white text-[11.5px] font-bold"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isMine = msg.senderId === effectiveActorId;

                      if (msg.type === "system") {
                        return (
                          <div key={msg.id} className="flex justify-center my-2">
                            <span className="radius-native px-3 py-1 rounded-full bg-[#F1F3F6] dark:bg-white/10 text-[11px] font-semibold text-[#5B636E] dark:text-neutral-300">
                              {msg.text} · {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            isMine ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`radius-native max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
                              isMine
                                ? "bg-[#FFF3C4] text-[#171717] border border-[#FDE68A]/70 rounded-br-md"
                                : "bg-white dark:bg-[#181B24] text-[#171717] dark:text-white border border-[#ECEEF2] dark:border-white/10 rounded-bl-md shadow-[0_1px_3px_rgba(15,23,42,0.02)]"
                            }`}
                          >
                            {msg.attachedContext && (
                              <Link
                                href={msg.attachedContext.href}
                                className="radius-native mb-2 p-2 rounded-xl bg-white/80 dark:bg-black/20 border border-[#E8E8E8] flex items-center gap-2.5 hover:border-[#FFC928]"
                              >
                                {msg.attachedContext.image && (
                                  <img
                                    src={msg.attachedContext.image}
                                    alt={msg.attachedContext.title}
                                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#8C929C]">
                                    {msg.attachedContext.label}
                                  </span>
                                  <span className="block text-[11.5px] font-bold truncate">
                                    {msg.attachedContext.title} ·{" "}
                                    {msg.attachedContext.priceFormatted}
                                  </span>
                                </div>
                              </Link>
                            )}

                            {msg.attachment && (
                              <div className="mb-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setLightboxImageUrl(msg.attachment!.url)
                                  }
                                  className="radius-native block rounded-xl overflow-hidden border border-black/10 max-h-56 cursor-pointer"
                                >
                                  <img
                                    src={msg.attachment.url}
                                    alt={msg.attachment.fileName}
                                    className="max-h-56 w-auto object-cover"
                                  />
                                </button>
                              </div>
                            )}

                            {msg.text && (
                              <p className="whitespace-pre-wrap break-words">
                                {msg.text}
                              </p>
                            )}
                          </div>

                          <span className="mt-1 px-1 text-[10.5px] text-[#8C929C]">
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                      );
                    })}

                    {/* Pending / Failed Outgoing Messages */}
                    {activeConvQueue.map((pending) => (
                      <div
                        key={pending.tempId}
                        className="flex flex-col items-end"
                      >
                        <div
                          className={`radius-native max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-[13.5px] bg-[#FFF3C4]/80 text-[#171717] border ${
                            pending.status === "failed"
                              ? "border-rose-400"
                              : "border-[#FDE68A]"
                          }`}
                        >
                          {pending.attachment && (
                            <img
                              src={pending.attachment.url}
                              alt={pending.attachment.fileName}
                              className="max-h-48 rounded-xl mb-2 object-cover"
                            />
                          )}
                          <p className="whitespace-pre-wrap break-words">
                            {pending.text}
                          </p>
                        </div>

                        <div className="mt-1 px-1 flex items-center gap-2 text-[10.5px]">
                          {pending.status === "sending" ? (
                            <span className="text-[#8C929C]">Sending...</span>
                          ) : (
                            <div className="flex items-center gap-2 text-rose-600 font-semibold">
                              <span>
                                {pending.errorMessage || "Failed to send"}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRetryFailedMessage(pending)
                                }
                                className="inline-flex items-center gap-1 underline cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Retry
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* 4. Bottom-Anchored Message Composer */}
              <div className="p-3.5 sm:px-5 sm:py-3.5 border-t border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] shrink-0">
                {pendingAttachment && (
                  <div className="mb-2.5 p-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#E8E8E8] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={pendingAttachment.url}
                        alt={pendingAttachment.fileName}
                        className="w-10 h-10 rounded-lg object-cover border border-[#E8E8E8]"
                      />
                      <div className="min-w-0">
                        <p className="text-[11.5px] font-bold truncate">
                          {pendingAttachment.fileName}
                        </p>
                        <p className="text-[10px] text-[#8C929C]">
                          {(pendingAttachment.sizeBytes / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingAttachment(null)}
                      className="p-1 text-[#8C929C] hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {isCounterpartTyping && (
                  <div className="px-4 py-1.5 text-xs text-[#717680] dark:text-neutral-400 flex items-center gap-1.5 animate-pulse bg-white/70 dark:bg-[#111318]/70 border-t border-[#ECEEF2] dark:border-white/10">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FFC928]" />
                    <span>{isCounterpartTyping} is typing...</span>
                  </div>
                )}

                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2.5"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach image"
                    aria-label="Attach image"
                    className="radius-native w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F7F8FA] dark:bg-white/5 border border-[#E8E8E8] dark:border-white/10 hover:border-[#171717] flex items-center justify-center text-[#5B636E] dark:text-neutral-300 shrink-0 transition-colors cursor-pointer"
                  >
                    <ImagePlus className="w-4 h-4" />
                  </button>

                  <div className="flex-1 relative">
                    <textarea
                      rows={1}
                      value={composerText}
                      onChange={(e) => {
                        setComposerText(e.target.value);
                        if (activeConv?.id) {
                          sendTypingIndicator(
                            activeConv.id,
                            { userId: currentUser.id, name: currentUser.name },
                            true
                          );
                        }
                      }}
                      onKeyDown={handleComposerKeyDown}
                      placeholder={`Message ${
                        activeConv.otherParticipant.name.split(" ")[0]
                      }...`}
                      className="radius-native w-full py-2.5 px-4 rounded-full bg-[#F7F8FA] dark:bg-white/5 border border-[#E8E8E8] dark:border-white/10 text-[13.5px] text-[#171717] dark:text-white placeholder:text-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:bg-white dark:focus:bg-[#181B24] resize-none leading-snug max-h-24 overflow-y-auto"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!composerText.trim() && !pendingAttachment}
                    aria-label="Send message"
                    className="radius-native w-10 h-10 rounded-full bg-[#FFC928] hover:bg-[#F2BD1E] disabled:opacity-45 disabled:cursor-not-allowed text-[#171717] flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4 stroke-[2.3]" />
                  </button>
                </form>
              </div>
            </>
          )}
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* COLUMN 3 (RIGHT): STATIONARY CONTEXT & DEAL TRACKING SIDEBAR      */}
        {/* Visible stationary on lg+; opens as Sheet/Drawer on smaller widths*/}
        {/* ----------------------------------------------------------------- */}
        {activeConv && !isRightSidebarCollapsed && (
          <aside
            aria-label="Conversation context and deal tracking"
            className="hidden lg:flex lg:w-[250px] xl:w-[275px] shrink-0 flex-col border-l border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] h-full overflow-y-auto"
          >
            {renderContextSidebarContent()}
          </aside>
        )}

        {/* Responsive Slide-Over Context Details Sheet / Drawer (<lg & Mobile) */}
        {activeConv && isDetailsDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs">
            <div className="w-full max-w-[360px] bg-white dark:bg-[#14161D] h-full overflow-y-auto shadow-2xl flex flex-col">
              <div className="px-4 py-3.5 border-b border-[#ECEEF2] dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-[#14161D] z-10">
                <h3 className="text-[14px] font-extrabold text-[#171717] dark:text-white">
                  Context &amp; Deal Details
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDetailsDrawerOpen(false)}
                  className="p-1 rounded-full text-[#8C929C] hover:text-[#171717]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderContextSidebarContent()}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxImageUrl && (
        <div
          onClick={() => setLightboxImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <img
            src={lightboxImageUrl}
            alt="Full attachment preview"
            className="max-w-full max-h-[88vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#F7F8FA] text-[#171717] text-sm font-semibold">
          Loading Campus Hive Messages...
        </div>
      }
    >
      <MessagesWorkspace />
    </Suspense>
  );
}
