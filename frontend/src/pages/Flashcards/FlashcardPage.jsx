import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";

import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Flashcard from "../../components/flashcards/Flashcard";

const FlashcardPage = () => {
  const navigate = useNavigate();
  const { id: documentId } = useParams();
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchFlashcards = async () => {
    try {
      const response =
        await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSet(response.data[0]);
      setFlashcards(response?.data[0]?.cards || []);
    } catch (error) {
      toast.error("Failed to fetch flashcards");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [documentId]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);

    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully");
      fetchFlashcards();
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    if (flashcards.length === 0) return;
    handleReview(currentCardIndex);
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    if (flashcards.length === 0) return;
    handleReview(currentCardIndex);
    setCurrentCardIndex(
      (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length,
    );
  };

  const handleReview = async (index) => {
    const currentCard = flashcards[index !== undefined ? index : currentCardIndex];
    if (!currentCard || !currentCard._id) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
    } catch (error) {
      console.error("Failed to review flashcard:", error);
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card,
        ),
      );
      toast.success("Flashcard starred status updated!");
    } catch (error) {
      toast.error("Failed to update starred status");
      console.error(error);
    }
  };

  const handleDeleteFlashcardSets = async () => {
    if (!flashcardSet || !flashcardSet._id) {
      toast.error("No flashcard set to delete");
      return;
    }
    setDeleting(true);
    console.log("flashcardSet:", flashcardSet);

    try {
      await flashcardService.deleteFlashcardSet(flashcardSet._id);
      toast.success("Flashcard set deleted successfully!");
      setIsDeleteModalOpen(false);
      fetchFlashcards(); // refetch to show empty state
    } catch (error) {
      toast.error(error.message || "Failed to delete flashcard set");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const renderFlashcardContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcards.length === 0) {
      return (
        <EmptyState
          title={"No flashcards Yet"}
          description={
            "Generate flashcards from your document to start learning."
          }
        />
      );
    }

    const currentCard = flashcards[currentCardIndex];

    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-md">
          <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handlePrevCard}
            variant="secondary"
            disabled={currentCardIndex <= 0}
          >
            <ChevronLeft size={16} /> Previous
          </Button>
          <span className="text-sm text-neutral-600 font-medium">
            {currentCardIndex + 1} / {flashcards.length}
          </span>
          <Button
            onClick={handleNextCard}
            variant="secondary"
            disabled={currentCardIndex >= flashcards.length - 1}
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <Link
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          to={`/documents/${documentId}`}
        >
          <ArrowLeft size={16} /> Back to Document
        </Link>
      </div>
      <PageHeader title={"Flashcards"}>
        <div className="flex gap-2">
          {!loading &&
            (flashcards.length > 0 ? (
              <>
                <Button
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={deleting}
                >
                  <Trash2 size={16} /> Delete Set
                </Button>
              </>
            ) : (
              <Button onClick={handleGenerateFlashcards} disabled={generating}>
                {generating ? (
                  <Spinner />
                ) : (
                  <>
                    <Plus size={16} /> Generate Flashcards
                  </>
                )}
              </Button>
            ))}
        </div>
      </PageHeader>

      {renderFlashcardContent()}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={"Confirm Delete Falshcard Set"}
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete this flashcard set? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500 "
              onClick={handleDeleteFlashcardSets}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FlashcardPage;
