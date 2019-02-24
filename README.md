# RESTful API tutorial

This tutorial will guide you through setting up a simple web application, written in [JavaScript](https://en.wikipedia.org/wiki/JavaScript) and running with [Node.js](https://en.wikipedia.org/wiki/Node.js), that exposes a [REpresentational State Transfer (REST)](https://en.wikipedia.org/wiki/Representational_state_transfer) [Application Programming Interface (API)](https://en.wikipedia.org/wiki/Application_programming_interface).
This RSETful API is exploited on the client's side by issuing GET, PUT, and POST requests and handle the server's responses.

> In this tutorial, you will find a **minimal** solution.
> The commited code includes elementary exception handling and other "corrections" as well as a more appealing design.
> Feel free to compare as you work through this tutorial.

## 1 setup

For our web app(lication), we will need only a few files: a web page index in [HyperText Markup Language](https://en.wikipedia.org/wiki/HTML), data in [JavaScript Object Notation (JSON)](https://en.wikipedia.org/wiki/JSON), and each a server and a client [JavaScript](https://en.wikipedia.org/wiki/JavaScript) file.
This tutrial provides a step-by-step guide for creating these files and continously extending the app.

### 1.1 starting a server

The server script is the **back-end** of the app.
It requries certain [modules](https://www.w3schools.com/nodejs/nodejs_modules.asp) (e.g., [**express**](https://expressjs.com/), a web framework for [Node.js](https://en.wikipedia.org/wiki/Node.js)).

`./server.js`
```javascript
const system = require("fs");              // for interaction with file system
const bodyParser = require("body-parser"); // for parsing a request's body
const express = require("express");        // as web framework
const app = express();

app.listen(4200, "localhost", function()
{   console.log("server listening at http://127.0.0.1:4200/")
});
```
To execute the server script, we (once) need to **initialise** the project and **install** its requirements using [Node.js Package Manager (**npm**)](https://www.npmjs.com/).
This process will create `package.json` and `package-lock.json`, and store all requirements into `node_modules/`. Now, the server can be started using [**node**](https://nodejs.org/en/download/).
```
$ npm init                         # initialise project, enter information or confirm defaults

$ npm install body-parser express  # install requirements
+ body-parser@1.18.3
+ express@4.16.4
added 51 packages from 36 contributors and audited 151 packages in 1.421s
found 0 vulnerabilities

$ node server2.js                  # start app, stop with [Ctrl]+[C]
server listening at http://127.0.0.1:4200/
```
Although the server has been started and is listening, it does not yet provide any content.

### 1.2 providing content

Let's create some minimal content that a browser can displayed, starting with a web page.

`./public/index.html`
```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>RESTful API tutorial</title>
    </head>
    <body>
        <h1>RESTful API tutorial</h1>
    </body>
    <script src="./client.js"></script>
</html>
```
With the script tag, we are referencing (the relative path to) a client script that will be the **front-end** of the app.
For now, we keep this script as simple as possile.

`./public/client.js`
```javascript
console.log("client console:");
```
In order to have the server provide content, we need to grant the client access to `public/` and send `index.html` on access.

`./server.js`
```javascript
app.use(express.static("./public")); // permit access to resources in 'public/'

app.get("/", function(request, response)
{   response.sendFile(__dirname + "/public/index.html");
});
```
Stop the server (with `[Ctrl]+[C]`), restart it (issuing `$ node server.js`), and open http://127.0.0.1:4200/ in your browser of choice.
You will see the `index.html` and the string `client console:` in the browser's web developer console.

Actually, we just developed our first RESTful API.
Opening the above link, the server receives a **GET request** and returns `index.html` as **repsonse**.
In the next sections, we will create more "funtional" APIs to interact with the server (and act on its data).

## 2 APIs

### 2.1 getting data

Let our server have some data in a readable, plain text [JSON](https://en.wikipedia.org/wiki/JSON) file (not within a database).

`./data/data.json`
```json
{   "city1" :
    {   "name" : "Venice",
        "continent" : "Europe",
    }
}
```
The server will provide this data only on **request**.
More precisely, we implement a API named `"/getter"` on the server side that will read the data file and send it as **response**.

`./server.js`
```javascript
app.get("/getter", function(request, response)
{   system.readFile(__dirname + "/data/data.json", "utf8", function(error, data)
    {   console.log("request GET data");
        response.end(data);
    })
});
```
You can exploit this API by opening http://127.0.0.1:4200/getter in your browser.
Next, we extend the body of our web page buy a "get" button and a "placeholder" paragraph, in which the data will be displayed.

`./public/index.html`
```html
        <button id="get_button">get</button>
        <p id="gotten_content"><i>placeholder</i></p>
```
On the client side, we implement a function that is invoked in case of a `"click"` event on this button.
On click, the client sends a **GET request**, [**fetch**](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) the server's **response**, and [**then**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) replaces the "placeholder" by the data's string representation.

`./public/client.js`
```javascript
document.getElementById("get_button").addEventListener("click", function(event)
{   console.log("click on GET button");
    fetch("/getter", {method : "GET"})
        .then(function(response)
        {   return response.json();
        })
        .then(function(data)
        {   document.getElementById("gotten_content").innerHTML = JSON.stringify(data);
        });
});
```
> The `fetch()` is executed **asynchronously**; i.e., once started the interpreter will continue without waiting for it to return.
> However, `fetch()` will leave a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) on which we can `then()` act.
> 
> For comparison, the above snippet could also be realised with [jQuery](https://jquery.com/) and [Asynchronous Javascript And Xml (AJAX)](https://en.wikipedia.org/wiki/Ajax_(programming)).
```javascript
$('#get_button').click(function()
{   console.log("click on GET button");
    $.ajax(
    {   url : "/getter",
        dataType : "json",
        success : function(data)
        {   $('#gotten_content').html(JSON.stringify(data));
        }
    });
});
```
Restart the server and try out the new button.

### 2.2 adding data

We can send data to the server through the **body** of a PUT (or POST) request.
To add new data, the server retrieves the body, reads the original data, adds every new key-value pair, and writes it back to file.

`./server.js`
```javascript
app.use(bodyParser.urlencoded({extended : false})); // use unextended URL encoding
app.use(bodyParser.json({type: "text/plain"}));     // use plain text JSON format

app.put("/putter", function (request, response)
{   var input = request.body;
    console.log("request PUT data");
    system.readFile(file, "utf8", function(error, data)
    {   data = JSON.parse(data);
        for(var key in data)
        {   input[key] = data[key];
        }
        system.writeFile(__dirname + "/data/data.json", JSON.stringify(input), function(error){});
    });
});
```
> `readFile()` and `writeFile()` are also **asynchronous**, which is why they were nested.

Next, we extend our web page with an "add" button.

`./public/index.html`
```html
        <br/><!-- line break -->
        <button id="add_button">add</button>
```
For simplicity, let the new data be available to the client as variable.
We send it within the body of a PUT request to the server's API `"/putter"`.

`./public/client.js`
```javascript
const KYOTO =
{   "city0" :
    {   "name" : "Kyoto",
        "continent" : "Asia",
    }
};

document.getElementById("add_button").addEventListener("click", function(event)
{   console.log("click on ADD button");
    fetch("/putter", {method : "PUT", body : JSON.stringify(KYOTO)});
});
```

### 2.3 deleting data

**POST** (or PUT) APIs can also handle requests for the deletion of data.
It is sufficient to send some identifier (e.g., the JSON key) of the entry we want deleted.
For this purpose, our the API `"/poster"` accepts an additional parameter `key`.
On request, the server reads the original data, deletes the specified entry (if present), and writes the data back to file.

`./server.js`
```javascript
app.post("/poster/:key", function (request, response)
{   console.log("request POST deletion of \"" + request.params.key + "\"");
    system.readFile(file, "utf8", function(error, data)
    {   data = JSON.parse(data);
        delete data[request.params.key]
        system.writeFile(__dirname + "/data/data.json", JSON.stringify(data), function(error){})
    });
});
```
Next, we add a "delete" button.

`./public/index.html`
```html
        <button id="delete_button">delete</button>
```
It remains to implement sending the POST request to `"/poster/city0"` (without colon) to delete the key `"city0"` (and its value).

`./public/client.js`
```javascript
document.getElementById("delete_button").addEventListener("click", function(event)
{   console.log("click on DELETE button");
    fetch("/poster/" + Object.keys(KYOTO)[0], {"method" : "POST"});
});
```
Closing the add/delete circle, it is time to give our buttons a try.

### 2.4 beautify

Lastly, we augment the front-end of our app with a bit of convinience and beauty.

`./public/index.html`
```html
        <br/>
        <p id="beauty_content"><i>placeholder</i></p>
```
Instead of a button, we can invoke a function periodically, say in an interval of 2 seconds.
And instead of displaying raw data, we can process it into a beautiful string using template literals.
Turning the data entries in to a list, the client can [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) the entries into sentences and [join](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join) those into a text.

`./public/client.js`
```javascript
setInterval(function()
{   fetch("/getter", {method : "GET"})
        .then(function(response)
        {   return response.json();
        })
        .then(function(data)
        {   var cities = []
            for(var key in data)
            {   cities.push(data[key]); // add values to list 'cities'
            }
            document.getElementById("beauty_content").innerHTML = `${cities.map(function(city)
            {   return `<b>${city.name}</b> lies in ${city.continent}.`;
            }).join(" ")}`;
        })
}, 2000); // milliseconds
```

