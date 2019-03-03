var AWS = require("aws-sdk");
let config = {
  endpointAddress: "a2nkurkxw60pe-ats.iot.us-west-2.amazonaws.com",
  thingName: "esp32_14958C"
};
var iotdata = new AWS.IotData({ endpoint: config.endpointAddress });
let iot = new AWS.Iot();

exports.handle = async data => {
  console.log("\n\nevent:");
  console.log(data);

  let thingGroups = {};

  /***********************************************************
   *
   *    Get the groups that this Thing is part of
   *
   ***********************************************************/
  try {
    thingGroups = await iot
      .listThingGroupsForThing({
        thingName: data.clientId
      })
      .promise();
  } catch (e) {
    console.log(err, err.stack);
  }

  console.log("listThingGroupsForThing:");
  console.log(thingGroups);

  /***********************************************************
   *
   *    Get the Things in a particular group
   *
   ***********************************************************/
  try {
    thingGroups = await iot
      .listThingsInThingGroup({
        thingGroupName: "michine"
      })
      .promise();
  } catch (err) {
    console.log(err, err.stack);
  }

  console.log("listThingsInThingGroup:");
  console.log(thingGroups);

  /***********************************************************
   *
   *    Get the thing shadow for a particular thing
   *
   ***********************************************************/
  let thingShadow = {};
  try {
    thingShadow = await iotdata
      .getThingShadow({ thingName: "esp32_FE0398" })
      .promise();
  } catch (e) {
    console.log(err, err.stack);
  }

  /***********************************************************
   *
   *    Update the thing shadow for a specific Thing
   *
   ***********************************************************/

  let desiredLedOn = false;

  if (data.buttonPressed) {
    desiredLedOn = true;
  }

  var update = {
    state: {
      desired: {
        ledOn: desiredLedOn
      }
    }
  };

  try {
    let updateThingShadow = await iotdata
      .updateThingShadow({
        payload: JSON.stringify(update),
        thingName: config.thingName
      })
      .promise();
    console.log("updateThingShadowResponse");
    console.log(updateThingShadow);
  } catch (e) {
    console.log("error when calling updateThingShadow");
    console.log(e);
  }

  console.log("done!");
};
