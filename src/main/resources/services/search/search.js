var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var nibioUtils = require("/lib/nibioUtils");

exports.get = function (req) {
  var view = resolve('search.html');

  var query = "fulltext('_allText', '" + req.params.q + "', 'OR') OR ngram('_allText', '" + req.params.q + "', 'OR')";

  var projects = [];
  var news = [];
  var persons = [];

  if (req.params.f === "all" || req.params.f === "projects") {
    var resultProjects = contentLib.query({
      query: query,
      contentTypes: [app.name + ":project"]
    });

    var projectsHits = resultProjects.hits;

    if (projectsHits.length) {
      for (var i = 0; i < projectsHits.length; i++) {
        var project = {};

        var division = contentLib.get({
          key: projectsHits[i].data.division
        });

        project.title = projectsHits[i].displayName;
        project.division = division.displayName;
        project.intro = projectsHits[i].data.intro;
        project.photo = projectsHits[i].data.photo;
        project.contentUrl = portal.pageUrl({
          id: projectsHits[i]._id
        });

        projects.push(project);
      }
    }
  }

  if (req.params.f === "all" || req.params.f === "news") {
    var resultNews = contentLib.query({
      query: query,
      contentTypes: [app.name + ":news-article"]
    });

    var newsHits = resultNews.hits;

    if (newsHits.length) {
      for (var i = 0; i < newsHits.length; i++) {
        var newsItem = {};

        newsItem.title = newsHits[i].displayName;
        newsItem.intro = newsHits[i].data.intro;
        newsItem.photo = newsHits[i].data.photo;
        newsItem.contentUrl = portal.pageUrl({
          id: newsHits[i]._id
        });

        news.push(newsItem);
      }
    }
  }
  
  if (req.params.f === "all" || req.params.f === "persons") {
    var resultPersons = contentLib.query({
      query: query,
      contentTypes: [app.name + ":person"]
    });

    var personsHits = resultPersons.hits;

    if (personsHits.length) {
      for (var i = 0; i < personsHits.length; i++) {
        var person = {};

        person.fullName = personsHits[i].displayName;
        person.photo = personsHits[i].data.photo;
        person.position = personsHits[i].data.position;
        person.phone = personsHits[i].data.phone;
        person.email = personsHits[i].data.email;
        person.contentUrl = portal.pageUrl({
          id: personsHits[i]._id
        });

        persons.push(person);
      }
    }
  }

  var pageContributions = nibioUtils.getPageContributions();
  for (var key in pageContributions){
    pageContributions[key] = nibioUtils.forceArray(pageContributions[key]);
  }

  var model = {
    pageContributions: pageContributions,
    projects: projects,
    news: news,
    persons: persons
  };

  return {
    body: thymeleaf.render(view, model)
  };
};