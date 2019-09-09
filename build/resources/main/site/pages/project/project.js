var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var nibioUtils = require("/lib/nibioUtils");

exports.get = function (req) {
  var view = resolve('project.html');

  var content = portal.getContent();

  var leftRegion = content.page.regions.left;
  var rightRegion = content.page.regions.right;

  var division = contentLib.get({
    key: content.data.division
  });
  var department = contentLib.get({
    key: content.data.department
  });

  var users = [];
  var projectManagerUser;

  for (var i = 0; i < content.data.users.length; i++) {
    var user = {};

    if (content.data.users[i].userName) {
      user.fullName = content.data.users[i].userName;
      users.push(user);
    } else {
      var userContent = contentLib.get({
        key: content.data.users[i].user
      });
  
      user.fullName = userContent.displayName
      user.url = portal.pageUrl({ id: userContent._id });
      user.role = content.data.users[i].role;
  
      if (user.role === 'manager') {
        projectManagerUser = user;
      } else {
        users.push(user);
      }
    }
  }

  var nowDate = new Date();
  var endDate = new Date(content.data.endDate);
  var active = nowDate.getTime() <= endDate.getTime();

  var model = {
    title: content.displayName,
    photo: content.data.photo,
    intro: content.data.intro,
    startDate: content.data.startDate,
    endDate: content.data.endDate,
    updatedDate: content.data.updatedDate,
    active: active, 
    users: users,
    projectManagerUser: projectManagerUser,
    division: division.displayName,
    department: department.displayName,
    partners: content.data.partners,
    totalBudget: content.data.totalBudget,
    fundingSource: content.data.fundingSource,
    leftRegion: leftRegion,
    rightRegion: rightRegion
  };

  var pageContributions = nibioUtils.getPageContributions();

  return {
    body: thymeleaf.render(view, model),
    pageContributions: pageContributions
  }
};