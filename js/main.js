
document.addEventListener('DOMContentLoaded', function () {

    const searchField = document.getElementById('searchField');
    const searchFind = document.getElementById('searchFind');
    const searchClear = document.getElementById('searchClear');

    searchFind.addEventListener('click', function () {
        //
    });

    searchClear.addEventListener('click', function () {
        searchField.value = null;
    });

});


function initMap() {

    const hospitalIcon = "./img/hospital.png";
    const hospitalIconWidth = 26;
    const hospitalIconHeight = 33.8;
    const doctorIcon = "./img/doctor.png";
    const doctorIconWidth = 26;
    const doctorIconHeight = 33.8;
    const options = {
        center: {lat: 50.431275, lng: 30.516910}, //{lat: -34.397, lng: 150.644}
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    let marker,
        allMarkers = [],
        popUpIsActive = null,
        activeMarker;
    let animationMarkerInterval;

    const map = new google.maps.Map(document.getElementById('map'), options);
    const locations = [
        {
            title: 'ЛОР центр',
            position: {lat: 50.418861, lng: 30.526437},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
             },
            schedule: '00:00–00:00',
            type: 'hospital',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.418861,
            lng: 30.526437
        },
        {
            title: 'Киевская городская клиническая больница №17',
            position: {lat: 50.428157, lng: 30.527383},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'hospital',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.428157,
            lng: 30.527383,
        },
        {
            title: 'Больница1',
            position: {lat: 50.424270, lng: 30.516910},
            icon: {
                url: doctorIcon,
                scaledSize: new google.maps.Size(doctorIconWidth, doctorIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'doctor',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.424270,
            lng: 30.516910,
        },
        {
            title: 'Больница2',
            position: {lat: 50.441555, lng: 30.527385},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'hospital',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.441555,
            lng: 30.527385,
        },
        {
            title: 'Больница3',
            position: {lat: 50.424160, lng: 30.481633},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'hospital',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.424160,
            lng: 30.481633,
        },
        {
            title: 'Больница4',
            position: {lat: 50.445192, lng: 30.516832},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'hospital',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.445192,
            lng: 30.516832,
        },
    ];

    locations.forEach( function( element, i ) {

        marker = new google.maps.Marker({
            position: element.position,
            map: map,
            title: element.title,
            icon: element.icon,
            type: element.type,
            schedule: element.schedule,
            address: element.address,
            lat: element.lat,
            lng: element.lng,
            id: i
            //animation: google.maps.Animation.BOUNCE,
        });

        allMarkers.push(marker);


    });

    renderList(allMarkers);

    allMarkers.forEach(function (item) {

        item.addListener('click', function() {

            renderPopUp(item);

        });

    });

    function renderPopUp(item) {

        if(popUpIsActive){
            popUpIsActive.close();
        }

        const {title} = item; // item data

        let infoWindowContent = `
            <div class="popUp">
                <h3>${title}</h3>
            </div>
                
        `;

        const infowindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });

        infowindow.open(map, item);

        popUpIsActive = infowindow;

    }

    function renderList(allMarkers) {

        const resultList = document.getElementById('resultList');
        const resultListFragment = document.createDocumentFragment();
        const allMarkersLength = allMarkers.length;

        let newReultItem,
            type;

        for(let i = 0; i < allMarkersLength; i++){

            type = allMarkers[i].type == 'hospital' ? 'Больница' : 'Врач';

            newReultItem = document.createElement('li');
            newReultItem.classList.add('filter__result__item');
            newReultItem.innerHTML = `
                <h3 class="title">
                    <a 
                        href="#" 
                        class="to-center-link js-to-center-link" 
                        data-lat="${allMarkers[i].lat}" 
                        data-lng="${allMarkers[i].lng}"
                        data-marker-id="${allMarkers[i].id}"
                    >
                        ${allMarkers[i].title}
                    </a>
                </h3>
                <p class="info">Открыто:&nbsp;<span class="value">${allMarkers[i].schedule}</span>,&nbsp; <span class="type hospital">${type}</span></p>
                <p class="address">${allMarkers[i].address}</p>
                <div class="bottom">
                    <a href="#" class="direction">Проложить маршрут</a>
                    <a href="#" class="more">Подробнее</a>
                </div>
            `;

            resultListFragment.appendChild(newReultItem);

        }

        resultList.appendChild(resultListFragment);

    }


    function linkToCenterItem(map){

        const resultItemsLinks = document.getElementsByClassName('js-to-center-link');
        const resultItemsArr = [].slice.call(resultItemsLinks);

        let lat,
            lng;
        let center;

        resultItemsArr.forEach(function (item, i) {

            item.addEventListener('click', function () {

                setActiveMarker(this, i);

            });

        });

        function setActiveMarker($this, i) {

            //console.log('activeMarker: ', activeMarker);

            clearInterval(animationMarkerInterval);

            if(activeMarker){
                activeMarker.setAnimation(null);
            }

            lat = $this.getAttribute('data-lat');
            lng = $this.getAttribute('data-lng');

            center = new google.maps.LatLng(lat, lng);
            map.panTo(center);

            animationMarkerInterval = setInterval(function () {
                allMarkers[i].setAnimation(google.maps.Animation.BOUNCE);
            }, 100);

            activeMarker = allMarkers[i];
        }

    }

    linkToCenterItem(map);

    function f() {
        
    }



}