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
      repos: {
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
    done()
  })

  test('Check PR status with forked repo/branch', async (done) => {
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
})
