var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var nibioUtils = require("/lib/nibioUtils");

exports.get = function (req) {
  var view = resolve('projects.html');

  var content = portal.getContent();
  var title = content.displayName;
  var contentUrl = portal.pageUrl({
    id: content._id,
    params: req.params
  });
  var projectsPath = content._path;

  var filters = {
    division: req.params.division,
    department: req.params.department,
    yearFrom: req.params.yearFrom,
    yearTo: req.params.yearTo
  };

  var query = "_path LIKE '/content" + projectsPath + "/*'";

  if (filters.yearFrom) {
    var yearFromDate = new Date(filters.yearFrom);
    var yearFromISODate = yearFromDate.toISOString();
    query += " AND data.startDate > dateTime('" + yearFromISODate + "')";
  }
  if (filters.yearTo) {
    var yearToDate = new Date(filters.yearTo);
    var yearToISODate = yearToDate.toISOString();
    query += " AND data.startDate < dateTime('" + yearToISODate + "')";
  }
  if (filters.division) {
    query += " AND data.division = '" + filters.division + "'";
  }
  if (filters.department) {
    query += " AND data.department = '" + filters.department + "'";
  }

  if (!req.params.sort) {
    var sortTitleUrl = portal.pageUrl({
      id: content._id,
      params: nibioUtils.mergeObjects(req.params, { sort: 'title-DESC' })
    });
    var sortEndingUrl = portal.pageUrl({
      id: content._id,
      params: nibioUtils.mergeObjects(req.params, { sort: 'ending-DESC' })
    });
    var sortLastUpdateUrl = portal.pageUrl({
      id: content._id,
      params: nibioUtils.mergeObjects(req.params, { sort: 'update-DESC' })
    });
  } else {
    var sortItem = req.params.sort.split('-')[0];
    var sortType = req.params.sort.split('-')[1];
    var newSortType = sortType === 'DESC' ? 'ASC' : 'DESC';

    var sortTitleUrl = portal.pageUrl({
      id: content._id,
      params: nibioUtils.mergeObjects(
        req.params, {
          sort: sortItem === 'title' ? 'title-' + newSortType : 'title-DESC'
        }
      )
    });
    var sortEndingUrl = portal.pageUrl({
      id: content._id,
      params: nibioUtils.mergeObjects(
        req.params, {
          sort: sortItem === 'ending' ? 'ending-' + newSortType : 'ending-DESC'
        }
      )
    });
    var sortLastUpdateUrl = portal.pageUrl({
      id: content._id,
      params: nibioUtils.mergeObjects(
        req.params, {
          sort: sortItem === 'update' ? 'update-' + newSortType : 'update-DESC'
        }
      )
    });
  }

  var sortTitleName = 'Title';
  var sortEndingName = 'Ending';
  var sortLastUpdateName = 'Last Update';

  var sort = "modifiedTime DESC";
  if (sortItem && sortType) {
    switch (sortItem) {
      case 'title':
        sort = "displayName " + sortType;
        sortTitleName += sortType === 'DESC' ? ' DOWN': ' UP';
        break;
      case 'ending':
        sort = "data.endDate " + sortType;
        sortEndingName += sortType === 'DESC' ? ' DOWN': ' UP';
        break;
      case 'update':
        sort = "data.updatedDate " + sortType;
        sortLastUpdateName += sortType === 'DESC' ? ' DOWN': ' UP';
        break;
    }
  }

  var count = 2;
  var start = parseInt(req.params.page) ? (parseInt(req.params.page) - 1) * count : 0;

  var result = contentLib.query({
    start: start,
    count: count,
    contentTypes: [
      app.name + ':project'
    ],
    query: query,
    sort: sort
  });

  var total = result.total;
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

  var divisionsResult = contentLib.query({
    start: 0,
    count: -1,
    contentTypes: [
      app.name + ':division'
    ],
    query: "",
    sort: "displayName ASC"
  });

  var divisionsHits = divisionsResult.hits;

  var divisions = [];

  if (divisionsHits.length) {
    for (var i = 0; i < divisionsHits.length; i++) {
      var division = {};

      division.id = divisionsHits[i]._id;
      division.title = divisionsHits[i].displayName;

      divisions.push(division);
    }
  }

  var departmentsResult = contentLib.query({
    start: 0,
    count: -1,
    contentTypes: [
      app.name + ':department'
    ],
    query: "",
    sort: "displayName ASC"
  });

  var departmentsHits = departmentsResult.hits;

  var departments = [];

  if (departmentsHits.length) {
    for (var i = 0; i < departmentsHits.length; i++) {
      var department = {};

      department.id = departmentsHits[i]._id;
      department.title = departmentsHits[i].displayName;

      departments.push(department);
    }
  }

  var totalPages = Math.ceil(total / count);
  var pages = nibioUtils.getPagePagination(req, totalPages);

  var model = {
    title: title,
    projects: projects,
    divisions: divisions,
    departments: departments,
    contentUrl: contentUrl,
    filters: filters,
    sortTitleName: sortTitleName,
    sortEndingName: sortEndingName,
    sortLastUpdateName: sortLastUpdateName,
    sortTitleUrl: sortTitleUrl,
    sortEndingUrl: sortEndingUrl,
    sortLastUpdateUrl: sortLastUpdateUrl,
    pages: pages
  };

  var pageContributions = nibioUtils.getPageContributions();

  return {
    body: thymeleaf.render(view, model),
    pageContributions: pageContributions
  }
};