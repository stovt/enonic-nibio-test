var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');
var common = require('/lib/xp/common');
var authLib = require('/lib/xp/auth');
var util = require('/lib/util');

exports.importPerson = importPerson;


function importPerson(params) {
 /* var user = authLib.createUser({
    idProvider: 'system',
    name:  common.sanitize(params.firstName + ' ' + params.lastName),
    displayName: params.firstName + ' ' + params.lastName,
    email: params.email
  });

  util.log(user);
*/
  var photoResult;
  var parentPath;

  function modifyEditor(person) {
    /*
    person._name = (person.data.firstName !== params.firstName || person.data.lastName !== params.lastName)
      ? common.sanitize(params.firstName + ' ' + params.lastName)
      : person._name;
    person.displayName = (person.data.firstName !== params.firstName || person.data.lastName !== params.lastName)
      ? params.firstName + ' ' + params.lastName
      : person._name;
    */
    person.data.firstName = person.data.firstName !== params.firstName ? params.firstName : person.data.firstName;
    person.data.lastName = person.data.lastName !== params.lastName ? params.lastName : person.data.lastName;
    person.data.position = person.data.position !== params.position ? params.position : person.data.position;
    person.data.phone = person.data.phone !== params.phone ? params.phone : person.data.phone;
    person.data.email = person.data.email !== params.email ? params.email : person.data.email;

    var photoStream = portalLib.getMultipartStream('photo');
    var photo = portalLib.getMultipartItem('photo');
    if (photo) {    
      var photoNameArr = photo.fileName.split('.');
      photoNameArr[2] = "." + photoNameArr[1];
      photoNameArr[1] = "-" + new Date().getTime();

      photoResult = contentLib.createMedia({
        name: photoNameArr.join(''),
        parentPath: parentPath,
        mimeType: photo.contentType,
        data: photoStream
      });

      person.data.photo = photoResult._id;
    }

    return person;
  }


  var searchResult = contentLib.query({
    start: 0,
    count: 1,
    contentTypes: [
      app.name + ':person'
    ],
    query: "_parentPath = '/content/nibio/persons' AND _name = '" + common.sanitize(params.firstName + ' ' + params.lastName) + "'"
  });

  if (searchResult.count) {
    var personId = searchResult.hits[0]._id;
    parentPath = searchResult.hits[0]._path;

    var modifyResult = contentLib.modify({
      key: personId,
      editor: modifyEditor
    });

    var publishResult = contentLib.publish({
      keys: photoResult ? [personId, photoResult._id] : [personId],
      sourceBranch: 'draft',
      targetBranch: 'master',
      includeDependencies: false
    });
  
    if (!publishResult || publishResult.failedContents.length) return false;
    return true;
  };

  var personResult = contentLib.create({
    name: common.sanitize(params.firstName + ' ' + params.lastName),
    parentPath: '/nibio/persons',
    displayName: params.firstName + ' ' + params.lastName,
    contentType: app.name + ':person',
    requireValid: false,
    data: params
  });

  parentPath = personResult._path;

  var modifyResult = contentLib.modify({
    key: personResult._id,
    editor: modifyEditor
  });

  var publishResult = contentLib.publish({
    keys: photoResult ? [personResult._id, photoResult._id] : [personResult._id],
    sourceBranch: 'draft',
    targetBranch: 'master',
    includeDependencies: false
  });

  if (!publishResult || publishResult.failedContents.length) return false;
  return true;
} 