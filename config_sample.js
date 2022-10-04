const config = {};

config.project = {
  name: "ml-ev-middle-tier"
};

config.path = "/PATH/TO/ml-ev-middle-tier/"; // include trailing "/"

config.auth = {
  user: 'USERNAME',
  pass: 'PASSWORD',
  sendImmediately: false
};

config.host = "localhost";

config.server = {
  port: 7777
}

config.databases = {
  content: {
    name: config.project.name + "-content"
  },
  modules: {
    name: config.project.name + "-modules"
  },
};

config.rest = {
  "rest-api": {
    name: config.project.name + "-rest",
    database: config.databases.content.name,
    "modules-database": config.databases.modules.name,
    port: 8077,
    "error-format": "json"
  }
};

config.xdbc = {
  "server-name": config.project.name + "-xdbc",
  "server-type": "xdbc",
  "group-name": "Default",
  "content-database": config.databases.content.name,
  root: "/",
  port: 8006
};

config.role = {
  "role-name": config.project.name + "-role", 
  "privilege": [
    {
      "privilege-name": "xdmp:eval",
      "action": "http://marklogic.com/xdmp/privileges/xdmp-eval",
      "kind": "execute"
    },
    {
      "privilege-name": "xdmp:eval-in",
      "action": "http://marklogic.com/xdmp/privileges/xdmp-eval-in",
      "kind": "execute"
    },
    {
      "privilege-name": "unprotected-collections",
      "action": "http://marklogic.com/xdmp/privileges/unprotected-collections",
      "kind": "execute"
    },
    {
      "privilege-name": "unprotected-uri",
      "action": "http://marklogic.com/xdmp/privileges/unprotected-uri",
      "kind": "execute"
    }
  ]
}

config.user = {
  "user-name": config.project.name + "-user", 
  "password": "password",
  "role": [ config.project.name + "-role", "rest-admin", "hadoop-user-all" ] 
}

config.entityType = "person";

config.entityLabel = "Person";

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = config;
}
