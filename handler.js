var AWS = require("aws-sdk");
let config = {
  endpointAddress: "a2nkurkxw60pe-ats.iot.us-west-2.amazonaws.com"
};
var iotdata = new AWS.IotData({ endpoint: config.endpointAddress });
let iot = new AWS.Iot();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

class BBUpdateTool {
  buildDisplay(thingShadows) {

    let displayGroups = [];

    displayGroups[0] = {
      "position": 1,
      "strength": 5
    };

    displayGroups[1] = {
      "position": 2,
      "strength": 2
    };

    displayGroups[2] = {
      "position": 3,
      "strength": 0
    };

    return displayGroups;

  }
}

const bbUpdateTool = new BBUpdateTool();

exports.handle = async data => {
  console.log("\n\nevent:");
  console.log(data);

  /***********************************************************
   *
   *    Get the groups that this Thing is part of
   *
   ***********************************************************/

  let thingGroups = [];

  try {
    let thingGroupsQueryResponse = await iot
      .listThingGroupsForThing({
        thingName: data.clientId
      })
      .promise();
    //this looks strange, but the response is an object, not an array, so we need to get the `thingGroups` array from the response object
    thingGroups = thingGroupsQueryResponse.thingGroups;
  } catch (e) {
    console.log(err, err.stack);
  }




  console.log("listThingGroupsForThing (these are all of the groups the original thing that triggered the execution is part of):");
  console.log(thingGroups);


  let relavantGroups = thingGroups.filter(thingGroup => thingGroup.groupName.toLowerCase().startsWith("mitchine"));

  if (relavantGroups.length < 1) {
    console.info("A Thing shadow was updated that is not in a group. The Thing client id / name is ", data.clientId);
    console.info(`Thing ${data.clientId} is in groups`, thingGroups);
  } else if (relavantGroups.length > 1) {
    console.info("A Thing shadow was updated that is in multiple \"mitchine\" groups so it is not possible to determine which group should be updated.", data.clientId);
    console.info(`Thing ${data.clientId} is in groups`, thingGroups);
  }

  //There should only be one group given the checks above
  const groupToUpdate = relavantGroups[0];

  console.log("The group we're going to update is");
  console.log(groupToUpdate);

  /***********************************************************
   *
   *    Get the Things in a particular group
   *
   ***********************************************************/

  let targetThings = [];

  try {
    const thingsResponse = await iot
      .listThingsInThingGroup({
        thingGroupName: groupToUpdate.groupName
      })
      .promise();
    /**
     { things: [ 'esp32_FE0398', 'esp32_9D3698', 'esp32_14958C' ], nextToken: null }
     */
    targetThings = thingsResponse.things;
  } catch (err) {
    console.log(err, err.stack);
  }

  console.log("listThingsInThingGroup (this is all of the IDs of all of the things that we're going to update):");
  console.log(targetThings);

  console.log("example of a single Thing:", targetThings[0]);


  /***********************************************************
   *
   *    Fetch configuratoin values from the database that show settings that were set by the users such as the display positions,
   *    the times that they want to stop the device from sounding, etc.
   *
   ***********************************************************/

  // const params = {
  //   TableName: process.env.DYNAMODB_TABLE,
  //   Key: {
  //     id: "test"
  //   }
  // };

  // try {
  //   result = await dynamoDb.get(params, (error, result)).promise();
  // } catch (e) {
  //   console.log(e, e.stack);
  // }



  /***********************************************************
   *
   *    Get the shadow of each Thing in the group
   *
   ***********************************************************/

  let timerStart = Date.now();

  let thingShadowGetPromises = [];

  targetThings.forEach(name => {
    thingShadowGetPromises.push(iotdata
      .getThingShadow({ thingName: name })
      .promise());
  });

  let allThingShadows = await Promise.all(thingShadowGetPromises);

  let timerStop = Date.now();

  console.log("Elapsed time to GET " + allThingShadows.length + " Thing shadows: " + ((timerStop - timerStart) / 1000) + " seconds");

  console.log("The shadows of all items in this group", allThingShadows);


  /***********************************************************
   *
   *    Update each Thing's shadow in the group
   *
   ***********************************************************/


  //determine display settings
  let displays = bbUpdateTool.buildDisplay(allThingShadows);

  var update = {
    state: {
      desired: {
        group: displays
      }
    }
  };

  timerStart = Date.now();

  let thingShadowUpdatePromises = [];

  targetThings.forEach(thing => {
    thingShadowUpdatePromises.push(
      iotdata.updateThingShadow({
        payload: JSON.stringify(update),
        thingName: thing
      })
        .promise());
  });

  let allUpdateResponses = await Promise.all(thingShadowUpdatePromises);

  timerStop = Date.now();

  console.log("Elapsed time to UPDATE " + allThingShadows.length + " Thing shadows: " + ((timerStop - timerStart) / 1000) + " seconds");


  console.log("done!");
};
