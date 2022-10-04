const config = require('../config'),
      rp = require('request-promise');
      fs = require('fs'),
      colors = require('colors');

const handleError = (err) => {
  if (err.error &&
      err.error.errorResponse &&
      err.error.errorResponse.message) {
    console.log('Error: '.red + err.error.errorResponse.message.red);
  } else {
    console.log(JSON.stringify(err, null, 2));
  }
}

const createDatabase = async (body) => {
  const options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/manage/v2/databases',
    body: body,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  try {
    const response = await rp(options);
    console.log('Database created: '.green + body["database-name"]);
  } catch (error) {
    handleError(error);
  }
}

const getHost = async () => {
  const options = {
    method: 'GET',
    uri: 'http://' + config.host + ':8002/manage/v2/hosts',
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  try {
    const response = await rp(options);
    return response['host-default-list']['list-items']['list-item'][0].nameref;
  } catch (error) {
    handleError(error);
  }
}

const createForest = async (name) => {
  let hostName = await getHost();
  const options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/manage/v2/forests',
    body: {
      "forest-name": name + '-1',
      "database": name,
      "host": hostName
    },
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  try {
    const response = await rp(options);
    console.log('Forest created and attached: '.green + name + '-1');
  } catch (error) {
    handleError(error);
  }
}

const createREST = async () => {
  const options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/v1/rest-apis',
    body: config.rest,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  try {
    const response = await rp(options);
    console.log('REST instance created at port: '.green + config.rest["rest-api"].port);
  } catch (error) {
    handleError(error);
  }
}

const createODBC = async () => {
    var options = {
      method: 'POST',
      uri: 'http://' + config.host + ':8002/manage/v2/servers?format=json',
      body: config.odbc,
      json: true,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: config.auth
    };
    try {
        const response = await rp(options);
        console.log('ODBC server created at port:   '.green + config.odbc.port);
      } catch (error) {
        handleError(error);
      }
  }

const createXDBC = async () => {
  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/manage/v2/servers?format=json',
    body: config.xdbc,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  try {
    const response = await rp(options);
    console.log('XDBC server created at port:   '.green + config.xdbc.port);
  } catch (error) {
    handleError(error);
  }
}

const createRole = async () => {
  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/manage/v2/roles?format=json',
    body: config.role,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  try {
    const response = await rp(options);
    console.log('Role created: '.green + config.role["role-name"]);
  } catch (error) {
    handleError(error);
  }
}

const createUser = async () => {
  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/manage/v2/users?format=json',
    body: config.user,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  try {
    const response = await rp(options);
    console.log('User created: '.green + config.user["user-name"]);
  } catch (error) {
    handleError(error);
  }
}

let inputPath = config.path + 'setup/input/basic/'
    recordFiles = fs.readdirSync(inputPath),
    count = 0;

const loadRecords = async () => {
  let currFile = recordFiles.shift();
  count++;
  let buffer;
  buffer = fs.readFileSync(inputPath + currFile);

  let url = 'http://' + config.host + ':' + config.rest["rest-api"].port + '/v1/documents';
  let db = '?database=' + config.databases.content.name;
  let uri = '&uri=/' + currFile;
  let coll = '&collection=' + config.entityType;
  // let perms = "&perm:rest-writer=read&perm:rest-writer=update&perm:rest-reader=update&perm:rest-admin=read&perm:rest-admin=update&perm:rest-admin=execute&perm:harmonized-reader=read&perm:harmonized-updater=update";
  let perms = "&perm:rest-writer=read";

  const options = {
    method: 'PUT',
    uri: url + db + uri + coll + perms,
    body: buffer,
    auth: config.auth
  };
  try {
    const response = await rp(options);
    console.log('Record loaded: '.green + currFile);
    if (recordFiles.length > 0) {
      await loadRecords();
    } else {
      console.log('Records loaded'.green);
    }
  } catch (error) {
    handleError(error);
  }
}

let templatePath = config.path + 'setup/scripts/'
    templateFiles = fs.readdirSync(templatePath),
    count2 = 0;

const loadTemplates = async () => {
  var currFile = templateFiles.shift();
  count2++;
  var buffer;
  buffer = fs.readFileSync(templatePath + currFile);

  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/v1/eval?database=' + config.databases.content.name,
    body: buffer,
    auth: config.auth
  };
  try {
    const response = await rp(options);
    console.log('Template loaded: '.green + currFile);
    if (recordFiles.length > 0) {
      await loadTemplates();
    } else {
      console.log('Templates loaded'.green);
    }
  } catch (error) {
    handleError(error);
  }
}

