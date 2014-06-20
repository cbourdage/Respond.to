Respond.to
==========

Lightweight javascript api to better facilitate and manage javascript for responsive development with the use of media queries.


Dependencies
==========
MatchMedia polyfill and the addListener polyfill

Sample
==========
````javascript
Respond.to({
	'media' : '(max-width: 920px)',
    'namespace' : '920_if_else',
    'fallback' : 'else' // ie8 fallback callback (optional - defaults to 'if' callback)
    'if' : function() {
    	document.querySelector('#matchmedia').style.backgroundColor = '#ff00cc';
    },
    'else' : function() {
    	document.querySelector('#matchmedia').style.backgroundColor = '';
    }
});

// adding by array
Respond.to([
	{
		'media' : '(max-width: 760px)',
		'namespace' : '760_alt_in_out_a',
		'fallback' : 'else',
		'if' : function() {
			document.querySelector('#matchmedia').style.fontSize = '36px';
		},
		'else' : function() {
			document.querySelector('#matchmedia').style.fontSize = '';
		}
	},
	{
		'media' : '(max-width: 760px)',
		'namespace' : '760_alt_in_out_b',
		'if' : function() {
			document.querySelector('#matchmedia').style.textDecoration = 'underline';
		},
		'else' : function() {
			document.querySelector('#matchmedia').style.textDecoration = '';
		}
	}
]);



// Individual calls demonstrated here
window.setTimeout(function() {
	Respond.remove('(max-width: 920px)');
    Respond.call('760_alt_in_out_b', 'else');
    //Respond.remove('(max-width: 760px)', '760_alt_in_out_b');
}, 2000);
````
