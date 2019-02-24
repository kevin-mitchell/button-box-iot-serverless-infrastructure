# Serverless setup for Button Box lambda processors

This project is meant to contain the serverless setup for the Button Box (working title) AWS infrastructure relating to the Lambda processing of IoT events.

This project is heavily based on https://github.com/serverless/examples/tree/master/aws-node-iot-event which is a good place to reference for updates that might be good to pull into this project.

## Useful information

We can check the logs for our functions with

```
serverless logs --function change-handler
```

## Functions

### change-detected (`buttonbox-iot-event-processor-change-detected`)

This function will be passed information at the time that a IoT device's shadow is updated. The function will then check the other IoT device shadows that share the same group as the device that triggered the event, and update their shadow as appropriate.

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
