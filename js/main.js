
(function($) {
    $(function() {

        // jQuery Form Styler
        // http://dimox.name/jquery-form-styler
         $('.filter__radio').styler();

    });
})(jQuery);

function initMap() {

    // Search
    const searhField = document.getElementById('searchField');
    const searhFields = document.getElementsByClassName('search-field');
    const searchFindBtn = document.getElementById('searchFind');

    // Filter
    const filterWrap = document.getElementById('filter');
    const closeFilterMobBtn = document.getElementsByClassName('js-close-filter')[0];
    const clearFieldBtn = document.getElementsByClassName('js-clear'); // all clear btns
    const clearFieldBtnsArr = [].slice.call(clearFieldBtn);
    const filterResultItem = document.getElementsByClassName('filter__result__item'); // all results
    const filterBlock = document.getElementsByClassName('filter__header__inner'); // Search or Direction
    const filterParams = document.getElementsByClassName('js-filter-params')[0];
    const filterParamsClose = document.getElementsByClassName('js-filter-params-close')[0];
    const filterParamsBasicBtn = document.getElementsByClassName('js-params-basic-btn'); // Clinic or Doctor
    const filterToggleBtn = document.getElementsByClassName('filter__toggle')[0]; // Toggle filter
    const filterParamsWrap = document.getElementsByClassName('js-filter-params-wrap')[0];
    const filterToggleListBtn = document.getElementsByClassName('js-toggle-filters-list')[0]; // Toggle additional filter

    // Direction
    const backToSearchBtn = document.getElementsByClassName('js-to-searching')[0];
    const getDirectionsBtn = document.getElementsByClassName('js-get-directions')[0];
    const directionFromField = document.getElementById('directionFrom');
    const directionToField = document.getElementById('directionTo');
    const directionFields = document.getElementsByClassName('direction-field'); // both fields
    const directionFieldsWrap = document.getElementsByClassName('direction__menu')[0]; // fields wrap

    // Google map
    const defaultZoom = 13;
    const geocoder = new google.maps.Geocoder();
    const directionsService = new google.maps.DirectionsService;
    const directionsDisplay = new google.maps.DirectionsRenderer;
    const hospitalIcon = "./img/hospital.png";
    const hospitalIconWidth = 26;
    const hospitalIconHeight = 33.8;
    //const hospitalIconWidthScaledSize = 31;
    //const hospitalIconHeightScaledSize = 38.8;
    const doctorIcon = "./img/doctor.png";
    const doctorIconWidth = 26;
    const doctorIconHeight = 33.8;
    const directionFromIcon = "./img/directionFromIcon.png";
    const options = {
        center: {lat: 50.431275, lng: 30.516910}, //{lat: -34.397, lng: 150.644}
        zoom: defaultZoom,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    const animationDrop = google.maps.Animation.DROP;
    const animationBounce= google.maps.Animation.BOUNCE;

    let marker,
        allMarkers = [],
        popUpIsActive = null,
        activeMarker,
        activeFilter = 'all',
        SEARCH_VALUE = searhField.value || null,
        ACTIVE_RESULT_ITEM_ID = null,
        APP_STATUS = 0, //  0 - search | 1 - direction
        statusOfAppIsSearch = true; // Direction or search

    let clientMarker,
        clientMarkerRadius;

    const map = new google.maps.Map(document.getElementById('map'), options);
    const locations = [
        {
            id: 0,
            title: 'ЛОР центр',
            position: {lat: 50.418861, lng: 30.526437},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
             },
            schedule: '00:00–00:00',
            type: 'clinic',
            address: 'вулиця Ковпака, 3, Київ, 02000',
            lat: 50.418861,
            lng: 30.526437,
            dutyClinic: true,
            aussendienst: false,
        },
        {
            id: 1,
            title: 'Киевская городская клиническая больница №17',
            position: {lat: 50.428157, lng: 30.527383},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '2, вул. Кутузова, Киев, 02000',
            lat: 50.428157,
            lng: 30.527383,
            dutyClinic: true,
            aussendienst: false,
        },
        {
            id: 2,
            title: 'Doctor',
            position: {lat: 50.424270, lng: 30.516910},
            icon: {
                url: doctorIcon,
                scaledSize: new google.maps.Size(doctorIconWidth, doctorIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'doctor',
            name: 'Иванов иван иванович',
            address: '3, вул. Кутузова, Киев, 02000',
            lat: 50.424270,
            lng: 30.516910,
            dutyClinic: true,
            aussendienst: false,
        },
        {
            id: 3,
            title: 'Больница2',
            position: {lat: 50.441555, lng: 30.527385},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.441555,
            lng: 30.527385,
            dutyClinic: true,
            aussendienst: true,
        },
        {
            id: 4,
            title: 'Больница3',
            position: {lat: 50.424160, lng: 30.481633},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.424160,
            lng: 30.481633,
            dutyClinic: false,
            aussendienst: false,
        },
        {
            id: 5,
            title: 'Больница4',
            position: {lat: 50.445192, lng: 30.516832},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.445192,
            lng: 30.516832,
            dutyClinic: false,
            aussendienst: false,
        },
    ];

    const defaultLocations = locations;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*searchFindBtn.addEventListener('click', function () {
        searhField.focus();
        autocompliteFunc();
    });*/

    if(SEARCH_VALUE){
        searchField.value = SEARCH_VALUE;

        geocodeAddress(geocoder, map);
    }

    closeFilterMobBtn.addEventListener('click', function () {
        filterWrap.classList.toggle('filter--hide');
        this.classList.toggle('revert');
    });

    filterToggleBtn.addEventListener('click', function () {
        filterWrap.classList.toggle('filter--hide');
        document.querySelectorAll('.filter__toggle__inner')[0].classList.toggle('show');
        document.querySelectorAll('.filter__toggle__inner')[1].classList.toggle('hidden');
    });

    filterToggleListBtn.addEventListener('click', function () {
        filterParams.classList.toggle('show');
    });

    filterParamsClose.addEventListener('click', function () {
        filterParams.classList.remove('show');
    });


    function geocodeAddress(geocoder, resultsMap) {
        let address = SEARCH_VALUE;

        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {

                if(clientMarker){
                    clientMarker.setVisible(false);
                    clientMarkerRadius.setMap(null);
                }

                resultsMap.setCenter(results[0].geometry.location);

                clientMarker = new google.maps.Marker({
                    map: resultsMap,
                    position: results[0].geometry.location
                });

                clientMarkerRadius = new google.maps.Circle({
                    strokeColor: '#00B1DA',
                    strokeOpacity: 0.3,
                    strokeWeight: 1,
                    fillColor: '#00B1DA',
                    fillOpacity: 0.35,
                    map: map,
                    center: results[0].geometry.location,
                    radius: 3000 // in meters
                });

            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    function autocompliteFunc() {
        let autocomplete;

        [].slice.call(searhFields).forEach(function (item) {

            autocomplete = new google.maps.places.Autocomplete(item);

            autocomplete.bindTo('bounds', map);

            let directionMarker = new google.maps.Marker({
                map: map,
                icon: {
                    url: directionFromIcon,
                    scaledSize: new google.maps.Size(35, 35)
                },
                anchorPoint: new google.maps.Point(0, -29)
            });

            autocomplete.addListener('place_changed', function() {

                directionMarker.setVisible(false);

                let place = autocomplete.getPlace();

                /*if (!place.geometry) {
                    // User entered the name of a Place that was not suggested and
                    // pressed the Enter key, or the Place Details request failed.
                    window.alert("No details available for input: '" + place.name + "'");
                    return;
                }
*/
                // If the place has a geometry, then present it on a map.
                /*if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                }else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);  // Why 17? Because it looks good.
                }*/

                SEARCH_VALUE = item.value || null;

                //directionMarker.setPosition(place.geometry.location);
                directionMarker.setVisible(true);

                geocodeAddress(geocoder, map);
            });


        });

    }autocompliteFunc();


    function direction(){
        const directionLink = document.getElementsByClassName('js-direction');
        const directionLinksArr = [].slice.call(directionLink) || null;

        let linkAddress,
            directionsInfoWrap,
            itemId,
            itemWrap;
        let duration = document.querySelectorAll('.js-duration');
        let distance = document.querySelectorAll('.js-distance');
        let durationsArr = [].slice.call(duration);
        let distanceArr = [].slice.call(distance);

        if(directionLinksArr){

            directionsDisplay.setMap(map);

            directionLinksArr.forEach(function (item, i) {

                item.addEventListener('click', function (e) {

                    e.preventDefault();

                    durationsArr.forEach(function (item) {
                        item.innerHTML = '';
                    });

                    distanceArr.forEach(function (item) {
                        item.innerHTML = '';
                    });


                    if(APP_STATUS == 0){

                        APP_STATUS = 1;

                        filterParamsWrap.classList.add('hidden');
                        filterBlock[0].classList.add('hidden');
                        filterBlock[1].classList.remove('hidden');
                        directionFieldsWrap.classList.add('show');

                    }

                    itemWrap = item.closest('.filter__result__item');
                    itemId = itemWrap.getAttribute('data-item-id');

                    if(itemId !== ACTIVE_RESULT_ITEM_ID){

                        linkAddress = item.getAttribute('data-direction');

                        directionFromField.value = SEARCH_VALUE;

                        directionToField.value = linkAddress;

                        //directionsInfoWrap = itemWrap.classList.add('active');

                        setActiveResultItem(itemId);
                    }



                });

            });

        }

    }

    // Hide directions fields && show
    backToSearchBtn.addEventListener('click', function () {
        filterParamsWrap.classList.remove('hidden');
        filterBlock[0].classList.remove('hidden');
        filterBlock[1].classList.add('hidden');
        directionFieldsWrap.classList.remove('show');

        APP_STATUS = 0; // search

        searhField.value = SEARCH_VALUE ? SEARCH_VALUE : null; // value from direction field
    });

    getDirectionsBtn.addEventListener('click', function () {

        let itemWrap = document.querySelector('.filter__result__item.active');

        directionFromField.value = SEARCH_VALUE ? SEARCH_VALUE : null; // value from direction field

        directionsService.route({
            origin: directionFromField.value,
            destination: directionToField.value,
            travelMode: 'DRIVING'
        }, function(response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);

                let point = response.routes[0].legs[0];

                itemWrap.querySelector('.js-duration').innerHTML = `Duration:&nbsp;<span class="value">${point.duration.text}</span>`;
                itemWrap.querySelector('.js-distance').innerHTML = `Distance:&nbsp;<span class="value">${point.distance.text}</span>`;

            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });

    });

    function setActiveResultItem(itemId) {

        const filterResultItemsArr = [].slice.call(filterResultItem);

        filterResultItemsArr.forEach(function (item) {
            item.classList.remove('active');
        });

        const activeItem = filterResultItemsArr.filter(item => item.getAttribute('data-item-id') == itemId)[0];

        activeItem.classList.add('active');

        activeItem.scrollIntoView({block: "end", behavior: "smooth"});

        ACTIVE_RESULT_ITEM_ID = itemId;

    }

    function showMore() {
        const showMore = document.getElementsByClassName('js-more');

        let markerId,
            marker;

        [].slice.call(showMore).forEach(function (item) {

            item.addEventListener('click', function () {
                markerId = item.getAttribute('data-marker-id');

                marker = allMarkers.filter(item => item.id == markerId)[0];

                setActiveResultItem(markerId);

                renderPopUp(marker);
            });
        });

    }

    function setMarkers(locations, animation){

        if(allMarkers){
            removeMarkers();
        }

        locations.forEach( function( element, i ) {

            marker = new google.maps.Marker({
                position: element.position,
                map: map,
                animation: animation,
                title: element.title,
                icon: element.icon,
                type: element.type,
                schedule: element.schedule,
                address: element.address,
                lat: element.lat,
                lng: element.lng,
                id: element.id,
                name: element.name || null,
                //animation: google.maps.Animation.BOUNCE,
            });

            allMarkers.push(marker);

            allMarkers.forEach(function (item) {

                item.addListener('click', function() {

                    renderPopUp(item);

                    item.setAnimation(null);

                    setActiveResultItem(item.id);

                });

            });

        });

        renderList(allMarkers); // renders list of markers
    }

    setMarkers(locations, animationDrop); // first init of markers

    function removeMarkers(){

        for(let i = 0; i < allMarkers.length ; i++){
            allMarkers[i].setMap(null);
        }

        allMarkers = [];
    }

    function renderPopUp(item) {

        if(popUpIsActive){
            popUpIsActive.close();
        }

        const {title, type} = item; // item data

        let infoWindowContent = `
            <div class="popUp">
                <h3>${title}</h3>
                <p>Адрес</p>
                <p>Медпрофиль контакта или компании</p>
                <p>Сотрудничество</p>
                <p>Wochenende ( компания и контакт)</p>
                <p>Wochenende ( компания и контакт)</p>
                <p>Ausendienst ( только для контактов)</p>
                <p>Статус компании или контакта</p>
                <p>Телефон раб</p>
                <p>Факс</p>
                <p>Мобильный (под вопросом)</p>
                ${type == 'doctor' ? '<p>Пол (муж или жен)</p>' : ''}
            </div>
                
        `;

        const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });

        infoWindow.open(map, item);

        popUpIsActive = infoWindow;

    }

    function renderList(markersList){

        const resultList = document.getElementById('resultList');
        const resultListFragment = document.createDocumentFragment();
        const allMarkersLength = markersList.length;

        let newReultItem,
            type;

        resultList.innerHTML = ''; // Clear list

        if(allMarkersLength){
            for(let i = 0; i < allMarkersLength; i++){

                type = markersList[i].type == 'clinic' ? 'Больница' : 'Врач';

                newReultItem = document.createElement('li');
                newReultItem.classList.add('filter__result__item');
                newReultItem.setAttribute('data-item-id', markersList[i].id);

                if(markersList[i].id == ACTIVE_RESULT_ITEM_ID){
                    newReultItem.classList.add('active');
                }

                newReultItem.innerHTML = `
                <h3 class="title">
                    <a 
                        href="#" 
                        class="to-center-link js-to-center-link" 
                        data-lat="${markersList[i].lat}" 
                        data-lng="${markersList[i].lng}"
                        data-marker-id="${markersList[i].id}"
                    >
                        ${markersList[i].title}
                    </a>
                </h3>
                <p class="info">Открыто:&nbsp;<span class="value">${markersList[i].schedule}</span>,&nbsp;<span class="type hospital">${type}</span></p>
                <p class="address">${markersList[i].address}</p>
                <div class="bottom">
                    <a href="#" class="direction js-direction" data-direction="${markersList[i].address}">Проложить маршрут</a>
                    <a href="#" class="more js-more" data-marker-id="${markersList[i].id}">Подробнее</a>
                </div>
                <div class="directions-info js-directions-info">
                    <div class="js-duration"></div>
                    <div class="distance js-distance"></div>
                </div>
            `;

                resultListFragment.appendChild(newReultItem);
            }

            resultList.appendChild(resultListFragment);

            direction(); // if exist results, we can create direction;
            showMore(); // if exist results, we can show infoWindow;

        }else{
            //resultList.innerHTML = '<li class="filter__result__item">not found</li>';
            resultList.innerHTML = 'not found';
        }


    }

    function linkToCenterItem(map){

        const resultItemsLinks = document.getElementsByClassName('js-to-center-link');
        const resultItemsArr = [].slice.call(resultItemsLinks);

        let lat,
            lng,
            id;
        let center;

        document.addEventListener('click', function (e) {
            const target = e.target;

            if(
                target.classList.contains('js-to-center-link') //&&
                //(!activeMarker || (activeMarker && target.getAttribute('data-marker-id') != activeMarker.id))
            ){

                setActiveMarker(target);

            }
        });

        function setActiveMarker($this) {

            if(activeMarker){
                activeMarker.setAnimation(null);
            }

            lat = $this.getAttribute('data-lat');
            lng = $this.getAttribute('data-lng');
            id = $this.getAttribute('data-marker-id');

            setActiveResultItem(id);

            center = new google.maps.LatLng(lat, lng);
            map.panTo(center);
            map.setZoom(16);

            for(let i = 0; i < allMarkers.length; i++){
                if(allMarkers[i].id == id){
                    //allMarkers[i].setAnimation(animationBounce);

                    activeMarker = allMarkers[i];
                }
            }

        }

    }

    linkToCenterItem(map);

    function search() {

        /*const markersList = allMarkers;


        searchValue = searhField.value.toLowerCase();

        let newMarkersList = [];

        if(searchValue){

            markersList.forEach(function(item) {
                let {address, title, name} = item;

                name = name ? name.toLowerCase() : null;
                title = title ? title.toLowerCase() : null;
                address = address ? address.toLowerCase() : null;

                if( address.match(searchValue) ||
                    title.match(searchValue) ||
                    (name && name.match(searchValue))
                ){
                    newMarkersList.push(item);
                }
            });

        }else{
            newMarkersList = allMarkers;
        }

        renderList(newMarkersList);*/
    }

    clearFieldBtnsArr.forEach(function (item) {
        item.addEventListener('click', function () {

            let field = this.parentNode.getElementsByClassName('field')[0];

            // fix re-render result list
            if(field.value){
                field.value = null;
                SEARCH_VALUE = null;
            }
        });
    });


    filterParamsWrap.addEventListener('click', function (e) {
        const target = e.target;

        if(target.classList.contains('js-all')){
            filter('all');
            map.setZoom(defaultZoom);
        }else if(target.classList.contains('js-clinics')){
            filter('clinic');
            map.setZoom(defaultZoom);
        }else if(target.classList.contains('js-doctors')){
            filter('doctor');
            map.setZoom(defaultZoom);
        }else if(target.classList.contains('js-duty-Clinic')){
            filter('dutyClinic');
            map.setZoom(defaultZoom);
        }else if(target.classList.contains('js-aussendienst')){
            filter('aussendienst');
            map.setZoom(defaultZoom);
        }
    });

    function filter(type) {

        let locFilterArr = [];

        if(type == 'all'){
            locFilterArr = locations;
        }else if(type == 'clinic' || type == 'doctor'){
            locFilterArr = locations.filter(item => item.type === type);
        }else if(type == 'dutyClinic'){
            locFilterArr = locations.filter(item => item.dutyClinic);
        }else if(type == 'aussendienst'){
            locFilterArr = locations.filter(item => item.aussendienst);
        }

        if(activeFilter !== type){
            removeMarkers();
            setMarkers(locFilterArr, animationDrop);
            search();

            activeFilter = type;
        }

    }

}