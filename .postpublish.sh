#/!bin/bash

echo "Running post publish hook to notify new version to Slack..."

if [ -f ./.env ]; then
	. ./.env
fi

if [ -z $SLACK_WEBHOOK ]; then
	echo "[X] Missing env var SLACK_WEBHOOK. Notification won't be sent"
	exit
fi

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

curl -s -X POST -H 'content-type: application/json' -d "
	{
		\"username\": \"AWS Listeners Test\",
		\"icon_url\":\"https://static.janis.in/microservices-v2-logos/janis.png\",
		\"text\": \":package: Versión $PACKAGE_VERSION publicada. <https://github.com/janis-commerce/aws-listeners-test/blob/master/CHANGELOG.md|[CHANGELOG]>\"
	}" $SLACK_WEBHOOK