// Requiring our app implementation
import myProbotApp from '../src'
import { Application } from 'probot'
// Requiring our fixtures
import pullRequestFromBranchRequest from './fixtures/pull-request-from-branch.json'
import pullRequestFromForkRequest from './fixtures/pull-request-from-fork.json'
import pullRequestSynchronizeRequest from './fixtures/pull-request-synchronize.json'

describe('che.openshift.io Probot app', () => {
  let probot: any
  let github: any

  beforeEach(() => {
    probot = new Application()
    // Load our app into probot
    probot.load(myProbotApp)

    // This is an easy way to mock out the GitHub API
    github = {
      checks: {
        create: jest.fn().mockResolvedValue(0)
      },
      issues: {
        createComment: jest.fn().mockResolvedValue(0)
      },
      repos: {
        getContents: jest.fn().mockResolvedValue({ data: { content: '' } }),
        createStatus: jest.fn().mockResolvedValue({})
      }
    }

    // Passes the mocked out GitHub API into out app instance
    probot.auth = () => Promise.resolve(github)
  })

  test('Check PR status with forked repo/branch', async (done) => {
    await probot.receive({
      name: pullRequestFromForkRequest.event,
      payload: pullRequestFromForkRequest.payload
    })

    expect(github.repos.createStatus).toBeCalled()
    // one param
    expect(github.repos.createStatus.mock.calls[0].length).toBe(1)

    // check parameter
    expect(github.repos.createStatus.mock.calls[0][0]).toStrictEqual(
      {
        context: 'che.openshift.io',
        description: 'Open Cloud Developer Workspace',
        owner: 'florent-benoit',
        repo: 'example1',
        sha: '4c2f49fbb407dae27e37438b9227f9e6fdef6070',
        state: 'success',
        target_url: 'https://che.openshift.io/f/?url=https://github.com/benoitf/example1/tree/new-branch-fork'
      }
    )

    // expect comment is created as well
    expect(github.issues.createComment).toBeCalled()
    // one param
    expect(github.issues.createComment.mock.calls[0].length).toBe(1)
    // check parameter
    expect(github.issues.createComment.mock.calls[0][0]).toStrictEqual(
      {
        number: 8,
        body: 'Open Developer Workspace:\n[![Contribute](https://www.eclipse.org/che/contribute.svg)](https://che.openshift.io/f/?url=https://github.com/benoitf/example1/tree/new-branch-fork)',
        owner: 'florent-benoit',
        repo: 'example1'
      }
    )

    done()
  })

  test('Check PR status with custom branch', async (done) => {
    await probot.receive({
      name: pullRequestFromBranchRequest.event,
      payload: pullRequestFromBranchRequest.payload
    })

    expect(github.repos.createStatus).toBeCalled()
    // one param
    expect(github.repos.createStatus.mock.calls[0].length).toBe(1)

    // check parameter
    expect(github.repos.createStatus.mock.calls[0][0]).toStrictEqual(
      {
        context: 'che.openshift.io',
        description: 'Open Cloud Developer Workspace',
        owner: 'florent-benoit',
        repo: 'example1',
        sha: 'e3938d3b583d13eafce89f606da7d463b124651d',
        state: 'success',
        target_url: 'https://che.openshift.io/f/?url=https://github.com/florent-benoit/example1/tree/custom-branch'
      }
    )
    done()
  })

  test('Check PR synchronized', async (done) => {
    await probot.receive({
      name: pullRequestSynchronizeRequest.event,
      payload: pullRequestSynchronizeRequest.payload
    })

    expect(github.repos.createStatus).toBeCalled()
    // one param
    expect(github.repos.createStatus.mock.calls[0].length).toBe(1)

    // check parameter
    expect(github.repos.createStatus.mock.calls[0][0]).toStrictEqual(
      {
        context: 'che.openshift.io',
        description: 'Open Cloud Developer Workspace',
        owner: 'florent-benoit',
        repo: 'example1',
        sha: 'd95a67580328939319d4f852bf22b9761175c924',
        state: 'success',
        target_url: 'https://che.openshift.io/f/?url=https://github.com/florent-benoit/example1/tree/custom-branch'
      }
    )
    done()
  })

  test('Check no status being added if addStatus is false', async (done) => {
    const yaml = Buffer.from('addStatus: false').toString('base64')

    github.repos.getContents = jest.fn().mockResolvedValue({ data: { content: yaml } })

    await probot.receive({
      name: pullRequestFromBranchRequest.event,
      payload: pullRequestFromBranchRequest.payload
    })

    expect(github.repos.createStatus).not.toHaveBeenCalled()

    // comment still called
    expect(github.issues.createComment).toBeCalled()

    done()
  })

  test('Check no comment being added if addComment is false', async (done) => {
    const yaml = Buffer.from('addComment: false').toString('base64')

    github.repos.getContents = jest.fn().mockResolvedValue({ data: { content: yaml } })

    await probot.receive({
      name: pullRequestFromBranchRequest.event,
      payload: pullRequestFromBranchRequest.payload
    })

    expect(github.issues.createComment).not.toHaveBeenCalled()

    // status still called
    expect(github.repos.createStatus).toBeCalled()

    done()
  })

  test('Check PR status/comment with custom cheInstance', async (done) => {
    const yaml = Buffer.from('cheInstance: https://www.my-che-instance.foo').toString('base64')
    github.repos.getContents = jest.fn().mockResolvedValue({ data: { content: yaml } })

    await probot.receive({
      name: pullRequestFromForkRequest.event,
      payload: pullRequestFromForkRequest.payload
    })

    expect(github.repos.createStatus).toBeCalled()
    // one param
    expect(github.repos.createStatus.mock.calls[0].length).toBe(1)

    // check parameter
    expect(github.repos.createStatus.mock.calls[0][0]).toStrictEqual(
      {
        context: 'che.openshift.io',
        description: 'Open Cloud Developer Workspace',
        owner: 'florent-benoit',
        repo: 'example1',
        sha: '4c2f49fbb407dae27e37438b9227f9e6fdef6070',
        state: 'success',
        target_url: 'https://www.my-che-instance.foo/f/?url=https://github.com/benoitf/example1/tree/new-branch-fork'
      }
    )

    // expect comment is created as well
    expect(github.issues.createComment).toBeCalled()
    // one param
    expect(github.issues.createComment.mock.calls[0].length).toBe(1)
    // check parameter
    expect(github.issues.createComment.mock.calls[0][0]).toStrictEqual(
      {
        number: 8,
        body: 'Open Developer Workspace:\n[![Contribute](https://www.eclipse.org/che/contribute.svg)](https://www.my-che-instance.foo/f/?url=https://github.com/benoitf/example1/tree/new-branch-fork)',
        owner: 'florent-benoit',
        repo: 'example1'
      }
    )

    done()
  })
})
