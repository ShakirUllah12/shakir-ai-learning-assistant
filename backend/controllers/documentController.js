import Document from "../models/Document.js";
import FlashcardSet from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import fs from "fs/promises";
import path from "path";

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a PDF file" });
    }

    const { title } = req.body;
    const filePath = req.file.path.replace(/\\/g, "/");
    const fileUrl = `/uploads/${path.basename(filePath)}`;

    let extractedText = "";
    let pageCount = 1;

    try {
      const pdfData = await extractTextFromPDF(req.file.path);
      extractedText = pdfData.text || "";
      pageCount = pdfData.numPages || 1;
    } catch (parseError) {
      console.warn("PDF extraction warning:", parseError.message);
    }

    const doc = await Document.create({
      userId: req.user.id,
      title: title || req.file.originalname.replace(/\.[^/.]+$/, ""),
      filePath,
      fileUrl,
      fileSize: req.file.size,
      extractedText,
      pageCount,
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    doc.lastAccessed = new Date();
    await doc.save();

    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Try deleting the physical file
    try {
      if (doc.filePath) {
        await fs.unlink(path.resolve(doc.filePath));
      }
    } catch {
      // ignore file deletion errors
    }

    // Cascade delete associated study materials
    await FlashcardSet.deleteMany({ documentId: doc._id });
    await Quiz.deleteMany({ documentId: doc._id });
    await ChatHistory.deleteMany({ documentId: doc._id });
    await Document.findByIdAndDelete(doc._id);

    res.status(200).json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
