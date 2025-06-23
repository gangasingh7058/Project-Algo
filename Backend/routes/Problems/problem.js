import express, { Router } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const route = Router();
const jwtpasskey = process.env.JWT_PASSKEY;
const prisma = new PrismaClient();

// Get all problems
route.get('/problems', async (req, res) => {
    try {
        const problems = await prisma.problem.findMany();
        res.json({
            success: true,
            problems: problems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get a single problem by ID
route.get('/problems/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const problem = await prisma.problem.findUnique({
            where: { id: id },
            include: {
                testCases: true,
                comments: true
            }
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        res.json({
            success: true,
            problem: problem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


// Create a problem (only for admins)
route.post('/problems', async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.json({
      success: false,
      message: "Send both Title and Description"
    });
  }

  try {
    const createdProblem = await prisma.problem.create({
      data: {
        title: title,
        description: description
      }
    });

    res.json({
      success: true,
      message: "Problem created successfully",
      problem: createdProblem
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating problem",
      error: error.message
    });
  }
});




// Comments

// Create Comment
route.post('/comments', async (req, res) => {
  const { title, body, problemId, userId } = req.body;

  if (!title || !body || !problemId || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please provide title, body, problemId, and userId"
    });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        title,
        body,
        problemId,
        userId
      }
    });

    res.json({
      success: true,
      message: "Comment created successfully",
      comment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message
    });
  }
});


// get comments
route.get('/comments/problem/:problemId', async (req, res) => {
  const { problemId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { problemId },
      include: { user: true }
    });

    res.json({
      success: true,
      comments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



export default route;
