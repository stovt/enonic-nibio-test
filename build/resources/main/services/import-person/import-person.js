var contextLib = require('/lib/xp/context');
var portalLib = require('/lib/xp/portal');
var importLib = require("/lib/importLib");

exports.post = function (req) {
  var params = req.params;

  var message = "Missing params: ";

  var missingParams = [];
  var photo = portalLib.getMultipartItem('photo');
  if (!photo) missingParams.push("'photo'");
  if (!params.firstName) missingParams.push("'firstName'");
  if (!params.lastName) missingParams.push("'lastName'");
  if (!params.position) missingParams.push("'position'");
  if (!params.phone) missingParams.push("'phone'");
  if (!params.email) missingParams.push("'email'");
  // if (!params.password) missingParams.push("'password'");

  if (missingParams.length) {
    message += missingParams.join(', ');

    return {
      body: {
        status: false,
        message: message
      },
      contentType: 'application/json'
    };
  }

  function callback() {
    return importLib.importPerson(req.params);
  }

  var result = contextLib.run({
    repository: 'com.enonic.cms.default',
    branch: 'draft',
    user: {
      login: 'su'
    }
  }, callback);

  return {
    body: {
      status: result,
      message: !result ? 'Operation failed.' : ''
    },
    contentType: 'application/json'
  };
};
