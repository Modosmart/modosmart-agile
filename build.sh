#!/bin/bash

PROJECT_HOME=$(pwd)
PROJECT_NAME="modosmart-agile-iot"
LAUNCH_DIRECTORY="/var"
SUPERVISOR_DIRECTORY="/etc/supervisor/conf.d"
SUPERVISOR_FILE_NAME="modosmart-agile-iot.conf"

if [[ $(id -u) -ne 0 ]] ; then echo "Please run as root" ; exit 1 ; fi

function help {
	echo "Choose one of the following: {publish|clean|run}"
	exit 1
}

function clean {
	echo "Cleaning .."
	sudo service supervisor stop &&
  sudo rm -r -f ${SUPERVISOR_DIRECTORY}/${SUPERVISOR_FILE_NAME} &&
  sudo service supervisor start &&
  sudo rm -r -f $LAUNCH_DIRECTORY/$PROJECT_NAME
}

function publish {
	sudo apt-get install supervisor &&
	clean
	echo "Publishing .."
  cd ${PROJECT_HOME} &&
  cd .. &&
  # Launching
  sudo cp -r ${PROJECT_NAME} ${LAUNCH_DIRECTORY} &&
  cd $LAUNCH_DIRECTORY/$PROJECT_NAME &&
  sudo npm install &&
	sudo cp ${SUPERVISOR_FILE_NAME} ${SUPERVISOR_DIRECTORY} &&
  sudo service supervisor stop &&
  sudo service supervisor start
}

function run {
  echo "Running .."
  clean
	cd ${PROJECT_HOME} &&
  npm install &&
  node index.js
}

if [ $# -eq 0 ]
then
	help
fi

for cmd in $@
do

case "$cmd" in

	publish)
		publish
	;;

	clean)
		clean
	;;

	run)
		run
	;;

	*)
		help
	;;
esac

done
