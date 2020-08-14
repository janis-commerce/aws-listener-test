'use strict';

class AwsListenerTestError extends Error {

	static get codes() {

		return {
			// your errors here...
		};

	}

	constructor(err, code) {
		super(err);
		this.message = err.message || err;
		this.code = code;
		this.name = 'AwsListenerTestError';
	}
}

module.exports = AwsListenerTestError;
