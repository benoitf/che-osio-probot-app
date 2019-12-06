import { Application } from 'probot' // eslint-disable-line no-unused-vars
import { ReposCreateStatusParams } from '@octokit/rest' // eslint-disable-line no-unused-vars

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.synchronize', 'check_run.rerequested'], async (context) => {
    const ctxRepo = context.repo()
    const pr = context.payload.pull_request

    const prBranchName = pr.head.ref
    const repoUrl = pr.head.repo.html_url

    const statusParams: ReposCreateStatusParams = {
      repo: ctxRepo.repo,
      owner: ctxRepo.owner,
      sha: pr.head.sha,
      state: 'success',
      description: 'Open Cloud Developer Workspace',
      context: 'che.openshift.io',
      target_url: `https://che.openshift.io/f/?url=${repoUrl}/tree/${prBranchName}`
    }
    await context.github.repos.createStatus(statusParams)
  })
}
