# Serverless setup for Button Box lambda processors

This project is meant to contain the serverless setup for the Button Box (working title) AWS infrastructure relating to the Lambda processing of IoT events.

This project is heavily based on https://github.com/serverless/examples/tree/master/aws-node-iot-event which is a good place to reference for updates that might be good to pull into this project.

## Setup

In order to deploy the function simply run

```
serverless deploy
```

The expected result should be similar to:

```
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service buttonbox-iot-event-processor.zip file to S3 (1.81 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.........
Serverless: Stack update finished...
Service Information
service: buttonbox-iot-event-processor
stage: dev
region: us-west-2
stack: buttonbox-iot-event-processor-dev
resources: 7
api keys:
  None
endpoints:
  None
functions:
  change-handler: buttonbox-iot-event-processor-dev-change-handler
layers:
  None
```

### Logs

`serverless logs --function change-handler --tail` will allow you to tail the logs for a particular function (`change-handler` in this example).

So for example to desploy and tail logs, `serverless deploy && serverless logs --function change-handler --tail`

## Functions

### change-detected (`buttonbox-iot-event-processor-change-detected`)

When a change is detected and this function is triggered, the following actions take place:

1. We gat the device ID / name from the trigger event data. This is refered to as `clientid() as clientId` (see: `https://docs.aws.amazon.com/iot/latest/developerguide/iot-sql-functions.html#iot-sql-function-clientid`) in the IoT SQL, but it (for the moment) also is the same value as the "thingName." As of this moment it's not clear to me if this is coincidental or if the two are the same things (todo!).
2. The thing is queried in order to find out which group(s) the thing is part of
3. If the thing is part of any groups with a group name following the format "michine\_" then that group is considered the group of interest. Most likely this will always be `michine_michine` but for the time being we're allowing this to be a convention so that in theory we could add additional groups (devices) and keep the same functionality.
4. This group name is then used to query for all of the devices within it. See `https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Iot.html#listThingsInThingGroup-property`
5. Each of these Things is updated with the new things value(s).
