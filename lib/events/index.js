'use strict';

const SNSMessage = require('./sns');
const S3Message = require('./s3');
const SQSMessage = require('./sqs');

module.exports = {
	SNSMessage,
	S3Message,
	SQSMessage
};
