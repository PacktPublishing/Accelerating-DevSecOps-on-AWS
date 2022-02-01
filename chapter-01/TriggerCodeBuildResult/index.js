const AWS = require('aws-sdk');
const codecommit = new AWS.CodeCommit();
exports.handler = async (event) => {
    try {
        console.log('Event', event);
        const parameters = await getParameters(event);
        console.log('Parameters For Comment:', parameters);
        await commentCodeBuildResultOnPR(parameters);
        return { statusCode: 200 };
    }
    catch (error) {
        console.log('An Error Occured', error);
        return { error };
    }
};

async function getParameters(event) {
    try {
        const buildId = event.detail['build-id'].split('/')[1];
        const buildStatus = event.detail['build-status'];
        const environmentVariableList = event.detail['additional-information'].environment['environment-variables'];
        let afterCommitId, beforeCommitId, content, pullRequestId;
        for (element of environmentVariableList) {
            if (element.name === 'pullRequestId') pullRequestId = element.value;
            if (element.name === 'sourceCommit') afterCommitId = element.value;
            if (element.name === 'destinationCommit') beforeCommitId = element.value;
            if (element.name === 'pullRequestName') pullRequestName = element.value;
        }

        const logLink = `https://${process.env.REGION}.console.aws.amazon.com/codesuite/codebuild/projects/ValidatePullRequest/build/${buildId}`;
        content = `Build Result: **${buildStatus}**   
        Timestamp: **${Date.now()}**   
        Check [CodeBuild Logs](${logLink})`;

        return {
            afterCommitId,
            beforeCommitId,
            content,
            pullRequestId,
            repositoryName: process.env.REPOSITORY_NAME
        };
    } catch (error) {
        throw error;
    }
}

async function commentCodeBuildResultOnPR(parameters) {
    const request = await codecommit.postCommentForPullRequest(parameters);
    const promise = request.promise();
    return promise.then(
        (data) => data,
        (error) => {
            console.log('Error In Commenting To Pull Request', error);
            throw new Error(error);
        }
    );
}