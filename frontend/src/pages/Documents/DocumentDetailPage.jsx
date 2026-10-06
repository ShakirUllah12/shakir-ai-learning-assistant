import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tabs";
import ChatInterface from "../../components/chat/ChatInterface";
import AIActions from "../../components/ai/AIActions";
import FlashcardManager from "../../components/flashcards/FlashcardManager";
import QuizManager from "../../components/quizzes/QuizManager";
import { BASE_URL } from "../../utils/apiPath";

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Content");

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      setLoading(true);
      try {
        const data = await documentService.getDocumentById(id);
        console.log("Document fetched successfully:", data);
        setDocument(data);
      } catch (error) {
        console.error("Error fetching document:", error);
        const errorMsg =
          error.error || error.message || "Failed to fetch document details";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchDocumentDetails();
    }
  }, [id]);

  // Helper function to get the full PDF URL
  const getPdfUrl = () => {
    // Support both response format { success, data: {...} } and direct {...}
    const docData = document?.data || document;

    if (!docData?.fileUrl && !docData?.filePath) {
      console.warn("No file path or URL found in document:", docData);
      return null;
    }

    const filePath = docData.fileUrl || docData.filePath;

    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }

    return `${BASE_URL}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    const docData = document?.data || document;

    if (!docData?.fileUrl && !docData?.filePath) {
      return <div className="text-center p-8 text-slate-500">PDF preview not available.</div>;
    }

    const pdfUrl = getPdfUrl();

    return (
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300">
          <span className="text-sm font-medium text-gray-700">
            Document Viewer
          </span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ExternalLink
              size={16}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors mr-1"
            />
            Open in new tab
          </a>
        </div>
        <div className="bg-gray-100 p-1">
          <iframe
            src={pdfUrl}
            className="w-full h-[70vh] bg-white rounded border border-gray-300"
            title="PDF Viewer"
            frameBorder="0"
            style={{ colorScheme: "light" }}
          />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return (
      <ChatInterface
        documentId={id}
        documentTitle={document?.data?.title || document?.title}
      />
    );
  };

  const renderAiActions = () => {
    return (
      <AIActions
        documentId={id}
        documentTitle={document?.data?.title || document?.title}
      />
    );
  };

  const renderFlashCardsTab = () => {
    return <FlashcardManager documentId={id} />;
  };

  const renderQuzzesTab = () => {
    return <QuizManager documentId={id} />;
  };

  const tabs = [
    { name: "Content", label: "Content", content: renderContent() },
    { name: "Chat", label: "Chat", content: renderChat() },
    { name: "AI Actions", label: "AI Actions", content: renderAiActions() },
    { name: "Flashcards", label: "Flashcards", content: renderFlashCardsTab() },
    { name: "Quizzes", label: "Quizzes", content: renderQuzzesTab() },
  ];

  if (loading) {
    return <Spinner />;
  }

  if (!document) {
    return <div className="text-center p-8">Document not found.</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </Link>
      </div>
      <PageHeader title={document?.data?.title || document?.title || "Document Details"} />
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default DocumentDetailPage;
