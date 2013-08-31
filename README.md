Respond.to
==========

Javascript api to better manage javascript with the use of media queries. The current implementation uses window.matchmedia object to addListeners based on the media queries. When pushing new media queries onto the Respond.to callback stack make sure, for the time being, the 'if' statement is the default desktop view (this is to support ie8).


Dependencies
==========
MatchMedia polyfill and the addListener polyfill

Sample
==========
````javascript
Respond.to({
	'media' : '(max-width: 920px)',
    'namespace' : '920_if_else',
    'if' : function() {
    	document.querySelector('#matchmedia').style.backgroundColor = '#ff00cc';
        console.log('920_if_else - if');
    },
    'else' : function() {
    	document.querySelector('#matchmedia').style.backgroundColor = '';
        console.log(document.querySelector('#matchmedia').style.backgroundColor);
        console.log('920_if_else - else');
    }
});


// Call ready for initial state
Respond.ready();


// Individual calls demonstrated here
window.setTimeout(function() {
        Respond.remove('(max-width: 920px)');
        Respond.call('760_alt_in_out_b', 'else');
        //Respond.remove('(max-width: 760px)', '760_alt_in_out_b');
}, 2000);
````
