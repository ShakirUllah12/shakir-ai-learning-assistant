import mongoose from "mongoose";

const cardItemSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  isStarred: {
    type: Boolean,
    default: false,
  },
  lastReviewed: {
    type: Date,
  },
});

const flashcardSetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    cards: [cardItemSchema],
  },
  { timestamps: true }
);

const FlashcardSet = mongoose.model("FlashcardSet", flashcardSetSchema);
export default FlashcardSet;
