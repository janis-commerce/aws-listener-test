'use strict';

const event = {
	eventName: 'someEventName',
	eventField: 'eventFieldValue',
	someEventfield: 'someEventfieldRandomValue'
};

module.exports = {
	Records: [
		{
			messageId: '2b29fe49-36f9-433b-8431-210595fa0858',
			receiptHandle: '2b29fe49-36f9-433b-8431-210595fa0858#66e104e8-a72a-40e6-b793-9fd6b1f01de0',
			body: JSON.stringify(event),
			attributes: {},
			messageAttributes: {},
			md5OfBody: 'e659511be3f9908d4019bd93cd194a3f',
			eventSource: 'aws:sqs',
			eventSourceARN: 'arn:aws:sqs:region:XXXXXX:EventsMainQueueLocal',
			awsRegion: 'us-west-2'
		}
	]
};
