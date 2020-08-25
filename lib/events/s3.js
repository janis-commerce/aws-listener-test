'use strict';

module.exports = {
	Records: [
		{
			s3: {
				s3SchemaVersion: '1.0',
				configurationId: 'testConfigId',
				bucket: {
					name: 'bucket-name',
					ownerIdentity: { principalId: '25DF414140DB2A' },
					arn: 'arn:aws:s3:::bucket-name'
				},
				object: {
					key: 'path/to/object.json',
					sequencer: '16E051CDD44',
					size: 84,
					eTag: 'f5edbddec6fc3d3a7fabe0e4c14d4744'
				}
			}
		}
	]
};
