import express, { Router } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const route = Router();
const jwtpasskey = process.env.JWT_PASSKEY;
const prisma = new PrismaClient();

// Login route
route.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    return res.json({
      success: false,
      msg: "Send all user details",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        username,
        password,
      },
    });

    if (user) {
      const token = jwt.sign({ username }, jwtpasskey);
      res.status(200).json({
        success: true,
        msg: "User Signin Successful",
        jwt_token: token,
      });
    } else {
      res.json({
        success: false,
        msg: "No user exists",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching user details",
      error: error.message,
    });
  }
});

// Register route
route.post('/register', async (req, res) => {
  
  const { username, password, firstname, lastname, dob } = req.body;

  if (!(username && password && firstname && dob)) {
    return res.json({
      success: false,
      msg: "Send all required user details",
    });
  }

  try {
    const existinguser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (existinguser) {
      return res.json({
        success: false,
        msg: "User With Same Username Already Exists",
      });
    }

    const user = await prisma.user.create({
      data: {
        username,
        password,
        firstname,
        lastname: lastname || null,
        DOB: new Date(dob),
      },
    });

    const token = jwt.sign({ username }, jwtpasskey);

    res.status(201).json({
      success: true,
      msg: "User created successfully",
      jwt_token: token,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error creating user",
      error: error.message,
    });
  }
});

export default route;
