var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var nibioUtils = require("/lib/nibioUtils");
var util = require("/lib/util");

exports.get = function (req) {
  var view = resolve('news.html');

  var content = portal.getContent();
  var title = content.displayName;
  var newsPath = content._path;

  var count = 2;
  var start = parseInt(req.params.page) ? (parseInt(req.params.page) - 1) * count : 0;

  var result = contentLib.query({
    start: start,
    count: count,
    contentTypes: [
      app.name + ':news-article'
    ],
    query: "_path LIKE '/content" + newsPath + "/*'",
    sort: "modifiedTime DESC"
  });

  var total = result.total;

  var hits = result.hits;
  var news = [];

  if (hits.length) {
    for (var i = 0; i < hits.length; i++) {
      var newsItem = {};

      newsItem.title = hits[i].displayName;
      newsItem.intro = hits[i].data.intro;
      newsItem.photo = hits[i].data.photo;
      newsItem.contentUrl = portal.pageUrl({
        id: hits[i]._id
      });

      news.push(newsItem);
    }
  }

  var totalPages = Math.ceil(total / count);
  var pages = nibioUtils.getPagePagination(req, totalPages);

  var model = {
    title: title,
    news: news,
    pages: pages
  };

  var pageContributions = nibioUtils.getPageContributions();

  return {
    body: thymeleaf.render(view, model),
    pageContributions: pageContributions
  }
};