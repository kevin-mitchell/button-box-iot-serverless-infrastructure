var AWS = require("aws-sdk");
let config = {
  endpointAddress: "a2nkurkxw60pe-ats.iot.us-west-2.amazonaws.com",
  thingName: "esp32_14958C"
};
var iotdata = new AWS.IotData({ endpoint: config.endpointAddress });

exports.handle = async event => {
  console.log(event);
  console.log(event.state.reported);

  let desiredLedOn = false;

  if (event.state.reported.buttonPressed) {
    desiredLedOn = true;
  }

  var update = {
    state: {
      desired: {
        ledOn: desiredLedOn
      }
    }
  };
  console.log(update);
  console.log("calling updateThing...");

  iotdata.getThingShadow(
    {
      thingName: "esp32_FE0398"
    },
    function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
      } else {
        console.log("------");
        console.log("------");
        console.log("------");
        console.log(data);
        console.log("------");
        console.log("------");
        console.log("------");
        updateThing(update);
        console.log("done calling updateThing!");
      }
    }
  );

  function wait() {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve("hello"), 1000);
    });
  }

  console.log(await wait());
};

let updateThing = function(data) {
  iotdata.updateThingShadow(
    {
      payload: JSON.stringify(data),
      thingName: config.thingName
    },
    function(err, data) {
      if (err) {
        console.log(err);
        context.fail(err);
      } else {
        console.log(data);
        console.log("success callback hit after update!");
      }
    }
  );
};
