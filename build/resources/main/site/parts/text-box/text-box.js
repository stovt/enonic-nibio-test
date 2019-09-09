var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');

exports.get = function (req) {
  var view = resolve('text-box.html');

  var component = portal.getComponent();

  var model = {
    bgClass: component.config.backgroundColor,
    body: component.config.body
  };

  return {
    body: thymeleaf.render(view, model)
  }
};
