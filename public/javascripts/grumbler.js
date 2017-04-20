var eventHandlers = {
	init: function(){
		$(".toggle-comments-btn").on("click", function(e){
			$target = $(e.target);
			$target.text() == "Show comments" ? $target.text("Hide comments") : $target.text('Show comments');
			$target.parent().next().toggle(200);
		});
	}
};

$(document).ready( function(){
	eventHandlers.init();
});