# MULTITUBE

Youtube Video Chat implementation using Node.js and Socket.io

## REQUIREMENTS

- NodeJS - http://nodejs.org/ [apt-get install nodejs]
- NPM[Node Package Manager] - http://npmjs.org [curl http://npmjs.org/install.sh | sh]
- MySQL http://mysql.com/

## INSTALLATION

Install any missing dependencies with:

    $ npm install -d

To use MySQL for storage of Video IDs, disable the memory provider and 
uncomment the mysql provider on top of server.js:

    UrlProvider = require('./lib/urlprovider-mysql').UrlProvider

Next, issue the following mysql commands to create the database:

    CREATE DATABASE multitube;
    GRANT SELECT, INSERT, UPDATE, DELETE ON multitube.* TO 'multitube'@'localhost' IDENTIFIED BY 'pAssw0rd';
    GRANT SELECT, INSERT, UPDATE, DELETE ON multitube.* TO 'multitube'@'localhost.localdomain' IDENTIFIED BY 'pAssw0rd';
    FLUSH PRIVILEGES;

After that, create the database table:

    $ mysql -u root multitube < multitube.sql

## RUNNING

    $ node server.js

Now open your web browser and visit http://localhost:3000
