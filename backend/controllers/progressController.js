import Document from "../models/Document.js";
import FlashcardSet from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalDocuments, flashcardSets, totalQuizzes, recentDocs, recentQuizzes] =
      await Promise.all([
        Document.countDocuments({ userId }),
        FlashcardSet.find({ userId }),
        Quiz.countDocuments({ userId }),
        Document.find({ userId }).sort({ updatedAt: -1 }).limit(5),
        Quiz.find({ userId }).sort({ updatedAt: -1 }).limit(5),
      ]);

    const totalFlashcards = flashcardSets.reduce(
      (sum, set) => sum + (set.cards ? set.cards.length : 0),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          totalFlashcards,
          totalQuizzes,
        },
        recentActivity: {
          documents: recentDocs,
          quizzes: recentQuizzes,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
