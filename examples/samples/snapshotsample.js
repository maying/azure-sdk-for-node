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

/**
* This sample is used to provide an overview of blob snapshots and how to work with them.
* 
* 1. Upload 3 blocks and commit them.
* 
* 2. Take a snapshot for that blob.
* 
* 3. Re-upload one of the three blocks and commit them.
* 
* 4. Take a snapshot again.
* 
* 5. List blobs including snapshots.
* 
* 6. Read from the first snapshot.
* 
* 7. Delete the first snapshot.
* 
* 8. List all snapshots for this blob.
*/

var fs = require('fs');
if (!fs.existsSync) {
  fs.existsSync = require('path').existsSync;
}

var azure;
if (fs.existsSync('./../../lib/azure.js')) {
  azure = require('./../../lib/azure');
} else {
  azure = require('azure');
}

var BlobConstants = azure.Constants.BlobConstants;
var ServiceClient = azure.ServiceClient;
var CloudBlobClient = azure.CloudBlobClient;

var util = require('util');

var async = require('async');

// Expose 'SnapshotSample'.
function SnapshotSample() {}

exports = module.exports = SnapshotSample;
SnapshotSample.container = 'snapshotsample9994';
SnapshotSample.blob = 'snapshotsample';

SnapshotSample.blockId1 = 'b1';
SnapshotSample.blockId2 = 'b2';
SnapshotSample.blockId3 = 'b3';

SnapshotSample.blockContent1 = 'content1';
SnapshotSample.blockContent2 = 'content2';
SnapshotSample.blockContentAlternative2 = 'alternative2';
SnapshotSample.blockContent3 = 'content3';

SnapshotSample.snapshot1 = null;

var sample = new SnapshotSample();
var blobClient = azure.createBlobService();

SnapshotSample.prototype.CreateContainer = function (callback) {
    // Step 0: Check if the target container exists.
    console.log(SnapshotSample.container);
    blobClient.createContainerIfNotExists(SnapshotSample.container, function (error) {
        if (error) {
            throw error;
        }
        else {
            console.log('Created the container ' + SnapshotSample.container);
            callback();
        }
    });
}

SnapshotSample.prototype.UploadBlockBlobs = function(callback) {
  // Step 1: Upload 3 blocks and commit them.
  var blockList = {
    LatestBlocks: [SnapshotSample.blockId1, SnapshotSample.blockId2, SnapshotSample.blockId3]
  };

  blobClient.createBlobBlockFromText(blockList.LatestBlocks[0], SnapshotSample.container, SnapshotSample.blob, SnapshotSample.blockContent1, SnapshotSample.blockContent1.length, function (error1) {
    if (error1) {
      throw error1;
    } else {
      console.log('Uploaded the block whose ID is ' + blockList.LatestBlocks[0]);
      blobClient.createBlobBlockFromText(blockList.LatestBlocks[1], SnapshotSample.container, SnapshotSample.blob, SnapshotSample.blockContent2, SnapshotSample.blockContent2.length, function (error2) {
        if (error2) {
          throw error2;
        } else {
          console.log('Uploaded the block whose ID is ' + blockList.LatestBlocks[1]);
          blobClient.createBlobBlockFromText(blockList.LatestBlocks[2], SnapshotSample.container, SnapshotSample.blob, SnapshotSample.blockContent3, SnapshotSample.blockContent3.length, function (error3) {
            if (error3) {
              throw error3;
            } else {
              console.log('Uploaded the block whose ID is ' + blockList.LatestBlocks[2]);
              blobClient.commitBlobBlocks(SnapshotSample.container, SnapshotSample.blob, blockList, function (error4) {
                if (error4) {
                  throw error4;
                }
                else {
                  console.log('Committed the blob ' + SnapshotSample.blob);
                  callback();
                }
              });
            }
          });
        }
      });
    }
  });
}

SnapshotSample.prototype.ReadBlobContent = function (callback) {
    blobClient.getBlobToText(SnapshotSample.container, SnapshotSample.blob, function (error, text) {
        if (error) {
            throw error;
        }
        else {
            console.log('Reading the current blob content: ' + text);
            callback(null, text);
        }
    })
}

SnapshotSample.prototype.CreateSnapshot = function (callback) {
    // Step 2 : Creates a snapshot.
    blobClient.createBlobSnapshot(SnapshotSample.container, SnapshotSample.blob, function (error, snapshot1) {
        if (error) {
            throw error;
        } else {
            console.log('Created a snapshot for the blob ' + SnapshotSample.blob);
            SnapshotSample.snapshot1 = snapshot1;
            callback();
        }
    });
}

