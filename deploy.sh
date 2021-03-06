#!/bin/bash
if [ "$TRAVIS_BRANCH" == "master" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ];
then
   echo "Deploying to Github"

   $(git config --global user.email "${GIT_EMAIL}")
   $(git config --global user.name "${GIT_COMMIT_DISPLAYNAME}")
   $(git remote set-url origin https://${GH_USER}:${GH_TOKEN}@github.com/${GH_USER}/${GH_REPO}.git)
   $(cd evento && npm run deploy)
else
   echo "Not running from master, so not deploying to Github!"
fi
