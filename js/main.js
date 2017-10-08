/* jshint esversion: 6 */
/* globals axios, ko, google */
(function mainJS(global, doc, axios) {
    "use strict";
    const CLIENT_ID = "ZKXLXRMMYMQEZHWAHNWFVNA4LEPMKCTL4XGCZPANQHQBXEPZ",
        CLIENT_SECRET = "ZMJX1RHMRYIEIXY5VEKDOYW5TNWPCAFA0ONJSRU1OPJ0TAHA",
        US_PHONE_LEN = 10,
        ERROR_BOX = doc.querySelector('#dangerBox'),
        MAP_DIV = doc.querySelector("#map"),
        DATALIST = doc.querySelector('#searchLocations'),
        ANIMATION_TIMEOUT = 1400;

    let initLocations = [
            {
                name: 'Donut Bistro',
                lat: 39.547192,
                long: -119.752429,
                id: 'donut_bistro'
            },
            {
                name: 'Water Springs Diner & Bar',
                lat: 39.58231,
                long: -119.744549,
                id: 'water_springs'
            },
            {
                name: 'Super Burrito',
                lat: 39.532707,
                long: -119.745974,
                id: 'super_burrito'
            },
            {
                name: 'Panaderia Azteca Mexico',
                lat: 39.542244,
                long: -119.73364,
                id: 'panaderia_azteca'
            },
            {
                name: 'Sui Korean BBQ',
                lat: 39.542135,
                long: -119.733639,
                id: 'sui_korean'
            },
            {
                name: 'Sawasdee Thai',
                lat: 39.555251,
                long: -119.753589,
                id: 'sawasdee'
            },
            {
                name: 'Bazaar European Deli and Cafe',
                lat: 39.490612,
                long: -119.793048,
                id: 'bazaar_deli'
            },
            {
                name: 'Soochow',
                lat: 39.542945,
                long: -119.734535,
                id: 'soochow'
            },
            {
                name: 'Jack\'s Cafe',
                lat: 39.535439,
                long: -119.773675,
                id: 'jacks_cafe'
            },
            {
                name: 'Port Of Subs',
                lat: 39.541209,
                long: -119.733659,
                id: 'p_o_s'
            },
            {
                name: 'Lighthouse Coffee',
                lat: 39.535524,
                long:-119.727661,
                id: 'lighthouse'
            }

        ],
        errorHandler = (currentErr) => {
            ERROR_BOX.classList.remove('is-hidden');
            let div = doc.createElement('DIV');
            div.innerHTML += currentErr;
            ERROR_BOX.appendChild(div);
        },
        map,
        formatPhone = (phonenum) => {
            phonenum = String(phonenum);
            if (phonenum.length === US_PHONE_LEN) {
                return "(" + phonenum.substr(0, 3) + ') ' + phonenum.substr(3, 3) + '-' + phonenum.substr(6, 4);
            }
            return phonenum;
        },
        previousWindow = null,
        previous = null,
        Location = class Location {

            constructor(data) {
                this.name = data.name || "";
                this.lat = data.lat || "";
                this.long = data.long || "";
                this.id = data.id || "";
                this.URL = "";
                this.street = "";
                this.city = "";
                this.phone = "";
                this.visible = ko.observable(true);

                axios.get(this.foursquareURL).then((data) => {
                    data = JSON.parse(data.request.responseText);
                    let results = data.response.venues[0];
                    if (!results) {
                        return;
                    }
                    if (results.url) {
                        this.URL = results.url;
                    }
                    this.street = results.location.formattedAddress[0];
                    this.city = results.location.formattedAddress[1];
                    this.phone = results.contact.phone || '';
                    this.formattedPhone = formatPhone(this.phone);

                }).catch((err) => {
                    let currentErr = alert("This is an error.");
                });

                this.marker = new google.maps.Marker({
                    position: new google.maps.LatLng(data.lat, data.long),
                    map: map,
                    title: data.name
                });

                ko.computed(() => {
                    if (this.visible() === true) {
                        this.marker.setMap(map);
                    } else {
                        this.marker.setMap(null);
                    }
                    return true;
                });

                this.marker.addListener('click', (location) => {

                    if (this.marker === previous) {
                        return;
                    }
                    Location.removeActive();
                    this.showActiveElement();
                    this.showInfoContent();

                    this.marker.setAnimation(google.maps.Animation.BOUNCE);

                    google.maps.event.addListener(this.infoWindow, 'closeclick', () => {
                        Location.removeActive();
                        this.marker.setAnimation(null);
                    });

                    global.setTimeout(() => {
                        this.marker.setAnimation(null);
                    }, ANIMATION_TIMEOUT);
                });

                this.animateEvent = (place, evt) => {
                    google.maps.event.trigger(this.marker, 'click');
                    google.maps.event.trigger(map, 'resize');
                };
            }

            showInfoContent() {
                this.infoWindow = new google.maps.InfoWindow({
                    content: this.createContentString(),
                    maxWidth: 250
                });
                if (previousWindow) {
                    previousWindow.close();
                }
                previousWindow = this.infoWindow;
                this.infoWindow.open(map, this.marker);
                if (previous) {
                    previous.setAnimation(null);
                }
                previous = this.marker;
            }

            showActiveElement() {
                Location.removeActive();
                let activeEl = document.querySelector(`[data-identifier='${this.id}']`);
                Location.addActiveEl(activeEl);
            }

            static addActiveEl(activeEl) {
                activeEl.classList.add('is-active');
            }

            createContentString() {
                return `<section class="info-window-content" id="${this.id}">
                        <p class="title">${this.name}</p>
                        <p class="url"><a href="${this.URL}">${this.URL}</a></p>
                        <p class="street">${this.street}</p>
                        <p class="city">${this.city}</p>
                        <p class="phone"><a href="tel:${this.phone}">${this.formattedPhone}</a></p>
                </section>`;
            }

            static removeActive() {
                let active = doc.querySelector('#results .is-active');
                if (active) {
                    active.classList.remove('is-active');
                }
            }

            get foursquareURL() {
                return `https://api.foursquare.com/v2/venues/search?ll=${this.lat},${this.long}&client_id=${5WF5BO5335BY4HFD3DCR0JAYBMRRC5YQ1BX1HXFCWPC5H3CU}&client_secret=${N345RUTXSA0YZV1C4KXQRUE2H3HUCCVGUYGYOEEPFK3V0AEI}&v=20160118&query=${this.name}`;
            }
        },
        AppViewModel = class AppViewModel {

            constructor() {
                this.searchTerm = ko.observable("");

                this.locationList = ko.observableArray([]);

                let latList = [];
                let longList = [];
                let centered = {
                    lat: [],
                    lng: []
                };

                initLocations.filter((locationItem) => {
                    return locationItem.lat && locationItem.long;
                }).forEach((locationItem) => {
                    latList.push(locationItem.lat);
                    longList.push(locationItem.long);
                });
                centered.lat = AppViewModel.average(latList);
                centered.lng = AppViewModel.average(longList);

                map = new google.maps.Map(MAP_DIV, {
                    zoom: 11,
                    center: centered
                });

                initLocations.forEach((locationItem) => {
                    let option = doc.createElement('OPTION');
                    option.value = locationItem.name;
                    DATALIST.appendChild(option);
                    this.locationList.push(new Location(locationItem));
                });

                this.searchList = ko.computed(() => {
                    let filter = this.searchTerm().toLocaleLowerCase();
                    if (!filter) {
                        return this.locationList().filter((locationItem) => {
                            locationItem.visible(true);
                            return true;
                        });
                    } else {
                        return this.locationList().filter((locationItem) => {
                            let string = locationItem.name.toLocaleLowerCase();
                            let result = string.search(filter) !== -1;
                            locationItem.visible(result);
                            return result;
                        });
                    }
                });
            }

            static average(arr) {
                return arr.reduce((p, c) => p + c, 0) / arr.length;
            }
        };

    global.initMap = () => {
        ko.applyBindings(new AppViewModel());
        MAP_DIV.style.height = doc.querySelector('#list').offsetHeight + "px";
    };

    global.errorHandling = (err) => {
        errorHandler(err);
    };


}(this, document, axios));