SnapshotSample.prototype.UpdateBlock2 = function (callback) {
    // Step 3: Update the block 2, commit the blob again.
    blobClient.createBlobBlockFromText(SnapshotSample.blockId2, SnapshotSample.container, SnapshotSample.blob, SnapshotSample.blockContentAlternative2, SnapshotSample.blockContentAlternative2.length, function (error) {
        if (error) {
            throw error;
        } else {
            console.log('Uploaded the block whose ID is ' + SnapshotSample.blockId2);

            var blockList = {
                LatestBlocks: [SnapshotSample.blockId1, SnapshotSample.blockId2, SnapshotSample.blockId3]
            };

            blobClient.commitBlobBlocks(SnapshotSample.container, SnapshotSample.blob, blockList, function (error2) {
                if (error2) {
                    throw error2;
                } else {
                    console.log('Committed the blob ' + SnapshotSample.blob);
                    callback();
                }
            });
        }
    });
}
SnapshotSample.prototype.CreateAnotherSnapshot = function (callback) {
    // Step 4 : Creates another snapshot.
    blobClient.createBlobSnapshot(SnapshotSample.container, SnapshotSample.blob, function (error) {
        if (error) {
            throw error;
        } else {
            console.log('Created a snapshot for the blob ' + SnapshotSample.blob);
            callback();
        }
    });
};

SnapshotSample.prototype.ListSnapshots = function (callback) {
    // Step 5 : List the blobs, including snapshots
    blobClient.listBlobs(SnapshotSample.container, { include: 'snapshots' }, function (error, blobResults) {
        if (error) {
            throw error;
        } else {
            console.log('Listing the blobs under the container ' + SnapshotSample.container);

            blobResults.forEach(function (blobResult) {
                console.log('  Blob: ' + blobResult.url);
            });

            callback(null, blobResults);
        }
    });
};

SnapshotSample.prototype.ReadBlobContentFromSnapshot = function (callback) {
    // Step 6 : Read from snapshot1.
    blobClient.getBlobToText(SnapshotSample.container, SnapshotSample.blob, { snapshotId: SnapshotSample.snapshot1 }, function (error, text) {
        if (error) {
            throw error;
        } else {
            console.log('Reading from snapshot ' + SnapshotSample.snapshot1 + ': ' + text);
            callback(null, text);
        }
    });
}

SnapshotSample.prototype.DeleteSnapshot = function (callback) {
    // Step 7 : Delete the first snapshot.
    blobClient.deleteBlob(SnapshotSample.container, SnapshotSample.blob, { snapshotId: SnapshotSample.snapshot1 }, function (error) {
        if (error) {
            throw error;
        } else {
            console.log('Deleted the snapshot ' + SnapshotSample.snapshot1);
            callback();
        }
    });
};

SnapshotSample.prototype.ListOnlySnapshots = function (callback) {
    // Step 8 : List the snapshots.
    blobClient.listBlobs(SnapshotSample.container, { prefix: SnapshotSample.blob, include: 'snapshots' }, function (error, blobResults) {
        if (error) {
            throw error;
        } else {
            console.log('Listing snapshots for the blob ' + SnapshotSample.blob);

            blobResults.forEach(function (blobResult) {
                if (blobResult.snapshot) {
                    console.log('  Snapshot: ' + blobResult.snapshot);
                }
            });

            callback(null, blobResults);
        }
    });
};

SnapshotSample.prototype.DeleteContainer = function (callback) {
    blobClient.deleteContainer(SnapshotSample.container, function (error) {
    if (error) {
      console.log(error);
    } else {
      callback();
    }
  });
}

var arguments = process.argv;

if (arguments.length > 3) {
  console.log('Incorrect number of arguments');
}
else if (arguments.length == 3) {
  // Adding a third argument on the command line, whatever it is, will delete the container before running the sample.
sample.DeleteContainer(function (error) {
        if (error) {
            console.log(error);
        } else {
            startSample();
        } 
    });
}
else {
  startSample();
}

function startSample() {

    async.series([
        // 1. Upload 3 blocks and commit them.
        sample.CreateContainer,
        sample.UploadBlockBlobs,
        sample.ReadBlobContent,

        // 2. Take a snapshot for that blob.
        // 3. Re-upload one of the three blocks and commit them.
        sample.CreateSnapshot,
        sample.UpdateBlock2,
        sample.ReadBlobContent,

        // 4. Take a snapshot again.
        // 5. List blobs including snapshots.
        sample.CreateAnotherSnapshot,
        sample.ListSnapshots,

        // 6. Read from the first snapshot.
        sample.ReadBlobContentFromSnapshot,

        // 7. Delete the first snapshot.
        // 8. List all snapshots for this blob.
        sample.DeleteSnapshot,
        sample.ListOnlySnapshots
     ]);    
}