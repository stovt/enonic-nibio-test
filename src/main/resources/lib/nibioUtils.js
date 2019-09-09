var contentLib = require('/lib/xp/content');
var portal = require("/lib/xp/portal");
var thymeleaf = require('/lib/thymeleaf');

exports.mergeObjects = mergeObjects;
exports.forceArray = forceArray;
exports.getMenu = getMenu;
exports.getPageContributions = getPageContributions;
exports.getPagePagination = getPagePagination;

function mergeObjects(obj1, obj2) {
  var obj3 = {};

  for (var attrname in obj1) {
    obj3[attrname] = obj1[attrname];
  }
  for (var attrname in obj2) {
    obj3[attrname] = obj2[attrname];
  }

  return obj3;
}

function forceArray(data) {
  if (!Array.isArray(data)) {
    data = [data];
  }
  return data;
}

function getMenu() {
  var siteConfig = portal.getSiteConfig();
  var content = portal.getContent();

  var menu = {
    internal: [],
    external: []
  };

  if (siteConfig.menuItems) {
    var menuItems = forceArray(siteConfig.menuItems);

    for (var i = 0; i < menuItems.length; i++) {
      var menuTitle = contentLib.get({ key: menuItems[i] }).displayName;
      var menuUrl = portal.pageUrl({ id: menuItems[i] });
      var contentUrl = portal.pageUrl({ _path: content._path }) ;

      menu.internal.push({
        url: menuUrl,
        title: menuTitle,
        active: contentUrl.startsWith(menuUrl)
      });
    }
  }

  if (siteConfig.menuLinks) {
    var menuLinks = forceArray(siteConfig.menuLinks);

    for (var i = 0; i < menuLinks.length; i++) {
      menu.external.push({
        url: menuLinks[i].url,
        title: menuLinks[i].title
      });
    }
  }

  return menu;
}

function getPageContributions() {
  var menuView = resolve("/site/pages/components/menu.html");  

  var site = portal.getSite();

  var menu = getMenu();
  var menuModel = {
    site: site,
    internalMenu: menu.internal,
    externalMenu: menu.external
  };
  var menuBody = thymeleaf.render(menuView, menuModel);

  var searchFormView = resolve("/site/pages/components/search-form.html");
  var searchFormModel = {};
  var searchFormBody = thymeleaf.render(searchFormView, searchFormModel);

  var headView = resolve("/site/pages/components/head.html");
  var headModel = {};
  var headBody = thymeleaf.render(headView, headModel);

  return {
    headBegin: headBody,
    bodyBegin: [menuBody, searchFormBody]
  }
}

function getPagePagination(req, totalPages) {
  var content = portal.getContent();

  var pages = [];

  if (req.params.page && req.params.page !== '2') {
    var prevPageUrl = portal.pageUrl({
      id: content._id,
      params: mergeObjects(req.params, {
        page: (req.params.page - 1).toString()
      })
    });
  } else {
    var reqParams = {};
    for (var key in req.params) {
      if (key !== 'page') {
        reqParams[key] = req.params[key];
      }
    }
    var prevPageUrl = portal.pageUrl({
      id: content._id,
      params: reqParams
    });
  }
  var prevPage = {
    title:'Previous',
    url: prevPageUrl,
    active: false,
    disabled: !req.params.page
  };

  pages.push(prevPage);

  var firstPageParams = {};
  for (var key in req.params) {
    if (key !== 'page') {
      firstPageParams[key] = req.params[key];
    }
  }
  var firstPage = {
    title: '1',
    url: portal.pageUrl({ id: content._id, params: firstPageParams }),
    active: !req.params.page,
    disabled: false
  };

  pages.push(firstPage);

  for (var i = 2; i < totalPages + 1; i++) {
    var page = {};
  
    page.title = i.toString();
    page.url = portal.pageUrl({
      id: content._id,
      params: mergeObjects(req.params, {
        page: i.toString()
      })
    });
    page.active = page.url === portal.pageUrl({ id: content._id, params: req.params });
    page.disabled = false;

    pages.push(page);
  }

  if (!req.params.page && totalPages > 1) {
    var nextPageUrl = portal.pageUrl({
      id: content._id,
      params: mergeObjects(req.params, {
        page: '2'
      })
    });
  } else if ((!req.params.page && totalPages === 1) || (req.params.page && parseInt(req.params.page) === totalPages)) {
    var nextPageUrl = portal.pageUrl({
      id: content._id,
      params: req.params
    });
  } else {
    var nextPageUrl = portal.pageUrl({
      id: content._id,
      params: mergeObjects(req.params, {
        page: (parseInt(req.params.page) + 1).toString()
      })
    });
  }
  var nextPage = {
    title:'Next',
    url: nextPageUrl,
    active: false,
    disabled: req.params.page === totalPages.toString() || totalPages === 1
  };

  pages.push(nextPage);

  return pages;
}