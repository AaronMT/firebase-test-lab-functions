const admin = require('firebase-admin');
const axios = require('axios');
const functions = require('firebase-functions');
const {google} = require('googleapis');

exports.printTest = functions.testLab.testMatrix().onComplete(async testMatrix => {
    
    const projectId = process.env.GCLOUD_PROJECT;
    const historyId = testMatrix.testMatrixId.historyId;
    const executionId = testMatrix.testMatrixId.executionId;

    const auth = await google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const toolResults = google.toolresults({version: 'v1beta3', auth});

    const executionResponse = await toolResults.projects.histories.executions.get({
        projectId,
        historyId,
        executionId
    });

    const execution = executionResponse.data;

    const steps = execution.testExecutionStep;

    for (const step of steps) {
        const stepResponse = await toolResults.projects.histories.executions.steps.get({
            projectId,
            historyId,
            executionId,
            stepId: step.stepId
        });

        const stepData = stepResponse.data;

        const testCasesResponse = await toolResults.projects.histories.executions.steps.testCases.list({
            projectId,
            historyId,
            executionId,
            stepId: step.stepId
        });

        const testCases = testCasesResponse.data.testCases;

        console.log(`Found ${testCases.length} test cases in step ${step.stepId} of execution ${executionId}`)
    }
});