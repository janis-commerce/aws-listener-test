'use strict';

const { inspect } = require('util');

const sinon = require('sinon');

const AwsListenerTestError = require('./aws-listener-test-error');

const Events = require('./events');

const isObject = value => typeof value === 'object' && !Array.isArray(value);

const idempotent = () => {};

const posibleEvent = ['SNS', 'S3', 'SQS'];

class AwsListenerTest {

	constructor(handler, rules, { before, after, printResponse }) {

		this.handler = handler;
		this.rules = rules;

		this.printResponse = !!printResponse;
		this.before = before || idempotent;
		this.after = after || idempotent;
	}

	validate() {

		if(!this.handler || typeof this.handler !== 'function')
			throw new AwsListenerTestError(`Handler must be a function. Received ${inspect(this.handler)}`, AwsListenerTestError.codes.INVALID_HANDLER);

		if(!this.rules || !Array.isArray(this.rules) || !this.rules.length)
			throw new AwsListenerTestError(`Rules must be a not empty array. Received ${inspect(this.rules)}`, AwsListenerTestError.codes.INVALID_RULES);

		const invalidRules = this.rules
			.map(rule => {
				try {
					return this.validateRule(rule);
				} catch({ message }) {
					return {
						...(isObject(rule) ? rule : { rule }),
						error: message
					};
				}

			})
			.filter(Boolean);

		if(invalidRules.length) {
			throw new AwsListenerTestError(
				`Found ${invalidRules.length} invalid rules: ${inspect(invalidRules)}`, AwsListenerTestError.codes.INVALID_RULES
			);
		}

		if(typeof this.before !== 'undefined' && typeof this.before !== 'function')
			throw new AwsListenerTestError('Before hook must be an function', AwsListenerTestError.codes.INVALID_BEFORE_HOOK);

		if(typeof this.after !== 'undefined' && typeof this.after !== 'function')
			throw new AwsListenerTestError('After hook must be an function', AwsListenerTestError.codes.INVALID_AFTER_HOOK);
	}

	validateRule(rule) {

		if(!isObject(rule))
			throw new Error('Rule must be an object');

		if(typeof rule.description !== 'string')
			throw new Error('Description must be a string');

		if(!isObject(rule.event) && typeof rule.event !== 'string')
			throw new Error('Event must be an object or a string');

		if(typeof rule.event === 'string' && !posibleEvent.includes(rule.event))
			throw new Error(`Event must be one of this options: ${posibleEvent.join(',')}`);

		if(typeof rule.responseCode !== 'undefined' && typeof rule.responseCode !== 'number')
			throw new Error('Response code must be a number');

		if(typeof rule.before !== 'undefined' && typeof rule.before !== 'function')
			throw new Error('Before hook must be an function');

		if(typeof rule.after !== 'undefined' && typeof rule.after !== 'function')
			throw new Error('After hook must be an function');
	}

	process() {

		before(() => {
			this.before(sinon);
		});

		after(() => {
			this.after(sinon);
		});

		afterEach(() => {
			sinon.restore();
		});

		this.rules.forEach(rule => this.processRule(rule));
	}

	processRule({
		description,
		only,
		before,
		after,
		event,
		printResponse
	}) {

		// No se puede testear el it.only porque hace que no corra el resto de los tests
		/* istanbul ignore next */
		const tester = only ? it.only : it;
		tester(description, async () => {

			if(before)
				await before(sinon);

			let actualResponse;

			try {
				actualResponse = await this.handler(this.prepareEvent(event));
			} catch(e) {
				actualResponse = e;
			}

			if(printResponse || this.printResponse) {
				console.log(`Test case: ${description}`); // eslint-disable-line no-console
				console.log(`Response: ${inspect(actualResponse)}`); // eslint-disable-line no-console
			}

			if(after)
				await after(sinon);
		});
	}

	/**
	 * Prepare event to use in the test
	 *
	 * @param {string|object} event The event
	 * @return {object} The event to use in the test
	 */
	prepareEvent(event) {

		if(isObject(event))
			return event;

		return Events[`${event}Message`];
	}
}

module.exports = (handler, rules, extraParameters) => {

	const tester = new AwsListenerTest(handler, rules, extraParameters || {});

	tester.validate();

	return tester.process();
};
