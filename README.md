# aws-listener-test

[![Build Status](https://travis-ci.org/janis-commerce/aws-listener-test.svg?branch=master)](https://travis-ci.org/janis-commerce/aws-listener-test)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/aws-listener-test/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/aws-listener-test?branch=master)
[![npm version](https://badge.fury.io/js/%40janiscommerce%2Faws-listener-test.svg)](https://www.npmjs.com/package/@janiscommerce/aws-listener-test)

A package for testing AWS Listeners developed with @janiscommerce/aws-listeners

## Installation
```sh
npm install @janiscommerce/aws-listener-test
```

### Rule

A rule is an object that defines a test case. It has the following properties:

* `description`: <_string_> **Required**. The test case description.
* `only`: <_boolean_> If it's set to true, only this rule will be executed. Useful to debug when a test fails.
* `event`: <_object|string_> **Required**. The AWS event to test, or you can use this string options: `SNS`, `S3`, `SQS`.
* `before`: <_function_> A function to be called before this test case is executed. It receives `sinon` as the first argument.
* `after`: <_function_> A function to be called after this test case is executed. It receives `sinon` as the first argument.
* `printResponse`: <_boolean_> Indicates if this test case response should be printed in the console (good for debugging).

## Examples

```js
const AwsListenerTest = require('@janiscommerce/aws-listener-test');

const MyServerlessHandler = require('./handler');
const MyModel = require('./model');

AwsListenerTest(MyServerlessHandler, [
	{
		description: 'It should return a 200 and do nothing',
		event: 'SNS'
	},
	{
		description: 'It should return a 200 and do nothing',
		event: 'S3'
	},
	{
		description: 'It should return a 200 and do nothing',
		event: 'SQS'
	},
	{
		description: 'It fail with a 500 status code if event is errorHappened',
		event: {
			// the complete AWS event object
		}
	},
	{
		description: 'It should update a record and return a 200',
		event: 'SNS',
		before: sinon => {
			sinon.stub(MyModel.prototype, 'update')
				.returns(true);
		},
		after: sinon => {
			sinon.assert.calledOnce(MyModel.prototype.update);
		}
	}
]);

```
