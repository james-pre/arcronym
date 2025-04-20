#!/usr/bin/bash

echo -n "Checking for postgres... "
id -u postgres > /dev/null 2>&1
HAS_PG_USER=$?
echo "done."

echo -n "Checking for dependencies... "
if [ -n "$(command -v dnf)" ]; then
	echo "using dnf."
	sudo dnf install -y nodejs postgresql-server
elif [ -n "$(command -v apt)" ]; then
	echo "using apt."
	sudo apt install -y nodejs postgresql-server
else
	echo "No package manager detected. Please install nodejs and postgresql-server manually."
	read -p "(Press enter to continue)"
fi

if [ $HAS_PG_USER -ne 0 ]; then
	sudo -u postgres initdb -D /var/lib/pgsql/data
fi

echo "Make sure these lines are added to pg_hba.conf (usually in /var/lib/pgsql/data) before the lines containing 'all all':"
echo -e "local axium axium md5\nhost  axium axium 127.0.0.1/32 md5\nhost  axium axium ::1/128 md5"
read -p "(Press enter to continue)"

npm install
npx axium db init -s
sudo npx axium ports enable -N $(which node)
