/**
  * Initialization Oauth.io
  */
var Oauth = (function(){
  //oauth.io authentication
  OAuth.initialize('vMLd_AIdnpZtRPRH61n9z4j8RS8', {cache: true});

  //if the user is already signed in, run the main scripts
  if (OAuth.create('github')) {
    doEverything();
  } else {
      //display sign in form
      $$('#createRepo, #addUser, #listRepos, #languages').hide();
      $$('.signIn').on('click', doEverything);
  }  
})();

/**
 * After login
 */
function doEverything() {
  OAuth.popup('github', {cache: true}, function (error, result) {

    //handle error with error
    //use result.access_token in your API request
    $$('.signIn').hide();
    $$('#createRepo, #addUser, #listRepos').show();
        

      //urls used in API calls
      var apiUrl = "https://api.github.com";
      var access_token = result.access_token;
      var tokenUrl ='?access_token='+access_token;
      var userUrl = apiUrl+'/user'+tokenUrl;
      var authRepoUrl = apiUrl+'/user/repos'+tokenUrl;
      var authAddUserUrl = apiUrl+'/user/match/collaborators'+tokenUrl;


    //next steps
    //getRepos. 
    //getLanguages. 
    //processRepos:  display repos.  calcLangPerc. display repo languages, calcTotalLang. display total lang
    //

    //get array of repo objects
    var getRepos = function (authRepoUrl){
      return $$.ajax({
        url: authRepoUrl,
        type: 'GET',
        data: {'sort': 'updated', 'per_page': 100},
        
      });
    };

    var getReposLanguages = function(repos) {
      return Promise.all(repos.map(function(repo) {
        return $$.ajax({
          url: repo.languages_url+tokenUrl,
          type: 'GET'
        })
      })).then(function(languages) {
        for(var i = 0; i<repos.length; i++) {
          repos[i].languages = languages[i];
        };
        return repos;
      })
    };

    var processRepos = function(repos) {

      //turn object into array then sort array
      var sortObject = function(object) {
        var array = [];
        for(var j in object) {
          array.push([ j,object[j] ])
        }
        array.sort(function(a,b) {return b[1]-a[1] });
        return array;
      };

      //calculate the total bytes of languages in all repos
      var ReposTotalSizes = function(repos){
        var sizes = function(repos) {
          var totals = {};
          repos.forEach(function(repo){
            var languages = repo.languages;
            Object.keys(languages).forEach(function(lang){
              totals[lang] = totals[lang]? totals[lang] + languages[lang] : languages[lang];
            });
          });
          console.log(totals);
          return totals;
        };
        
        var displaySizes = function(totals) {
          var reposLanguages = sortObject(totals);
          var output = '<ul class="list-group totalLanguages"> ';
          for(var i in reposLanguages) {
            output += '<li class="list-group-item">'+reposLanguages[i][0]+':'+'<span class="badge">'+Math.round(reposLanguages[i][1]/1000)+'</span>'+'</li>';
          };
          output+='</ul>';
          $$('.reposLanguages').append(output);
        };
        var totals = sizes(repos);
        displaySizes(totals);
      }; 

      //format the repos into buttons and display them
      var parseRepo = function(repo){
        //display repo html on the page
        var render = function(htmlString) {
          $$('.repos').append(htmlString);
        };

        //count total bytes of repo. argument is object of languages
        var repoBytes = function(repoLangs) {
          var totalBytes=0;
          for(key in repoLangs) {
            //console.log(repoLangs[key]);
            totalBytes += repoLangs[key];
          };
          return totalBytes;
        };
      
        //var totalB = repoBytes(repo.languages);
        //format the repos into buttons/links and checkboxes
        
        var output = '<div class="col-md-2">';
        output += '<div class="panel panel-default">';
        output += '<div class="panel-heading">';
        output += '<label class="btn btn-primary"> <input type="checkbox" id=' + repo.name + '></label> ';//checkbox
        output += '<a href=' + repo.html_url + ' class="'+repo.name+'">' + repo.name + '</a>';
        output += '</div>'
        

        output += ' <div class="panel-body">';
        output += '<ul class="list-group languages"> ';        
        var langArray = sortObject(repo.languages);

        //calculate the languages' percentage of it's repo's total byte size
        for (var i =0;i< langArray.length ;i++) {
          var languagePercentage = Math.round(langArray[i][1]/repoBytes(repo.languages)*100)
          output += '<li class="list-group-item language">' + langArray[i][0] + ':  ' + '<span class="badge">'+languagePercentage+'%'+'</span>' + '</li>'; 
        };
        output += '</ul>';
        output += '</div>';
        output += '</div>';
        output += '</div>';

        render(output);
      };

      repos.forEach(parseRepo);
      ReposTotalSizes(repos);
    }
    getRepos(authRepoUrl).then(getReposLanguages).then(processRepos);
    

    var createRepo = function(authRepoUrl) {
      //POST new repo to github
      var postRepo = function(repoName) {
        return $$.ajax({
          url: authRepoUrl,
          type: 'POST',
          data:{'name': repoName}
        })
      };

      //display new repo
      var renderRepo = function(repo) {
        var content = '<div class="list-group-item"> <a href='+repo.html_url+' class="btn btn-primary">'+repo.name+ '</a> <label class="btn btn-primary"> <input type="checkbox" id='+ repo.name+'> add collaborator </label></div>';
        $$('.repos').prepend(content);
      };
      
      $$('.create').on('click', function() {
        event.preventDefault();
        var repoName = $$('.repoName').val();
        postRepo(repoName).then(renderRepo)
      }); 
    }(authRepoUrl);
    //when create button is clicked, create a new repo and display it
    

//I added $$ to all jquery except ajax before this point
    
    var collaborator = function() {
      
      //add collaborator to repo(s) function
      var addCollaborator = function(userAdded, repo) { 
        var postUser = function(userAdded, repo) {
          $$.ajax({
            url: userUrl,
            type: 'GET',
            success: function(user) {
              var addUserUrl = apiUrl + '/repos/' + user.login + '/' + repo + '/collaborators/' + userAdded + tokenUrl;
              $$.ajax({
                url: addUserUrl,
                type: 'PUT',
                success: function(response) {
                  getGravatar(userAdded);
                }
              });
            }
          });
        }(userAdded, repo);

        //get new collaborator's gravatar from github
        var getGravatar = function(userAdded) {
          var displayGravatar = function(userAdded) {
            var content = '<img src=' + userAdded.avatar_url + ' class="img-responsive img-circle" alt="user added">';
            var oldImg = $$('#' + repo).parent().parent().children('img');
            if(oldImg[0]){ oldImg.hide() };
            $$('.' + repo).after('<img src=' + userAdded.avatar_url + ' class="img-responsive img-circle" alt="user added">');  
          };
          $$.ajax({
            url: apiUrl + '/users/' + userAdded,
            type: 'GET',
            success: displayGravatar
          });  
        };
      };

    //when add button is clicked, add new user to repos
      $$('.add').on('click', function () {
        event.preventDefault();
        var repos = $$("input[type=checkbox]:checked");
        console.log(repos);
        if (repos.length == 0) {
          $$('.error').hide();
          $$('#userName').append('<div class="error">check the repos to which you want to add a collaborator</div>');
        } else {
          for (var i = 0; i < repos.length; i++) {
            $$('.error').hide();
            addCollaborator($$('.userName').val(), repos[i].id);
          }
        };
      });
    }();
    

  });
};