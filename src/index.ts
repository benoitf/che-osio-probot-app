import { Application } from 'probot' // eslint-disable-line no-unused-vars
import { ReposCreateStatusParams } from '@octokit/rest' // eslint-disable-line no-unused-vars

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.synchronize', 'check_run.rerequested'], async (context) => {
    const ctxRepo = context.repo()
    const pr = context.payload.pull_request

    const prBranchName = pr.head.ref
    const repoUrl = pr.head.repo.html_url

    const DEFAULT_OPTIONS = {
      addComment: true,
      addStatus: true,
      cheInstance: 'https://che.openshift.io'
    }

    // Load config from .github/che-workspace.yaml
    const config: any = await context.config('che-workspace.yaml', DEFAULT_OPTIONS)

    const targetUrl = `${config.cheInstance}/f/?url=${repoUrl}/tree/${prBranchName}`

    if (config && config.addStatus) {
      const statusParams: ReposCreateStatusParams = {
        repo: ctxRepo.repo,
        owner: ctxRepo.owner,
        sha: pr.head.sha,
        state: 'success',
        description: 'Open Cloud Developer Workspace',
        context: 'che.openshift.io',
        target_url: targetUrl
      }
      await context.github.repos.createStatus(statusParams)
    }

    if (config && config.addComment) {
      const comment = `Open Developer Workspace:\n[![Contribute](https://www.eclipse.org/che/contribute.svg)](${targetUrl})`

      const issueComment = context.issue({ body: comment })
      await context.github.issues.createComment(issueComment)
    }
  })
}
