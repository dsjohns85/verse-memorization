import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { VerseService } from '../services/verseService';

const verseService = new VerseService();

export const createVerse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reference, text, translation } = req.body;
    const userId = req.user!.id;

    const verse = await verseService.createVerse({
      reference,
      text,
      translation,
      userId,
    });

    res.status(201).json(verse);
  } catch (error) {
    next(error);
  }
};

export const getVerses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const verses = await verseService.getVersesByUser(userId);
    res.json(verses);
  } catch (error) {
    next(error);
  }
};

export const getVerse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const verse = await verseService.getVerseById(id, userId);
    res.json(verse);
  } catch (error) {
    next(error);
  }
};

export const getVersesDue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const verses = await verseService.getVersesDueForReview(userId);
    res.json(verses);
  } catch (error) {
    next(error);
  }
};

export const updateVerse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reference, text, translation } = req.body;
    const userId = req.user!.id;

    const verse = await verseService.updateVerse(id, userId, {
      reference,
      text,
      translation,
    });

    res.json(verse);
  } catch (error) {
    next(error);
  }
};

export const deleteVerse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await verseService.deleteVerse(id, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getVerseStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const stats = await verseService.getVerseStats(userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
