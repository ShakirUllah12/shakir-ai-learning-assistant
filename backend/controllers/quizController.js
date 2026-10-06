import Quiz from "../models/Quiz.js";
import Document from "../models/Document.js";

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      documentId: req.params.documentId,
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    let correctCount = 0;
    quiz.userAnswers = answers;

    quiz.questions.forEach((q, idx) => {
      const submitted = answers.find((a) => a.questionIndex === idx);
      if (submitted && submitted.selectedAnswer === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    quiz.score = score;
    quiz.isCompleted = true;
    quiz.completedAt = new Date();
    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: { score, quizId: quiz._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("documentId", "title");

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const detailedResults = quiz.questions.map((q, idx) => {
      const userAnswer = quiz.userAnswers.find((a) => a.questionIndex === idx);
      const isCorrect = userAnswer && userAnswer.selectedAnswer === q.correctAnswer;

      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        selectedAnswer: userAnswer ? userAnswer.selectedAnswer : null,
        isCorrect,
        explanation: q.explanation,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          score: quiz.score,
          document: quiz.documentId || { _id: quiz.documentId, title: "Document" },
        },
        results: detailedResults,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    const doc = await Document.findById(quiz.documentId);
    if (doc) {
      doc.quizCount = Math.max(0, (doc.quizCount || 0) - 1);
      await doc.save();
    }

    res.status(200).json({ success: true, message: "Quiz deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
