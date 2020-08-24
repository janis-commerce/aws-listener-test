'use strict';

const assert = require('assert');

const sinon = require('sinon');

const { SNSListener, SNSServerlessHandler } = require('@janiscommerce/aws-listeners');

const { AWSListenerTest, AWSListenerTestError } = require('../lib');

const AWSExampleEvents = require('../lib/events');

class MyListener extends SNSListener {
	async process() {
		return true;
	}
}

const MyHandler = (...args) => SNSServerlessHandler.handle(MyListener, ...args);

class ErrorListener extends SNSListener {

	async process() {

		this
			.setCode(400)
			.setBody({});
	}
}

const ErrorHandler = (...args) => SNSServerlessHandler.handle(ErrorListener, ...args);

const { SNSMessage } = AWSExampleEvents;

describe('AWSListenerTest', () => {

	describe('Arguments validation', () => {

		it('Should throw if handler is falsy', () => {
			assert.throws(() => AWSListenerTest(undefined, []), {
				code: AWSListenerTestError.codes.INVALID_HANDLER
			});

			assert.throws(() => AWSListenerTest(null, []), {
				code: AWSListenerTestError.codes.INVALID_HANDLER
			});

			assert.throws(() => AWSListenerTest(0, []), {
				code: AWSListenerTestError.codes.INVALID_HANDLER
			});

			assert.throws(() => AWSListenerTest(false, []), {
				code: AWSListenerTestError.codes.INVALID_HANDLER
			});

			assert.throws(() => AWSListenerTest('', []), {
				code: AWSListenerTestError.codes.INVALID_HANDLER
			});
		});

		it('Should throw if handler is not a function', () => {
			assert.throws(() => AWSListenerTest('InvalidListener', []), {
				code: AWSListenerTestError.codes.INVALID_HANDLER
			});
		});

		it('Should throw if rules are falsy', () => {
			assert.throws(() => AWSListenerTest(MyHandler, undefined), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});

			assert.throws(() => AWSListenerTest(MyHandler, null), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});

			assert.throws(() => AWSListenerTest(MyHandler, 0), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});

			assert.throws(() => AWSListenerTest(MyHandler, false), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});

			assert.throws(() => AWSListenerTest(MyHandler, ''), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if rules are not an array', () => {
			assert.throws(() => AWSListenerTest(MyHandler, 'InvalidRules'), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if rules are empty', () => {
			assert.throws(() => AWSListenerTest(MyHandler, []), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule is not an object', () => {
			assert.throws(() => AWSListenerTest(MyHandler, ['InvalidRule']), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule description is not set', () => {
			assert.throws(() => AWSListenerTest(MyHandler, [{}]), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule description is not a string', () => {
			assert.throws(() => AWSListenerTest(MyHandler, [{
				description: ['InvalidRuleDescription']
			}]), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule event is not set', () => {
			assert.throws(() => AWSListenerTest(MyHandler, [{
				description: 'Valid description'
			}]), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule event is not an object or string', () => {
			assert.throws(() => AWSListenerTest(MyHandler, [{
				description: 'Valid description',
				event: []
			}]), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});

			assert.throws(() => AWSListenerTest(MyHandler, [{
				description: 'Valid description',
				event: null
			}]), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});

			assert.throws(() => AWSListenerTest(MyHandler, [{
				description: 'Valid description',
				event: 0
			}]), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule before hook is not a function', () => {
			assert.throws(() => AWSListenerTest(MyHandler, [{
				description: 'Valid description',
				event: SNSMessage,
				before: 'InvalidBeforeHook'
			}]), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule after hook is not a function', () => {
			assert.throws(() => AWSListenerTest(MyHandler, [{
				description: 'Valid description',
				event: SNSMessage,
				after: 'InvalidAfterHook'
			}]), {
				code: AWSListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if the before hook is not a function', () => {
			assert.throws(() => AWSListenerTest(MyHandler, [{
				description: 'Valid description',
				event: SNSMessage
			}], {
				before: 'InvalidBeforeHook'
			}), {
				code: AWSListenerTestError.codes.INVALID_BEFORE_HOOK
			});
		});

		it('Should throw if the after hook is not a function', () => {
			assert.throws(() => AWSListenerTest(MyHandler, [{
				description: 'Valid description',
				event: SNSMessage
			}], {
				after: 'InvalidAfterHook'
			}), {
				code: AWSListenerTestError.codes.INVALID_AFTER_HOOK
			});
		});
	});

	describe('Rule processing', () => {

		AWSListenerTest(MyHandler, [
			{
				description: 'Should pass for a basic rule',
				event: SNSMessage
			},
			{
				description: 'Should print the response for an individual rule if printResponse is truthy',
				printResponse: true,
				before: ({ stub }) => {
					stub(console, 'log');
				},
				after: ({ assert: sinonAssert }) => {
					sinonAssert.calledTwice(console.log); // eslint-disable-line
					sinonAssert.calledWithExactly(console.log.getCall(0), 'Test case: Should print the response for an individual rule if printResponse is truthy'); // eslint-disable-line
					sinonAssert.calledWithExactly(console.log.getCall(1), sinon.match(/^Response: /)); // eslint-disable-line
				},
				event: SNSMessage
			},
			{
				description: 'Should not print the response for an individual rule if printResponse is falsy',
				printResponse: false,
				before: ({ spy }) => {
					spy(console, 'log');
				},
				after: ({ assert: sinonAssert }) => {
					sinonAssert.notCalled(console.log); // eslint-disable-line
				},
				event: SNSMessage
			}
		]);

		AWSListenerTest(ErrorHandler, [
			{
				description: 'Should fail if status code is not OK',
				event: SNSMessage
			}
		]);

		AWSListenerTest(MyHandler, [
			{
				description: 'Should print the response for the whole execution if printResponse is truthy',
				before: ({ stub }) => {
					stub(console, 'log');
				},
				after: ({ assert: sinonAssert }) => {
					sinonAssert.calledTwice(console.log); // eslint-disable-line
					sinonAssert.calledWithExactly(console.log.getCall(0), 'Test case: Should print the response for the whole execution if printResponse is truthy'); // eslint-disable-line
					sinonAssert.calledWithExactly(console.log.getCall(1), sinon.match(/^Response: /)); // eslint-disable-line
				},
				event: SNSMessage
			}
		], {
			printResponse: true
		});
	});

	describe('Hooks calls', () => {

		const externalSandbox = sinon.createSandbox();
		const beforeAll = externalSandbox.fake();
		const before = externalSandbox.fake();
		const after = externalSandbox.fake();

		AWSListenerTest(MyHandler, [
			{
				description: 'Should call the rule before and after hooks once',
				event: SNSMessage,
				before,
				after
			}
		], {
			before: beforeAll,
			after: () => {
				externalSandbox.assert.calledOnce(beforeAll);
				externalSandbox.assert.calledOnce(before);
				externalSandbox.assert.calledOnce(after);

				assert(before.calledAfter(beforeAll));
				assert(after.calledAfter(before));
			}
		});
	});
});
