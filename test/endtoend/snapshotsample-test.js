/**
* Copyright (c) Microsoft.  All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// Lib includes
var assert = require('assert');
var async = require('async');
var snapshotsample = require('../../examples/samples/snapshotsample');
var Sample = new snapshotsample();

suite('snapshotsample-test', function () {
    setup(function (done) {
        done();
    });

    teardown(function (done) {
        Sample.DeleteContainer(function () {
            done();
        });
    });

    test('Basic', function (done) {
        async.series([
            // 1. Upload 3 blocks and commit them.
            Sample.CreateContainer,
            Sample.UploadBlockBlobs,
            Sample.ReadBlobContent,

            // 2. Take a snapshot for that blob.
            // 3. Re-upload one of the three blocks and commit them.
            Sample.CreateSnapshot,
            Sample.UpdateBlock2,
            Sample.ReadBlobContent,

            // 4. Take a snapshot again.
            // 5. List blobs including snapshots.
            Sample.CreateAnotherSnapshot,
            Sample.ListSnapshots,

            // 6. Read from the first snapshot.
            Sample.ReadBlobContentFromSnapshot,

            // 7. Delete the first snapshot.
            // 8. List all snapshots for this blob.
            Sample.DeleteSnapshot,
            Sample.ListOnlySnapshots,
        ], function (error, results) {
            // From #1 - Validate block content
            assert.equal(results[2], snapshotsample.blockContent1 +
                snapshotsample.blockContent2 + snapshotsample.blockContent3);

            // From #2-3 - Validate updated block content
            assert.equal(results[5], snapshotsample.blockContent1 +
                snapshotsample.blockContentAlternative2 + snapshotsample.blockContent3);

            // From #4-5 - Validate number of snapshots
            assert.equal(results[7].length, 3);

            // From #6 - Validate reading block from snapshot
            assert.equal(results[8], snapshotsample.blockContent1 +
                snapshotsample.blockContent2 + snapshotsample.blockContent3);

            // From #7-8 - Validate number of snapshots
            assert.equal(results[10].length, 2);

            done();
        });
    });
});
