var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var nibioUtils = require("/lib/nibioUtils");

exports.get = function (req) {
  var view = resolve('news-single.html');

  var content = portal.getContent();

  var leftRegion = content.page.regions.left;
  var rightRegion = content.page.regions.right;

  var author = contentLib.get({
    key: content.data.author
  });

  var model = {
    title: content.displayName,
    intro: content.data.intro,
    photo: content.data.photo,
    author: author.displayName,
    authorUrl: portal.pageUrl({
      id: author._id
    }),
    leftRegion: leftRegion,
    rightRegion: rightRegion
  };

  var pageContributions = nibioUtils.getPageContributions();

  return {
    body: thymeleaf.render(view, model),
    pageContributions: pageContributions
  }
};