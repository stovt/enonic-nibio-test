var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var util = require('/lib/util');
var nibioUtils = require('/lib/nibioUtils');

exports.get = function (req) {
  var view = resolve('links.html');

  var component = portal.getComponent();

  var links = nibioUtils.forceArray(component.config.links);

  var model = {
    links: links
  };

  return {
    body: thymeleaf.render(view, model)
  }
};
