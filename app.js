$(document).ready( function() {
	$('.unanswered-getter').submit( function(event){
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});

	$('.inspiration-getter').submit( function(event){
		$('.results').html('');
		// get the value of the tags the user submitted
		var tag = $(this).find("input[name='answerers']").val();
		var period = $("#param-period option:selected").text(); 
		getAnswerers(tag, period);
	});


});

// this function takes the question object returned by StackOverflow 
// and creates new result to be appended to DOM


var questionResultTemplate = 
			'<dt>Question</dt>' +
				'<dd class="question-text"><a href="{{qLink}}" target="_blank">{{qTitle}}</a></dd>' +
			'<dt>Asked</dt>' +
				'<dd class="asked-date">{{qDate}}</dd>' +
			'<dt>Viewed</dt>' +
				'<dd class="viewed">{{qViewCount}}</dd>' +
			'<dt>Asker</dt>' +
				'<dd class="asker">' + 
					'<p>Name: <a target="_blank" href="http://stackoverflow.com/users/{{qUserId}}" >{{qDisplayName}}</a>' +
					'</p>' +
					'<p>Reputation: {{qRep}}</p>'
				'</dd>';

var answererResultTemplate = 
				'<dt>User:</dt>' +
					'<dd>' +
						'<p>' +
							'<img src="{{aIcon}}" alt="userImage" class="userIcon">' +
								'Name: <a href="{{aLink}}">{{aName}}</a>' +
						'</p>' +
						'<p>' +
							'User Type: {{aType}}' +
						'</p>' +
					'</dd>' +
				'<dt>Stats:</dt>' +
					'<dd>' +
						'<p>' +
							'Reputation: {{aRep}}' +
						'</p>' +
						'<p>' +
							'Post Count: {{aCount}}' +
						'</p>' +
						'<p>' +
							'Score: {{aScore}}' +
						'</p>' +
					'</dd>';

var showAnswerer = function(answerer) {
	var result = $('.templates .topAnswerer').clone();
	
	var data = {
		aIcon: answerer.user.profile_image,
		aLink: answerer.user.link,
		aName: answerer.user.display_name,
		aType: answerer.user.user_type,
		aRep: answerer.user.reputation,
		aCount: answerer.post_count,
		aScore: answerer.score
	}
	console.log(data);

	var newHtml = Mustache.to_html(answererResultTemplate, data);

	result.html(newHtml);

	return result;
};

var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();

	var data = {
		qLink: question.link,
		qTitle: question.title,
		qDate: new Date(1000*question.creation_date).toString(),
		qViewCount: question.view_count,
		qUserId: question.owner.user_id,
		qDisplayName: question.owner.display_name,
		qRep: question.owner.reputation
	};

	var newHtml = Mustache.to_html(questionResultTemplate, data);

	result.html(newHtml);

	return result;
};

// this function takes the results object from StackOverflow
// and creates info about search results to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query;
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow

var getAnswerers = function(tag, period) {

	var request = {tagged: tag,
					site: 'stackoverflow',
					order: 'desc',
					sort: 'creation'};

	var result = $.ajax({
		url: "http://api.stackexchange.com/2.2/tags/" + tag + "/top-answerers/" + period,
		data: request,
		dataType: "jsonp",
		type: "GET",
		})
	.done(function(result){
		console.log(result.items);
		
		var searchResults = showSearchResults(request.tagged, result.items.length);
		
		$('.search-results').html(searchResults);
		
		$.each(result.items, function(i, item) {
			var answer = showAnswerer(item);
			$('.results').append(answer);
		});
	})
	.fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});

	console.log(result);		

};

var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = {tagged: tags,
					site: 'stackoverflow',
					order: 'desc',
					sort: 'creation'};
	
	var result = $.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		type: "GET",
		})
	.done(function(result){
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);

		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};


