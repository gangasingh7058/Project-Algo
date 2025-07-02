import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import getTestCases from '../Functions/get_testcases.js';

const route = Router();
const prisma = new PrismaClient();

route.post('/run/:pid', async (req, res) => {
  const { code, language } = req.body;
  const { pid } = req.params;

  if (!pid || !code || !language) {
    return res.json({
      success: false,
      msg: "Send All Parameters",
      err:"Send All Parameters"
    });
  }

  try {
    const problem = await getTestCases(pid)

    if (problem.success==false) {
      return res.json({
        success: false,
        msg: "P_id does not exist or is in-valid",
        err:"P_id does not exist or is in-valid"
      });
    }

    const testCases = problem.testCases;

    for (let i = 0; i < testCases.length; i++) {
      const test = testCases[i];

      try {
        const response = await axios.post('http://localhost:3002/run', {
          code,
          language,
          inputs: test.input,
          mode: "compiler",
        });

        if (!response.data.success) {
          return res.json({
            success: false,
            msg: "Compilation Failed",
            err: response.data.error,
            failedTestCase: i,
            totalTestCases: testCases.length,
          });
        }

        if (response.data.verdict.trim() !== test.output.trim()) {
          return res.json({
            success: false,
            msg: `Failed at Test Case ${i + 1}`,
            testcase:test.input,
            expected: test.output.trim() || "",
            received: response.data.verdict.trim() || "",
            failedTestCase: i + 1,
            totalTestCases: testCases.length,
          });
        }

      } catch (err) {
        return res.json({
          success: false,
          msg: `Error while running test case ${i + 1}`,
          err: err.message,
        });
      }
    }

    // All test cases passed
    return res.json({
      success: true,
      msg: "All Test Cases Passed",
      totalTestCases: testCases.length,
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal Server Error",
      err: error.message,
    });
  }
});

export default route;
