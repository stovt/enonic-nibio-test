var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var nibioUtils = require("/lib/nibioUtils");

exports.get = function (req) {
  var view = resolve('persons.html');

  var content = portal.getContent();
  var title = content.displayName;
  var personsPath = content._path;

  var count = 3;
  var start = parseInt(req.params.page) ? (parseInt(req.params.page) - 1) * count : 0;

  var result = contentLib.query({
    start: start,
    count: count,
    contentTypes: [
      app.name + ':person'
    ],
    query: "_path LIKE '/content" + personsPath + "/*'",
    sort: "modifiedTime DESC"
  });

  var total = result.total;
  var hits = result.hits;

  var persons = [];

  if (hits.length) {
    for (var i = 0; i < hits.length; i++) {
      var person = {};

      person.fullName = hits[i].displayName;
      person.photo = hits[i].data.photo;
      person.position = hits[i].data.position;
      person.phone = hits[i].data.phone;
      person.email = hits[i].data.email;
      person.contentUrl = portal.pageUrl({
        id: hits[i]._id
      });

      persons.push(person);
    }
  }

  var totalPages = Math.ceil(total / count);
  var pages = nibioUtils.getPagePagination(req, totalPages);

  var model = {
    title: title,
    persons: persons,
    pages: pages
  };

  var pageContributions = nibioUtils.getPageContributions();

  return {
    body: thymeleaf.render(view, model),
    pageContributions: pageContributions
  }
};