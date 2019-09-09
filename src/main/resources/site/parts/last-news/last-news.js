var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var nibioUtils = require("/lib/nibioUtils");

exports.get = function (req) {
  var view = resolve('last-news.html');

  var content = portal.getContent();
  var title = content.displayName;
  var newsPath = content._path;

  var result = contentLib.query({
    start: 0,
    count: 4,
    contentTypes: [
      app.name + ':news-article'
    ],
    query: "_path LIKE '/content" + newsPath + "/*'",
    sort: "modifiedTime DESC"
  });

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

  var model = {
    title: title,
    news: news
  };

  var pageContributions = nibioUtils.getPageContributions();

  return {
    body: thymeleaf.render(view, model),
    pageContributions: pageContributions
  }
};