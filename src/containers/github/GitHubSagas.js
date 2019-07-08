/*
 * @flow
 */

import axios from 'axios';
import { put, takeEvery } from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import { DateTime } from 'luxon';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED, ERR_WORKER_SAGA } from '../../utils/Errors';

import {
  OPEN_PULL_REQUEST,
  openPullRequest,
} from './GitHubActions';

const LOG = new Logger('ConsentSagas');

const Base64 = {
  encode: str => btoa(unescape(encodeURIComponent(str))),
  decode: str => decodeURIComponent(escape(atob(str))),
};

/*
 *
 * GitHubActions.openPullRequest()
 *
 */

function* openPullRequestWorker(seqAction :SequenceAction) :Generator<*, *, *> {

  const { id, value } = seqAction;
  if (value === null || value === undefined) {
    yield put(openPullRequest.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  let response :any;

  try {
    yield put(openPullRequest.request(id, value));

    const edmAsBase64 = Base64.encode(value.edmAsString);

    const axiosConfig = {};
    axiosConfig.auth = { username: value.username, password: value.password };
    axiosConfig.baseURL = 'https://api.github.com/repos/Lattice-Works/EDM';

    if (value.otp) {
      axiosConfig.headers = { 'X-GitHub-OTP': value.otp };
    }

    const ax = axios.create(axiosConfig);

    /*
     * 1. get "master" branch hash
     */

    response = yield ax.get('/git/refs');
    const masterBranchHash = fromJS(response.data)
      .find((ref :Map) => ref.get('ref') === 'refs/heads/master', Map())
      .getIn(['object', 'sha'], '');

    /*
     * 2. create new branch off of "master"
     */

    const formattedDateTime :string = DateTime.local().toFormat('yyyyMMddHHmmss');
    const newBranchName :string = `edm-changes-${formattedDateTime}`;
    response = yield ax.post('/git/refs', { ref: `refs/heads/${newBranchName}`, sha: masterBranchHash });
    const newBranchData :Map = fromJS(response.data);
    const newBranchHash :string = newBranchData.getIn(['object', 'sha'], '');

    /*
     * 3. get commit data for this hash
     */

    response = yield ax.get(`/git/commits/${newBranchHash}`);
    const headCommitData = fromJS(response.data);
    const headCommitHash = headCommitData.get('sha', '');
    const headCommitTreeHash = headCommitData.getIn(['tree', 'sha'], '');

    /*
     * 4. create a new blob
     */

    response = yield ax.post('/git/blobs', { content: edmAsBase64, encoding: 'base64' });
    const newBlobData :Map = fromJS(response.data);
    const newBlobHash :Map = newBlobData.get('sha', '');

    /*
     * 5. create a new tree
     */

    response = yield ax.post('/git/trees', {
      base_tree: headCommitTreeHash,
      tree: [{
        mode: '100644',
        path: 'data/edm.json',
        sha: newBlobHash,
        type: 'blob',
      }],
    });
    const newCommitTreeData :Map = fromJS(response.data);
    const newCommitTreeHash :string = newCommitTreeData.get('sha', '');

    /*
     * 6. create a new commit
     */

    response = yield ax.post('/git/commits', {
      message: `edm changes ${formattedDateTime}`,
      parents: [headCommitHash],
      tree: newCommitTreeHash
    });
    const newCommitData = fromJS(response.data);
    const newCommitHash = newCommitData.get('sha');

    /*
     * 7. update head on the new branch
     */

    response = yield ax.patch(`/git/refs/heads/${newBranchName}`, { sha: newCommitHash });

    /*
     * 8. create a new pull request
     */

    response = yield ax.post('/pulls', {
      base: 'master',
      head: newBranchName,
      title: `edm changes ${formattedDateTime}`,
    });

    yield put(openPullRequest.success(id));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(openPullRequest.failure(id, error));
  }
  finally {
    yield put(openPullRequest.finally(id));
  }
}

function* openPullRequestWatcher() :Generator<*, *, *> {

  yield takeEvery(OPEN_PULL_REQUEST, openPullRequestWorker);
}

export {
  openPullRequestWatcher,
  openPullRequestWorker,
};
