import FlashcardSet from "../models/Flashcard.js";
import Document from "../models/Document.js";

export const getAllFlashCardSets = async (req, res) => {
  try {
    const sets = await FlashcardSet.find({ userId: req.user.id })
      .populate("documentId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: sets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFlashCards = async (req, res) => {
  try {
    const sets = await FlashcardSet.find({
      documentId: req.params.documentId,
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: sets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewFlashcard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const set = await FlashcardSet.findOne({
      userId: req.user.id,
      "cards._id": cardId,
    });

    if (!set) {
      return res.status(404).json({ success: false, message: "Flashcard not found" });
    }

    const card = set.cards.id(cardId);
    if (card) {
      card.lastReviewed = new Date();
      await set.save();
    }

    res.status(200).json({ success: true, message: "Flashcard reviewed", data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleStarFlashcard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const set = await FlashcardSet.findOne({
      userId: req.user.id,
      "cards._id": cardId,
    });

    if (!set) {
      return res.status(404).json({ success: false, message: "Flashcard not found" });
    }

    const card = set.cards.id(cardId);
    if (card) {
      card.isStarred = !card.isStarred;
      await set.save();
    }

    res.status(200).json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFlashcardSet = async (req, res) => {
  try {
    const set = await FlashcardSet.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!set) {
      return res.status(404).json({ success: false, message: "Flashcard set not found" });
    }

    await FlashcardSet.findByIdAndDelete(req.params.id);

    // Update document card count
    const doc = await Document.findById(set.documentId);
    if (doc) {
      doc.flashcardCount = Math.max(0, (doc.flashcardCount || 0) - set.cards.length);
      await doc.save();
    }

    res.status(200).json({ success: true, message: "Flashcard set deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
