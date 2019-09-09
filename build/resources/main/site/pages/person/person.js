var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var nibioUtils = require("/lib/nibioUtils");

exports.get = function (req) {
  var view = resolve('person.html');

  var content = portal.getContent();

  var result = contentLib.query({
    start: 0,
    count: -1,
    contentTypes: [
      app.name + ':project'
    ],
    query: "data.users.user = '" + content._id + "'",
    sort: "modifiedTime DESC"
  });

  var hits = result.hits;

  var projects = [];

  if (hits.length) {
    for (var i = 0; i < hits.length; i++) {
      var project = {};

      var division = contentLib.get({
        key: hits[i].data.division
      });

      project.title = hits[i].displayName;
      project.division = division.displayName;
      project.intro = hits[i].data.intro;
      project.photo = hits[i].data.photo;
      project.contentUrl = portal.pageUrl({
        id: hits[i]._id
      });

      projects.push(project);
    }
  }

  var model = {
    title: content.displayName,
    fullName: content.displayName,
    photo: content.data.photo,
    position: content.data.position,
    phone: content.data.phone,
    email: content.data.email,
    projects: projects
  };

  var pageContributions = nibioUtils.getPageContributions();

  return {
    body: thymeleaf.render(view, model),
    pageContributions: pageContributions
  }
};