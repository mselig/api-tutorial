const system = require("fs");
const bodyParser = require('body-parser');
const express = require("express");
const app = express();
const HOST = "localhost";
const PORT = 42000;
const file = __dirname + "/data/data.json";


var server = app.listen(PORT, HOST, function()
{   var host = server.address().address
    var port = server.address().port
    console.log("server listening at http://%s:%s", host, port)
});


// permit access to resources in public/
app.use(express.static("./public"));


// serve index
app.get("/", function(request, response)
{   response.sendFile(__dirname + "/public/index.html");
});


app.get("/getter", function(request, response)
{   system.readFile(file, "utf8", function(error, data)
    {   if(! error)
        {   console.log("request GET data (" + Object.keys(JSON.parse(data)).length + " keys)");
            response.end(data);
        }
        else
        {   console.error(error);
        }
    })
});


app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json({type: "text/plain"}));


app.put("/putter", function (request, response)
{   var input = request.body;
    console.log("request PUT data (" + Object.keys(input).length + " keys)");
    system.readFile(file, "utf8", function(error, data)
    {   if(! error)
        {   data = JSON.parse(data);
            for(var key in data)
            {   input[key] = data[key];
            }
            system.writeFile(file, JSON.stringify(input), function(error)
            {   if(error)
                {   console.error(error);
                }
            });
        }
        else
        {   console.error(error);
        }
    });
});


app.post("/purger/:key", function (request, response)
{   console.log("request POST deletion of \"" + request.params.key + "\"");
    system.readFile(file, "utf8", function(error, data)
    {   if(! error)
        {   data = JSON.parse(data);
            delete data[request.params.key]
            system.writeFile(file, JSON.stringify(data), function(error)
            {   if(error)
                {   console.error(error);
                }
            })
        }
        else
        {   console.error(error);
        }
    });
});

