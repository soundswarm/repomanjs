/* @flow */

//create a jquery-like library called $$
(function() {
	
	//
	var $$ = function(elements) {
		return new Library(elements);
	};

	//another constructor function
	var Library = function(elements) {
		var selector = document.querySelectorAll(elements); 
		this.length = selector.length;
		for(var i = 0; i<this.length; i++) {
			this[i] = selector[i];
		};
		return this;
	};

	//functions in my $$ library that have the same name as jquery functions and act similiar to said jquery functions
	$$.prototype = Library.prototype = 
	{
		after: function(content) {
			var len = this.length;
			while(len--) {
				this[len].insertAdjacentHTML('afterend', content);
			};
			return this;
		},
		append: function(content) {
			var len = this.length;
			while(len--) {
				this[len].insertAdjacentHTML('beforeend', content);
			};
			return this;
		},
		children: function(child) {
			var len = this.length;
			while(len--) {
				this[len] = this[len].querySelector('img');
			}
			return this[0] == null? "": this;
		},
		hide: function() {
			var len = this.length;
			while(len--) {
				this[len].style.display = 'none';
			};
			return this;
		},
		on: function(action, callback) {
			var len = this.length;
			while(len--) {
				this[len].addEventListener(action, callback);
			};
			return this;
		},
		parent: function() {
			var len = this.length;
			while(len--) {
				this[len] = this[len].parentNode;
			};
			console.log(this);
			return this;
		},
		prepend: function(content) {
			var len = this.length;
			while(len--) {
				this[len].insertAdjacentHTML('afterbegin', content)
			};
			return this;
		},
		removeChild: function(newChild, oldChild) {
			var len = this.length;
			while(len--) {
				this[len].removeChild(newChild, oldChild);
			};
			return this
		},
		show: function(){
			var len = this.length;
			while(len--) {
				this[len].style.display = 'block';
			};
			return this;
		},
		val: function() {
			return this[0].value;
		}
	}

	//similiar to jquery ajax.  However, input must be an object. 
	$$.ajax =  function(input) {
		//CORRECT THE URL
		//add input.data parameters to the end of the url

		return new Promise(function(resolve,reject) {
			var httpRequest;
			if (window.XMLHttpRequest) { // Mozilla, Safari, IE7+ ...
			    httpRequest = new XMLHttpRequest();
			} else if (window.ActiveXObject) { // IE 6 and older
			    httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
			};
			var response = function() {
				if(httpRequest.readyState === 4) {
					if(httpRequest.status >= 200 && httpRequest.status <300) {
						if(input.success) {
							if(input.type==='PUT') {
								resolve(input.success(httpRequest.response));
							} else {
								resolve(input.success(JSON.parse(httpRequest.response)));
							}
							
						} else {
							resolve(JSON.parse(httpRequest.response));
						};
					};
				};
			};

			//add data parameters to the url for a GET request
			if(input.type == 'GET') {
				if(input.data) {
					if(input.url.search(/\?/) !=-1) {
						for(var key in input.data) {
							input.url += '&'+key+'='+input.data[key]
						};
					} else {
						input.url += '?';
						for(var key in input.data) {
							input.url += key+'='+input.data[key]+'&'
						};
						input.url = input.url.substring(0,input.url.length-1)
					}
				};
			};
			httpRequest.open(input.type, input.url, true);
			httpRequest.onreadystatechange = response;

			if(input.type ==='POST') {
				httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				httpRequest.send(JSON.stringify(input.data));
			} else {
				httpRequest.send();
			}			
		});		
	};

	if(!window.$$) {
		window.$$ = $$;
	};
})();


//User Class.  Argument = Github JSON
var User = function(userName, apiUrl, tokenUrl) {
	this.apiUrl = apiUrl;
	this.user = userName;
	this.tokenUrl = tokenUrl;

	this.authReposUrl = this.apiUrl+'/user/repos'+this.tokenUrl;
	//this.repos = this.getRepos(this.authReposUrl);
	//this.languages = getLanguages();

	this.prototype.getRepos = function(){
		var promise = $.Deferred();
		$.ajax({
		  url: this.authReposUrl,
		  type: 'GET',
		  data: {'sort': 'updated'}, 
		  success: function(result) {
		  	promise.resolve(result);
		  }
		});
		return promise;
	}
	//this.prototype.getLanguages = function() {};
};






