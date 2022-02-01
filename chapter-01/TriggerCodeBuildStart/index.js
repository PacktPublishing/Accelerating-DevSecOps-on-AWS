const AWS = require('aws-sdk');
const codecommit = new AWS.CodeCommit();
const codebuild = new AWS.CodeBuild();

exports.handler = async (event) => {
    try {
        console.log('Received Event: ', event);
        const { destinationCommit } = event.detail;
        const { sourceCommit } = event.detail;
        const { pullRequestId } = event.detail;
        const pullRequestName = event.detail.title;
        const cutter = "heads/";
        const srcbrnch = event.detail.sourceReference;
        const sourceBranch = srcbrnch.slice(srcbrnch.indexOf(cutter) + cutter.length);
        const triggerCodeBuildParameters = {
            sourceBranch, sourceCommit, destinationCommit, pullRequestId, pullRequestName
        };
        const codeBuildResult = await triggerCodebuild(triggerCodeBuildParameters);
        
        const buildId = codeBuildResult.build.id;
        const postBuildStartedCommentOnPRParameters = {
            sourceCommit, destinationCommit, pullRequestId, buildId
        }
        
        await postBuildStartedCommentOnPR(postBuildStartedCommentOnPRParameters);
        
        return {
            statusCode: 200
        };
    }
    catch (error) {
        console.log('An Error Occured', error);
        return { 
            error
        };
    }
};

async function postBuildStartedCommentOnPR(postBuildStartedCommentOnPRParameters) {
    const { sourceCommit, destinationCommit, pullRequestId, buildId } = postBuildStartedCommentOnPRParameters;
    const logLink = `https://${process.env.REGION}.console.aws.amazon.com/codesuite/codebuild/projects/ValidatePullRequest/build/${buildId}`;
    const parameters = {
        afterCommitId: sourceCommit,
        beforeCommitId: destinationCommit,
        content: `Build For Validating The Pull Request has been started.   
        Timestamp: **${Date.now()}**   
        Check [CodeBuild Logs](${logLink})`,
        pullRequestId,
        repositoryName: process.env.REPOSITORY_NAME
    };

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

async function triggerCodebuild(triggerCodeBuildParameters) {
    const { sourceBranch, sourceCommit, destinationCommit, pullRequestId, pullRequestName } = triggerCodeBuildParameters;
    console.log(`Triggering Codebuild, Branch: ${sourceBranch}`);
    const parameters = {
        projectName: process.env.CODEBUILD_PROJECT,
        sourceVersion: `refs/heads/${sourceBranch}^{${sourceCommit}}`,
        environmentVariablesOverride: [
            {
                name: 'pullRequestId',
                value: pullRequestId,
                type: 'PLAINTEXT'
            },
            {
                name: 'sourceCommit',
                value: sourceCommit,
                type: 'PLAINTEXT'
            },
            {
                name: 'destinationCommit',
                value: destinationCommit,
                type: 'PLAINTEXT'
            },
            {
                name: 'pullRequestName',
                value: pullRequestName,
                type: 'PLAINTEXT'
            }
        ]
    };
    const request = await codebuild.startBuild(parameters);
    const promise = request.promise();
    return promise.then(
        (data) => data,
        (error) => {
            console.log('Error In Starting Codebuild', error);
            throw new Error(error);
        }
    );
}