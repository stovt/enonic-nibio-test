var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var nibioUtils = require("/lib/nibioUtils");

exports.get = function (req) {
  var view = resolve('main.html');

  var content = portal.getContent();

  var mainRegion = content.page.regions.main;

  var model = {
    title: content.displayName,
    mainRegion: mainRegion
  };

  var pageContributions = nibioUtils.getPageContributions();

  return {
    body: thymeleaf.render(view, model),
    pageContributions: pageContributions
  };
};