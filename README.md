## Respond.to

Lightweight javascript api to better facilitate and manage javascript for responsive development with the use of media queries. Please see the wiki for more information.


## Dependencies (optional)

MatchMedia polyfill and the addListener polyfill

## Documentation/API

### Respond.to(obj)
* param object || array
* return this

The `Respond.to` call accepts an object literal or an array of object literals that define the media query conditions. If the obj parameter is an array it will add all object array items in a single pass. As each item is added to the internal Respond.to media query stack, the media query list object will perform an initial match check and fire of the corresponding callback.

An example of the object:

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
    }

---

### Respond.ready()
* return this

Will test all match media objects in the stack and execute the necessary callbacks.

---

### Respond.getStack(mqString)
* param mqString String (optional)
* return array || object (if mqString is passed)

Will return the stack of all match media objects.

---

### Respond.remove(mqString, namespace)
* mqString String
* namespace String (optional)

Removes the matching media query objects from the internal Respond.to stack. If the namespace string is provided only media query objects with a matching namespace will be removed. If no namespace is provided all associated namespaces with this media query string will be removed from the internal Respond.to stack.

---

### Respond.call(namespace, type, mqString)
* namespace String
* type String (if || else)
* mqString String (optional)

Calls the matching namespace object and type. For instance `Respond.call('namespace_header_mobile', 'if')` will call the specific namespaces if condition callback.


## Sample Usage

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

// Adding media query objects via array of objects
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


// Individual api calls
Respond.remove('(max-width: 920px)');
Respond.call('760_alt_in_out_b', 'else');
````
