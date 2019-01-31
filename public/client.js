console.log("client console:");


function jsonGetter()
{   return fetch("/getter", {method : "GET"})
        .then(function(response)
        {   if(response.ok)
            {   return response.json();
            }
            throw new Error("GET request failed.");
        })
        .catch(function(error)
        {   console.error(error);
        });
}


document.getElementById("get_button").addEventListener("click", function(event)
{   console.log("click on GET button");
    jsonGetter()
        .then(function(data)
        {   document.getElementById("gotten_content").innerHTML = JSON.stringify(data);
        });
});


setInterval(function()
{   jsonGetter()
        .then(function(data)
        {   document.getElementById("content").innerHTML = JSON.stringify(data);
        });
}, 20000); // milliseconds


const KYOTO =
{   "city0" :
    {   "name" : "Kyoto",
        "continent" : "Asia",
        "coordinates" :
        {   "longitude" : 135.768,
            "latitude" : 35.012
        }
    }
};


document.getElementById("add_button").addEventListener("click", function(event)
{   console.log("click on ADD button");
    fetch("/putter", {method : "PUT", body : JSON.stringify(KYOTO)})
        .then(function(response)
        {   if(! response.ok)
            {   console.log("PUT request failed.");
            }
        })
        .catch(function(error)
        {   console.error(error);
        });
});


document.getElementById("delete_button").addEventListener("click", function(event)
{   console.log("click on DELETE button");
    fetch("/purger/" + Object.keys(KYOTO)[0], {"method" : "POST"})
        .then(function(response)
        {   if(! response.ok)
            {   throw new Error("POST request failed.");
            }
        })
        .catch(function(error)
        {   console.error(error);
        });
});


document.getElementById("beauty_button").addEventListener("click", function(event)
{   console.log("click on BEAUTY button");
    jsonGetter()
        .then(function(data)
        {   var cities = []
            for(var key in data)
            {   cities.push(data[key]);
            }
            document.getElementById("beauty_content").innerHTML = `There is data of ${cities.length} ${cities.length === 1 ? "city" : "cities"}:
                ${cities.map(function(city)
                {   var lat = city.coordinates.latitude;
                    var lon = city.coordinates.longitude;
                    return `<b>${city.name}</b> lies in ${city.continent} at
                    a latitude of ${lat}° (${lat > 0 ? "north" : "south"}) and
                    a longitude of ${lon}° (${(lon > 0) && (lon <= 180) ? "east" : "west"}).`;
                }).join(" ")}`; // template literal
        })
});