const loadSearchOptions = async () => {
  let currFile = config.path + 'setup/search-options.xml';
  let buffer = fs.readFileSync(currFile);

  let bufferString = buffer.toString().replace("%%ENTITYTYPE%%", config.entityType);
  
  let url = 'http://' + config.host + ':' + config.rest["rest-api"].port + '/v1/config/query/search-options';

  const options = {
    method: 'POST',
    uri: url, // + db+ uri + perms,
    body: bufferString,
    auth: config.auth,
    headers: {
      'Content-Type': 'application/xml'
    },
  };
  try {
    const response = await rp(options);
    console.log('Module loaded: '.green + '/v1/config/query/search-options');
  } catch (error) {
    handleError(error);
  }
}

const loadSearchLib = async () => {
  let currFile = config.path + 'setup/modules/configurable-search-lib.sjs';
  let buffer = fs.readFileSync(currFile);

  let bufferString = buffer.toString().replace("%%ENTITYTYPE%%", config.entityType);
  
  let url = 'http://' + config.host + ':' + config.rest["rest-api"].port + '/v1/documents';
  let db = '?database=' + config.databases.modules.name;
  let uri = '&uri=' + '/explore-data/search-lib/configurable-search-lib.sjs';
  let perms = "&perm:rest-writer=read&perm:rest-writer=update&perm:rest-reader=update&perm:rest-admin=read&perm:rest-admin=update&perm:rest-admin=execute&perm:harmonized-reader=read&perm:harmonized-updater=update";

  var options = {
    method: 'PUT',
    uri: url + db + uri + perms,
    body: bufferString,
    auth: config.auth
  };
  try {
    const response = await rp(options);
    console.log('Module loaded: '.green + '/explore-data/search-lib/configurable-search-lib.sjs');
  } catch (error) {
    handleError(error);
  }
}

// const configPath = config.path + 'setup/config/'
//     configFiles = fs.readdirSync(configPath),
//     count = 0;

// const loadConfig = async () => {
//   let currFile = configFiles.shift();
//   count++;
//   let buffer;
//   buffer = fs.readFileSync(configPath + currFile);

//   let bufferString = buffer.toString().replace(/%%ENTITYTYPE%%/g, config.entityType).replace(/%%ENTITYLABEL%%/g, config.entityLabel);

//   let url = 'http://' + config.host + ':' + config.rest["rest-api"].port + '/v1/documents';
//   let db = '?database=' + config.databases.modules.name;
//   let uri = '&uri=' + '/explore-data/ui-config/' + currFile;
//   let perms = "&perm:rest-writer=read&perm:rest-writer=update&perm:rest-reader=update&perm:rest-admin=read&perm:rest-admin=update&perm:rest-admin=execute&perm:harmonized-reader=read&perm:harmonized-updater=update";

//   const options = {
//     method: 'PUT',
//     uri: url + db + uri + perms,
//     body: bufferString,
//     auth: config.auth
//   };
//   try {
//     const response = await rp(options);
//     console.log('Config loaded: '.green + currFile);
//     if (configFiles.length > 0) {
//       await loadConfig();
//     } else {
//       console.log('Config files loaded'.green);
//     }
//   } catch (error) {
//     handleError(error);
//   }
// }

const start = async () => {
  console.log(
    '                            SETUP STARTED                             '.gray.bold.inverse
  );
  await createDatabase({
    "database-name": config.databases.schema.name,
  });
  await createDatabase({
    "database-name": config.databases.content.name,
    "schema-database": config.databases.schema.name,
    "triple-index": true
  });
  await createDatabase({
    "database-name": config.databases.modules.name,
  });
  await getHost();
  await createForest(config.databases.schema.name);
  await createForest(config.databases.content.name);
  await createForest(config.databases.modules.name);
  await createREST();
  await createODBC();
  await createXDBC();
  await createRole();
  await createUser();
  console.log('Loading records...'.green);
  await loadRecords();
  console.log('Loading templates...'.green);
  await loadTemplates();
  //   await loadSearchOptions();
  // await loadSearchLib();
  // await loadConfig();
  console.log(
    '                            SETUP FINISHED                            '.gray.bold.inverse
  );
}

start();
